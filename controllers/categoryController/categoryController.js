import categoryService from "../../services/categoryService/categoryService.js";
import { categoryValidationSchema } from "../../validations/categoryValidation/categoryValidation.js";

export default {
  createCategory: async (req, res) => {
    try {
      const { error } = categoryValidationSchema.validate(req.body);
      if (error) {
        return res.status(400).json({ success: false, message: error.details[0].message });
      }

      const { categoryName } = req.body;
      const createdBy = req.admin._id; // admin id from JWT

      const category = await categoryService.createCategory({ categoryName, createdBy });

      res.status(201).json({ success: true, message: "Category created successfully", result : category });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  },

  getAllCategories: async (req, res) => {
    try {
    const { search, page, limit } = req.query;

    const categories = await categoryService.getAllCategories({
      search: search || "",
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 10,
    });
    if (categories.categories.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No categories found matching your search",
        result: [],
        total: 0,
        page: categories.page,
        totalPages: 0,
      });
    }
    res.status(200).json({
      success: true,
      message: "Categories fetched successfully",
      result: categories.categories,  // actual list
      total: categories.total,
      page: categories.page,
      totalPages: categories.totalPages,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
  },


  getCategoryById: async (req, res) => {
    try {
      const { id } = req.params;
      const category = await categoryService.getCategoryById(id);
      res.status(200).json({ success: true, message:"Category fetch successfully",result: category });
    } catch (err) {
      res.status(404).json({ success: false, message: err.message });
    }
  },
    updateCategory: async (req, res) => {
    try {
      const { error } = categoryValidationSchema.validate(req.body);
      if (error) return res.status(400).json({ success: false, message: error.details[0].message });

      const { id } = req.params;
      const { categoryName } = req.body;

      const category = await categoryService.updateCategory(id, categoryName);
      res.status(200).json({ success: true, message: "Category updated successfully", result: category });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  },

  deleteCategory: async (req, res) => {
    try {
      const { id } = req.params;
      await categoryService.deleteCategory(id);
      res.status(200).json({ success: true, message: "Category deleted successfully" });
    } catch (err) {
      res.status(404).json({ success: false, message: err.message });
    }
  }
};