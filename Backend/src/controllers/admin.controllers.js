import mongoose from "mongoose";
import Post from "../models/Post.model.js";
import User from "../models/User.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getAdminDashboard = asyncHandler(async (req, res) => {
  const totalUsers = await User.countDocuments();
  const totalPosts = await Post.countDocuments();
  const publishedPosts = await Post.countDocuments({ isPublished: true });
  const unpublishedPosts = await Post.countDocuments({ isPublished: false });

  return res.status(200).json(
    new ApiResponse(200, {
      totalUsers,
      totalPosts,
      publishedPosts,
      unpublishedPosts
    }, "Admin dashboard data fetched")
  );
});

const getAllUsersForAdmin = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  const users = await User.find({
    role: "user",
    _id: { $ne: req.user._id }
  })
    .select("-password -refreshToken")
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .sort({ createdAt: -1 });

  const totalUsers = await User.countDocuments();

  return res.status(200).json(
    new ApiResponse(200, { users, totalUsers }, "Users fetched successfully")
  );
});

const getAllPostsForAdmin = asyncHandler(async (req, res) => {
  const posts = await Post.find()
    .populate("owner", "username email")
    .sort({ createdAt: -1 });

  return res.status(200).json(
    new ApiResponse(200, posts, "All posts fetched for admin")
  );
});

const adminDeletePost = asyncHandler(async (req, res) => {
  const { postId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(postId)) {
    throw new ApiError(400, "Invalid postId");
  }

  const post = await Post.findByIdAndDelete(postId);

  if (!post) {
    throw new ApiError(404, "Post not found");
  }

  return res.status(200).json(
    new ApiResponse(200, {}, "Post deleted by admin")
  );
});

const toggleUserStatus = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new ApiError(400, "Invalid userId");
  }

  const user = await User.findOneAndUpdate(
    {_id : userId}, 
    // Values ​​are being flipped within the database itself
    [
      {
        $set: {
          isBlocked: { $not: "$isBlocked" }
        }
      }
    ],
    { new: true, updatePipeline: true }
  );

  if (!user) {
    throw new ApiError(404, "user not Block or unauthorized");
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      { isBlocked: user.isBlocked },
      "User status updated"
    )
  );
});

export {getAdminDashboard, getAllPostsForAdmin, getAllUsersForAdmin, adminDeletePost, toggleUserStatus}
