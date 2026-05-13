import mongoose from "mongoose";
import * as EmailValidator from "email-validator";

const APPLICATION_STATUS = [
    "new",
    "reviewed",
    "shortlisted",
    "rejected",
];

const applicantSchema = new mongoose.Schema(
    {
        // Job Reference
        job: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Company",
            required: true,
            index: true,
        },

        companyName: {
            type: String,
            required: true,
            trim: true,
        },

        jobRole: {
            type: String,
            required: true,
            trim: true,
        },

        // Applicant Name
        fullName: {
            type: String,
            required: true,
            trim: true,
        },

        // Applicant Email
        email: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
            validate: {
                validator: EmailValidator.validate,
                message: "Please enter a valid email address",
            },
        },

        // Applicant Phone Number
        phone: {
            type: String,
            required: true,
            trim: true,
            match: [/^(\+91[\-\s]?)?[6-9]\d{9}$/, "Please enter a valid phone number"]
        },

        // Applicant Message
        message: {
            type: String,
            default: "",
            trim: true,
            maxlength: 1000,
        },

        applicantStatus: {
            type: String,
            enum: APPLICATION_STATUS,
            default: "new",
            index: true,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

// Indexes
applicantSchema.index({ createdAt: -1 });
applicantSchema.index({ applicantStatus: 1, createdAt: -1 });

export default mongoose.model("Applicant", applicantSchema);