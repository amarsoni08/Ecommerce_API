import express from 'express';
import { adminauthenticateJWT, adminVerification } from '../../middlewares/adminAuth/adminAuth.js';
import productController from '../../controllers/productController/productController.js';
import upload from '../../middlewares/multer/multer.js';
const ProductRouter = express.Router();

ProductRouter.post('/add-product', adminauthenticateJWT, adminVerification, upload.array("images", 5), productController.addProduct);
ProductRouter.patch('/update-product/:id', adminauthenticateJWT, adminVerification, upload.array('images', 5), productController.updateProduct);
ProductRouter.delete(
  '/delete-product/:id',
  adminauthenticateJWT,
  adminVerification,
  productController.deleteProduct
);
ProductRouter.delete(
  '/delete-product-image/:productId/:imageId',
  adminauthenticateJWT,
  adminVerification,
  productController.deleteSingleImage
);
ProductRouter.get(
  '/getallproducts',
  adminauthenticateJWT,
  adminVerification,
  productController.getAllProductsAdmin
);
export default ProductRouter;