import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const otpSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    otp: {
        type: String,
        required: true
    },

    Attempts: {
        type: Number,
        default: 0
    },

    expiresAt: {
        type: Date,
        required: true
    }
}, { timestamps: true });

otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

otpSchema.pre("save", async function () {
    if (!this.isModified("otp")) return;
    this.otp = await bcrypt.hash(this.otp, 10);
});

otpSchema.methods.isOtpValid = async function (enteredOtp) {
    return await bcrypt.compare(enteredOtp, this.otp);
};

const OTP = mongoose.model("OTP", otpSchema);

export default OTP;