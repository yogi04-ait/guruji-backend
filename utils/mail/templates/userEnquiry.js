export const userEnquiry = ({ name }) => {
    return `
    <div style="font-family: Arial; padding: 20px;">
            <h2>Enquiry Received</h2>

            <p>Hi ${name},</p>

            <p>
                Thank you for contacting
                <strong>Guruji Job Consultancy</strong>.
            </p>

            <p>
                We have received your enquiry successfully.
                Our team will contact you shortly.
            </p>

            <br />

            <p>Best regards,</p>

            <p><strong>Guruji Job Consultancy</strong></p>
        </div>
    `
}