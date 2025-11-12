import cron from 'node-cron';
import Order from '../models/orderModel/orderModel.js';
import Transaction from '../models/transactionModel/transactionModel.js';


export const startOrderCleanupCron = () => {
  cron.schedule("*/5 * * * *", async () => {
    const expireTime = new Date(Date.now() - 15 * 60 * 1000);
    const pendingOrders = await Order.find({
      paymentMethod: "Online",
      paymentStatus: "Pending",
      createdAt: { $lt: expireTime },
    });

    for (const order of pendingOrders) {
      order.orderStatus = "Cancelled";
      order.paymentStatus = "Failed";
      await order.save();
      await Transaction.updateMany({ order: order._id }, { status: "cancelled" });
      console.log(`Order ${order._id} cancelled due to payment timeout`);
    }
  });
};