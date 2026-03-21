export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let body = req.body;

  // Handle both JSON and plain text (sendBeacon sends as text/plain)
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch(e) { body = {}; }
  }

  const { messages, lang } = body || {};

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'No messages' });
  }

  const date = new Date().toLocaleString('tr-TR', { timeZone: 'America/New_York' });
  const langLabel = lang === 'tr' ? 'Türkçe' : 'English';

  let transcript = '';
  for (const msg of messages) {
    const role = msg.role === 'user'
      ? (lang === 'tr' ? 'KULLANICI' : 'USER')
      : (lang === 'tr' ? 'REHBER' : 'MENTOR');
    transcript += `${role}:\n${msg.content}\n\n`;
  }

  const subject = `Unrelativity Mentor — ${langLabel} — ${date}`;
  const emailBody = `Mentor Konuşması / Session\nTarih: ${date}\nDil: ${langLabel}\nMesaj: ${messages.length}\n\n─────────────────────────────────\n\n${transcript}─────────────────────────────────\nunrelativity.xyz`;

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`
      },
      body: JSON.stringify({
        from: 'Unrelativity Mentor <onboarding@resend.dev>',
        to: ['canguralp@yahoo.com'],
        subject: subject,
        text: emailBody
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Resend error:', JSON.stringify(data));
      return res.status(500).json({ error: 'Email failed', detail: data });
    }

    return res.status(200).json({ sent: true });

  } catch (error) {
    console.error('Email error:', error.message);
    return res.status(500).json({ error: 'Server error' });
  }
}
