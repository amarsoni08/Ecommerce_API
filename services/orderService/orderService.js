import Order from "../../models/orderModel/orderModel.js";
import Product from "../../models/productModel/productModel.js";
import User from "../../models/userModel/userModel.js";
import { sendEmail } from "../../utils/sendemail.js";
import Transaction from "../../models/transactionModel/transactionModel.js";
import Razorpay from "razorpay";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});
export default {
    placeOrderService: async ({ userId, products, shippingAddress, paymentMethod }) => {
    try {
    const user = await User.findById(userId).lean();
    if (!user) throw new Error("User not found");

    // Decide shipping address
    const address =
      shippingAddress && Object.keys(shippingAddress).length
        ? shippingAddress
        : user.defaultAddress && Object.keys(user.defaultAddress).length
          ? user.defaultAddress
          : null;

    if (!address) throw new Error("Shipping address required");
    if (!address.phone && user.phone) address.phone = user.phone;

    // Calculate total & check stock
    let totalAmount = 0;
    const orderProducts = [];

    for (const item of products) {
      const product = await Product.findById(item.productId);
      if (!product || !product.isActive) throw new Error(`Product not found: ${item.productId}`);
      if (product.quantity < item.quantity) throw new Error(`Insufficient stock: ${product.productName}`);

      product.quantity -= item.quantity;
      await product.save();

      orderProducts.push({
        product: product._id,
        quantity: item.quantity,
        price: product.price,
      });

      totalAmount += product.price * item.quantity;
    }

    // Create order
    const order = new Order({
      user: userId,
      products: orderProducts,
      totalAmount,
      shippingAddress: address,
      paymentMethod,
      paymentStatus: paymentMethod === "COD" ? "Pending" : "Pending",
      orderStatus: "Pending",
    });

    await order.save();
    await order.populate("products.product");

    // ---------------- COD FLOW ----------------
    if (paymentMethod === "COD") {
      const productsList = order.products.map(
        item => `• ${item.product.productName} x ${item.quantity} - ₹${item.price * item.quantity}`
      ).join("\n");

      const emailText = `
Hi ${user.userName || "Customer"},

Your order has been placed successfully!

Order ID: ${order._id}
Products:
${productsList}

Total Amount: ₹${order.totalAmount}
Payment Method: Cash on Delivery (COD)

Shipping Address:
${address.address}, ${address.city}, ${address.state}, ${address.country} - ${address.zipCode}
Phone: ${address.phone}

Thank you for shopping with us!
      `;
      await sendEmail(user.email, "Order Confirmation - COD", emailText);
      return { order, message: "Order placed successfully (COD)" };
    }

    // ---------------- ONLINE PAYMENT FLOW ----------------
    const totalAmountInPaise = totalAmount * 100; // Razorpay expects paise
    const razorpayOrder = await razorpay.orders.create({
      amount: totalAmountInPaise,
      currency: "INR",
      receipt: `receipt_${order._id}`,
      payment_capture: 1,
    });

    // Save transaction
    const transaction = new Transaction({
      order: order._id,
      user: userId,
      amount: totalAmount,
      paymentMethod: "Online",
      razorpayOrderId: razorpayOrder.id,
      status: "created",
    });
    await transaction.save();

    // Send email with payment link
    const paymentLink = `https://checkout.razorpay.com/v1/checkout.js?order_id=${razorpayOrder.id}`;
    const emailText = `
Hi ${user.userName || "Customer"},

Your order is pending payment.

Order ID: ${order._id}
Total Amount: ₹${order.totalAmount}
Payment Method: Online

Please complete your payment using the link below:
${paymentLink}

If payment is not completed within 15 minutes, the order will be cancelled automatically.

Shipping Address:
${address.address}, ${address.city}, ${address.state}, ${address.country} - ${address.zipCode}
Phone: ${address.phone}
    `;
    await sendEmail(user.email, "Complete Your Payment", emailText);

    return { order, razorpayOrder, message: "Order placed successfully, complete payment to confirm" };

  } catch (error) {
    throw new Error(error.message);
  }
},
getAllOrdersAdminService: async () => {
    try {
      const orders = await Order.find() 
        .sort({ createdAt: -1 })
        .lean();
      return orders;
    } catch (error) {
      throw new Error(error.message);
    }
  }
};