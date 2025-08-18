const express = require("express");

const {
  getFeedbacks,
  getFeedbackID,
  addFeedback,
  updateFeedback,
  deleteFeedback,
} = require("../controllers/feedback");

const { verify, authorize } = require("../controllers/auth/auth");

const router = express.Router();

router.use(verify);
router.get("/", getFeedbacks);
router.get("/:fid", getFeedbackID);
router.post("/:pid/new-feedback", addFeedback);
router.patch("/:fid", updateFeedback);
router.delete("/:fid", authorize("admin"), deleteFeedback);

module.exports = router;
