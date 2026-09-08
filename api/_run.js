import { appendHistory, loadState, setQueueStatus } from './_queue.js';
import { publishText } from './_threads.js';

export async function runNextPost({ dryRun = false } = {}) {
  const state = await loadState();
  const item = state.pending[0];
  if (!item) return { success: true, posted: false, reason: '投稿できる承認済み待機文がありません', stock: state.stock };
  if (dryRun) return { success: true, posted: false, dryRun: true, candidate: item, stock: state.stock };
  await setQueueStatus(item.rowNumber, '投稿中');
  try {
    const threadsId = await publishText(item.text);
    const postedAt = new Date().toISOString();
    await setQueueStatus(item.rowNumber, '投稿済み', { postedAt, threadsId });
    await appendHistory(item, '成功', { threadsId });
    return { success: true, posted: true, threadsId, queueId: item.queueId };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    await setQueueStatus(item.rowNumber, 'エラー', { error: message });
    await appendHistory(item, '失敗', { error: message });
    throw error;
  }
}
