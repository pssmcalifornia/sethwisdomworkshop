/**
 * Seth Wisdom Workshop registration receiver.
 * Copy this entire file into a Google Apps Script project owned by
 * pssmcalifornia@gmail.com, set SPREADSHEET_ID, and deploy as a Web app.
 * Do not place attendee data in the public GitHub repository.
 */
const SPREADSHEET_ID = '1bPTl7j-WpWPr8WsULx3TQ4m7OcL0uczHPtOfF4-NjMc';
const SHEET_NAME = 'Registrations';
const WEBSITE_URL = 'https://pssmcalifornia.github.io/sethwisdomworkshop/';
const FLYER_URL = WEBSITE_URL + 'flyer.png';

function doPost(e) {
  try {
    const p = e && e.parameter ? e.parameter : {};
    // This hidden field helps filter unsophisticated automated submissions.
    if (String(p._honey || '').trim()) {
      return makeResult_('Thank you', 'Your request has been received.');
    }

    const name = clean_(p.name, 100);
    const mobile = clean_(p['Mobile Number'], 25);
    const email = clean_(p.email, 160);
    const city = clean_(p.City, 100);

    if (name.length < 2 || city.length < 2 ||
        !/^[+0-9().\-\s]{7,25}$/.test(mobile) ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return makeResult_('Please check your details',
        'The registration was not saved. Please return to the form and check all four fields.');
    }

    if (SPREADSHEET_ID === 'REPLACE_WITH_YOUR_GOOGLE_SHEET_ID') {
      throw new Error('Spreadsheet ID is not configured.');
    }

    // Concurrent submissions must not overwrite or duplicate header setup.
    const lock = LockService.getScriptLock();
    lock.waitLock(15000);
    try {
      const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
      let sheet = ss.getSheetByName(SHEET_NAME);
      if (!sheet) sheet = ss.insertSheet(SHEET_NAME);
      if (sheet.getLastRow() === 0) {
        sheet.appendRow(['Submitted At', 'Full Name', 'Mobile', 'Email', 'City']);
        sheet.setFrozenRows(1);
      }

      // Prevent values beginning with =, +, -, @ from being evaluated as formulas.
      const safe = value => /^[=+\-@]/.test(value) ? "'" + value : value;
      sheet.appendRow([new Date(), safe(name), safe(mobile), safe(email), safe(city)]);
    } finally {
      lock.releaseLock();
    }

    return makeResult_('Thank you for registering!',
      'Your Seth Wisdom Workshop registration was saved successfully.');
  } catch (err) {
    console.error('Workshop registration failure', err.message);
    return makeResult_('Registration not completed',
      'We could not save your registration. Please contact Anu Venkat at +1 (916) 260-7243.');
  }
}

function clean_(value, maxLen) {
  return String(value == null ? '' : value)
    .replace(/[\x00-\x1F\x7F]/g, ' ').trim().slice(0, maxLen);
}

function makeResult_(heading, message) {
  const escape = s => String(s).replace(/[&<>"']/g, c =>
    ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const html = '<!doctype html><html lang="en"><head><meta charset="utf-8">' +
    '<meta name="viewport" content="width=device-width,initial-scale=1">' +
    '<title>Seth Wisdom Workshop Registration</title><style>' +
    'body{margin:0;background:linear-gradient(145deg,#eaf3ff,#fff7e6);' +
    'font:16px/1.6 system-ui;color:#213954;padding:22px 12px}' +
    'main{max-width:610px;margin:15px auto;background:white;padding:24px;' +
    'border-radius:18px;border:1px solid #e8d6b3;text-align:center;' +
    'box-shadow:0 12px 36px #17325a15}' +
    'h1{font:700 2rem Georgia,serif;color:#173b69}' +
    'img{display:block;width:100%;max-width:450px;height:auto;margin:20px auto;' +
    'border-radius:10px}' +
    'a{color:#173b69;font-weight:700}.back{display:inline-block;margin-top:18px}' +
    '</style></head><body><main><h1>' + escape(heading) + '</h1><p>' +
    escape(message) + '</p><p><strong>November 21–22, 2026</strong><br>' +
    'Sacramento, California</p><p>Questions? Contact <strong>Anu Venkat</strong><br>' +
    '<a href="tel:+19162607243">+1 (916) 260-7243</a></p>' +
    '<img src="' + escape(FLYER_URL) + '" alt="Seth Wisdom Workshop flyer">' +
    '<a class="back" href="' + escape(WEBSITE_URL) + '">Back to workshop page</a>' +
    '</main></body></html>';
  return HtmlService.createHtmlOutput(html)
    .setTitle('Seth Wisdom Workshop Registration');
}
