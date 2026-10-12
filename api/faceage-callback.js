export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const token = req.headers['x-auth-token'];
  if (token !== 'skintrip-2026') {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { email, name, results, recommended_products, quiz_answers } = req.body;

  const klaviyoRes = await fetch('https://a.klaviyo.com/client/events/?company_id=W5JUus', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'revision': '2024-10-15'
    },
    body: JSON.stringify({
      data: {
        type: 'event',
        attributes: {
          metric: {
            data: { type: 'metric', attributes: { name: 'FaceAge Recommendation' } }
          },
          properties: {
            products: recommended_products || [],
            results: results || {},
            quiz_answers: quiz_answers || {}
          },
          profile: {
            data: {
              type: 'profile',
              attributes: { email: email, first_name: name }
            }
          }
        }
      }
    })
  });

  if (!klaviyoRes.ok) {
    return res.status(500).json({ error: 'Klaviyo error' });
  }

  return res.status(200).json({ ok: true });
}
