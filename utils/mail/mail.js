// utils/mail.js
import nodemailer from "nodemailer";
import { SESClient, SendRawEmailCommand } from "@aws-sdk/client-ses";

const sesClient = new SESClient({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

const transporter = nodemailer.createTransport({
    SES: {
        sesClient,
        SendRawEmailCommand,
    },
});

export default transporter;