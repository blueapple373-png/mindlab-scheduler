import { runNextPost } from './_run.js';

export default async function handler(req, res) {
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  if (process.env.POSTING_ENABLED !== 'true') {
    return res.status(200).json({ success: true, posted: false, reason: 'POSTING_ENABLED is not true' });
  }
  try {
    return res.status(200).json(await runNextPost({ dryRun: false }));
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
