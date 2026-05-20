import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },

    description: {
      type: String,
      required: true
    },

    image: 
      {
        type: String,
        trim: true
      },

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    isPublished: {
      type: Boolean,
      default: true
    },

    views: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

const Post = mongoose.model("Post", postSchema);
export default Post;

