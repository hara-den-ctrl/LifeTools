const CACHE="healthtools-v1.1";const CORE=["./","./index.html","./styles.css?v=1.1","./seasoning-db.js?v=1.1","./app.js?v=1.1","./product-scan.js?v=1.1","./vendor/html5-qrcode.min.js?v=1.1","./vendor/tesseract.min.js?v=1.1","./vendor/worker.min.js","./vendor/lang/jpn.traineddata.gz","./manifest.webmanifest","./version.json","./icon.svg"];
self.addEventListener("install",event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(CORE)).then(()=>self.skipWaiting())));
self.addEventListener("activate",event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith("healthtools-")&&key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim())));
self.addEventListener("message",event=>{if(event.data?.type==="SKIP_WAITING")self.skipWaiting();});
self.addEventListener("fetch",event=>{
 if(event.request.method!=="GET")return;
 const url=new URL(event.request.url);
 if(url.pathname.endsWith("/version.json")){event.respondWith(fetch(event.request,{cache:"no-store"}));return;}
 if(event.request.mode==="navigate"){
  event.respondWith(fetch(event.request,{cache:"no-store"}).then(response=>{const copy=response.clone();caches.open(CACHE).then(cache=>cache.put("./index.html",copy));return response;}).catch(()=>caches.match("./index.html")));
  return;
 }
 event.respondWith(fetch(event.request).then(response=>{if(response.ok&&url.origin===location.origin){const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(event.request,copy));}return response;}).catch(()=>caches.match(event.request)));
});
