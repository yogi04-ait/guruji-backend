// utils/mail/templates/applicantConfirmation.js

export const applicantConfirmationTemplate = ({
    fullName,
    jobRole,
    companyName,
}) => {
    return `
        <div style="font-family: Arial; padding: 20px;">
            <h2>Application Received</h2>

            <p>Hi ${fullName},</p>

            <p>
                Thank you for applying for the 
                <strong>${jobRole}</strong> position at 
                <strong>${companyName}</strong>.
            </p>

            <p>
                We have successfully received your application.
                Our team will review it and contact you soon.
            </p>

            <br />

            <p>Best regards,</p>
            <p><strong>Guruji Job Consultancy</strong></p>
        </div>
    `;
};