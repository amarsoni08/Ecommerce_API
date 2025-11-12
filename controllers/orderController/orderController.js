import orderService from "../../services/orderService/orderService.js";

export default {
  placeOrder: async (req, res) => {
    try {
    const { products, shippingAddress, paymentMethod } = req.body;
    const userId = req.user._id;

    const result = await orderService.placeOrderService({ userId, products, shippingAddress, paymentMethod });
    res.status(201).json({ success: true, message: "successfully done", result:result });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
  },
  getAllOrdersAdmin: async (req, res) => {
    try {
      const result = await orderService.getAllOrdersAdminService();
      res.status(200).json({ success: true, message: "successfully fetched", result: result });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  } 
};