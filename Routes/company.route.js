// routes/company.routes.js

import express from "express";
import adminAuth from "../middleware/auth.js";
import { applyForJob } from "../controller/applicationController.js";
import {
    createCompany,
    deleteCompany,
    getCompanies,
    getCompanyById,
    updateCompany
} from "../controller/company.controller.js";

const companyRouter = express.Router();

companyRouter.post("/create", adminAuth, createCompany);
companyRouter.delete("/delete/:id", adminAuth, deleteCompany);
companyRouter.put("/update/:id", adminAuth, updateCompany);
companyRouter.get("/list", getCompanies);
companyRouter.post("/apply/:jobId", applyForJob);
companyRouter.get("/jobs/:id", getCompanyById);

export default companyRouter;
