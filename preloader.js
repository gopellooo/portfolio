(() => {
  const overlay = document.getElementById('site-preloader');
  if (!overlay) return;
  let done = 0, total = 3, finished = false;
  const label = overlay.querySelector('.preloader-percent');
  const fill = overlay.querySelector('.preloader-fill');
  const update = () => {
    const progress = Math.min(100, Math.round(done / total * 100));
    label.textContent = `${progress}%`;
    fill.style.transform = `scaleX(${progress / 100})`;
    overlay.setAttribute('aria-valuenow', String(progress));
  };
  const finish = () => {
    if (finished) return;
    finished = true;
    clearTimeout(failsafe);
    overlay.setAttribute('aria-hidden', 'true');
    overlay.classList.add('is-complete');
    setTimeout(() => overlay.remove(), 250);
  };
  const tick = () => { done++; update(); if (done >= total) setTimeout(finish, 180); };
  const failsafe = setTimeout(finish, 8000);
  const waitForContent = () => {
    const root = document.getElementById('root');
    if (root && !root.firstElementChild) {
      const observer = new MutationObserver(() => {
        if (root.firstElementChild) { observer.disconnect(); trackImages(); }
      });
      observer.observe(root, { childList: true });
      setTimeout(() => observer.disconnect(), 8000);
    } else trackImages();
  };
  const trackImages = () => {
    const images = [...document.images].filter(image => image.loading !== 'lazy');
    total += images.length;
    update();
    for (const image of images) {
      if (image.complete) tick();
      else {
        const loaded = () => { image.removeEventListener('load', loaded); image.removeEventListener('error', loaded); tick(); };
        image.addEventListener('load', loaded);
        image.addEventListener('error', loaded);
      }
    }
    (document.fonts ? document.fonts.ready : Promise.resolve()).then(tick, tick);
    tick();
  };
  if (document.readyState === 'complete') tick();
  else window.addEventListener('load', tick, { once: true });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', waitForContent, { once: true });
  else waitForContent();
})();
