if(!self.define){let e,n={};const t=(t,i)=>(t=new URL(t+".js",i).href,n[t]||new Promise((n=>{if("document"in self){const e=document.createElement("script");e.src=t,e.onload=n,document.head.appendChild(e)}else e=t,importScripts(t),n()})).then((()=>{let e=n[t];if(!e)throw new Error(`Module ${t} didn’t register its module`);return e})));self.define=(i,s)=>{const o=e||("document"in self?document.currentScript.src:"")||location.href;if(n[o])return;let c={};const r=e=>t(e,o),m={module:{uri:o},exports:c,require:r};n[o]=Promise.all(i.map((e=>m[e]||r(e)))).then((e=>(s(...e),c)))}}define(["./workbox-b7614db5"],(function(e){"use strict";self.skipWaiting(),e.clientsClaim(),e.registerRoute(/^https:\/\/apiviewstagingtest\.com\/api\/reviews\/.*\/content\/.*$/,new e.CacheFirst({cacheName:"revisioncontent",plugins:[new e.ExpirationPlugin({maxEntries:50,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/^https:\/\/apiviewuxtest\.com\/api\/reviews\/.*\/content\/.*$/,new e.CacheFirst({cacheName:"revisioncontent",plugins:[new e.ExpirationPlugin({maxEntries:50,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/^https:\/\/apiview\.com\/api\/reviews\/.*\/content\/.*$/,new e.CacheFirst({cacheName:"revisioncontent",plugins:[new e.ExpirationPlugin({maxEntries:50,maxAgeSeconds:86400})]}),"GET")}));
//# sourceMappingURL=sw.js.map
