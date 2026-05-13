import Applicant from "../models/applicant.model.js";
import Job from "../models/company.model.js";
import ExcelJS from "exceljs";
import transporter from "../utils/mail.js";
import { validate } from "email-validator";

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

        const safeMessage = message
            ?.replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");

        // Validation
        if (!fullName || !email || !phone) {
            return res.status(400).json({
                success: false,
                message: "Required fields missing",
            });
        }

        // Email validation
        if (!validate(email)) {
            return res.status(400).json({
                success: false,
                message: "Invalid email address",
            });
        }

        // Prevent duplicate applications
        const existingApplicant = await Applicant.findOne({
            email,
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
            fullName,
            email,
            phone,
            message: safeMessage,
        });

        // Admin email template
        const adminHtmlTemplate = `
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
            <p>${safeMessage || "No message provided"}</p>
        </div>
        `;

        // Applicant confirmation template
        const applicantHtmlTemplate = `
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

        // Send both emails in parallel
        await Promise.all([

            // Admin email
            transporter.sendMail({
                from: `"Job Portal" <${process.env.EMAIL_USER}>`,
                to: process.env.EMAIL_USER,
                subject: `New Application for ${jobRole} at ${companyName}`,
                html: adminHtmlTemplate,
            }),

            // Applicant email
            transporter.sendMail({
                from: `"Job Portal" <${process.env.EMAIL_USER}>`,
                to: email,
                subject: `Application Received for ${jobRole} at ${companyName}`,
                html: applicantHtmlTemplate,
            }),
        ]);

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

        // Query params
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const status = req.query.status;

        // Prevent invalid values
        const validatedPage = Math.max(page, 1);
        const validatedLimit = Math.max(limit, 1);

        // Skip calculation
        const skip = (validatedPage - 1) * validatedLimit;

        // Filters
        const filters = {};

        // Optional status filter
        if (status) {
            filters.applicantStatus = status;
        }

        // Total applicants count
        const totalApplicants =
            await Applicant.countDocuments(filters);

        // Aggregation
        const applicants = await Applicant.aggregate([

            // Apply filters
            {
                $match: filters,
            },

            // Custom status order
            {
                $addFields: {
                    statusOrder: {
                        $switch: {
                            branches: [
                                {
                                    case: {
                                        $eq: [
                                            "$applicantStatus",
                                            "new",
                                        ],
                                    },
                                    then: 1,
                                },
                                {
                                    case: {
                                        $eq: [
                                            "$applicantStatus",
                                            "reviewed",
                                        ],
                                    },
                                    then: 2,
                                },
                                {
                                    case: {
                                        $eq: [
                                            "$applicantStatus",
                                            "shortlisted",
                                        ],
                                    },
                                    then: 3,
                                },
                                {
                                    case: {
                                        $eq: [
                                            "$applicantStatus",
                                            "rejected",
                                        ],
                                    },
                                    then: 4,
                                },
                            ],

                            default: 5,
                        },
                    },
                },
            },

            // Sort
            {
                $sort: {
                    statusOrder: 1,
                    createdAt: -1,
                },
            },

            // Pagination
            {
                $skip: skip,
            },

            {
                $limit: validatedLimit,
            },

            // Select fields
            {
                $project: {
                    fullName: 1,
                    email: 1,
                    phone: 1,
                    companyName: 1,
                    jobRole: 1,
                    applicantStatus: 1,
                    createdAt: 1,
                },
            },
        ]);

        return res.status(200).json({
            success: true,

            pagination: {
                total: totalApplicants,
                page: validatedPage,
                limit: validatedLimit,

                totalPages: Math.ceil(
                    totalApplicants / validatedLimit
                ),

                hasNextPage:
                    validatedPage <
                    Math.ceil(
                        totalApplicants / validatedLimit
                    ),

                hasPrevPage: validatedPage > 1,
            },

            count: applicants.length,

            data: applicants,
        });

    } catch (error) {

        console.error(
            "Get Applicants Error:",
            error.message
        );

        return res.status(500).json({
            success: false,
            message: "Server error",
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

const getApplicantsExcel = async (req, res) => {
    try {

        const { range, startDate, endDate } = req.query;

        // Date filter object
        let dateFilter = {};

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
                dateFilter.createdAt = {
                    $gte: fromDate,
                };
            }
        }

        // Custom date range
        if (startDate && endDate) {

            dateFilter.createdAt = {
                $gte: new Date(startDate),
                $lte: new Date(endDate),
            };
        }

        // Fetch applicants
        const applicants = await Applicant.find(dateFilter)
            .select(
                "fullName email phone companyName jobRole applicantStatus createdAt"
            )
            .lean();
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
    getApplicantsExcel
};
