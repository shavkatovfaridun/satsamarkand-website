/* Lead capture form — SAT Samarkand
   Renders into <div id="lead-form-mount"></div>.
   Submits to a Google Apps Script web app that (1) appends the lead to a Google
   Sheet and (2) notifies your Telegram bot. The bot token lives ONLY in the
   Apps Script (server side) — never here in the browser. */
(function () {
  // ▼▼▼ PASTE YOUR DEPLOYED APPS SCRIPT WEB-APP URL HERE ▼▼▼
  var ENDPOINT = ''; // e.g. 'https://script.google.com/macros/s/AKfy.../exec'
  // ▲▲▲ until this is set, the form falls back to your Telegram link ▲▲▲
  var TG_FALLBACK = 'https://t.me/satsam_support';

  var mount = document.getElementById('lead-form-mount');
  if (!mount) return;

  var lang = 'en';
  try { lang = localStorage.getItem('sats_lang') || 'en'; } catch (e) {}

  var T = {
    en: { h: 'Prefer we call you back?', sub: 'Leave your number and we’ll reach out today.',
          name: 'Your name', phone: 'Phone number', course: 'Which program?',
          opts: ['Not sure yet', 'SAT Intensive', 'SAT MAX (1500+ guaranteed)', 'Private 1-on-1'],
          send: 'Request a callback', ok: 'Thank you! We’ll contact you today.',
          err: 'Could not send. Please message us on Telegram instead.', req: 'Please fill in your name and phone.' },
    uz: { h: 'Sizga o‘zimiz qo‘ng‘iroq qilaylikmi?', sub: 'Raqamingizni qoldiring — bugun bog‘lanamiz.',
          name: 'Ismingiz', phone: 'Telefon raqamingiz', course: 'Qaysi dastur?',
          opts: ['Hali aniq emas', 'SAT Intensive', 'SAT MAX (1500+ kafolat)', 'Yakkama-yakka'],
          send: 'Qo‘ng‘iroq so‘rash', ok: 'Rahmat! Bugun bog‘lanamiz.',
          err: 'Yuborilmadi. Iltimos, Telegram orqali yozing.', req: 'Iltimos, ism va telefonni kiriting.' },
    ru: { h: 'Перезвонить вам?', sub: 'Оставьте номер — свяжемся сегодня.',
          name: 'Ваше имя', phone: 'Номер телефона', course: 'Какая программа?',
          opts: ['Пока не уверен', 'SAT Intensive', 'SAT MAX (гарантия 1500+)', 'Индивидуально'],
          send: 'Заказать звонок', ok: 'Спасибо! Мы свяжемся с вами сегодня.',
          err: 'Не удалось отправить. Напишите нам в Telegram.', req: 'Укажите имя и телефон.' }
  };
  var t = T[lang] || T.en;

  var wrap = document.createElement('div');
  wrap.style.cssText = 'max-width:520px;margin:2.5rem auto;background:#fff;border:1px solid #d2d2d7;' +
    'border-radius:18px;padding:26px 24px;box-shadow:0 8px 32px rgba(0,0,0,.08);' +
    'font:400 15px/1.5 -apple-system,BlinkMacSystemFont,Segoe UI,system-ui,sans-serif';

  var optsHtml = t.opts.map(function (o) { return '<option>' + o + '</option>'; }).join('');
  wrap.innerHTML =
    '<h3 style="margin:0 0 4px;font-size:1.25rem;color:#022049">' + t.h + '</h3>' +
    '<p style="margin:0 0 18px;color:#6e6e73;font-size:.92rem">' + t.sub + '</p>' +
    '<form novalidate>' +
      '<input name="name" autocomplete="name" placeholder="' + t.name + '" ' +
        'style="width:100%;box-sizing:border-box;padding:12px 14px;margin-bottom:10px;border:1px solid #d2d2d7;border-radius:10px;font-size:15px">' +
      '<input name="phone" type="tel" autocomplete="tel" inputmode="tel" placeholder="' + t.phone + '" ' +
        'style="width:100%;box-sizing:border-box;padding:12px 14px;margin-bottom:10px;border:1px solid #d2d2d7;border-radius:10px;font-size:15px">' +
      '<select name="course" aria-label="' + t.course + '" ' +
        'style="width:100%;box-sizing:border-box;padding:12px 14px;margin-bottom:14px;border:1px solid #d2d2d7;border-radius:10px;font-size:15px;background:#fff">' +
        optsHtml + '</select>' +
      '<button type="submit" ' +
        'style="width:100%;cursor:pointer;border:0;border-radius:11px;padding:14px;font-weight:700;font-size:15px;background:#022049;color:#fff">' +
        t.send + '</button>' +
      '<p class="lf-msg" role="status" aria-live="polite" style="margin:12px 0 0;font-size:.9rem;text-align:center;min-height:1em"></p>' +
    '</form>';

  mount.appendChild(wrap);
  var form = wrap.querySelector('form');
  var msg = wrap.querySelector('.lf-msg');

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var name = form.name.value.trim(), phone = form.phone.value.trim();
    if (!name || !phone) { msg.style.color = '#b00020'; msg.textContent = t.req; return; }

    var btn = form.querySelector('button');
    btn.disabled = true; btn.style.opacity = '.6';
    msg.style.color = '#6e6e73'; msg.textContent = '…';

    if (window.gtag) gtag('event', 'generate_lead', { method: 'callback_form' });

    if (!ENDPOINT) { // not configured yet → graceful Telegram fallback
      msg.style.color = '#b00020';
      msg.innerHTML = t.err + ' <a href="' + TG_FALLBACK + '" target="_blank" rel="noopener" style="color:#022049;font-weight:700">@satsam_support</a>';
      btn.disabled = false; btn.style.opacity = '1';
      return;
    }

    var body = new URLSearchParams({
      type: 'lead',                 // routes to the "Leads" tab in your Apps Script
      name: name, phone: phone,
      program: form.course.value,   // your script reads data.program
      lang: lang, page: location.pathname
    });
    fetch(ENDPOINT, { method: 'POST', body: body }) // simple request → no CORS preflight
      .then(function () {
        form.reset();
        msg.style.color = '#0a7d32'; msg.textContent = t.ok;
      })
      .catch(function () {
        msg.style.color = '#b00020';
        msg.innerHTML = t.err + ' <a href="' + TG_FALLBACK + '" target="_blank" rel="noopener" style="color:#022049;font-weight:700">@satsam_support</a>';
      })
      .finally(function () { btn.disabled = false; btn.style.opacity = '1'; });
  });
})();
