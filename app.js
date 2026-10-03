/* Optional navigation highlight. The full exhibition is static HTML. */
(() => {
  'use strict';
  const links = [...document.querySelectorAll('.main-nav a')];
  const sections = links.map(link => document.querySelector(link.hash)).filter(Boolean);
  const header = document.querySelector('.site-header');
  if (!sections.length || !header) return;
  let scheduled = false;
  function update() {
    scheduled = false;
    const scrollPadding = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
    const readingLine = Math.max(header.getBoundingClientRect().bottom, scrollPadding) + 1;
    let active = sections[0];
    sections.forEach(section => {
      if (section.getBoundingClientRect().top <= readingLine) active = section;
    });
    if (window.scrollY > 0 && window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2) {
      active = sections[sections.length - 1];
    }
    links.forEach(link => {
      if (link.hash === '#' + active.id) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  }
  function schedule() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(update);
  }
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule);
  update();
})();
