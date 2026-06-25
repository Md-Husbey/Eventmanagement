const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

exports.sendEmail = async ({ to, subject, html }) => {
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject,
    html,
  });
};

exports.bookingConfirmationEmail = (user, booking, event, qrCode) => ({
  to: user.email,
  subject: `Booking Confirmed - ${event.title} | SeaFest BD`,
  html: `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px">
      <div style="background:#0ea5e9;padding:20px;border-radius:8px 8px 0 0;text-align:center">
        <h1 style="color:#fff;margin:0">SeaFest BD</h1>
        <p style="color:#e0f2fe;margin:5px 0">Discover. Book. Celebrate.</p>
      </div>
      <div style="background:#f8fafc;padding:30px;border-radius:0 0 8px 8px">
        <h2 style="color:#1e293b">Booking Confirmed!</h2>
        <p>Hi <strong>${user.name}</strong>, your booking is confirmed.</p>
        <table style="width:100%;border-collapse:collapse;margin:20px 0">
          <tr><td style="padding:8px;border-bottom:1px solid #e2e8f0;color:#64748b">Booking Ref</td><td style="padding:8px;border-bottom:1px solid #e2e8f0;font-weight:bold">${booking.bookingRef}</td></tr>
          <tr><td style="padding:8px;border-bottom:1px solid #e2e8f0;color:#64748b">Event</td><td style="padding:8px;border-bottom:1px solid #e2e8f0">${event.title}</td></tr>
          <tr><td style="padding:8px;border-bottom:1px solid #e2e8f0;color:#64748b">Date</td><td style="padding:8px;border-bottom:1px solid #e2e8f0">${new Date(event.date).toLocaleDateString('en-BD', { weekday:'long',year:'numeric',month:'long',day:'numeric' })}</td></tr>
          <tr><td style="padding:8px;border-bottom:1px solid #e2e8f0;color:#64748b">Location</td><td style="padding:8px;border-bottom:1px solid #e2e8f0">${event.location}</td></tr>
          <tr><td style="padding:8px;color:#64748b">Amount Paid</td><td style="padding:8px;font-weight:bold;color:#0ea5e9">৳${booking.totalAmount}</td></tr>
        </table>
        <div style="text-align:center;margin:20px 0">
          <p style="color:#64748b">Show this QR code at the event entrance</p>
          <img src="${qrCode}" alt="QR Ticket" style="width:200px;height:200px" />
        </div>
        <p style="color:#94a3b8;font-size:12px;text-align:center">SeaFest BD — Cox's Bazar, Bangladesh</p>
      </div>
    </div>
  `,
});
