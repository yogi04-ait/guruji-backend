import Applicant from "../models/applicant.model.js";
import Job from "../models/company.model.js";
import ExcelJS from "exceljs";
import transporter from "../utils/mail/mail.js";
import { validate } from "email-validator";
import { sanitize } from "../utils/sanitize.js";
import { parsePhoneNumberFromString } from "libphonenumber-js";
import { adminJobApplicationTemplate } from "../utils/mail/templates/adminJobApplication.js";
import { applicantConfirmationTemplate } from "../utils/mail/templates/applicantConfirmation.js";

const applyForJob = async (req, res) => {
    try {

        const { jobId } = req.params;

        const {
            fullName,
            email,
            phone,
            message,
        } = req.body;

        // Get job details from database
        const job = await Job.findById(jobId).lean();

        if (!job) {
            return res.status(404).json({
                success: false,
                message: "Job not found",
            });
        }

        const companyName = job.name;
        const jobRole = job.role;
        const safeMessage = sanitize(message);
        const safeFullName = sanitize(fullName);
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


        // Validation
        if (!safeFullName || !normalizedEmail || !normalizedPhone) {
            return res.status(400).json({
                success: false,
                message: "Required fields missing",
            });
        }

        // Email validation
        if (!validate(normalizedEmail)) {
            return res.status(400).json({
                success: false,
                message: "Invalid email address",
            });
        }

        // Prevent duplicate applications
        const existingApplicant = await Applicant.findOne({
            email: normalizedEmail,
            job: jobId,
        });

        if (existingApplicant) {
            return res.status(400).json({
                success: false,
                message: "You've already applied for this job",
            });
        }

        // Save applicant
        const applicant = await Applicant.create({
            job: job._id,
            companyName,
            jobRole,
            fullName: safeFullName,
            email: normalizedEmail,
            phone: normalizedPhone,
            message: safeMessage,
        });

        // Admin email template
        const adminHtmlTemplate = adminJobApplicationTemplate({
            jobId,
            companyName,
            jobRole,
            fullName: safeFullName,
            email: normalizedEmail,
            phone: normalizedPhone,
            message: safeMessage,
        });

        // Applicant confirmation template
        const applicantHtmlTemplate = applicantConfirmationTemplate({
            fullName: safeFullName,
            jobRole,
            companyName
        })


        // Send both emails in parallel
        // Send emails asynchronously to reduce request latency (fire-and-forget)
        Promise.all([
            transporter.sendMail({
                from: `"Job Portal" <${process.env.EMAIL_USER}>`,
                to: process.env.EMAIL_USER,
                subject: `New Application for ${jobRole} at ${companyName}`,
                html: adminHtmlTemplate,
            }),
            transporter.sendMail({
                from: `"Job Portal" <${process.env.EMAIL_USER}>`,
                to: normalizedEmail,
                subject: `Application Received for ${jobRole} at ${companyName}`,
                html: applicantHtmlTemplate,
            }),
        ]).catch((err) => console.error('Application email send failed:', err));

        return res.status(201).json({
            success: true,
            message: "Application submitted successfully",
            data: applicant,
        });

    } catch (error) {

        console.error(
            "Apply Job Error:",
            error.message
        );

        return res.status(500).json({
            success: false,
            message: "Something went wrong",
        });
    }
};

