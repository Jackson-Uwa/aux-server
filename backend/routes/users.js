const express = require("express");
const {
  getUsers,
  getUserByID,
  updateUser,
  deleteUser,
} = require("../controllers/users");

const {
  Register,
  LogIn,
  verify,
  LogOut,
  uploadProfile,
} = require("../controllers/auth/auth");

const router = express.Router();

router.use(verify);
router.get("/", getUsers);
router.get("/:uid", getUserByID);

router.post("/auth/register", Register);
router.post("/auth/login", LogIn);
router.post("/auth/logout", LogOut);

router.patch("/:uid/my-profile", uploadProfile);
router.patch("/:uid", updateUser);

router.delete("/:uid", deleteUser);

module.exports = router;
