interface EmailData {
  to: string;
  subject: string;
  template: string;
  data: Record<string, any>;
}

// Simple email service - in production, use nodemailer or similar
export const sendEmail = async (emailData: EmailData): Promise<void> => {
  const { to, subject, template, data } = emailData;
  
  // In a real implementation, you would:
  // 1. Use nodemailer or similar email service
  // 2. Load email templates
  // 3. Send actual emails
  
  console.log('📧 Email would be sent:');
  console.log(`To: ${to}`);
  console.log(`Subject: ${subject}`);
  console.log(`Template: ${template}`);
  console.log(`Data:`, data);
  
  // For development, we'll just simulate email sending
  // In production, replace this with actual email sending logic
  
  // Example with nodemailer:
  /*
  const transporter = nodemailer.createTransporter({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
  
  const mailOptions = {
    from: process.env.FROM_EMAIL,
    to: to,
    subject: subject,
    html: generateEmailTemplate(template, data)
  };
  
  await transporter.sendMail(mailOptions);
  */
};

const generateEmailTemplate = (template: string, data: Record<string, any>): string => {
  switch (template) {
    case 'welcome':
      return `
        <h1>Welcome to SM System!</h1>
        <p>Hi ${data.username},</p>
        <p>Welcome to our system! Your account has been created successfully.</p>
        <p>You can now log in to your account using your email and password.</p>
        <a href="${data.loginUrl}">Login to Your Account</a>
        <p>If you have any questions, please contact our support team.</p>
        <p>Best regards,<br>SM System Team</p>
      `;
    
    case 'password-reset':
      return `
        <h1>Password Reset Request</h1>
        <p>Hi ${data.username},</p>
        <p>You requested a password reset. Click the link below to reset your password:</p>
        <a href="${data.resetUrl}">Reset Password</a>
        <p>Or copy this token: ${data.resetToken}</p>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
        <p>Best regards,<br>SM System Team</p>
      `;
    
    default:
      return `<p>Email content for ${template}</p>`;
  }
}; 