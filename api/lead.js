export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const lead = req.body;
    const { name, email, phone, interest, timestamp } = lead;

    console.log('NEW LEAD:', JSON.stringify(lead));

    // Send email notification via Resend (free tier: 3000 emails/month)
    const resendKey = process.env.RESEND_API_KEY;
    if (resendKey) {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${resendKey}`
        },
        body: JSON.stringify({
          from: 'Maya <hello@alignedwellnessco.space>',
          to: process.env.OWNER_EMAIL || 'hello@alignedwellnessco.space',
          subject: `New Lead: ${name} is interested in ${interest || 'Aligned Wellness'}!`,
          html: `
            <h2>New Lead from Aligned Wellness! 🌿</h2>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
            <p><strong>Interested in:</strong> ${interest || 'Not specified'}</p>
            <p><strong>Time:</strong> ${timestamp}</p>
            <hr/>
            <p style="color:#666">Sent by Maya, your Aligned Wellness AI agent</p>
          `
        })
      });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Lead error:', err.message);
    return res.status(500).json({ error: err.message });
  }
}
