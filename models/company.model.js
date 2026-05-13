// models/company.model.js

import mongoose from "mongoose";

const companySchema = new mongoose.Schema(
    {
        // Company Name
        name: {
            type: String,
            required: true,
            trim: true,
        },

        // Industry Type
        industry: {
            type: String,
            default: "",
            trim: true,
        },

        // Company Location
        location: {
            type: String,
            default: "",
            trim: true,
        },

        // Job Role / Position
        role: {
            type: String,
            default: "",
            trim: true,
        },

        // Required Experience
        experience: {
            type: String,
            default: "Fresher",
            trim: true,
        },

        // Number of Openings
        openings: {
            type: Number,
            default: 1,
            min: 0,
        },

        // Salary Package
        salary: {
            type: String,
            default: "",
            trim: true,
        },

        // Working Days
        working_days: {
            type: String,
            default: "",
            trim: true,
        },

        // Office Timing
        working_hours: {
            type: String,
            default: "",
            trim: true,
        },

        // Job Description
        description: {
            type: String,
            default: "",
            trim: true,
        },

        // job status 
        status: {
            type: String,
            enum: ["active", "closed", "archived"],
            default: "active",
        },
    },
    {
        timestamps: true,
    }
);

// Indexes to improve search and sort performance
companySchema.index({ createdAt: -1 });
companySchema.index({ name: 1 });
companySchema.index({ role: 1 });
// Text index for simple search queries on name, role and description
companySchema.index({ name: 'text', role: 'text', description: 'text' });

export default mongoose.model("Company", companySchema);