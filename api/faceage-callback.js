export default async function handler(req, res) {
  // solo aceptamos envíos post, cualquier otra cosa se rechaza
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // comprobamos la contraseña que face age manda en la cabecera
  const token = req.headers['x-auth-token'];
  if (token !== 'skintrip-2026') {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // vercel ya convierte el json en objeto; si llega vacío usamos uno vacío
  const body = req.body || {};

  // dejamos en los logs de vercel lo que manda face age, así vemos su json real
  console.log('faceage payload:', JSON.stringify(body));

  // sin email klaviyo no sabe a qué clienta asignar el evento
  const email = body.email;
  if (!email) {
    return res.status(400).json({ error: 'Missing email' });
  }

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
          // pasamos todos los campos con sus nombres originales, los mismos que lee la plantilla
          properties: body,
          profile: {
            data: {
              type: 'profile',
              attributes: { email: email }
            }
          }
        }
      }
    })
  });

  if (!klaviyoRes.ok) {
    // guardamos en los logs el motivo exacto por el que klaviyo lo rechazó
    console.log('klaviyo error:', klaviyoRes.status, await klaviyoRes.text());
    return res.status(500).json({ error: 'Klaviyo error' });
  }

  return res.status(200).json({ ok: true });
}
