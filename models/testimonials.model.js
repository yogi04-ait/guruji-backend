import mongoose from "mongoose";
const testimonialSchema = new mongoose.Schema(
    {
        quote: {
            type: String,
            required: true,
            trim: true,
        },

        name: {
            type: String,
            required: true,
            trim: true,
        },

        designation:{ type: String, required: true, trim: true },
        category: { type: String, required: true, trim: true },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model("Testimonial", testimonialSchema);