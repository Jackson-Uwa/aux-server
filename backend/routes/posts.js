const express = require("express");
const {
  getPost,
  getPosts,
  createPost,
  updatePost,
  deletePost,
} = require("../controllers/post");

const { verify, authorize } = require("../controllers/auth/auth");

const router = express.Router();

router.use(verify);
router.get("/", getPosts);
router.get("/:postId", getPost);
router.post("/", createPost);
router.patch("/:postId", updatePost);
router.delete("/:postId", authorize("admin"), deletePost);

module.exports = router;
