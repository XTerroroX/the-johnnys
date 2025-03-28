// /api/sendConfirmation.js
const mailgun = require('mailgun-js');

const DOMAIN = process.env.MAILGUN_DOMAIN;
const mg = mailgun({ apiKey: process.env.MAILGUN_API_KEY, domain: DOMAIN });

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const { email, name, bookingDetails } = req.body;
    
    const data = {
      from: `The Johnnys <noreply@${DOMAIN}>`,
      to: email,
      subject: 'Appointment Confirmation',
      text: `Hello ${name},\n\nYour appointment has been confirmed.\n\nDetails:\n${bookingDetails}\n\nThank you for choosing The Johnnys!`,
      html: `<p>Hello ${name},</p>
             <p>Your appointment has been confirmed.</p>
             <p><strong>Details:</strong><br>${bookingDetails.replace(/\n/g, '<br>')}</p>
             <p>Thank you for choosing The Johnnys!</p>`
    };
    
    const body = await mg.messages().send(data);
    console.log('Email sent:', body);
    return res.status(200).json({ message: 'Email sent successfully', body });
  } catch (error) {
    console.error('Mailgun error:', error);
    return res.status(500).json({ error: 'Failed to send email' });
  }
}
