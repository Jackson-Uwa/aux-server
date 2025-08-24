const mongoose = require("mongoose");
const slugify = require("slugify");

const postSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Add a title for your post"],
    },
    slug: String,
    description: {
      type: String,
      required: [true, "Describe your post"],
    },
    thumbnail: {
      type: String,
      default: "default.jpg",
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "Invalid user ID / Log in to create a post"],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

postSchema.pre("delete", async function (next) {
  await this.model("Comments").deleteMany({ post: this._id });
  next();
});

postSchema.pre("save", function (next) {
  this.slug = slugify(this.title, { lower: true });
  next();
});

postSchema.virtual("comments", {
  ref: "Comment",
  localField: "_id",
  foreignField: "post",
  justOne: false,
});

module.exports = mongoose.model("Post", postSchema);
