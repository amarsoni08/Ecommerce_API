import adminService from "../../services/adminService/adminService.js";
import { adminValidationSchema, adminLoginValidationSchema } from "../../validations/adminValidation/adminValidation.js";
import User from "../../models/userModel/userModel.js";
export default {
    adminSignup: async (req, res) => {
        try {
            const { error } = adminValidationSchema.validate(req.body);
            if (error) return res.status(400).json({ success: false, message: error.details[0].message });
            const admin = await adminService.adminSignupService(req.body);
            res.status(201).json({ success: true, message: "Admin created successfully", result: admin });

        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },
    adminLogin: async (req, res) => {
        try {

            const { error } = adminLoginValidationSchema.validate(req.body);
            if (error) return res.status(400).json({ success: false, message: error.details[0].message });
            const { adminName, email, password } = req.body;
            const identifier = adminName || email;
            const token = await adminService.adminLoginService(identifier, password);
            res.status(200).json({ success: true, message: "Login successful", result: { token } });
        } catch (error) {
            res.status(401).json({ success: false, message: error.message });
        }
    },
    blockUser: async (req, res) => {
        try {
            const { id } = req.params;
            const user = await User.findByIdAndUpdate(id, { isBlocked: true }, { new: true }).select('-password -otp -otpExpiry');
            if (!user) return res.status(404).json({ success: false, message: "User not found" });

            res.json({ success: true, message: `${user.userName} has been blocked`, result: user });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },
    unblockUser: async (req, res) => {
        try {
            const { id } = req.params;
            const user = await User.findByIdAndUpdate(id, { isBlocked: false }, { new: true }).select('-password -otp -otpExpiry');
            if (!user) return res.status(404).json({ success: false, message: "User not found" });

            res.json({ success: true, message: `${user.userName} has been unblocked`, user });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },
}