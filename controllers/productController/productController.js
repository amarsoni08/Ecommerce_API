import productService from "../../services/productService/productService.js";
import { productValidationSchema, updateProductValidationSchema } from "../../validations/productValidation/productValidation.js";
import Image from "../../models/imageModel/imageModel.js";
import { v2 as cloudinary } from 'cloudinary';
import Product from "../../models/productModel/productModel.js";
import Category from "../../models/categoryModel/categoryModel.js";
export default {
  addProduct: async (req, res) => {
    try {
      const { error } = productValidationSchema.validate(req.body);
      if (error) return res.status(400).json({ success: false, message: error.details[0].message });
      const { productName, description, price, category_id, quantity } = req.body;
      const adminId = req.admin._id;
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ success: false, message: "Images are required" });
      }
      const categoryExists = await Category.findById(category_id);
      if (!categoryExists) {
        return res.status(400).json({ success: false, message: "Category does not exist" });
      }
      const productData = {
        productName,
        description,
        price,
        category_id,
        quantity,
        addedBy: adminId, // JWT se admin ID
      };
      const product = await productService.addProductService(productData);
      const imageIds = [];
      for (const file of req.files) {
        const image = new Image({
          url: file.path,
          public_id: file.filename || file.public_id,
          uploadedBy: adminId,
          product: product._id,
        });
        await image.save();
        imageIds.push(image._id);
      }
      product.images = imageIds;
      await product.save();
      res.status(201).json({ success: true, message: "Product added successfully", result: product });
    }
    catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },
  updateProduct: async (req, res) => {
    try {
      const { error } = updateProductValidationSchema.validate(req.body);
      if (error) return res.status(400).json({ success: false, message: error.details[0].message });

      const { id } = req.params;
      const adminId = req.admin._id;

      const product = await productService.getProductById(id);
      if (!product) return res.status(404).json({ success: false, message: "Product not found" });

      if (product.addedBy.toString() !== adminId.toString()) {
        return res.status(403).json({ success: false, message: "You are not authorized to update this product" });
      }

      const { productName, description, price, category, quantity } = req.body;
      const updatedData = { productName, description, price, category, quantity };
      Object.keys(updatedData).forEach(key => updatedData[key] === undefined && delete updatedData[key]);

      // 🔹 Image handling with limit check
      if (req.files && req.files.length > 0) {
        const existingImagesCount = product.images.length;
        const totalImages = existingImagesCount + req.files.length;

        if (totalImages > 5) {
          return res.status(400).json({
            success: false,
            message: `Cannot upload more than 5 images. You already have ${existingImagesCount} images.`
          });
        }

        // Add new images without deleting old ones
        const imageIds = [...product.images];
        for (const file of req.files) {
          const image = new Image({
            url: file.path,
            public_id: file.filename || file.public_id,
            uploadedBy: adminId,
            product: product._id,
          });
          await image.save();
          imageIds.push(image._id);
        }
        updatedData.images = imageIds;
      }

      const updatedProduct = await productService.updateProductService(id, updatedData);
      res.status(200).json({ success: true, message: "Product updated successfully", result: updatedProduct });

    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: err.message });
    }
  },
  deleteProduct: async (req, res) => {
    try {
      const { id } = req.params;
      const adminId = req.admin._id;

      const product = await productService.getProductById(id);
      if (!product) {
        return res.status(404).json({ success: false, message: "Product not found" });
      }

      if (product.addedBy.toString() !== adminId.toString()) {
        return res.status(403).json({ success: false, message: "You are not authorized to delete this product" });
      }

      const images = await Image.find({ product: product._id });
      for (const img of images) {
        if (img.public_id && cloudinary) {
          await cloudinary.uploader.destroy(img.public_id); // cloud se delete
        }
        await img.deleteOne(); // DB se delete
      }
      await productService.deleteProductService(id);

      res.status(200).json({ success: true, message: "Product and associated images deleted successfully" });

    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: err.message });
    }
  },
  deleteSingleImage: async (req, res) => {
    try {
      const { productId, imageId } = req.params;
      const adminId = req.admin._id;

      const product = await Product.findById(productId);
      if (!product) return res.status(404).json({ success: false, message: "Product not found" });

      if (product.addedBy.toString() !== adminId.toString()) {
        return res.status(403).json({ success: false, message: "Not authorized" });
      }

      const image = await Image.findById(imageId);
      if (!image) return res.status(404).json({ success: false, message: "Image not found" });

      if (image.public_id) {
        await cloudinary.uploader.destroy(image.public_id);
      }
      await image.deleteOne();


      product.images = product.images.filter(imgId => imgId.toString() !== imageId);
      await product.save();

      res.status(200).json({ success: true, message: "Image deleted successfully", result: product });

    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: err.message });
    }
  },
  getAllProductsAdmin: async (req, res) => {
    try {
    let { page, limit, search } = req.query;

    page = parseInt(page) || 1;
    limit = parseInt(limit) || 5;
    const skip = (page - 1) * limit;

    const query = {};

    if (search) {
      query.$or = [
        { productName: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .sort({ createdAt: -1 }) // newest first
      .skip(skip)
      .limit(limit);

    if (products.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No products found matching your search",
        total: 0,
        page,
        pages: 0,
        result: [],
      });
    }

    res.status(200).json({
      success: true,
      total,
      page,
      pages: Math.ceil(total / limit),
      result: products,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
  },
  getProductById: async (req, res) => {
    try {
      const productId = req.params.id;

      const product = await Product.findById(productId).populate("images");
      if (!product) {
        return res.status(404).json({ success: false, message: "Product not found" });
      }

      res.status(200).json({ success: true, result: product });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },
}