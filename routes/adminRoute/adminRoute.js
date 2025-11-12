import express from 'express';
import adminController from '../../controllers/adminController/adminController.js';
import { adminauthenticateJWT, adminVerification } from '../../middlewares/adminAuth/adminAuth.js';
import dashboardController from '../../controllers/dashboardController/dashboardController.js';
const adminRouter = express.Router();

adminRouter.post('/signup', adminController.adminSignup);
adminRouter.post('/login', adminController.adminLogin);
adminRouter.get("/dashboard", adminauthenticateJWT, adminVerification, dashboardController.getDashboard);
adminRouter.patch('/block-user/:id', adminauthenticateJWT, adminVerification, adminController.blockUser);
adminRouter.patch('/unblock-user/:id', adminauthenticateJWT, adminVerification, adminController.unblockUser);

export default adminRouter;