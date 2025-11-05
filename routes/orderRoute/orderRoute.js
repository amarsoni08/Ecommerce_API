import express from 'express';
import { userauthenticateJWT } from '../../middlewares/userAuth/userAuth.js';
import orderController from '../../controllers/orderController/orderController.js';
import { adminauthenticateJWT , adminVerification } from '../../middlewares/adminAuth/adminAuth.js';
const orderRouter = express.Router();

orderRouter.post("/place-order", userauthenticateJWT, orderController.placeOrder);
orderRouter.get(
  '/getallorders',
  adminauthenticateJWT,
  adminVerification,
  orderController.getAllOrdersAdmin
);

export default orderRouter;