/* A bounded enhancement: no route, focus or content visibility is owned by this intro. */
(() => {
  const root = document.documentElement;
  if (!root.classList.contains('bg-intro-active')) return;
  let closed = false;
  const close = () => {
    if (closed) return;
    closed = true;
    root.classList.remove('bg-intro-active');
    root.dataset.introState = 'complete';
    window.dispatchEvent(new Event('blackglass:intro-complete'));
    clearTimeout(timer);
    for (const name of ['pointerdown', 'wheel', 'touchstart', 'keydown', 'pagehide']) window.removeEventListener(name, close, true);
    document.querySelector('[data-intro-skip]')?.removeEventListener('click', close);
  };
  const remaining = Math.max(0, 1500 - (performance.now() - Number(root.dataset.introStart || 0)));
  const timer = setTimeout(close, remaining);
  for (const name of ['pointerdown', 'wheel', 'touchstart', 'keydown', 'pagehide']) window.addEventListener(name, close, {capture:true, passive:true});
  document.querySelector('[data-intro-skip]')?.addEventListener('click', close);
})();
