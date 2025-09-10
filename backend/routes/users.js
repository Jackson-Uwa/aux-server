const express = require("express");

const { getUsers } = require("../controllers/users");

const {
  Register,
  LogIn,
  authenticate,
  LogOut,
  updateMe,
  updateUserDetails,
  getUserProfileData,
  authorize,
  updatePassword,
  forgotPassword,
  resetPassword,
  deleteMe,
} = require("../controllers/auth/auth");

const router = express.Router();

router.post("/auth/register", Register);
router.post("/auth/login", LogIn);
router.post("/auth/logout", LogOut);
router.post("/auth/forgot-password", forgotPassword);
router.patch("/auth/reset-password/:resetToken", resetPassword);


router.use(authenticate);
router.get("/", getUsers);
router.get("/my-profile", getUserProfileData);
router.patch("/me", updateMe);
router.patch("/my-details", updateUserDetails);
router.patch("/my-profile/update-password", updatePassword);
router.delete("/my-profile/", authorize("admin"), deleteMe);

module.exports = router;
