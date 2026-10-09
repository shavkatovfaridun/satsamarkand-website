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

  var hd = d.getElementById('sx-hd'), bg = d.getElementById('sx-burger');
  if (hd && bg) {
    var menu = function (open) { hd.classList.toggle('sx-open', open); bg.setAttribute('aria-expanded', open); };
    bg.addEventListener('click', function () { menu(!hd.classList.contains('sx-open')); });
    hd.querySelectorAll('.sx-drawer a').forEach(function (a) { a.addEventListener('click', function () { menu(false); }); });
    d.addEventListener('keydown', function (e) { if (e.key === 'Escape') menu(false); });
  }

  var bar = d.querySelector('.sx-sticky');
  if (bar) {
    var tick = false;
    var onScroll = function () { tick = false; bar.classList.toggle('sx-show', window.scrollY > 520); };
    window.addEventListener('scroll', function () { if (!tick) { tick = true; requestAnimationFrame(onScroll); } }, { passive: true });
    onScroll();
  }
})();
