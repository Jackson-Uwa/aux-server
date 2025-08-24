const express = require("express");

const {
  getFeedbacks,
  getFeedbackID,
  addFeedback,
  updateFeedback,
  deleteFeedback,
} = require("../controllers/feedback");

const { authenticate, authorize } = require("../controllers/auth/auth");

const router = express.Router();

router.use(authenticate);
router.get("/", getFeedbacks);
router.get("/:fid", getFeedbackID);
router.post("/:pid/new-feedback", addFeedback);
router.patch("/:fid", updateFeedback);
router.delete("/:fid", deleteFeedback);

module.exports = router;
