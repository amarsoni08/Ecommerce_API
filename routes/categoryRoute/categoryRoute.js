import express from 'express'
import { adminauthenticateJWT, adminVerification } from '../../middlewares/adminAuth/adminAuth.js';
import categoryController from '../../controllers/categoryController/categoryController.js';

const categoryRouter = express.Router();

categoryRouter.post("/category-add", adminauthenticateJWT, adminVerification, categoryController.createCategory);
categoryRouter.get("/categories", adminauthenticateJWT, adminVerification, categoryController.getAllCategories);
categoryRouter.get("/categoryone/:id", adminauthenticateJWT, adminVerification, categoryController.getCategoryById);
categoryRouter.put("/category/:id", adminauthenticateJWT, adminVerification, categoryController.updateCategory);
categoryRouter.delete("/category/:id", adminauthenticateJWT, adminVerification, categoryController.deleteCategory);



export default categoryRouter;