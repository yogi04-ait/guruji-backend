// utils/mail/templates/adminJobApplication.js

export const adminJobApplicationTemplate = ({
    jobId,
    companyName,
    jobRole,
    fullName,
    email,
    phone,
    message,
}) => {
    return `
        <div style="font-family: Arial; padding: 20px;">
            <h2>New Job Application</h2>

            <p><strong>Job ID:</strong> ${jobId}</p>
            <p><strong>Company:</strong> ${companyName}</p>
            <p><strong>Role:</strong> ${jobRole}</p>

            <hr />

            <p><strong>Full Name:</strong> ${fullName}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Phone:</strong> ${phone}</p>

            <p><strong>Message:</strong></p>
            <p>${message || "No message provided"}</p>
        </div>
    `;
};