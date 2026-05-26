import mongoose from "mongoose";

const postViewSchema = new mongoose.Schema(
  {
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true
    },

    viewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    }
  },
  { timestamps: true }
);

// prevent duplicate views
postViewSchema.index(
  { post: 1, viewedBy: 1 },
  { unique: true }
);

const PostView = mongoose.model("PostView", postViewSchema);

export default PostView;