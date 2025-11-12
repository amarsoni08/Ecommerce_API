import userService from "../../services/userService/userService.js";
import { userValidationSchema, loginValidationSchema, resetPasswordSchema } from "../../validations/userValidation/userValidation.js";
import User from "../../models/userModel/userModel.js";

export default {
    signup: async (req, res) => {
        try {
            const { error } = userValidationSchema.validate(req.body);
            if (error) return res.status(400).json({ success: false, message: error.details[0].message });

            const user = await userService.signupService(req.body);
            res.status(201).json({ success: true, message: "User created successfully", result: user });
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    },

    login: async (req, res) => {
        try {
            const { error } = loginValidationSchema.validate(req.body);
            if (error) return res.status(400).json({ success: false, message: error.details[0].message });
            const { userName, email, password } = req.body;
            const identifier = userName || email;
            const user = await User.findOne({
              $or: [{ userName: identifier }, { email: identifier }]
            });
            if (user.isBlocked)
              return res.status(403).json({ success: false, message: "You are blocked by admin" });
            const token = await userService.loginService(identifier, password);
            res.status(200).json({ success: true, message: "Login successful", result: { token } });
        } catch (err) {
            res.status(401).json({ success: false, message: err.message });
        }
    },

    editProfile: async (req, res) => {
        try {
            const updatedUser = await userService.editProfileService(req.user._id, req.body);
            res.status(200).json({ success: true, message: "Profile updated successfully", result: updatedUser });
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    },

    getProfile: async (req, res) => {
        try {
            const user = await userService.getProfileService(req.user._id);
            res.status(200).json({ success: true, result: user });
        } catch (err) {
            res.status(404).json({ success: false, message: err.message });
        }
    },

    sendOtp: async (req, res) => {
        try {
            await userService.sendOtpService(req.body.email);
            res.status(200).json({ success: true, message: "OTP sent to your email" });
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    },

    verifyOtpAndReset: async (req, res) => {
        try {
            const { error } = resetPasswordSchema.validate(req.body);
            if (error) return res.status(400).json({ success: false, message: error.details[0].message });

            const { email, otp, newPassword } = req.body;
            await userService.resetPasswordService(email, otp, newPassword);
            res.status(200).json({ success: true, message: "Password reset successfully" });
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    },
    resetPassword: async (req, res) => {
        try {
            const { password , newPassword } = req.body;
            await userService.resetPasswordAuthenticatedService(req.user._id, password, newPassword);
            res.status(200).json({ success: true, message: "Password reset successfully" });
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    },
    getAllUsersAdmin: async (req, res) => {
    try {
        let { page, limit } = req.query;

      page = parseInt(page) || 1;      
      limit = parseInt(limit) || 5;    
      const skip = (page - 1) * limit;
      const total = await User.countDocuments();
      const users = await User.find()
        .sort({ createdAt: -1 })    
        .skip(skip)
        .limit(limit)
        .select('-password');    

      res.status(200).json({
        success: true,
        total,
        page,
        pages: Math.ceil(total / limit),
        result: users
      });

    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: err.message });
    }
  },
};
