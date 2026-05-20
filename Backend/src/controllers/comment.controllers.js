import mongoose from "mongoose";
import Comment from "../models/Comment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createComment = asyncHandler(async (req, res) => {
    const {postId} = req.params;
    const {text} = req.body;

    if (text.trim() === "") {
        throw new ApiError(400, "Comment text is required");
    }

    const comment = await Comment.create({
        text,
        owner: req.user._id,
        post: postId
    });

    if (!comment) {
        throw new ApiError(400, "Failed to create comment");
    }

    return res.status(201).json(new ApiResponse(201, comment, "Comment created successfully"));
});

const updateComment = asyncHandler(async (req, res) => {
    const {commentId} = req.params;
    const {text} = req.body;
    if (text.trim() === "") {
        throw new ApiError(400, "Comment text is required");
    }
    if (!mongoose.Types.ObjectId.isValid(commentId)) {
        throw new ApiError(400, "Invalid commentId");
    }   

    const comment = await Comment.findOneAndUpdate(
        {_id : commentId, owner : req.user._id},
        {
            $set : {text}
        },
        {new : true}
    );

    if (!comment) {
        throw new ApiError(401, "Unauthorized or comment not found");
    }

    return res.status(200).json(
        new ApiResponse(200, comment, "Comment updated successfully")
    );
});

const deleteComment = asyncHandler(async (req, res) => {
    const {commentId} = req.params;
    if (!mongoose.Types.ObjectId.isValid(commentId)) {
        throw new ApiError(400, "Invalid commentId");
    }

    const comment = await Comment.findOneAndDelete({_id : commentId, owner : req.user._id});

    if (!comment) {
        throw new ApiError(401, "Unauthorized or comment not found");
    }

    return res.status(200).json(
        new ApiResponse(200, null, "Comment deleted successfully")
    );
});

const getCommentsByPostId = asyncHandler(async (req, res) => {
    const {postId, page = 1, limit = 10} = req.params;
    if (!mongoose.Types.ObjectId.isValid(postId)) {
        throw new ApiError(400, "Invalid postId");
    }

    const comments = await Comment.find({post: postId})
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .sort({createdAt: -1})
        .populate("owner", "username avatar");
    return res.status(200).json(
        new ApiResponse(200, comments, "Comments fetched successfully")
    );
});

export { createComment, deleteComment, getCommentsByPostId, updateComment };
