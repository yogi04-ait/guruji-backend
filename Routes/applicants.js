import express from "express";
import adminAuth from "../middleware/auth.js";

import {
    applyForJob,
    getApplicants,
    getApplicantById,
    getApplicantsExcel,
    updateApplicantStatus
} from "../controller/applicationController.js";

const applicantRouter = express.Router();


// Apply for a job
applicantRouter.post("/apply/:jobId", applyForJob);


// Get all applicants
applicantRouter.get("/applicants", adminAuth, getApplicants);


// Download applicants excel
applicantRouter.get(
    "/applicants/excel",
    adminAuth,
    getApplicantsExcel
);


// Get single applicant by ID
// KEEP THIS LAST
applicantRouter.get(
    "/applicant/:applicantId",
    adminAuth,
    getApplicantById
);

// Update applicant status
applicantRouter.put(
    "/applicant/:applicantId/status",
    adminAuth,
    updateApplicantStatus
);




export default applicantRouter;