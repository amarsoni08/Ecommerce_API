import orderService from "../../services/orderService/orderService.js";
// import { orderValidationSchema } from "../../validations/orderValidation/orderValidation.js";
import User from "../../models/userModel/userModel.js";
import Order from "../../models/orderModel/orderModel.js";
import { sendEmail } from "../../utils/sendemail.js";
export default {
    placeOrder: async (req, res) => {
        try {
            const { products, shippingAddress: shippingFromBody, paymentMethod } = req.body;
            const userId = req.user._id;

            const user = await User.findById(userId).lean();
            if (!user) return res.status(404).json({ success: false, message: "User not found" });

            // Decide shipping address
            const shippingAddress =
                shippingFromBody && Object.keys(shippingFromBody).length
                    ? shippingFromBody
                    : user.defaultAddress && Object.keys(user.defaultAddress).length
                        ? user.defaultAddress
                        : null;

            if (shippingAddress && !shippingAddress.phone && user.phone) shippingAddress.phone = user.phone;

            if (!shippingAddress) {
                return res.status(400).json({ success: false, message: "Shipping address or phone required" });
            }

            const order = await orderService.placeOrderService({ userId, products, shippingAddress, paymentMethod });
            const productsList = order.products.map(
                item => `• ${item.product.productName} x ${item.quantity} - ₹${item.price * item.quantity}`
            ).join("\n");

            const emailText = `
Hi ${user.userName || "Customer"},

Your order has been successfully placed!

Order ID: ${order._id}
Products:${productsList}

Total Amount: ₹${order.totalAmount}

Shipping Address:
${shippingAddress.address}, ${shippingAddress.city}, ${shippingAddress.state}, ${shippingAddress.country} - ${shippingAddress.zipCode}
Phone: ${shippingAddress.phone}

Thank you for shopping with us!
      `;

    
            await sendEmail(user.email, 'Order Confirmation', emailText);
            res.status(201).json({ success: true, message: "Order placed successfully", result: order });
        } catch (err) {
            res.status(400).json({ success: false, message: err.message });
        }
    },
    getAllOrdersAdmin: async (req, res) => {
    try {
        let { page, limit } = req.query;
      
            page = parseInt(page) || 1;      
            limit = parseInt(limit) || 5;    
            const skip = (page - 1) * limit;
            const total = await Order.countDocuments();
      const orders = await Order.find()
        .sort({ createdAt: -1 }) // newest first
        .skip(skip)
        .limit(limit)
      res.status(200).json({
        success: true,
        total,
        page,
        pages: Math.ceil(total / limit),
        result: orders
      });

    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: err.message });
    }
  },
};