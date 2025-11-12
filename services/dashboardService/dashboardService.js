import User from "../../models/userModel/userModel.js";
import Order from "../../models/orderModel/orderModel.js";
import Product from "../../models/productModel/productModel.js";
import Category from "../../models/categoryModel/categoryModel.js";

export default {
  getDashboardStats: async () => {
    try {
      const [userCount, productCount, orderCount, categoryCount] = await Promise.all([
        User.countDocuments(),
        Product.countDocuments(),
        Order.countDocuments(),
        Category.countDocuments(),
      ]);

      return {
        totalUsers: userCount,
        totalProducts: productCount,
        totalOrders: orderCount,
        totalCategories: categoryCount,
      };
    } catch (error) {
      throw new Error("Error fetching dashboard statistics: " + error.message);
    }
  },
};
