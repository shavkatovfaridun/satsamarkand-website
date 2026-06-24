const SHEET_ID = '1nneDzo_Uzj5sNvh5r5DHQHJT73CRPrvOfWUev9e5PXw';
const TELEGRAM_BOT_TOKEN = 'PASTE_YOUR_NEW_BOT_TOKEN_HERE'; // old token was exposed — revoke it in @BotFather and paste the new one here
const TELEGRAM_CHAT_ID = '1632587141';

function doPost(e) {
  try {
    let data = {};

    // Try form-encoded first (URL params)
    if (e.parameter && Object.keys(e.parameter).length > 0) {
      data = e.parameter;
    }
    // Fall back to JSON body
    else if (e.postData && e.postData.contents) {
      try {
        data = JSON.parse(e.postData.contents);
      } catch(jsonErr) {
        data = {};
      }
    }

    Logger.log('Parsed data: ' + JSON.stringify(data));

    const sheet = SpreadsheetApp.openById(SHEET_ID);
    const timestamp = new Date().toLocaleString('en-GB', { timeZone: 'Asia/Tashkent' });

    if (data.type === 'registration') {
      let tab = sheet.getSheetByName('Registrations');
      if (!tab) {
        tab = sheet.insertSheet('Registrations');
        tab.appendRow(['Timestamp', 'Name', 'Phone', 'Age', 'Grade', 'School', 'Program', 'Heard', 'Message']);
      }
      tab.appendRow([
        timestamp,
        data.name || '',
        data.phone || '',
        data.age || '',
        data.grade || '',
        data.school || '',
        data.program || '',
        data.heard || '',
        data.message || ''
      ]);

      sendTelegram(data, timestamp);
    }

    if (data.type === 'mock_score') {
      let tab = sheet.getSheetByName('MockScores');
      if (!tab) {
        tab = sheet.insertSheet('MockScores');
        tab.appendRow(['Timestamp', 'Name', 'Score', 'Date', 'Added By']);
      }
      tab.appendRow([
        timestamp,
        data.name || '',
        data.score || '',
        data.date || '',
        data.added_by || 'Admin'
      ]);
    }

    // Lightweight callback leads from the website form (kept separate from full Registrations)
    if (data.type === 'lead') {
      let tab = sheet.getSheetByName('Leads');
      if (!tab) {
        tab = sheet.insertSheet('Leads');
        tab.appendRow(['Timestamp', 'Name', 'Phone', 'Program', 'Language', 'Page']);
      }
      tab.appendRow([
        timestamp,
        data.name || '',
        data.phone || '',
        data.program || '',
        data.lang || '',
        data.page || ''
      ]);

      sendTelegram(data, timestamp);
    }

    return ContentService
      .createTextOutput(JSON.stringify({status: 'ok'}))
      .setMimeType(ContentService.MimeType.JSON);

  } catch(err) {
    Logger.log('doPost ERROR: ' + err.toString());
    return ContentService
      .createTextOutput(JSON.stringify({status: 'error', message: err.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function sendTelegram(data, timestamp) {
  try {
    Logger.log('Sending Telegram for: ' + data.name);

    const message =
      '🔔 *New Lead — SAT Samarkand*\n\n' +
      '👤 *Name:* ' + (data.name || 'Not provided') + '\n' +
      '📞 *Phone:* `' + (data.phone || 'Not provided') + '`\n' +
      (data.age ? '🎂 *Age:* ' + data.age + '\n' : '') +
      (data.grade ? '🎓 *Grade:* ' + data.grade + '\n' : '') +
      (data.school ? '🏫 *School:* ' + data.school + '\n' : '') +
      (data.program ? '📚 *Program:* ' + data.program + '\n' : '') +
      (data.heard ? '📡 *Source:* ' + data.heard + '\n' : '') +
      (data.page ? '🌐 *Page:* ' + data.page + '\n' : '') +
      (data.message ? '\n💬 *Message:* ' + data.message + '\n' : '') +
      '\n📅 ' + timestamp + '\n' +
      '\n⚡ _Contact within 24 hours_';

    const url = 'https://api.telegram.org/bot' + TELEGRAM_BOT_TOKEN + '/sendMessage';

    UrlFetchApp.fetch(url, {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'Markdown'
      }),
      muteHttpExceptions: true
    });
  } catch(err) {
    Logger.log('Telegram error: ' + err.toString());
  }
}

function doGet(e) {
  const sheet = SpreadsheetApp.openById(SHEET_ID);
  const type = e.parameter.type;

  if (type === 'get_scores') {
    let tab = sheet.getSheetByName('MockScores');
    if (!tab) return ContentService.createTextOutput(JSON.stringify([])).setMimeType(ContentService.MimeType.JSON);
    const rows = tab.getDataRange().getValues();
    const scores = rows.slice(1).filter(r => r[1] && r[2]).map(r => ({name:r[1], score:Number(r[2]), date:r[3]}));
    scores.sort((a,b) => b.score - a.score);
    return ContentService.createTextOutput(JSON.stringify(scores.slice(0,10))).setMimeType(ContentService.MimeType.JSON);
  }

  if (type === 'get_registrations') {
    let tab = sheet.getSheetByName('Registrations');
    if (!tab) return ContentService.createTextOutput(JSON.stringify([])).setMimeType(ContentService.MimeType.JSON);
    const rows = tab.getDataRange().getValues();
    const regs = rows.slice(1).filter(r => r[1]).map(r => ({time:r[0], name:r[1], phone:r[2], age:r[3], grade:r[4], school:r[5], program:r[6]})).reverse();
    return ContentService.createTextOutput(JSON.stringify(regs)).setMimeType(ContentService.MimeType.JSON);
  }

  return ContentService.createTextOutput(JSON.stringify({status:'ok'})).setMimeType(ContentService.MimeType.JSON);
}

function testFromForm() {
  const fakeEvent = {
    parameter: {
      type: 'lead',
      name: 'Faridun Test',
      phone: '+998 95 113 16 00',
      program: 'SAT MAX (1500+ guaranteed)',
      lang: 'en',
      page: '/'
    }
  };
  doPost(fakeEvent);
  Logger.log('Test done — check Telegram and the Leads tab');
}
