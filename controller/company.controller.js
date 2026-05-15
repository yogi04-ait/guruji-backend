// controllers/company.controller.js

import Company from "../models/company.model.js";

// ==============================
// Create Company / Job Posting
// ==============================
const createCompany = async (req, res) => {
    try {
        const {
            name,
            industry,
            location,
            role,
            experience,
            salary,
            openings,
            working_hours,
            working_days,
            description,
            status,
        } = req.body;

        // Validation
        if (!name) {
            return res.status(400).json({
                success: false,
                message: "Company name is required",
            });
        }

        if (openings && openings < 0) {
            return res.status(400).json({
                success: false,
                message: "Openings cannot be negative",
            });
        }

        // Create company/job
        const company = await Company.create({
            name,
            industry,
            location,
            role,
            experience,
            salary,
            openings,
            working_hours,
            working_days,
            description,
            status: status || "active",
        });

        res.status(201).json({
            success: true,
            message: "Company created successfully",
            data: company,
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message,
        });

    }
};

// ==============================
// Update Company / Job Posting
// ==============================
const updateCompany = async (req, res) => {
    try {
        const { id } = req.params;

        const {
            name,
            industry,
            location,
            role,
            experience,
            salary,
            openings,
            working_hours,
            working_days,
            description,
            status,
        } = req.body;

        // Check if exists
        const existingCompany = await Company.findById(id).lean();

        if (!existingCompany) {
            return res.status(404).json({
                success: false,
                message: "Company not found",
            });
        }

        // Validation
        if (openings && openings < 0) {
            return res.status(400).json({
                success: false,
                message: "Openings cannot be negative",
            });
        }

        // Update
        const updatedCompany = await Company.findByIdAndUpdate(
            id,
            {
                name,
                industry,
                location,
                role,
                experience,
                salary,
                openings,
                working_hours,
                working_days,
                description,
                status,
            },
            {
                new: true,
                runValidators: true,
            }
        );

        res.status(200).json({
            success: true,
            message: "Company updated successfully",
            data: updatedCompany,
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message,
        });

    }
};

// ==============================
// Archive Company / Job Posting
// ==============================
// NOTE:
// We are NOT permanently deleting jobs.
// This preserves applicant history
// and prevents broken references.
const deleteCompany = async (req, res) => {
    try {
        const { id } = req.params;

        const company = await Company.findByIdAndUpdate(
            id,
            {
                status: "archived",
            },
            {
                new: true,
            }
        );

        if (!company) {
            return res.status(404).json({
                success: false,
                message: "Company not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Company archived successfully",
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message,
        });

    }
};

// ==============================
// Get Companies For Admin Panel
// ==============================
// Shows:
// - active
// - closed
//
// Hides:
// - archived
const getCompanies = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const companies = await Company.find({
            status: { $ne: "archived" },
        })
            .select(
                `
                name
                industry
                location
                role
                experience
                openings
                salary
                status
                createdAt
                `
            )
            .sort({
                createdAt: -1,
            })
            .skip(skip)
            .limit(limit)
            .lean();

        res.status(200).json({
            success: true,
            count: companies.length,
            data: companies,
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message,
        });

    }
};

// ==============================
// Get Single Company / Job
// ==============================
const getCompanyById = async (req, res) => {

    try {

        const { id } = req.params;

        const company = await Company.findById(id).lean();

        if (!company) {
            return res.status(404).json({
                success: false,
                message: "Company not found",
            });
        }

        res.status(200).json({
            success: true,
            data: company,
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message,
        });

    }

};

// ==============================
// Optional:
// Get Archived Companies
// ==============================
const getArchivedCompanies = async (req, res) => {
    try {

        const companies = await Company.find({
            status: "archived",
        })
            .sort({
                updatedAt: -1,
            })
            .lean();

        res.status(200).json({
            success: true,
            count: companies.length,
            data: companies,
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message,
        });

    }
};

// ==============================
// Optional:
// Restore Archived Company
// ==============================
const restoreCompany = async (req, res) => {
    try {

        const { id } = req.params;

        const company = await Company.findByIdAndUpdate(
            id,
            {
                status: "active",
            },
            {
                new: true,
            }
        );

        if (!company) {
            return res.status(404).json({
                success: false,
                message: "Company not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Company restored successfully",
            data: company,
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message,
        });

    }
};

export {
    createCompany,
    deleteCompany,
    getArchivedCompanies,
    getCompanies,
    getCompanyById,
    restoreCompany,
    updateCompany,
};