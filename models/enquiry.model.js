import mongoose from "mongoose";
import EmailValidator from "email-validator";


const category = ["job seeker", "employer", "other"];


const enquirySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
            validate: {
                validator: EmailValidator.validate,
                message: "Please enter a valid email address",
            }
        },
        phone: {
            type: String,
            required: true,
            trim: true,
            match: [/^(\+91[\-\s]?)?[6-9]\d{9}$/, "Please enter a valid phone number"]
        },
        category: {
            type: String,
            enum: category,
            default: "job seeker",
        },
        status: {
            type: String,
            enum: ["new", "seen"],
            default: "new"
        },
        message: {
            type: String,
            default: "",
            trim: true,
            maxlength: 1000,
        },

    }, { timestamps: true });

enquirySchema.index({ status: 1, createdAt: -1 });

const Enquiry = mongoose.model("Enquiry", enquirySchema);

export default Enquiry;