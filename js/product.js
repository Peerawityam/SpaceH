// Product page controller – JS-enhanced behavior
(function(){
  const $ = (sel, ctx=document) => ctx.querySelector(sel);
  const $$ = (sel, ctx=document) => Array.from(ctx.querySelectorAll(sel));

  const VARIANTS = {
    "1": { id: "1", title: "SpaceTownhome", price: "price 1", imgClass: "img-1", lblClass: "lbl-1" },
    "2": { id: "2", title: "SpaceHouse",    price: "price 2", imgClass: "img-2", lblClass: "lbl-2" },
    "3": { id: "3", title: "SpaceVilla",    price: "price 3", imgClass: "img-3", lblClass: "lbl-3" },
  };

  function ready(fn){
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn);
    else fn();
  }

  ready(() => {
    const wrapper = $('.product-wrapper');
    if (!wrapper) return;

    const details = $('#variantBox');
    const radios = $$('input[name="variant"]', wrapper);
    const titleEl = $('.title', wrapper);
    const titleSpans = $$('.title span', wrapper);
    const priceSpans = $$('.price-display .price', wrapper);
    const images = $$('.product-media img', wrapper);
    const summary = $('summary', details || document);
    const summaryLabels = summary ? $$('.lbl', summary) : [];

    const persistKey = 'spaceh.product.variant';

    function setSummaryLabel(id){
      if (!summary) return;
      summaryLabels.forEach(el => el.style.display = 'none');
      const v = VARIANTS[id];
      const lbl = v && $('.' + v.lblClass, summary);
      if (lbl) lbl.style.display = 'inline';
    }

    function setTitle(id){
      titleSpans.forEach(el => el.style.display = 'none');
      const t = $('.title-' + id, titleEl);
      if (t) t.style.display = 'inline';
    }

    function setPrice(id){
      priceSpans.forEach(el => el.style.display = 'none');
      const p = $('.price-' + id, wrapper);
      if (p) p.style.display = 'inline';
    }

    function setImage(id){
      images.forEach(img => img.style.display = 'none');
      const img = $('.img-' + id, wrapper);
      if (img) img.style.display = 'block';
    }

    function setRadio(id){
      radios.forEach(r => r.checked = (r.id === 'opt' + id));
    }

    function setVariant(id, opts){
      const options = Object.assign({ persist: true, closeDropdown: true }, opts);
      if (!VARIANTS[id]) return;
      // Update UI pieces
      setRadio(id);
      setTitle(id);
      setPrice(id);
      setImage(id);
      setSummaryLabel(id);
      // Pulse glow on media frame to hint a change
      const frame = $('.product-media .frame', wrapper);
      animateOnce(frame, 'pulse-glow');
      if (wrapper) wrapper.dataset.variant = id;
      if (options.persist) {
        try { localStorage.setItem(persistKey, String(id)); } catch {}
      }
      if (options.closeDropdown && details) details.open = false;
    }

    // Restore selection or default to the checked radio
    let initial = '2';
    try {
      const saved = localStorage.getItem(persistKey);
      if (saved && VARIANTS[saved]) initial = saved;
    } catch {}
    // If DOM has a different checked radio, prefer it
    const checked = radios.find(r => r.checked);
    if (checked && VARIANTS[checked.value]) initial = checked.value;

    setVariant(initial, { persist: false, closeDropdown: false });

    // Respond to radio changes
    wrapper.addEventListener('change', (e) => {
      const t = e.target;
      if (t && t.name === 'variant') {
        setVariant(t.value);
      }
    });

    // Dropdown auto-close helpers
    if (details) {
      document.addEventListener('click', (e) => {
        if (!details.contains(e.target)) details.open = false;
      });
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') details.open = false;
      });
    }

    // Navbar enhancements: close on link click / resize
    const navToggle = $('#nav-toggle');
    const navLinks = $$('.navbar .nav-link');

    function closeNav(){ if (navToggle) navToggle.checked = false; }

    navLinks.forEach(a => a.addEventListener('click', closeNav));
    window.addEventListener('resize', () => {
      if (window.innerWidth >= 992) closeNav();
    });
    document.addEventListener('click', (e) => {
      const nav = $('.navbar');
      if (!nav) return;
      if (!nav.contains(e.target)) closeNav();
    });

    // Planet dropdown behavior
    const planetKey = 'spaceh.product.planet';
    // Use local placeholder SVGs for each planet (media/icons/*.svg). Replace later with final licensed icons if desired.
    const PLANET_ICON = {
      Mercury: 'media/icons/mercury.png',
      Venus:   'media/icons/venus.png',
      Mars:    'media/icons/mars.png',
      Jupiter: 'media/icons/jupiter.png',
      Saturn:  'media/icons/saturn.png',
      Uranus:  'media/icons/uranus.png',
      Neptune: 'media/icons/neptune.png',
      Pluto:   'media/icons/pluto.png'
    };
    const planetSelect = $('#planetSelect');
    const planetInfo = $('#planetInfo');
    const planetIcon = $('#planetIcon');
    function setPlanetUI(value){
      if (planetSelect) planetSelect.value = value;
      if (planetInfo) {
        const url = PLANET_ICON[value];
        const label = $('.planet-label', planetInfo);
        if (label) label.textContent = 'Selected: ' + value;
        if (planetIcon && url) {
          planetIcon.src = url;
          planetIcon.style.display = 'inline-block';
          planetIcon.width = 18;
          planetIcon.height = 18;
          animateOnce(planetIcon, 'pop');
        }
      }
    }
    if (planetSelect) {
      let planet = 'Mercury';
      try {
        const saved = localStorage.getItem(planetKey);
        if (saved) planet = saved;
      } catch {}
      // Fallback if saved value is no longer available
      if (!PLANET_ICON[planet]) planet = 'Mercury';
      setPlanetUI(planet);
      planetSelect.addEventListener('change', () => {
        const val = planetSelect.value;
        setPlanetUI(val);
        try { localStorage.setItem(planetKey, val); } catch {}
      });
    }

    // Button ripple effect
    const buyBtn = $('.btn-primary');
    if (buyBtn) {
      buyBtn.addEventListener('click', (e) => {
        const rect = buyBtn.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const span = document.createElement('span');
        span.className = 'ripple';
        span.style.width = span.style.height = size + 'px';
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        span.style.left = x + 'px';
        span.style.top = y + 'px';
        buyBtn.appendChild(span);
        span.addEventListener('animationend', () => span.remove(), { once: true });
      });
    }

    // Scroll reveal for main cards
    const toReveal = [$('.product-media'), $('.price-card')].filter(Boolean);
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('show');
            io.unobserve(entry.target);
          }
        });
      }, { threshold: 0.2 });
      toReveal.forEach(el => { el.classList.add('reveal'); io.observe(el); });
    } else {
      toReveal.forEach(el => el.classList.add('show'));
    }
  });
})();

// Small helper to play a CSS animation class once
function animateOnce(el, className){
  if (!el) return;
  el.classList.remove(className);
  void el.offsetWidth; // reflow to restart animation
  el.classList.add(className);
  el.addEventListener('animationend', () => el.classList.remove(className), { once: true });
}
