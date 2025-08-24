const express = require("express");
const {
  getProducts,
  getProduct,
  addProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/product");

const { authenticate, authorize } = require("../controllers/auth/auth");

const router = express.Router();

router.use(authenticate);
router.get("/", getProducts);
router.get("/:pid", getProduct);
router.post("/", addProduct);
router.patch("/:pid", updateProduct);
router.delete("/:pid", deleteProduct);

module.exports = router;
