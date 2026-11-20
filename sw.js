var V = "spese-v1";
var SHELL = ["./", "index.html", "manifest.json", "icon-192.png", "icon-512.png"];
self.addEventListener("install", function (e) {
  e.waitUntil(caches.open(V).then(function (c) { return c.addAll(SHELL); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener("activate", function (e) {
  e.waitUntil(caches.keys().then(function (ks) {
    return Promise.all(ks.filter(function (k) { return k !== V; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
self.addEventListener("fetch", function (e) {
  var r = e.request;
  if (r.method !== "GET") return;
  var u = new URL(r.url);
  var ok = u.origin === location.origin || u.host === "cdn.jsdelivr.net" || u.host === "fonts.googleapis.com" || u.host === "fonts.gstatic.com";
  if (!ok) return;
  e.respondWith(caches.open(V).then(function (c) {
    return c.match(r).then(function (hit) {
      var net = fetch(r).then(function (res) {
        if (res && (res.ok || res.type === "opaque")) c.put(r, res.clone());
        return res;
      }).catch(function () { return hit; });
      return hit || net;
    });
  }));
});
