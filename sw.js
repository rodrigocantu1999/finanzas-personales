const CACHE='finanzas-v10.3';
const ASSETS=[
  './',
  './index.html',
  './manifest.json',
];

self.addEventListener('install',e=>{
  e.waitUntil(
    caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting())
  );
});

self.addEventListener('activate',e=>{
  e.waitUntil(
    caches.keys().then(keys=>
      Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))
    ).then(()=>self.clients.claim())
  );
});

// Network-first strategy
self.addEventListener('fetch',e=>{
  // Skip non-GET and cross-origin
  if(e.request.method!=='GET') return;
  if(!e.request.url.startsWith(self.location.origin)) return;

  // Skip Firebase/API calls
  if(e.request.url.includes('firestore.googleapis.com')) return;
  if(e.request.url.includes('firebase')) return;

  e.respondWith(
    fetch(e.request).then(res=>{
      const clone=res.clone();
      caches.open(CACHE).then(c=>c.put(e.request,clone));
      return res;
    }).catch(()=>caches.match(e.request))
  );
});
