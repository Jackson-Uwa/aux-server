const express = require("express");
const {
  getProducts,
  getProduct,
  addProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/product");

const { verify, authorize } = require("../controllers/auth/auth");

const router = express.Router();

router.use(verify);
router.get("/", getProducts);
router.get("/:pid", getProduct);
router.post("/", addProduct);
router.patch("/:pid", updateProduct);
router.delete("/:pid", authorize("admin"), deleteProduct);

module.exports = router;
