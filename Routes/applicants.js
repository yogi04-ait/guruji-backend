import express from "express";
import adminAuth from "../middleware/auth.js";
import { applyForJob, getApplicants, getApplicantById, getApplicantsExcel } from "../controller/applicationController.js";
const applicantRouter = express.Router();

// Apply for a job
applicantRouter.post("/apply/:jobId", applyForJob);

// Get applicants
applicantRouter.get("/applicants", adminAuth, getApplicants);

// Get applicants data in excel file
applicantRouter.get("/applicants/excel", adminAuth, getApplicantsExcel);

// Get specific applicant by applicant ID
applicantRouter.get("/applicant/:applicantId", adminAuth, getApplicantById);



export default applicantRouter;