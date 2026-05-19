import mongoose from "mongoose";
import Post from "../models/Post.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const createPost = asyncHandler(async (req, res) => {
    const {title, content} = req.body;

    if (!title || !content) {
        throw new ApiError(400, "All fields are required");
    }

    const imageLocalPath = req.file?.path;

    let imageUrl = "";
    if (imageLocalPath) {
        const image = await uploadOnCloudinary(imageLocalPath, "image");
        imageUrl = image?.url || "";
    }

    const post = await Post.create({
        title,
        content,
        image : imageUrl,
        owner: req.user._id
    })

    if (!post) {
        throw new ApiError(400, "Post crated failed")
    }

    return res.status(201).json(
        new ApiResponse(201, post, "Post created successfully")
    )
})

const updatePost = asyncHandler(async (req, res) => {
    const { postId } = req.params;
    const { title, content } = req.body;

    if (!mongoose.Types.ObjectId.isValid(postId)) {
        throw new ApiError(400, "Invalid postId");
    }

    if (!title || !content) {
        throw new ApiError(400, "All fields are required");
    }

    const updatePost = await Post.findByIdAndUpdate(
        {_id : postId, owner : req?.user._id},
        {
            $set : {title, content}
        },
        {new : true}
    )

    if (!updatePost) {
        throw new ApiError(401, "Unauthorized or update failed");
    }

    return res.status(200).json(
        new ApiResponse(200, {post : updatePost}, "Post updated successfully")
    );
});

const deletePost = asyncHandler(async (req, res) => {
    const { postId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(postId)) {
        throw new ApiError(400, "Invalid postId");
    }

    const filter = req.user.role === "admin" ? {_id : postId} : {_id: postId, owner: req?.user._id};
    const deletePost = await Post.findOneAndDelete(filter);

    if (!deletePost) {
        throw new ApiError(404, "Post not found");
    }

    return res.status(200).json(
        new ApiResponse(200, {}, "Post deleted successfully")
    );
});

const getUserPosts = asyncHandler(async (req, res) => {
  const {userId} = req.params;

  if (!userId) {
    throw new ApiError(400, "User id is required");
  }

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new ApiError(400, "Invalid user id");
  }

  const posts = await Post.find({
    owner: userId,
    isPublished: true 
  })
    .sort({ createdAt: -1 })
    .populate("owner", "username avatar");

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        totalPosts: posts.length,
        posts
      },
      "User posts fetched successfully"
    )
  );
});

const getPostById = asyncHandler(async (req, res) => {
  const { postId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(postId)) {
        throw new ApiError(400, "Invalid postId");
    }

  const post = await Post.findOne({
    _id: postId,
    isPublished: true
  }).populate("owner", "username email avatar");

  if (!post) {
    throw new ApiError(404, "Post not found or unpublished");
  }

  return res.status(200).json(
    new ApiResponse(200, post, "Post fetched successfully")
  );
});

const getAllPosts = asyncHandler(async (req, res) => {
    const {page = 1, limit = 10, search = ""} = req.query;

    const query = {
        title: { $regex: search, $options: "i" }
    };

    if (req.user?.role !== "admin") {
        query.isPublished = true;
    }

    const posts = await Post.find(query)
    .populate({
      path: "owner",
      match: req.user?.role === "admin" ? {} : { isBlocked: false },
      select: "username avatar isBlocked"
    })
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .sort({ createdAt: -1 });

    if (!posts) {
        throw new ApiError(404, "posts not found");
    }

    const totalPosts = await Post.countDocuments(query);

    return res.status(200).json(
        new ApiResponse(200, {posts, totalPosts}, "Post fetch successfully")
    )
})

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { postId  } = req.params;

  if (!mongoose.Types.ObjectId.isValid(postId)) {
    throw new ApiError(400, "Invalid postId");
  }

  const filter = req.user.role === "admin" ? {_id : postId} : {_id: postId, owner: req?.user._id};
  const post = await Post.findOneAndUpdate(
    filter,   
    // Values ​​are being flipped within the database itself
    [
      {
        $set: {
          isPublished: { $not: "$isPublished" }
        }
      }
    ],
    { new: true, updatePipeline: true }
  );

  if (!post) {
    throw new ApiError(404, "post not found or unauthorized");
  }

  return res.status(200).json(
    new ApiResponse(200, post, "Publish status toggled successfully")
  );
});

export {createPost, updatePost, deletePost, getAllPosts, getPostById, togglePublishStatus, getUserPosts}
