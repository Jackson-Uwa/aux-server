const express = require("express");
const {
  getComment,
  getComments,
  createComment,
  updateComment,
  deleteComment,
} = require("../controllers/comment");

const { verify } = require("../controllers/auth/auth");

const router = express.Router();

router.use(verify);
router.get("/", getComments);
router.get("/:commentId", getComment);
router.post("/:postId/new-comment", createComment);
router.patch("/:commentId", updateComment);
router.delete("/:commentId", deleteComment);

module.exports = router;