const getApplicants = async (req, res) => {
    try {
        const page = Math.max(parseInt(req.query.page) || 1, 1);
        const limit = Math.min(Math.max(parseInt(req.query.limit) || 10, 1), 100);
        // Get status from query
        const { applicantStatus } = req.query;

        const filter = {};
        if (applicantStatus) {
            filter.applicantStatus = applicantStatus;
        }


        const skip = (page - 1) * limit;

        // Fetch count and paginated applicants in parallel
        const [total, applicants] = await Promise.all([
            Applicant.countDocuments(filter),
            Applicant.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .select("fullName email phone companyName jobRole applicantStatus createdAt")
                .lean(),
        ]);

        res.status(200).json({
            success: true,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalApplicants: total,
            applicants,
        });

    } catch (error) {
        console.error("Get Applicants Error:", error);
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};


const getApplicantById = async (req, res) => {
    try {
        const { applicantId } = req.params;

        const applicant = await Applicant.findById(applicantId)
            .populate({
                path: "job",
                select:
                    "name role industry location experience openings salary working_hours shift_timing working_days skills description status",
            })
            .lean();

        if (!applicant) {
            return res.status(404).json({
                success: false,
                message: "Applicant not found",
            });
        }

        return res.status(200).json({
            success: true,
            data: applicant,
        });
    } catch (error) {
        console.error("Get Applicant Error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};

const updateApplicantStatus = async (req, res) => {
    try {
        const { applicantId } = req.params;
        const { applicantStatus } = req.body;

        // Allowed statuses
        const allowedStatuses = [
            "new",
            "reviewed",
            "shortlisted",
            "rejected",
        ];

        // Validate status
        if (
            !applicantStatus ||
            !allowedStatuses.includes(applicantStatus)
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid applicant status",
            });
        }

        // Update applicant status only
        const applicant = await Applicant.findByIdAndUpdate(
            applicantId,
            {
                $set: {
                    applicantStatus,
                },
            },
            {
                new: true,
                runValidators: true,
            }
        )
            .populate({
                path: "job",
                select:
                    "name role industry location experience openings salary working_hours shift_timing working_days skills description status",
            })
            .lean();

        // Applicant not found
        if (!applicant) {
            return res.status(404).json({
                success: false,
                message: "Applicant not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Applicant status updated successfully",
            data: applicant,
        });
    } catch (error) {
        console.error(
            "Update Applicant Status Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};

const getApplicantsExcel = async (req, res) => {
    try {

        const { range, startDate, endDate, applicantStatus } = req.query;

        // Main filter object
        let filter = {};



        // Current date
        const now = new Date();

        // Preset ranges
        if (range) {

            let fromDate = new Date();

            switch (range) {

                case "3months":
                    fromDate.setMonth(now.getMonth() - 3);
                    break;

                case "6months":
                    fromDate.setMonth(now.getMonth() - 6);
                    break;

                case "1year":
                    fromDate.setFullYear(now.getFullYear() - 1);
                    break;

                default:
                    fromDate = null;
            }

            if (fromDate) {
                filter.createdAt = {
                    $gte: fromDate,
                };
            }
        }

        // Custom date range
        if (startDate && endDate) {

            filter.createdAt = {
                $gte: new Date(startDate),
                $lte: new Date(endDate),
            };
        }

        // applicant status filter
        if (applicantStatus) {
            filter.applicantStatus = applicantStatus;
        }

        // Fetch applicants
        const applicants = await Applicant.find(filter)
            .select(
                "fullName email phone companyName jobRole applicantStatus createdAt"
            )
            .lean();
        // No applicants found
        if (applicants.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No applicants found for the given criteria",
            });
        }
        // Create workbook
        const workbook = new ExcelJS.Workbook();

        const worksheet = workbook.addWorksheet("Applicants");

        worksheet.columns = [
            { header: "Full Name", key: "fullName", width: 30 },
            { header: "Email", key: "email", width: 30 },
            { header: "Phone", key: "phone", width: 20 },
            { header: "Company Name", key: "companyName", width: 30 },
            { header: "Job Role", key: "jobRole", width: 30 },
            { header: "Application Status", key: "applicantStatus", width: 20 },
            {
                header: "Applied On",
                key: "createdAt",
                width: 20,
                style: { numFmt: "dd/mm/yyyy" },
            },
        ];

        // Add rows
        applicants.forEach((applicant) => {

            worksheet.addRow({
                fullName: applicant.fullName,
                email: applicant.email,
                phone: applicant.phone,
                companyName: applicant.companyName,
                jobRole: applicant.jobRole,
                applicantStatus: applicant.applicantStatus,
                createdAt: applicant.createdAt,
            });
        });

        // Bold header
        worksheet.getRow(1).font = { bold: true };

        // Response headers
        res.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );

        res.setHeader(
            "Content-Disposition",
            "attachment; filename=applicants.xlsx"
        );

        // Send file
        await workbook.xlsx.write(res);

        return res.end();

    } catch (error) {

        console.error(
            "Get Applicants Excel Error:",
            error.message
        );

        return res.status(500).json({
            success: false,
            message: "Failed to generate Excel file",
        });
    }
};

export {
    applyForJob,
    getApplicants,
    getApplicantById,
    getApplicantsExcel,
    updateApplicantStatus
};
