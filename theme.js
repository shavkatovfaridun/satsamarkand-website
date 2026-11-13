/* Shared header, language switch fallback and mobile action bar. */
(function () {
  var d = document, KEY = 'sats_lang';

  // Pages that ship their own setLang keep it; the rest get this one.
  if (typeof window.setLang !== 'function') {
    var apply = function (l) {
      d.querySelectorAll('[data-' + l + ']').forEach(function (el) { el.innerHTML = el.getAttribute('data-' + l); });
      d.documentElement.lang = l;
      d.querySelectorAll('.lb').forEach(function (b) { b.classList.toggle('on', b.dataset.lang === l); });
    };
    window.setLang = function (l) { try { localStorage.setItem(KEY, l); } catch (e) {} apply(l); };
    var saved = null;
    try { saved = localStorage.getItem(KEY); } catch (e) {}
    apply(saved || d.documentElement.lang || 'en');
  }

  // A page with its own Uzbek or Russian address switches by going there.
  var langs = d.querySelector('.sx-langs');
  if (langs) langs.addEventListener('click', function (e) {
    var b = e.target.closest ? e.target.closest('.lb') : null; if (!b) return;
    var alt = d.querySelector('link[rel="alternate"][hreflang="' + b.dataset.lang + '"]'); if (!alt) return;
    var path = alt.getAttribute('href').replace(/^https?:\/\/[^/]+/, '');
    if (path === location.pathname) return;
    e.stopImmediatePropagation(); e.preventDefault();
    try { localStorage.setItem(KEY, b.dataset.lang); } catch (x) {}
    location.href = path;
  }, true);

  var hd = d.getElementById('sx-hd'), bg = d.getElementById('sx-burger');
  if (hd && bg) {
    var menu = function (open) { hd.classList.toggle('sx-open', open); bg.setAttribute('aria-expanded', open); };
    bg.addEventListener('click', function () { menu(!hd.classList.contains('sx-open')); });
    hd.querySelectorAll('.sx-drawer a').forEach(function (a) { a.addEventListener('click', function () { menu(false); }); });
    d.addEventListener('keydown', function (e) { if (e.key === 'Escape') menu(false); });
  }

  // Call-request form: same Apps Script endpoint and field names as /register/.
  var LEAD_URL = 'https://script.google.com/macros/s/AKfycbySO6lLsainzUtHLBF5HVKatqIcbHZSpzsSBAOml7mBIsRadRT52A88Roz-oG9uDeZLpQ/exec';
  d.querySelectorAll('.sx-lead-form').forEach(function (f) {
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = f.elements.name.value.trim(), phone = f.elements.phone.value.trim(), btn = f.querySelector('button');
      f.classList.remove('sx-err');
      if (!name) { f.elements.name.focus(); return; }
      if (phone.replace(/\D/g, '').length < 12) { f.elements.phone.focus(); return; }
      btn.disabled = true;
      fetch(LEAD_URL, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain' }, body: JSON.stringify({
        type: 'registration', name: name, phone: phone, age: '', grade: '', school: '', program: '',
        heard: 'Website call request', message: 'Call request from ' + location.pathname
      }) }).then(function () {
        f.classList.add('sx-ok');
        if (typeof window.gtag === 'function') window.gtag('event', 'generate_lead', { form: 'call_request', page: location.pathname });
      }).catch(function () { f.classList.add('sx-err'); btn.disabled = false; });
    });
  });

  var bar = d.querySelector('.sx-sticky');
  if (bar) {
    var tick = false;
    var onScroll = function () { tick = false; bar.classList.toggle('sx-show', window.scrollY > 520); };
    window.addEventListener('scroll', function () { if (!tick) { tick = true; requestAnimationFrame(onScroll); } }, { passive: true });
    onScroll();
  }
})();
