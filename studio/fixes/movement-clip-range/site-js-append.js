
/* Movement Studio: register the range worker (scoped to /movements only).
   A clip that loaded before the worker took control is not seekable; reload
   that clip once, while it is paused, so the worker can serve it. */
(function () {
  if (!('serviceWorker' in navigator) || !/^\/movements(\/|$)/.test(location.pathname)) return;
  navigator.serviceWorker.register('/movement-clips-sw.js', { scope: '/movements' }).catch(function () {});
  function seekable(v) {
    return v.seekable.length > 0 && v.seekable.end(v.seekable.length - 1) > 0.5;
  }
  function retry(v) {
    if (!navigator.serviceWorker.controller || v.__clipRetried || !v.paused || seekable(v)) return;
    if (!v.closest('.ms-studio') || v.networkState === HTMLMediaElement.NETWORK_EMPTY) return;
    v.__clipRetried = true;
    v.load();
  }
  navigator.serviceWorker.addEventListener('controllerchange', function () {
    document.querySelectorAll('.ms-studio video').forEach(retry);
  });
  // Media events don't bubble; listen in the capture phase for clips that finish loading later.
  document.addEventListener('loadedmetadata', function (e) { if (e.target instanceof HTMLVideoElement) retry(e.target); }, true);
})();
