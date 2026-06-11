export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { text, access_token } = req.body;

  if (!text || !access_token) {
    return res.status(400).json({ error: 'text and access_token are required' });
  }

  try {
    const createRes = await fetch('https://graph.threads.net/v1.0/me/threads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        media_type: 'TEXT',
        text: text,
        access_token: access_token
      })
    });

    const createData = await createRes.json();

    if (!createData.id) {
      return res.status(400).json({ error: 'Failed to create container', detail: createData });
    }

    await new Promise(r => setTimeout(r, 2000));

    const publishRes = await fetch('https://graph.threads.net/v1.0/me/threads_publish', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        creation_id: createData.id,
        access_token: access_token
      })
    });

    const publishData = await publishRes.json();

    if (publishData.id) {
      return res.status(200).json({ success: true, id: publishData.id });
    } else {
      return res.status(400).json({ error: 'Failed to publish', detail: publishData });
    }

  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
