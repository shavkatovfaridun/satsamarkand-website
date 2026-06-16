/**
 * SAT Samarkand — lead capture backend (Google Apps Script)
 *
 * What it does on each form submit:
 *   1. Appends the lead as a row in the bound Google Sheet.
 *   2. Sends a Telegram message to your chat via your bot.
 *
 * SETUP (one time):
 *   1. Create a Google Sheet. Top menu: Extensions → Apps Script.
 *   2. Delete any sample code, paste THIS file in, and save.
 *   3. Create a Telegram bot: message @BotFather → /newbot → copy the token.
 *   4. Get your chat id: message your new bot once, then open
 *      https://api.telegram.org/bot<YOUR_TOKEN>/getUpdates and read "chat":{"id":...}.
 *      (For a group, add the bot to the group and use the group's negative id.)
 *   5. Fill in BOT_TOKEN and CHAT_ID below.
 *   6. Deploy → New deployment → type "Web app" →
 *        Execute as: Me   |   Who has access: Anyone
 *      Copy the /exec URL it gives you.
 *   7. Paste that URL into ENDPOINT at the top of lead-form.js on the website.
 */

var BOT_TOKEN = 'PASTE_YOUR_BOT_TOKEN_HERE';
var CHAT_ID   = 'PASTE_YOUR_CHAT_ID_HERE';   // e.g. 123456789  or  -1001234567890 for a group

function doPost(e) {
  try {
    var p = (e && e.parameter) ? e.parameter : {};
    var name   = (p.name   || '').toString().slice(0, 120);
    var phone  = (p.phone  || '').toString().slice(0, 60);
    var course = (p.course || '').toString().slice(0, 120);
    var lang   = (p.lang   || '').toString().slice(0, 8);
    var page   = (p.page   || '').toString().slice(0, 200);
    var now    = new Date();

    // 1) Append to the Sheet
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(['Timestamp', 'Name', 'Phone', 'Program', 'Language', 'Page']);
    }
    sheet.appendRow([now, name, phone, course, lang, page]);

    // 2) Notify Telegram
    if (BOT_TOKEN.indexOf('PASTE_') !== 0) {
      var text =
        '🎓 New SAT Samarkand lead\n' +
        '👤 ' + name + '\n' +
        '📞 ' + phone + '\n' +
        '📚 ' + course + '\n' +
        '🌐 ' + lang + '  ·  ' + page;
      UrlFetchApp.fetch('https://api.telegram.org/bot' + BOT_TOKEN + '/sendMessage', {
        method: 'post',
        payload: { chat_id: CHAT_ID, text: text },
        muteHttpExceptions: true
      });
    }

    return ContentService.createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ ok: false, error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Optional: lets you open the /exec URL in a browser to confirm it's live.
function doGet() {
  return ContentService.createTextOutput('SAT Samarkand lead endpoint is running.');
}
