import Product from "../../models/productModel/productModel.js";
import Admin from "../../models/adminModel/adminModel.js";

export default {
    addProductService: async (productData) => {
        const admin = await Admin.findById(productData.addedBy);
        if (!admin) {
            throw new Error("Admin not found");
        }
        const product = new Product(productData);
        await product.save();
        return product;
    },
    getProductById: async (productId) => {
        return await Product.findById(productId)
    },
    updateProductService: async (productId, updatedData) => {
        return await Product.findByIdAndUpdate(productId, updatedData, { new: true });
    },
    deleteProductService: async (productId) => {
    return await Product.findByIdAndDelete(productId);
  },
}