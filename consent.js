/* Cookie consent + Google Consent Mode v2 — SAT Samarkand */
(function () {
  var KEY = 'sats_consent';
  var saved = null;
  try { saved = localStorage.getItem(KEY); } catch (e) {}

  function grant() {
    if (window.gtag) gtag('consent', 'update', {
      ad_storage: 'granted', analytics_storage: 'granted',
      ad_user_data: 'granted', ad_personalization: 'granted'
    });
  }
  // If user already accepted in a previous visit, restore consent and skip banner.
  if (saved === 'granted') { grant(); return; }
  if (saved === 'denied') { return; }

  var lang = 'en';
  try { lang = localStorage.getItem('sats_lang') || 'en'; } catch (e) {}

  var T = {
    en: { msg: 'We use cookies for analytics to improve our SAT prep site. You can accept or decline.',
          accept: 'Accept', decline: 'Decline' },
    uz: { msg: 'Saytimizni yaxshilash uchun analitik cookie-fayllardan foydalanamiz. Qabul qilishingiz yoki rad etishingiz mumkin.',
          accept: 'Qabul qilish', decline: 'Rad etish' },
    ru: { msg: 'Мы используем аналитические cookie, чтобы улучшать сайт. Вы можете принять или отклонить.',
          accept: 'Принять', decline: 'Отклонить' }
  };
  var t = T[lang] || T.en;

  var bar = document.createElement('div');
  bar.setAttribute('role', 'dialog');
  bar.setAttribute('aria-label', 'Cookie consent');
  bar.style.cssText = 'position:fixed;left:12px;right:12px;bottom:12px;z-index:9999;' +
    'max-width:760px;margin:0 auto;background:#022049;color:#fff;border-radius:14px;' +
    'box-shadow:0 8px 32px rgba(0,0,0,.28);padding:16px 18px;display:flex;gap:14px;' +
    'align-items:center;flex-wrap:wrap;font:500 14px/1.45 -apple-system,BlinkMacSystemFont,Segoe UI,system-ui,sans-serif';

  var txt = document.createElement('span');
  txt.textContent = t.msg;
  txt.style.cssText = 'flex:1 1 280px;min-width:200px';

  function mkBtn(label, primary) {
    var b = document.createElement('button');
    b.type = 'button'; b.textContent = label;
    b.style.cssText = 'cursor:pointer;border:0;border-radius:9px;padding:10px 18px;' +
      'font-weight:700;font-size:14px;' + (primary
        ? 'background:#60a5fa;color:#022049'
        : 'background:rgba(255,255,255,.14);color:#fff');
    return b;
  }
  var accept = mkBtn(t.accept, true);
  var decline = mkBtn(t.decline, false);

  function close() { if (bar.parentNode) bar.parentNode.removeChild(bar); }
  accept.onclick = function () { try { localStorage.setItem(KEY, 'granted'); } catch (e) {} grant(); close(); };
  decline.onclick = function () { try { localStorage.setItem(KEY, 'denied'); } catch (e) {} close(); };

  var btns = document.createElement('div');
  btns.style.cssText = 'display:flex;gap:10px;flex:0 0 auto';
  btns.appendChild(decline); btns.appendChild(accept);

  bar.appendChild(txt); bar.appendChild(btns);
  function show() { document.body.appendChild(bar); }
  if (document.body) show(); else document.addEventListener('DOMContentLoaded', show);
})();
