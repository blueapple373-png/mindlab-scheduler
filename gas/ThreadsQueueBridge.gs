const SHEET_ID = '12iI7qdoQ-oWUY57g2LuvZ_DDetbarBWkt_17ToYvgns';
const SCRIPT_SECRET = PropertiesService.getScriptProperties().getProperty('GAS_SECRET');

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents || '{}');

    if (!SCRIPT_SECRET || body.secret !== SCRIPT_SECRET) {
      return jsonResponse({ ok: false, error: 'Unauthorized' }, 401);
    }

    const spreadsheet = SpreadsheetApp.openById(SHEET_ID);

    if (body.action === 'readRange') {
      const range = spreadsheet.getRange(body.range);
      return jsonResponse({ ok: true, values: range.getValues() });
    }

    if (body.action === 'updateRange') {
      const values = Array.isArray(body.values) ? body.values : [];
      const range = spreadsheet.getRange(body.range);
      range.setValues(values);
      return jsonResponse({ ok: true });
    }

    if (body.action === 'appendRange') {
      const values = Array.isArray(body.values) ? body.values : [];
      const sheetName = String(body.range || '').split('!')[0].replace(/^'|'$/g, '');
      const sheet = spreadsheet.getSheetByName(sheetName);
      if (!sheet) throw new Error(`Sheet not found: ${sheetName}`);
      values.forEach(row => sheet.appendRow(row));
      return jsonResponse({ ok: true });
    }

    return jsonResponse({ ok: false, error: `Unknown action: ${body.action}` }, 400);
  } catch (error) {
    return jsonResponse({ ok: false, error: error.message || String(error) }, 500);
  }
}

function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
