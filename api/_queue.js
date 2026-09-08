import { appendRange, readRange, updateRange } from './_google.js';

const truthy = value => value === true || String(value).toLowerCase() === 'true';
const numeric = value => Number.isFinite(Number(value)) ? Number(value) : Number.MAX_SAFE_INTEGER;
const scheduledMillis = value => typeof value === 'number'
  ? Math.round((value - 25569) * 86400000)
  : Date.parse(value);

export async function loadState() {
  const [settingRows, queueRows] = await Promise.all([
    readRange('設定・抽出ルール!A2:C100'),
    readRange('投稿キュー!A2:L1000'),
  ]);
  const settings = Object.fromEntries(settingRows.filter(r => r[0]).map(r => [String(r[0]), r[1]]));
  const rows = queueRows.map((r, i) => ({
    rowNumber: i + 2, queueId: r[0] || '', materialId: r[1] || '', text: r[2] || '',
    approved: truthy(r[3]), status: r[4] || '', scheduledAt: r[5] || '', order: r[6],
    postedAt: r[7] || '', threadsId: r[8] || '', error: r[9] || '',
  }));
  const now = Date.now();
  const pending = rows.filter(r => {
    if (!r.approved || r.status !== '待機' || !r.text) return false;
    if (!r.scheduledAt) return true;
    const time = scheduledMillis(r.scheduledAt);
    return Number.isNaN(time) || time <= now;
  }).sort((a, b) => numeric(a.order) - numeric(b.order) || a.rowNumber - b.rowNumber);
  const stock = rows.filter(r => r.approved && r.status === '待機' && r.text).length;
  const perDay = Math.max(1, Number(settings['1日投稿数']) || 1);
  return { settings, rows, pending, stock, remainingDays: Math.ceil(stock / perDay) };
}

export async function setQueueStatus(rowNumber, status, { postedAt = '', threadsId = '', error = '' } = {}) {
  await Promise.all([
    updateRange(`投稿キュー!E${rowNumber}`, [[status]]),
    updateRange(`投稿キュー!H${rowNumber}:J${rowNumber}`, [[postedAt, threadsId, error]]),
    updateRange(`投稿キュー!L${rowNumber}`, [[new Date().toISOString()]]),
  ]);
}

export async function appendHistory(item, result, { threadsId = '', error = '' } = {}) {
  await appendRange('投稿履歴!A:I', [[`H-${Date.now()}`, item.queueId, item.materialId, item.text, new Date().toISOString(), threadsId, result, error, '1.0']]);
}
