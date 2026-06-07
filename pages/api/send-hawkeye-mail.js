import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { result } = req.body;

  if (!result) {
    return res.status(400).json({ error: 'result is required' });
  }

  try {
    await resend.emails.send({
      from: 'yumesaku@resend.dev',
      to: 'rucci0413gt@gmail.com', // ← U39のGmailアドレスに変更してください
      subject: '🦅 鷹の目レポート',
      html: `<pre style="font-family:sans-serif;white-space:pre-wrap;">${result}</pre>`,
    });

    res.status(200).json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'メール送信失敗' });
  }
}
