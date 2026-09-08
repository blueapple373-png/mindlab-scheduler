import { loadState } from './_queue.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  if (!process.env.DASHBOARD_SECRET || req.headers['x-dashboard-secret'] !== process.env.DASHBOARD_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try {
    const state = await loadState();
    return res.status(200).json({
      stock: state.stock,
      remainingDays: state.remainingDays,
      tokenExpiry: state.settings['トークン期限'] || '',
      nextPosts: state.pending.slice(0, 20).map(({ rowNumber, ...item }) => item),
      postingEnabled: process.env.POSTING_ENABLED === 'true',
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
