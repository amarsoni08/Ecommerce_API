import express from 'express';
import { userauthenticateJWT } from '../../middlewares/userAuth/userAuth.js';
import { adminauthenticateJWT, adminVerification } from '../../middlewares/adminAuth/adminAuth.js';
import userController from '../../controllers/userController/userController.js'
import productController from '../../controllers/productController/productController.js';
import cartController from '../../controllers/cartController/cartController.js';
const userRouter = express.Router();

userRouter.post('/signup', userController.signup);
userRouter.post('/login', userController.login);
userRouter.patch('/update/profile', userauthenticateJWT, userController.editProfile);
userRouter.get('/userprofile', userauthenticateJWT, userController.getProfile);
userRouter.post('/resert-password', userauthenticateJWT, userController.resetPassword);
userRouter.post('/forgot-password/send-otp', userController.sendOtp);
userRouter.post('/forgot-password/verify-otp', userController.verifyOtpAndReset);
userRouter.get("/products", productController.getAllProductsAdmin);
userRouter.post("/cart/add/:id", userauthenticateJWT, cartController.addToCart);
userRouter.get("/cart", userauthenticateJWT, cartController.getCart);
userRouter.post("/cart/remove/:id", userauthenticateJWT, cartController.removeFromCart);
userRouter.delete("/cart/clear", userauthenticateJWT, cartController.clearCart);
userRouter.get("/productdetail/:id", productController.getProductById);
userRouter.get(
  '/getallusers',
  adminauthenticateJWT,
  adminVerification,
  userController.getAllUsersAdmin
);
export default userRouter;