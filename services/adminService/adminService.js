import Admin from "../../models/adminModel/adminModel.js";
import { hashPassword } from "../../utils/hashPassword.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
export default {
    adminSignupService: async (data) => {
        try {
            const { adminName, email, password } = data;
            const trimmedPassword = password.trim();
            // Check if Email already exists
            const existingAdmin = await
                Admin.findOne({
                    $or: [
                { adminName: adminName },
                { email: email },
                    ]
                 });
            if (existingAdmin) {
                if (existingAdmin.adminName === adminName) {
                throw new Error("admin already exists, please choose another one");
            } else if (existingAdmin.email === email) {
                throw new Error("Email already exists, please use another email");
            } 
            }
            const hashedPassword = await hashPassword(trimmedPassword);
            const admin = new Admin({ adminName, email, password: hashedPassword });
            await admin.save();
            return admin;
        } catch (err) {
            throw new Error(err.message);
        }
    }, 
    adminLoginService: async (identifier, password) => {
        try {
            const admin = await Admin.findOne({
                $or: [
                    { adminName: identifier },
                    { email: identifier }
                ]
            });
            if (!admin) {
                throw new Error("Invalid adminName or Email");
            }
            const trimmedPassword = password.trim();
            const isMatch = await bcrypt.compare(trimmedPassword, admin.password);
            if (!isMatch) {
                throw new Error("Invalid password");
            }
            const token = jwt.sign(
                  { _id: admin._id , role: admin.role }, 
                  process.env.SECRET_KEY,
                  { expiresIn: "12h" }
                );
            return token;
        } catch (err) {
            throw new Error(err.message);
        }
    }
}