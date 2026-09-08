import { runNextPost } from './_run.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!process.env.DASHBOARD_SECRET || req.headers['x-dashboard-secret'] !== process.env.DASHBOARD_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const dryRun = req.body?.dryRun !== false || process.env.POSTING_ENABLED !== 'true';
  try {
    return res.status(200).json(await runNextPost({ dryRun }));
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
