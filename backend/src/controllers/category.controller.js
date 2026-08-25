const Category = require("../models/Category");


const escapeRegex = (str) => {
  if (!str) return '';
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

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


const createCategory = async (req, res, next) => {
  try {
    const { name } = req.body;
    const userId = getUserIdFromReq(req); // FIXED: Safe helper used here

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized access" });
    }

 if (!name || typeof name !== "string" || !name.trim()) {
    return res.status(400).json({ message: "Category name is required and must be a string" });
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
      success: true,
      message: "Category created successfully",
      category,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "Category already exists" });
    }
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