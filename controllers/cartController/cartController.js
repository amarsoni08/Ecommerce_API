import Product from '../../models/productModel/productModel.js';
import Cart from '../../models/cartModel/cartModel.js';

export default {
  // Add or update product in cart
  addToCart: async (req, res) => {
    try {
      const userId = req.user._id;
      const productId = req.params.id;

      const product = await Product.findById(productId);
      if (!product) return res.status(404).json({ success: false, message: "Product not found" });

      let cartItem = await Cart.findOne({ user: userId, product: productId });

      if (cartItem) {
        // Already in cart → update quantity
        cartItem.quantity += 1;
        cartItem.price += product.price;
      } else {
        // New entry
        cartItem = new Cart({
          user: userId,
          product: productId,
          quantity:1,
          price: product.price,
        });
      }

      await cartItem.save();
      res.status(200).json({ success: true, message: "Product added to cart", cartItem });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // Get all products in cart for user
  getCart: async (req, res) => {
    try {
      const userId = req.user._id;
      const cartItems = await Cart.find({ user: userId }).populate("product");

      if (!cartItems || cartItems.length === 0)
        return res.status(404).json({ success: false, message: "Cart is empty" });

      res.status(200).json({ success: true, total: cartItems.length, cartItems });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // Remove product from cart
  removeFromCart: async (req, res) => {
    try {
      const userId = req.user._id;
      const  productId  = req.params.id;

      const deleted = await Cart.findOneAndDelete({ user: userId, product: productId });

      if (!deleted) return res.status(404).json({ success: false, message: "Product not in cart" });

      res.status(200).json({ success: true, message: "Product removed from cart" });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // Clear all cart items for user
  clearCart: async (req, res) => {
    try {
      const userId = req.user._id;
      await Cart.deleteMany({ user: userId });
      res.status(200).json({ success: true, message: "Cart cleared" });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },
};