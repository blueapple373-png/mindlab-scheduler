import crypto from 'node:crypto';

const TOKEN_URL = 'https://oauth2.googleapis.com/token';
const SCOPE = 'https://www.googleapis.com/auth/spreadsheets';

function required(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing environment variable: ${name}`);
  return value;
}

function base64url(value) {
  return Buffer.from(value).toString('base64url');
}

async function getAccessToken() {
  const email = required('GOOGLE_SERVICE_ACCOUNT_EMAIL');
  const privateKey = required('GOOGLE_PRIVATE_KEY').replace(/\\n/g, '\n');
  const now = Math.floor(Date.now() / 1000);
  const header = base64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const payload = base64url(JSON.stringify({ iss: email, scope: SCOPE, aud: TOKEN_URL, iat: now, exp: now + 3600 }));
  const unsigned = `${header}.${payload}`;
  const signature = crypto.sign('RSA-SHA256', Buffer.from(unsigned), privateKey).toString('base64url');
  const response = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: `${unsigned}.${signature}` }),
  });
  const data = await response.json();
  if (!response.ok || !data.access_token) throw new Error(`Google authentication failed: ${JSON.stringify(data)}`);
  return data.access_token;
}

async function sheetsFetch(path, options = {}) {
  const spreadsheetId = required('GOOGLE_SHEET_ID');
  const token = await getAccessToken();
  const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}${path}`, {
    ...options,
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', ...(options.headers || {}) },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(`Google Sheets error: ${JSON.stringify(data)}`);
  return data;
}

export async function readRange(range) {
  const data = await sheetsFetch(`/values/${encodeURIComponent(range)}?valueRenderOption=UNFORMATTED_VALUE`);
  return data.values || [];
}

export async function updateRange(range, values) {
  return sheetsFetch(`/values/${encodeURIComponent(range)}?valueInputOption=USER_ENTERED`, {
    method: 'PUT', body: JSON.stringify({ range, majorDimension: 'ROWS', values }),
  });
}

export async function appendRange(range, values) {
  return sheetsFetch(`/values/${encodeURIComponent(range)}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`, {
    method: 'POST', body: JSON.stringify({ range, majorDimension: 'ROWS', values }),
  });
}
