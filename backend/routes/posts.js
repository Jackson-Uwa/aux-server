const express = require("express");
const {
  getPost,
  getPosts,
  createPost,
  updatePost,
  deletePost,
} = require("../controllers/post");

const { authenticate, authorize } = require("../controllers/auth/auth");

const router = express.Router();

router.use(authenticate);
router.get("/", getPosts);
router.get("/:postId", getPost);
router.post("/", createPost);
router.patch("/:postId", updatePost);
router.delete("/:postId", deletePost);

module.exports = router;
