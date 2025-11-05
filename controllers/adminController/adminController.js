import adminService from "../../services/adminService/adminService.js";
import { adminValidationSchema, adminLoginValidationSchema } from "../../validations/adminValidation/adminValidation.js";

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
            const { adminName,email, password } = req.body;
            const identifier = adminName || email;
            const token = await adminService.adminLoginService(identifier, password);
            res.status(200).json({ success: true, message: "Login successful", result: { token } });
        } catch (error) {
            res.status(401).json({ success: false, message: error.message });
        }
    }

}