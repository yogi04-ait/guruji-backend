export const adminNewEnquiry = ({fullName, email, phone , category, message}) =>{
    return `<div style="font-family: Arial; padding: 20px;">
        <h2>New Enquiry Received</h2>

        <p><strong>Name:</strong> ${fullName}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Category:</strong> ${category}</p>

        <hr />

        <p><strong>Message:</strong></p>

        <p>${message}</p>
    </div>`;
}