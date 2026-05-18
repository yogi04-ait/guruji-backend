import express from "express";
import adminAuth from "../middleware/auth.js";
import Testimonial from "../models/testimonials.model.js";
const testimonialRouter = express.Router();



// GET random 10 testimonials
testimonialRouter.get("/testimonials", async (req, res) => {
    try {
        const testimonials = await Testimonial.aggregate([
            { $sample: { size: 10 } }
        ]);

        res.json(testimonials);
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
});


// ADD testimonial
testimonialRouter.post("/testimonials/add", adminAuth, async (req, res) => {
    try {
        const testimonial = await Testimonial.create(req.body);
        res.status(201).json(testimonial);
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
});


// DELETE testimonial
testimonialRouter.delete("/testimonial/:id", adminAuth, async (req, res) => {
    try {
        await Testimonial.findByIdAndDelete(req.params.id);

        res.json({
            message: "Testimonial removed",
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
});

export default testimonialRouter;