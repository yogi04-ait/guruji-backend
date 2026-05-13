import mongoose from "mongoose";

const partnerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
}, { timestamps: true }
)

partnerSchema.pre("save", function (next) {
    if (this.name) {
        this.name = this.name
            .trim()
            .replace(/\s+/g, " ")
            .replace(/\b\w/g, (char) => char.toUpperCase());
    }
});

// Index on name to speed up lookups by partner name
partnerSchema.index({ name: 1 });

export default mongoose.model("HiringPartner", partnerSchema);