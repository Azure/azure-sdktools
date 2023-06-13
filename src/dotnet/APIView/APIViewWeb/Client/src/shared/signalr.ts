import * as hp from "./helpers";
import * as comments from "./comments";
import { ConsoleLogger, createLogger } from "@microsoft/signalr/dist/esm/Utils";
import { LogLevel } from "@microsoft/signalr";

$(() => {
//-------------------------------------------------------------------------------------------------
// Create SignalR Connection and Register various events
//-------------------------------------------------------------------------------------------------
  const signalR = require('@microsoft/signalr');

  const connection = new signalR.HubConnectionBuilder()
    .withUrl(`${location.origin}/hubs/notification`, { 
      skipNegotiation: true,
      transport: signalR.HttpTransportType.WebSockets })
    .configureLogging(signalR.LogLevel.Information)
    .withAutomaticReconnect()
    .build();

  async function start() {
    try {
      await connection.start();
    }
    catch (err) {
      console.log(err);
      setTimeout(start, 5000);
    }
  }

  connection.onclose(async () => {
    await start();
  });

  connection.on("RecieveNotification", (notification) => {
    hp.addToastNotification(notification);
  });

  connection.on("ReceiveConnectionId", (connectionId) => {
    hp.setSignalRConnectionId(connectionId);
  });

  connection.on("ReceiveComment", (commentDto) => {
    console.log("comment received");

    // push to everyone except current
    // find a way to update their comments
    // if current client has same review id open and received this same message,
    // use the id to find where to add comment 
  });

  // NOTE: for debugging purposes only. remove for PR 
  connection.on("ReceiveCommentTest", (commentDto) => {

    let logger = createLogger();
    logger.log(LogLevel.Information, "comment received");
  });

  // Start the connection.
  start();
});
