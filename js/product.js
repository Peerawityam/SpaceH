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
  // Only target the product gallery images inside the media frame (exclude planet icon)
  const images = $$('.product-media .frame img', wrapper);
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
      const img = $('.product-media .frame .img-' + id, wrapper);
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
    // Priority: URL ?v= → saved in localStorage → checked radio → default '2'
    let initial = '2';
    const params = new URLSearchParams(window.location.search);
    const urlV = params.get('v');
    if (urlV && VARIANTS[urlV]) {
      initial = urlV;
    } else {
      try {
        const saved = localStorage.getItem(persistKey);
        if (saved && VARIANTS[saved]) initial = saved;
      } catch {}
      // If DOM has a different checked radio, prefer it
      const checked = radios.find(r => r.checked);
      if (checked && VARIANTS[checked.value]) initial = checked.value;
    }

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

    // (Removed legacy CSS-only navbar toggle helpers; Bootstrap handles collapse behavior)

  // Planet dropdown behavior (custom dropdown, do not persist between visits)
    // Use local placeholder icons for each planet (media/icons/*.png). Replace later with final licensed icons if desired.
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
    const planetInfo = $('#planetInfo');
    const planetIcon = $('#planetIcon');
    const planetSummary = $('#planetSummary');
    const planetDetails = $('#planetDropdown');
    const planetRadios = $$('input[name="planet"]');
    function setPlanetUI(value){
      // Update dropdown summary label
      if (planetSummary) planetSummary.textContent = value ? value : '— เลือกดาวเคราะห์ —';
      if (planetInfo) {
        const url = PLANET_ICON[value];
        const label = $('.planet-label', planetInfo);
        if (label) label.textContent = value ? ('Selected: ' + value) : 'Selected: —';
        if (planetIcon) {
          if (url) {
            planetIcon.src = url;
            planetIcon.style.display = 'inline-block';
            planetIcon.width = 18;
            planetIcon.height = 18;
            animateOnce(planetIcon, 'pop');
          } else {
            planetIcon.removeAttribute('src');
            planetIcon.style.display = 'none';
          }
        }
      }
    }
    // Start with no selection
    setPlanetUI('');
    // Wire up radios
    if (planetRadios.length) {
      planetRadios.forEach(r => r.addEventListener('change', () => {
        if (r.checked) {
          setPlanetUI(r.value);
          if (planetDetails) planetDetails.open = false; // close panel after pick
        }
      }));
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

        // After ripple, open in-page checkout modal with current selection
        setTimeout(()=>{
          const current = wrapper?.dataset?.variant || (radios.find(r=>r.checked)?.value) || '2';
    const pr = $$('input[name="planet"]');
    const cpr = pr.find(x=>x.checked);
    const planet = cpr ? cpr.value : '—';
          openCheckoutModal(current, planet);
        }, 80);
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

// --- Embedded Checkout Modal Logic ---
function fmtUSD(n){
  try { return new Intl.NumberFormat('en-US').format(Number(n)); } catch { return n; }
}

function openCheckoutModal(variantId, planet){
  const VARIANT_META = {
    "1": { name: "SpaceTownhome", price: 9999999, img: "media/SpaceTownhome.png" },
    "2": { name: "SpaceHouse",    price: 15999999, img: "media/SpaceHouse.png" },
    "3": { name: "SpaceVilla",    price: 25999999, img: "media/SpaceVilla.png" }
  };
  const modalEl = document.getElementById('checkoutModal');
  if (!modalEl) return;
  const modal = (window.bootstrap && window.bootstrap.Modal) ? window.bootstrap.Modal.getOrCreateInstance(modalEl, { backdrop: 'static', keyboard: true }) : null;

  const meta = VARIANT_META[variantId] || VARIANT_META['2'];
  // Populate summary
  const img = modalEl.querySelector('#mSumImage');
  if (img) { img.src = meta.img; img.alt = meta.name; }
  const pName = modalEl.querySelector('#mSumProduct');
  if (pName) pName.textContent = meta.name;
  const pPlanet = modalEl.querySelector('#mSumPlanet');
  if (pPlanet) pPlanet.textContent = planet || '—';
  const pTotal = modalEl.querySelector('#mSumTotal');
  if (pTotal) pTotal.textContent = '$ ' + fmtUSD(meta.price);

  // Reset form / success state
  const form = modalEl.querySelector('#mPayForm');
  const btn = modalEl.querySelector('#mPayBtn');
  const spin = modalEl.querySelector('#mPaySpin');
  const ok = modalEl.querySelector('#mPaySuccess');
  if (form) { form.reset(); form.style.display = 'block'; }
  if (ok) ok.style.display = 'none';
  if (btn) btn.disabled = false;
  if (spin) spin.classList.add('d-none');

  if (form) {
    form.onsubmit = function(ev){
      ev.preventDefault();
      if (btn) btn.disabled = true;
      if (spin) spin.classList.remove('d-none');
      setTimeout(()=>{
        if (spin) spin.classList.add('d-none');
        if (ok) ok.style.display = 'block';
        form.style.display = 'none';
        const id = 'SH-' + Date.now().toString(36).toUpperCase();
        const oid = modalEl.querySelector('#mOrderId');
        if (oid) oid.textContent = id;
      }, 1000);
    };
  }

  if (modal) modal.show();
}
