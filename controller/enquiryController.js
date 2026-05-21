import Enquiry from '../models/enquiry.model.js';
import mongoose from 'mongoose';
import transporter from "../utils/mail/mail.js";
import { sanitize } from '../utils/sanitize.js';
import { validate } from 'email-validator';
import { parsePhoneNumberFromString } from "libphonenumber-js";
import { adminNewEnquiry } from "../utils/mail/templates/adminNewEnquiry.js";
import { userEnquiry } from "../utils/mail/templates/userEnquiry.js"


// Allowed categories
const allowedCategories = ["job seeker", "employer", "other"];

// Create Enquiry
const createEnquiry = async (req, res) => {



    try {
        const {
            name,
            email,
            phone,
            message,
            category = "job seeker",

        } = req.body;
        const safeMessage = sanitize(message);
        const safeName = sanitize(name);
        const normalizedEmail = email?.trim().toLowerCase();

        //  phone number validation
        const parsedPhone = parsePhoneNumberFromString(phone, "IN");
        if (!parsedPhone?.isValid()) {
            return res.status(400).json({
                success: false,
                message: "Invalid phone number",
            });
        }

        const normalizedPhone = parsedPhone.number;


        // Basic validation
        if (!safeName || !normalizedEmail || !safeMessage) {
            return res.status(400).json({
                success: false,
                message: "Name, email, and message are required",
            });
        }

        // Validate category
        if (!allowedCategories.includes(category)) {
            return res.status(400).json({
                success: false,
                message: "Invalid category",
            });
        }

        // Email validation
        if (!validate(normalizedEmail)) {
            return res.status(400).json({
                success: false,
                message: "Invalid email address",
            });
        }

        const newEnquiry = new Enquiry({
            name: safeName,
            email: normalizedEmail,
            phone: normalizedPhone,
            message: safeMessage,
            category,
            status: "new",
        });

        // Admin email enquiry template
        const adminHtmlTemplate = adminNewEnquiry({ fullName: safeName, email: normalizedEmail, phone: normalizedPhone, category, message: safeMessage })

        // User email template
        const userHtmlTemplate = userEnquiry({ name: safeName });

        // Save enquiry first to ensure persistence before notifying
        const savedEnquiry = await newEnquiry.save();

        // Fire-and-forget email sends to reduce API latency
        Promise.all([
            transporter.sendMail({
                from: `"Job Portal" <${process.env.EMAIL_USER}>`,
                to: process.env.EMAIL_USER,
                subject: "New Enquiry Received",
                html: adminHtmlTemplate,
            }),
            transporter.sendMail({
                from: `"Job Portal" <${process.env.EMAIL_USER}>`,
                to: normalizedEmail,
                subject: "Enquiry Received",
                html: userHtmlTemplate,
            }),
        ]).catch((err) => console.error('Enquiry email send failed:', err));

        res.status(201).json({
            success: true,
            message: "Enquiry sent successfully",
            data: savedEnquiry,
        });

    } catch (error) {
        console.error("Error creating enquiry:", error);
        return res.status(500).json({
            success: false,
            message:
                process.env.NODE_ENV === "development"
                    ? error.message
                    : "Something went wrong. Please try again later.",
        });
    }
};

// Get All Enquiries with Pagination

const getAllEnquiries = async (req, res) => {
    try {
        const page = Math.max(parseInt(req.query.page) || 1, 1);
        const limit = Math.min(Math.max(parseInt(req.query.limit) || 10, 1), 100);
        const skip = (page - 1) * limit;
        const { status } = req.query;


        // Build filter object based on query parameters
        const filter = {};
        if (status) {
            filter.status = status;
        }

        // Get total count (respecting filters) and paginated enquiries in parallel
        const [totalEnquiries, enquiries] = await Promise.all([
            Enquiry.countDocuments(filter),
            Enquiry.find(filter)
                .sort({ status: 1, createdAt: -1 }) // Sort by status (new first) and then by creation date
                .skip(skip)
                .limit(limit)
                .select("name email phone category status createdAt") // Select only necessary fields
                .lean()
        ]);


        res.status(200).json({
            success: true,
            currentPage: page,
            totalPages: Math.ceil(totalEnquiries / limit),
            totalEnquiries,
            enquiriesCount: enquiries.length,
            enquiries,
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// view Enquiry Details
const viewEnquiry = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid enquiry ID",
            });
        }

        const enquiry = await Enquiry.findByIdAndUpdate(id, { $set: { status: "seen" } }, { returnDocument: "after" }).lean();

        if (!enquiry) {
            return res.status(404).json({
                success: false,
                message: "Enquiry not found",
            });
        }

        res.status(200).json({
            success: true,
            data: enquiry,
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Delete Enquiry
const deleteEnquiry = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid enquiry ID",
            });
        }

        const deletedEnquiry = await Enquiry.findByIdAndDelete(id);

        if (!deletedEnquiry) {
            return res.status(404).json({
                success: false,
                message: "Enquiry not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Enquiry deleted successfully",
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export {
    createEnquiry,
    getAllEnquiries,
    deleteEnquiry,
    viewEnquiry
};