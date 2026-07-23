// controllers/contactController.js
const { Resend } = require('resend');

exports.sendContactEmail = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Please enter a valid email address.' });
    }

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey || apiKey.startsWith('re_your_')) {
      return res.status(503).json({
        message: 'Resend API key is not configured on Vercel yet. Please set RESEND_API_KEY in Vercel Environment Variables.'
      });
    }

    const resend = new Resend(apiKey);
    const developerEmail = process.env.DEVELOPER_EMAIL || 'razaaffan08@gmail.com';

    const { data, error } = await resend.emails.send({
      from: 'Prepify AI Contact <onboarding@resend.dev>',
      to: [developerEmail],
      replyTo: email,
      subject: `[Prepify AI] ${subject}`,
      html: `
        <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #090d16; border-radius: 16px; overflow: hidden; border: 1px solid #1f2937;">
          
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #14b8a6, #06b6d4); padding: 32px 40px;">
            <h1 style="color: white; margin: 0; font-size: 22px; font-weight: 700; letter-spacing: -0.5px;">Prepify AI</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 6px 0 0; font-size: 14px;">New developer contact message</p>
          </div>

          <!-- Body -->
          <div style="padding: 36px 40px; color: #e5e7eb;">
            <h2 style="color: #ffffff; font-size: 18px; margin: 0 0 24px; font-weight: 600;">${subject}</h2>
            
            <div style="background: #111827; border: 1px solid #1f2937; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #9ca3af; font-size: 13px; width: 80px; vertical-align: top; font-weight: 500;">Name</td>
                  <td style="padding: 8px 0; color: #ffffff; font-size: 14px; font-weight: 600;">${name}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #9ca3af; font-size: 13px; vertical-align: top; font-weight: 500;">Email</td>
                  <td style="padding: 8px 0; color: #ffffff; font-size: 14px;"><a href="mailto:${email}" style="color: #2dd4bf; text-decoration: none;">${email}</a></td>
                </tr>
              </table>
            </div>

            <div style="background: #042f2e; border: 1px solid #134e4a; border-radius: 12px; padding: 20px; margin-bottom: 28px;">
              <p style="margin: 0; color: #ccfbf1; font-size: 14px; line-height: 1.7; white-space: pre-wrap;">${message}</p>
            </div>

            <a href="mailto:${email}?subject=Re: ${subject}" 
               style="display: inline-block; background: linear-gradient(135deg, #14b8a6, #06b6d4); color: white; text-decoration: none; padding: 12px 28px; border-radius: 50px; font-size: 14px; font-weight: 600; letter-spacing: 0.3px;">
              Reply to ${name}
            </a>
          </div>

          <!-- Footer -->
          <div style="padding: 20px 40px; background: #111827; border-top: 1px solid #1f2937;">
            <p style="margin: 0; color: #6b7280; font-size: 12px;">Sent via Prepify AI contact form · <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}" style="color: #2dd4bf; text-decoration: none;">Prepify AI</a></p>
          </div>
        </div>
      `,
    });

    if (error) {
      console.error('Resend error:', error);
      return res.status(500).json({ message: 'Failed to send email. Please try again.' });
    }

    return res.status(200).json({ message: 'Message sent successfully! I will get back to you soon.' });
  } catch (error) {
    console.error('Contact error:', error.message);
    return res.status(500).json({ message: 'Something went wrong. Please try again.' });
  }
};
