(() => {
  'use strict';
  const project = window.PROJECT || { stops: [], sources: [] };
  const stops = Array.isArray(project.stops) ? project.stops : [];
  const sources = Array.isArray(project.sources) ? project.sources : [];
  let current = 0;
  let edition = 'greenbook';
  let storymap = null;
  let mapReady = false;
  let toastTimer;
  const $ = (id) => document.getElementById(id);
  const escape = (value) => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const number = (value) => String(value + 1).padStart(2, '0');
  const safeUrl = (value) => {
    if (!value) return '';
    const text = String(value);
    return /^(https?:\/\/|\.\/|assets\/)/i.test(text) ? escape(text) : '';
  };
  const plain = (value) => Array.isArray(value) ? value.join('\n\n') : String(value ?? '');
  const paragraphs = (value) => plain(value).split(/\n\s*\n/).filter(Boolean).map(p => `<p>${escape(p).replace(/\n/g, '<br>')}</p>`).join('');
  const previewUrl = (value) => {
    const path = String(value || '');
    return safeUrl(path.endsWith('-thumb.jpg') ? path : path.replace(/^(assets\/greenbook-(?:1941|1956)-[^.]+)\.jpg$/, '$1-thumb.jpg'));
  };
  const sourceLabel = (source) => {
    const parts = [];
    if (source.year) parts.push(escape(source.year));
    if (source.pages) parts.push(`Printed ${/^pp?\./.test(String(source.pages)) ? '' : /[–—,-]/.test(String(source.pages)) ? 'pp. ' : 'p. '}${escape(source.pages)}`);
    if (!source.pages && source.reference) parts.push(escape(source.reference));
    return parts.join(' <span aria-hidden="true">·</span> ');
  };
  const external = (url, label, classes = 'source-link') => safeUrl(url) ? `<a class="${classes}" href="${safeUrl(url)}" target="_blank" rel="noopener noreferrer">${escape(label)} <span aria-hidden="true">↗</span></a>` : '';
  function getHashIndex() {
    const raw = location.hash.slice(1);
    const stopId = decodeURIComponent(raw.startsWith('stop-') ? raw.slice(5) : raw);
    return stops.findIndex(stop => stop.id === stopId);
  }
  function makeSourceCard(source) {
    const image = previewUrl(source.image);
    const cover = image ? `<img src="${image}" alt="Cover or page of ${escape(source.title)}" loading="lazy">` : `<span class="source-cover-placeholder">${escape(source.title)}</span>`;
    const href = safeUrl(source.url);
    return `<${href ? 'a' : 'article'} class="source-card"${href ? ` href="${href}" target="_blank" rel="noopener noreferrer"` : ''}><div class="source-cover">${cover}</div><p class="source-year">${escape(source.year || 'Primary source')}</p><h3>${escape(source.title)}</h3>${source.creator ? `<p class="source-creator">${escape(source.creator)}</p>` : ''}<p class="source-description">${escape(source.description || '')}</p>${source.pages ? `<p class="source-pages">${escape(source.pages)}</p>` : ''}${source.credit ? `<p class="source-credit">Image credit: ${escape(source.credit)}</p>` : ''}<span class="archive-label">${href ? 'Read in the archive' : 'Source record'} <span aria-hidden="true">↗</span></span></${href ? 'a' : 'article'}>`;
  }
  function listingMarkup(source) {
    if (!source.listings?.length) return '';
    return `<div class="listings"><p class="listings-label">Selected entries, as printed</p>${source.listings.map(entry => `<div class="listing"><span><strong>${escape(entry.name)}</strong>${entry.type ? `<br>${escape(entry.type)}` : ''}</span><span>${escape(entry.address || '')}</span></div>`).join('')}</div>`;
  }
  function countMarkup(source) {
    if (source.hotelCount == null) return '';
    return `<div class="count-summary"><div><strong>${escape(source.hotelCount)}</strong><span>Hotels reported<br>by the guide</span></div><div><strong>${source.blackHotelCount == null ? '—' : escape(source.blackHotelCount)}</strong><span>${source.blackHotelCount == null ? 'No separate racial<br>hotel count printed' : 'Marked for<br>Black travelers'}</span></div></div>${source.countNote ? `<p class="count-note">${escape(source.countNote)}</p>` : ''}`;
  }
  function evidenceMarkup(source, kind, stop) {
    if (!source) return '';
    const isGreen = kind === 'greenbook';
    const image = previewUrl(source.image);
    const label = isGreen ? 'The Green Book' : 'The mainstream guide';
    return `<section class="evidence-card${isGreen ? ' greenbook-card' : ''}" aria-label="${label}"><div class="evidence-topline"><span class="small-label">${label}</span><span class="source-date">${escape(source.year || '')}</span></div>${isGreen && stop.later ? `<div class="edition-switch" role="group" aria-label="Green Book edition"><button type="button" class="edition-button" data-edition="greenbook" aria-pressed="${edition === 'greenbook'}">${escape(stop.greenbook?.year || '1941')}</button><button type="button" class="edition-button" data-edition="later" aria-pressed="${edition === 'later'}">${escape(stop.later.year || '1956')}</button></div>` : ''}<h4>${escape(source.title || label)}</h4><p class="source-ref">${sourceLabel(source)}</p>${image ? `<a href="${safeUrl(source.url) || image}" class="evidence-image" target="_blank" rel="noopener noreferrer" aria-label="Open original scan of ${escape(source.title)}"><img src="${image}" alt="Historical page from ${escape(source.title)}" loading="lazy"></a>` : ''}<div class="evidence-text">${paragraphs(source.text)}</div>${!isGreen ? countMarkup(source) : ''}${listingMarkup(source)}${external(source.url, 'View the cited source')}</section>`;
  }
  function stopPromotionMarkup(source) {
    if (!source) return '';
    return `<section class="stop-promotion" aria-label="Supplemental promotional evidence"><figure><a href="${safeUrl(source.url) || safeUrl(source.image)}" target="_blank" rel="noopener noreferrer"><img src="${safeUrl(source.image)}" alt="${escape(source.caption || 'Historical tourism image from the 1939 North Carolina brochure.')}" loading="lazy"></a>${source.caption ? `<figcaption>${escape(source.caption)}</figcaption>` : ''}</figure><div><p class="eyebrow">The promotional image / ${escape(source.year || '1939')}</p><h4>${escape(source.title)}</h4><p class="source-ref">${sourceLabel(source)}</p><div class="supplemental-text">${paragraphs(source.text)}</div>${external(source.url, 'View the brochure scan')}${source.credit ? `<p class="supplemental-credit">Image credit: ${escape(source.credit)}</p>` : ''}</div></section>`;
  }
  function renderStop(index, options = {}) {
    if (!stops.length) return;
    current = Math.max(0, Math.min(stops.length - 1, index));
    const stop = stops[current];
    const greenbook = edition === 'later' && stop.later ? stop.later : stop.greenbook;
    $('stop-detail').innerHTML = `<div class="stop-header"><span class="stop-big-number" aria-hidden="true">${number(current)}</span><div class="stop-heading"><p class="eyebrow">${escape(stop.kicker || 'North Carolina / A place in the guides')}</p><h3 id="stop-title">${escape(stop.title || stop.city)}</h3></div><div class="stop-intro">${paragraphs(stop.intro)}</div></div><div class="comparison-grid">${evidenceMarkup(stop.mainstream, 'mainstream', stop)}${evidenceMarkup(greenbook, 'greenbook', stop)}</div>${stopPromotionMarkup(stop.promotion)}<aside class="analysis-note"><span class="small-label">What the comparison reveals</span><div>${paragraphs(stop.analysis)}${stop.question ? `<p class="stop-question">${escape(stop.question)}</p>` : ''}</div></aside>`;
    document.querySelectorAll('.stop-tab').forEach((button, i) => button.setAttribute('aria-pressed', String(i === current)));
    $('stop-count').textContent = `${number(current)} / ${String(stops.length).padStart(2, '0')}`;
    $('previous-stop').disabled = current === 0;
    $('next-stop').disabled = current === stops.length - 1;
    if (options.hash !== false) history.replaceState(null, '', `#stop-${encodeURIComponent(stop.id)}`);
    if (mapReady && options.map !== false && storymap?.goTo) storymap.goTo(current);
    $('stop-detail').querySelectorAll('[data-edition]').forEach(button => button.addEventListener('click', () => {
      edition = button.dataset.edition;
      renderStop(current, { hash: false, map: false });
      const selected = $('stop-detail').querySelector(`[data-edition="${edition}"]`);
      selected?.focus({ preventScroll: true });
    }));
  }
  function notify(message) {
    $('toast').textContent = message;
    $('toast').classList.add('visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => $('toast').classList.remove('visible'), 3500);
  }
  async function shareStop() {
    const url = new URL(location.href);
    url.hash = `stop-${stops[current].id}`;
    try {
      if (navigator.clipboard && window.isSecureContext) await navigator.clipboard.writeText(url.href);
      else {
        const field = document.createElement('textarea');
        field.value = url.href;
        field.style.position = 'fixed';
        field.style.opacity = '0';
        document.body.appendChild(field);
        field.select();
        const copied = document.execCommand('copy');
        field.remove();
        if (!copied) throw new Error('Copy unavailable');
      }
      notify(`Link to ${stops[current].city} copied.`);
    } catch {
      notify('The address bar now contains this stop’s link. Copy it to share.');
      history.replaceState(null, '', url.href);
    }
  }
  function loadStyles(href) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    const loaded = new Promise((resolve, reject) => {
      link.onload = resolve;
      link.onerror = reject;
    });
    document.head.appendChild(link);
    return loaded;
  }
  async function loadStoryMap() {
    const stylesLoaded = loadStyles('https://cdn.knightlab.com/libs/storymapjs/latest/css/storymap.css');
    const script = document.createElement('script');
    script.src = 'https://cdn.knightlab.com/libs/storymapjs/latest/js/storymap-min.js';
    const loaded = new Promise((resolve, reject) => {
      script.onload = resolve;
      script.onerror = reject;
    });
    document.head.appendChild(script);
    try {
      await Promise.all([loaded, stylesLoaded]);
      const Constructor = window.KLStoryMap?.StoryMap || window.VCO?.StoryMap;
      if (!Constructor) throw new Error('StoryMapJS is unavailable');
      const data = { storymap: { slides: stops.map((stop, i) => ({
        location: { lat: Number(stop.lat), lon: Number(stop.lon), zoom: 9, line: true },
        text: { headline: `${number(i)} · ${escape(stop.city)}`, text: `<p>${escape(plain(stop.intro))}</p><p><a href="#stop-detail">Compare the evidence below ↓</a></p>` }
      })) }};
      const fallback = $('map-fallback');
      storymap = new Constructor('storymap', data, {
        map_type: 'osm:standard',
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        map_background_color: '#e3e4d9',
        line_color: '#9d412d', line_color_inactive: '#b9c0ae', line_weight: 2,
        line_dash: '5,6', duration: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 700,
        start_at_slide: current, map_popup: false, map_mini: false,
        calculate_zoom: true, show_lines: true, show_history_line: true,
        slide_padding_lr: 28, language: 'en'
      }, {
        loaded: () => {
          mapReady = true;
          fallback?.remove();
          if (storymap?.goTo) storymap.goTo(current);
        },
        change: (event) => {
          const index = Number(event.current_slide);
          if (Number.isInteger(index) && index >= 0 && index < stops.length && index !== current) renderStop(index, { map: false });
        }
      });
      // Native controls retain StoryMapJS navigation while receiving a visible,
      // keyboard-accessible hit area independent of the library's icon font.
      [['.vco-slidenav-previous', 'Previous map stop'], ['.vco-slidenav-next', 'Next map stop']].forEach(([selector, label]) => {
        const control = $('storymap').querySelector(selector);
        if (!control) return;
        control.setAttribute('role', 'button');
        control.setAttribute('tabindex', '0');
        control.setAttribute('aria-label', label);
        control.addEventListener('keydown', event => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            control.click();
          }
        });
      });
      // Establish the Leaflet view immediately rather than waiting for the
      // library's animated layout refresh. The map's public handle is documented.
      if (storymap.map?.setView) {
        storymap.map.setView([Number(stops[current].lat), Number(stops[current].lon)], 9, { animate: false });
      }
      storymap.updateDisplay?.();
      setTimeout(() => {
        if (!mapReady && $('map-status')) $('map-status').textContent = 'The interactive map is taking longer to load. Use the place names and arrows.';
      }, 15000);
    } catch (error) {
      console.warn('The interactive map could not load; the exhibit remains available.', error);
      $('map-status').textContent = 'Interactive map unavailable. Explore every stop using the place names and arrows.';
    }
  }
  $('sources-grid').innerHTML = sources.map(makeSourceCard).join('');
  if (project.promotion) {
    const promotion = project.promotion;
    $('promotion-evidence').innerHTML = `<article class="promotion-panel"><div class="promotion-copy"><p class="eyebrow">A second mainstream voice / ${escape(promotion.year || '1939')}</p><h3>The promise of a<br><em>year-round vacation.</em></h3><p class="promotion-source-title">${escape(promotion.title)}</p><p class="source-ref">${sourceLabel(promotion)}</p><div class="promotion-text">${paragraphs(promotion.text)}</div>${external(promotion.url, 'Read the promotional brochure')}</div><figure class="promotion-figure"><a href="${safeUrl(promotion.url) || safeUrl(promotion.image)}" target="_blank" rel="noopener noreferrer"><img src="${safeUrl(promotion.image)}" alt="A calendar of twelve leisure photographs from the 1939 North Carolina tourism brochure." loading="lazy"></a><figcaption>${escape(promotion.caption || '')}${promotion.credit ? `<span>Image credit: ${escape(promotion.credit)}</span>` : ''}</figcaption></figure></article>`;
  }
  if (project.routeEvidence) {
    const route = project.routeEvidence;
    $('route-evidence').innerHTML = `<aside class="route-evidence"><span class="section-index">A period road</span><div><h3>${escape(route.title)}</h3><div>${paragraphs(route.text)}</div>${route.reference ? `<p class="route-reference">${escape(route.reference)}</p>` : ''}${external(route.url, 'Read the period route description')}</div></aside>`;
  }
  if (project.about?.method) {
    const methodText = document.querySelector('.method-note p');
    methodText.textContent = 'The 1939 guide and 1941 Green Book provide the closest comparison; Fall 1956 is a later snapshot. ' + project.about.method;
  }
  if (!stops.length) {
    $('map-status').textContent = 'The exhibit content is being prepared.';
    $('stop-detail').innerHTML = '<p>The historical comparisons will appear here.</p>';
    $('previous-stop').disabled = true;
    $('next-stop').disabled = true;
    $('share-stop').disabled = true;
    return;
  }
  $('stop-nav').innerHTML = stops.map((stop, i) => `<button class="stop-tab" type="button" data-stop="${i}" aria-pressed="false"><span class="stop-tab-number">${number(i)}</span><span class="stop-tab-city">${escape(stop.city)}</span></button>`).join('');
  $('stop-nav').addEventListener('click', event => {
    const button = event.target.closest('[data-stop]');
    if (button) renderStop(Number(button.dataset.stop));
  });
  $('stop-nav').addEventListener('keydown', event => {
    const button = event.target.closest('[data-stop]');
    if (!button || !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    let index = Number(button.dataset.stop);
    if (event.key === 'ArrowLeft') index = Math.max(0, index - 1);
    if (event.key === 'ArrowRight') index = Math.min(stops.length - 1, index + 1);
    if (event.key === 'Home') index = 0;
    if (event.key === 'End') index = stops.length - 1;
    renderStop(index);
    $('stop-nav').querySelector(`[data-stop="${index}"]`).focus({ preventScroll: true });
  });
  $('previous-stop').addEventListener('click', () => renderStop(current - 1));
  $('next-stop').addEventListener('click', () => renderStop(current + 1));
  $('share-stop').addEventListener('click', shareStop);
  window.addEventListener('hashchange', () => {
    const index = getHashIndex();
    if (index >= 0) renderStop(index, { hash: false });
  });
  let resizeFrame;
  window.addEventListener('resize', () => {
    cancelAnimationFrame(resizeFrame);
    resizeFrame = requestAnimationFrame(() => storymap?.updateDisplay?.());
  });
  const initialIndex = getHashIndex();
  renderStop(initialIndex >= 0 ? initialIndex : 0, { hash: false, map: false });
  // Native hash scrolling occurs before the stop rail exists, so recover a direct link.
  if (initialIndex >= 0) requestAnimationFrame(() => $('journey').scrollIntoView({ behavior: 'instant', block: 'start' }));
  loadStoryMap();
})();
