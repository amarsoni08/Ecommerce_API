import Order from "../../models/orderModel/orderModel.js";
import Product from "../../models/productModel/productModel.js";
import User from "../../models/userModel/userModel.js";
export default {
    placeOrderService: async ({ userId, products, shippingAddress, paymentMethod }) => {
    if (!products || products.length === 0) throw new Error("No products provided");
    if (!shippingAddress || !shippingAddress.address || !shippingAddress.phone) {
      throw new Error("Valid shipping address and phone are required");
    }

    let totalAmount = 0;
    const orderProducts = [];

    // Check stock and calculate total
    for (const item of products) {
      const product = await Product.findById(item.productId);
      if (!product || !product.isActive) {
        throw new Error(`Product not found or inactive: ${item.productId}`);
      }
      if (product.quantity < item.quantity) {
        throw new Error(`Insufficient stock for product: ${product.productName}`);
      }

      product.quantity -= item.quantity;
      await product.save();

      orderProducts.push({
        product: product._id,
        quantity: item.quantity,
        price: product.price,
      });

      totalAmount += product.price * item.quantity;
    }

    const order = new Order({
      user: userId,
      products: orderProducts,
      totalAmount,
      shippingAddress,
      paymentMethod,
      paymentStatus: paymentMethod === "COD" ? "Pending" : "Paid",
      orderStatus: "Pending",
    });

    await order.save();
    await order.populate("products.product");
    return order;
  },
};