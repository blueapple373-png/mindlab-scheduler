export async function publishText(text) {
  const accessToken = process.env.THREADS_ACCESS_TOKEN;
  if (!accessToken) throw new Error('Missing environment variable: THREADS_ACCESS_TOKEN');
  const createResponse = await fetch('https://graph.threads.net/v1.0/me/threads', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ media_type: 'TEXT', text, access_token: accessToken }),
  });
  const container = await createResponse.json();
  if (!createResponse.ok || !container.id) throw new Error(`Container creation failed: ${JSON.stringify(container)}`);
  await new Promise(resolve => setTimeout(resolve, 2000));
  const publishResponse = await fetch('https://graph.threads.net/v1.0/me/threads_publish', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ creation_id: container.id, access_token: accessToken }),
  });
  const published = await publishResponse.json();
  if (!publishResponse.ok || !published.id) throw new Error(`Publish failed: ${JSON.stringify(published)}`);
  return published.id;
}
