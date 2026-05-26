import mongoose from "mongoose";

const likeSchema = new mongoose.Schema(
  {
    likedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true
    }
  },
  { timestamps: true }
);

// Prevent duplicate likes
likeSchema.index({ likedBy: 1, post: 1 }, { unique: true });

const Like = mongoose.model("Like", likeSchema);

export default Like;