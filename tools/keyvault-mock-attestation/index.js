const express = require("express");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const jose = require("node-jose");
const crypto = require("crypto");
const url = require("url");

const PORT = process.env.PORT || 5000;

const fullUrl = (req) => `https://${req.get("host")}`;

async function initKeys() {
  const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
    modulusLength: 2048,
    publicKeyEncoding: { type: "spki", format: "pem" },
    privateKeyEncoding: { type: "pkcs8", format: "pem" }
  });
  const keystore = jose.JWK.createKeyStore();

  const key = await keystore.add(publicKey, "pem");
  return {
    signingKeyId: key.kid,
    privateKey,
    publicKey,
    keyStore: keystore
  };
}

function initApp({ keyStore, privateKey, signingKeyId }) {
  const app = express();
  app.use(bodyParser.json());

  app.get("/.well-known/openid-configuration", (req, res) => {
    res.json({
      jwks_uri: `${fullUrl(req)}/keys`
    });
  });

  app.get("/keys", (_req, res) => {
    res.json(keyStore.toJSON(false));
  });

  app.get("/generate-test-token", async (req, res) => {
    // create a fake release key to wrap a token with.
    const releaseKey = await jose.JWK.createKey("RSA", 2048, {
      use: "enc",
      kid: "fake-release-key"
    });

    // sdk-test will be the claim used for tests.
    const tokenData = {
      iss: `${fullUrl(req)}/`,
      "sdk-test": true,
      "x-ms-inittime": {},
      "x-ms-runtime": {
        keys: [releaseKey.toJSON(false)]
      },
      "maa-ehd": "sdk-test"
    };

    const token = jwt.sign(tokenData, privateKey, {
      algorithm: "RS256",
      expiresIn: "7 days",
      header: {
        jku: `${fullUrl(req)}/keys`,
        kid: signingKeyId
      }
    });

    // TODO: some tests are still referencing `token` which is too generic.
    // Let's move to attestationToken which is easier to understand and replace in a recorder.
    // We can delete `token` once languages have moved over.
    res.json({ token, attestationToken: token });
  });

  return app;
}

async function main() {
  const { keyStore, privateKey, signingKeyId } = await initKeys();
  const app = initApp({ keyStore, privateKey, signingKeyId });
  await new Promise((resolve, reject) => {
    app.listen(PORT, (err) => {
      if (err) {
        reject(err);
      }

      console.log(`Server listening on port ${PORT}`);

      resolve();
    });
  });
}
main().catch(console.error);
