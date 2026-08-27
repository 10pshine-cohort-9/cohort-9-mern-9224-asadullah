const express = require("express");
const router = express.Router();

const {getCategories,createCategory,deleteCategory} = require("../controllers/category.controller");

const protect = require('../middleware/auth.middleware');

router.get("/", protect, getCategories);

router.post("/", protect, createCategory);

router.delete("/:id", protect, deleteCategory);

module.exports = router;