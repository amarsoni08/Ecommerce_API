import Category from "../../models/categoryModel/categoryModel.js";
export default {

   createCategory : async({ categoryName, createdBy }) => {
    const existing = await Category.findOne({ categoryName: categoryName.trim() });
    if (existing) {
      throw new Error("Category already exists");
    }

    const category = new Category({ categoryName: categoryName.trim(), createdBy });
    await category.save();
    return category;
  },
    updateCategory: async(id, categoryName) => {
    const category = await Category.findById(id);
    if (!category) throw new Error("Category not found");

    // Check duplicate name
    const existing = await Category.findOne({ categoryName: categoryName.trim(), _id: { $ne: id } });
    if (existing) throw new Error("Another category with this name already exists");

    category.categoryName = categoryName.trim();
    await category.save();
    return category;
  },

   getAllCategories : async ({ search = "", page = 1, limit = 10 }) => {
    try {
    const query = {};

    if (search) {
      query.categoryName = { $regex: search, $options: "i" };
    }

    const total = await Category.countDocuments(query);

    const categories = await Category.find(query)
      .sort({ createdAt: -1 }) // latest first
      .skip((page - 1) * limit)
      .limit(limit);

    return {
      categories,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  } catch (error) {
    throw new Error(error.message);
  }
  },

   getCategoryById : async(id) => {
    const category = await Category.findById(id);
    if (!category) throw new Error("Category not found");
    return category;
  },

  // Delete category
    deleteCategory: async(id) => {
    const deleted = await Category.findByIdAndDelete(id);
    if (!deleted) throw new Error("Category not found ");
    return deleted;
  }
};