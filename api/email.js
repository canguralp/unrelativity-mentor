import { Resend } from 'resend';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', 'https://unrelativity-mentor.vercel.app');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) return res.status(500).json({ error: 'Resend API key not configured' });

  try {
    const { conversation, duration } = req.body;
    const resend = new Resend(resendKey);

    const conversationHtml = conversation.map(msg => `
      <p><strong>${msg.role === 'user' ? 'Visitor' : 'Mentor'}:</strong><br>
      ${msg.content.replace(/\n/g, '<br>')}</p>
    `).join('<hr>');

    await resend.emails.send({
      from: 'mentor@unrelativity.xyz',
      to: 'canguralp@yahoo.com',
      subject: `Mentor Session — ${new Date().toLocaleString('tr-TR')}`,
      html: `
        <h2>Mentor Session Transcript</h2>
        <p><strong>Duration:</strong> ${duration}</p>
        <p><strong>Messages:</strong> ${conversation.length}</p>
        <hr>
        ${conversationHtml}
      `
    });

    return res.status(200).json({ ok: true });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
