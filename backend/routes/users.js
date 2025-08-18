const express = require("express");

const {
  getUsers,
  getUserProfileData,
  deleteUser,
} = require("../controllers/users");

const {
  Register,
  LogIn,
  verify,
  LogOut,
  updateMe,
  authorize,
  forgotPassword,
  resetPassword,
} = require("../controllers/auth/auth");

const router = express.Router();

router.post("/auth/register", Register);
router.post("/auth/login", LogIn);
router.post("/auth/logout", LogOut);
router.post("/auth/forgot-password", forgotPassword);
router.patch("/auth/reset-password/:resetToken", resetPassword);

router.use(verify);
router.get("/", getUsers);
router.get("/my-profile", getUserProfileData);
router.patch("/me", updateMe);
router.delete("/", authorize("admin"), deleteUser);

module.exports = router;
