import express from 'express';
import adminController from '../../controllers/adminController/adminController.js';
import { adminauthenticateJWT } from '../../middlewares/adminAuth/adminAuth.js';
const adminRouter = express.Router();

adminRouter.post('/signup', adminController.adminSignup);
adminRouter.post('/login', adminController.adminLogin);

export default adminRouter;