function required(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing environment variable: ${name}`);
  return value;
}

async function gasRequest(action, payload = {}) {
  const response = await fetch(required('GAS_ENDPOINT_URL'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action,
      secret: required('GAS_SECRET'),
      ...payload,
    }),
  });

  const text = await response.text();
  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch (error) {
    throw new Error(`GAS returned non-JSON response: ${text.slice(0, 300)}`);
  }

  if (!response.ok || data.ok === false) {
    throw new Error(data.error || `GAS request failed with status ${response.status}`);
  }

  return data;
}

export async function readRange(range) {
  const data = await gasRequest('readRange', { range });
  return data.values || [];
}

export async function updateRange(range, values) {
  return gasRequest('updateRange', { range, values });
}

export async function appendRange(range, values) {
  return gasRequest('appendRange', { range, values });
}
