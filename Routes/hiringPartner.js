import express from "express";
import HiringPartner from "../models/hiringpartner.model.js";
import adminAuth from "../middleware/auth.js";

const hiringPartnerRouter = express.Router();

hiringPartnerRouter.post("/partner/create", adminAuth, async (req, res) => {
    try {
        const { name } = req.body;

        if (!name) {
            return res.status(400).json({
                success: false,
                message: "Name is required",
            });
        }


        const hiringPartner = await HiringPartner.create({ name });

        res.status(201).json({
            success: true,
            message: "Hiring Partner created successfully",
            data: hiringPartner,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
}
);

hiringPartnerRouter.get("/partner/list", async (req, res) => {
    try {
        const hiringPartners = await HiringPartner.find().lean();
        res.status(200).json({
            success: true,
            message: "Hiring Partners retrieved successfully",
            data: hiringPartners,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
}
);

hiringPartnerRouter.delete("/partner/delete/:id", adminAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const hiringPartner = await HiringPartner.findByIdAndDelete(id);
        if (!hiringPartner) {
            return res.status(404).json({
                success: false,
                message: "Hiring Partner not found",
            });
        }
        res.status(200).json({
            success: true,
            message: "Hiring Partner deleted successfully",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});



export default hiringPartnerRouter;