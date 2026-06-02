import mongoose from "mongoose";
import Post from "../models/Post.model.js";
import User from "../models/User.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getAdminDashboard = asyncHandler(async (req, res) => {
  const [
    totalUsers,
    totalPosts,
    publishedPosts,
    unpublishedPosts
  ] = await Promise.all([
    User.countDocuments({ role: "user" }),
    Post.countDocuments(),
    Post.countDocuments({ isPublished: true }),
    Post.countDocuments({ isPublished: false })
  ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        totalUsers,
        totalPosts,
        publishedPosts,
        unpublishedPosts
      },
      "Admin dashboard data fetched successfully"
    )
  );
});

const getAllUsersForAdmin = asyncHandler(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 20;
  const search = req.query.search?.trim() || "";

  const query = {
    role: "user",
    _id: { $ne: req.user._id }
  }

  if (search) {
    query.$or = [
      { username: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } }
    ];
  }

  const [users, totalUsers] = await Promise.all([
    User.find(query)
      .select("-password -refreshToken")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),

    User.countDocuments(query)
  ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        users,
        totalUsers,
        currentPage: page,
        totalPages: Math.ceil(totalUsers / limit)
      },
      "Users fetched successfully"
    )
  );
});

const getAllPostsForAdmin = asyncHandler(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 20;
  const search = req.query.search?.trim() || "";

  const query = {};

  if (search) {
    query.title = {
      $regex: search,
      $options: "i"
    };
  }

  const [posts, totalPosts] = await Promise.all([
    Post.find(query)
      .populate("owner", "username email")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),

    Post.countDocuments(query)
  ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        posts,
        totalPosts,
        currentPage: page,
        totalPages: Math.ceil(totalPosts / limit)
      },
      "Posts fetched successfully"
    )
  );
});

const adminDeletePost = asyncHandler(async (req, res) => {
  const { postId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(postId)) {
    throw new ApiError(400, "Invalid post id");
  }

  const post = await Post.findByIdAndDelete(postId);

  if (!post) {
    throw new ApiError(404, "Post not found");
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      null,
      "Post deleted successfully by admin"
    )
  );
});

const toggleUserStatus = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new ApiError(400, "Invalid user id");
  }

  if (userId === req.user._id.toString()) {
    throw new ApiError(400, "You cannot block/unblock yourself");
  }

  const user = await User.findOneAndUpdate(
    { _id: userId },
    [
      {
        $set: {
          isBlocked: {
            $not: "$isBlocked"
          }
        }
      }
    ],
    { new: true }
  );

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        userId: user._id,
        isBlocked: user.isBlocked
      },
      `User ${user.isBlocked ? "blocked" : "unblocked"} successfully`
      )
  );
});

const getSingleUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new ApiError(400, "Invalid user id");
  }

  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return res.status(200).json(
    new ApiResponse(200, user, "User fetched successfully")
  );
});

const getSinglePost = asyncHandler(async (req, res) => {
  const { postId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(postId)) {
    throw new ApiError(400, "Invalid post id");
  }

  const post = await Post.findById(postId)
    .populate("owner", "username email");

  if (!post) {
    throw new ApiError(404, "Post not found");
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      post,
      "Post fetched successfully"
    )
  );
});


export {
  getAdminDashboard,
  getAllUsersForAdmin,
  getAllPostsForAdmin,
  getSinglePost,
  getSingleUser, 
  adminDeletePost,
  toggleUserStatus
};

