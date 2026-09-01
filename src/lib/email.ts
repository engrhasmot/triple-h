interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail(options: EmailOptions) {
  const provider = process.env.EMAIL_PROVIDER || 'log';

  if (provider === 'log') {
    console.log('--- EMAIL ---');
    console.log('To:', options.to);
    console.log('Subject:', options.subject);
    console.log('Body:', options.html);
    console.log('--- END EMAIL ---');
    return { success: true };
  }

  if (provider === 'sendgrid') {
    try {
      const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.SENDGRID_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personalizations: [{ to: [{ email: options.to }] }],
          from: { email: process.env.EMAIL_FROM || 'noreply@tripleh.com.bd' },
          subject: options.subject,
          content: [{ type: 'text/html', value: options.html }],
        }),
      });
      return { success: res.ok };
    } catch (err) {
      console.error('SendGrid email failed:', err);
      return { success: false };
    }
  }

  return { success: true };
}