const mongoose = require("mongoose");
const slugify = require("slugify");

const productSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Enter product name"],
    },
    slug: String,
    price: { type: Number },
    description: {
      type: String,
      required: [true, "Add a description"],
    },
    thumbnail: {
      type: String,
      default: "default.jpg",
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

productSchema.pre("remove", async function (next) {
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
