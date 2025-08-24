const mongoose = require("mongoose");
const slugify = require("slugify");

const productSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Enter product name"],
    },
    slug: String,
    price: {
      type: Number,
      required: [true, "Enter product rice"],
    },
    description: {
      type: String,
      required: [true, "Please describe the product"],
    },
    thumbnail: {
      type: String,
      default: "default.jpg",
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "Invalid user ID / Log in to create a product"],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

productSchema.pre("delete", async function (next) {
  await this.model("Feedback").deleteMany({ product: this._id });
  next();
});

productSchema.pre("save", function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

productSchema.virtual("feedbacks", {
  ref: "Feedback",
  localField: "_id",
  foreignField: "product",
  justOne: false,
});

module.exports = mongoose.model("Product", productSchema);
