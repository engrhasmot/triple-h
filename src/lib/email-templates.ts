export function newInquiryEmail(data: {
  name: string;
  phone: string;
  email?: string;
  serviceType: string;
  message: string;
}) {
  return {
    subject: `New Inquiry: ${data.name} - ${data.serviceType}`,
    html: `
      <h2>New Inquiry Received</h2>
      <table>
        <tr><td><strong>Name:</strong></td><td>${data.name}</td></tr>
        <tr><td><strong>Phone:</strong></td><td>${data.phone}</td></tr>
        <tr><td><strong>Email:</strong></td><td>${data.email || 'N/A'}</td></tr>
        <tr><td><strong>Service:</strong></td><td>${data.serviceType}</td></tr>
        <tr><td><strong>Message:</strong></td><td>${data.message}</td></tr>
      </table>
    `,
  };
}

export function newBookingEmail(data: {
  name: string;
  phone: string;
  date: string;
  timeSlot: string;
  type: string;
}) {
  return {
    subject: `New Booking: ${data.name} - ${data.type}`,
    html: `
      <h2>New Appointment Booking</h2>
      <table>
        <tr><td><strong>Name:</strong></td><td>${data.name}</td></tr>
        <tr><td><strong>Phone:</strong></td><td>${data.phone}</td></tr>
        <tr><td><strong>Type:</strong></td><td>${data.type}</td></tr>
        <tr><td><strong>Date:</strong></td><td>${data.date}</td></tr>
        <tr><td><strong>Time:</strong></td><td>${data.timeSlot}</td></tr>
      </table>
    `,
  };
}