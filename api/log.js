export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { messages, lang } = req.body;

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'Messages required' });
  }

  // Format conversation as readable text
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

  const emailBody = `
Mentor Konuşması / Mentor Session
Tarih / Date: ${date}
Dil / Language: ${langLabel}
Mesaj sayısı / Message count: ${messages.length}

─────────────────────────────────

${transcript}
─────────────────────────────────
unrelativity.xyz
  `.trim();

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`
      },
      body: JSON.stringify({
        from: 'Unrelativity Mentor <onboarding@resend.dev>',
        to: ['canguralp47@gmail.com'],
        subject: subject,
        text: emailBody
      })
    });

    if (!response.ok) {
      const err = await response.json();
      console.error('Resend error:', err);
      return res.status(500).json({ error: 'Email failed' });
    }

    return res.status(200).json({ sent: true });

  } catch (error) {
    console.error('Email error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
}
