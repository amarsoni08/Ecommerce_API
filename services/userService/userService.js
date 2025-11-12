import User from "../../models/userModel/userModel.js";
import { hashPassword } from "../../utils/hashPassword.js";
import { generateOTP } from "../../utils/generateotp.js";
import { sendEmail } from "../../utils/sendemail.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
export default {
  signupService: async (data) => {
    try {
        const { userName, email, password, contactNumber, address, gender, age ,role } = data;
        const trimmedPassword = password.trim()
        // Check if Username, Email or Contact Number already exist
        const existingUser = await User.findOne({
            $or: [
                { userName: userName },
                { email: email },
                { contactNumber: contactNumber }
            ]
        });

        if (existingUser) {
            if (existingUser.userName === userName) {
                throw new Error("Username already exists, please choose another one");
            } else if (existingUser.email === email) {
                throw new Error("Email already exists, please use another email");
            } else if (existingUser.contactNumber === contactNumber) {
                throw new Error("Contact number already exists, please use another number");
            }
        }

        const hashedPassword = await hashPassword(trimmedPassword);
        const user = new User({ userName, email, password: hashedPassword, contactNumber, address, gender, age , role });
        await user.save();
        return user;

    } catch (err) {
        // Error ko throw karenge taki controller me catch ho
        throw new Error(err.message);
    }
},

  loginService: async (identifier, password) => {
    try {

    const user = await User.findOne({
      $or: [{ userName: identifier }, { email: identifier }]
    });
    if (!user) throw new Error("Invalid username or email");
    const trimmedPassword = password.trim()
    const isMatch = await bcrypt.compare(trimmedPassword, user.password);
    if (!isMatch) throw new Error("Invalid password");

    const token = jwt.sign(
      { _id: user._id , role: user.role }, 
      process.env.SECRET_KEY,
      { expiresIn: "12h" }
    );

    return token;

  } catch (error) {
    throw new Error(error.message);
  }
  },

  editProfileService: async (userId, updates) => {
    try {
        const user = await User.findById(userId).select("-password");
        if (!user) throw new Error("User not found");

        // Check for duplicates only for fields being updated
        if (updates.Username || updates.email || updates.contactNumber) {
            const existingUser = await User.findOne({
                $or: [
                    { userName: updates.Username },
                    { email: updates.email },
                    { contactNumber: updates.contactNumber }
                ],
                _id: { $ne: userId } // exclude current user
            });

            if (existingUser) {
                if (existingUser.userName === updates.userName) {
                    throw new Error("Username already exists, please choose another one");
                } else if (existingUser.email === updates.email) {
                    throw new Error("Email already exists, please use another email");
                } else if (existingUser.contactNumber === updates.contactNumber) {
                    throw new Error("Contact number already exists, please use another number");
                }
            }
        }

        // Dynamic update
        Object.keys(updates).forEach(key => (user[key] = updates[key]));
        await user.save();
        return user;

    } catch (err) {
        throw new Error(err.message);
    }
},


getProfileService: async (userId) => {
    try {
        const user = await User.findById(userId).select("-password");
        if (!user) throw new Error("User not found");
        return user;
    } catch (err) {
        throw new Error(err.message);
    }
},

sendOtpService: async (email) => {
    try {
        const user = await User.findOne({ email });
        if (!user) throw new Error("User not found");

        const otp = generateOTP();
        const otpExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
        user.otp = otp;
        user.otpExpiry = otpExpiry;
        await user.save();

        await sendEmail(
            email,
            "Your OTP for password reset",
            `Your OTP is ${otp}. It is valid for 15 minutes.`
        );

        return true;
    } catch (err) {
        throw new Error(err.message);
    }
},
resetPasswordService: async (email, otp, newPassword) => {
    try {
        const user = await User.findOne({ email });
        if (!user) throw new Error("User not found");
        if (user.otp !== otp) throw new Error("Invalid OTP");
        if (user.otpExpiry < new Date()) throw new Error("OTP expired");
        const trimmedPassword = newPassword.trim()
        const hashedPassword = await hashPassword(trimmedPassword);
        user.password = hashedPassword;

        // Clear OTP fields
        user.otp = null;
        user.otpExpiry = null;

        await user.save();
        return true;
    } catch (err) {
        throw new Error(err.message);
    }
},
resetPasswordAuthenticatedService: async (userId, password, newPassword) => {
    try {

      const user = await User.findById(userId);
      if (!user) throw new Error("User not found");

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) throw new Error("Current password is incorrect");

      const isSameAsOld = await bcrypt.compare(newPassword.trim(), user.password);
      if (isSameAsOld) throw new Error("New password cannot be same as current password");
   
      const trimmedPassword = newPassword.trim();
      const hashedPassword = await hashPassword(trimmedPassword);

      user.password = hashedPassword;
      await user.save();

      return true;
    } catch (err) {
      throw new Error(err.message);
    }
  },

};
