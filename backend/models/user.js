const mongoose = require("mongoose");

const crypto = require("crypto");
const bcrypt = require("bcrypt");

const userSchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please tell us your name"],
  },
  email: {
    type: String,
    required: [true, "Please enter your email address"],
    unique: true,
    lowercase: true,
    // validate: [validator.isEmail, "Provide email"],
  },
  photo: { type: String, default: "default.jpg" },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
  password: {
    type: String,
    required: [true, "A user password is required"],
    minlength: 8,
    select: false,
  },
  confirmPassword: {
    type: String,
    required: [true, "please confirm password"],
    validate: {
      validator: function (el) {
        return el === this.password;
      },
      message: "Ooops..., user passwords are not the same!",
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
});

userSchema.pre("save", function (next) {
  if (!this.isModified("password")) return next();
  this.password = bcrypt.hash(this.password, 12);
  this.confirmPassword = undefined;
  next();
});

userSchema.pre("save", function (next) {
  //on every save or new user if the password field is not modified or newly created move to the
  //next middleware else set the passwordChangedAt property to the current time
  if (!this.isModified("password") || this.isNew) return next();
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

userSchema.pre(/^find/, function (next) {
  // this points to the current query
  this.find({ active: { $ne: false } });
  next();
});

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < changedTimestamp;
  }

  //false means Not Changed
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  // console.log({ resetToken }, this.passwordResetToken);
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

module.exports = mongoose.model("User", userSchema);
