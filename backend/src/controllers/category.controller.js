const Category = require("../models/Category");

const getUserIdFromReq = (req) => {
  return req.user?._id || req.user?.id || req.user?.userId;
};

const getCategories = async (req, res, next) => {
  try {
    const userId = getUserIdFromReq(req);

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized access" });
    }

    const categories = await Category.find({ user: userId }).sort({ name: 1 });

    res.status(200).json({
      success: true,
      categories,
    });
  } catch (error) {
    next(error);
  }
};

const escapeRegex = (str) => {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

const createCategory = async (req, res, next) => {
  try {
    const { name } = req.body;
    const userId = req.user.userId;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Category name is required" });
    }

    const trimmedName = name.trim();


    const safeRegex = new RegExp(`^${escapeRegex(trimmedName)}$`, "i");

  
    const existingCategory = await Category.findOne({
      user: userId,
      name: safeRegex,
    });

    if (existingCategory) {
      return res.status(400).json({ message: "Category already exists" });
    }

    const category = await Category.create({
      name: trimmedName,
      user: userId,
    });

    res.status(201).json({
      message: "Category created successfully",
      category,
    });
  } catch (error) {
    next(error);
  }
};

const deleteCategory = async (req, res, next) => {
  try {
    const userId = getUserIdFromReq(req);

    const category = await Category.findOneAndDelete({
      _id: req.params.id,
      user: userId,
    });

    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }

    res.status(200).json({ success: true, message: "Category deleted successfully" });
  } catch (error) {
    next(error);
  }
};

module.exports = { getCategories, createCategory, deleteCategory };