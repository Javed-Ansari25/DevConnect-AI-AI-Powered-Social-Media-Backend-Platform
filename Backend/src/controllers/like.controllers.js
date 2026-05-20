import mongoose from "mongoose";
import Like from "../models/Like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleLike = asyncHandler(async (req, res) => {
    const {postId} = req.params;
    if (!mongoose.Types.ObjectId.isValid(postId)) {
        throw new ApiError(400, "Invalid postId");
    }

    const existingLike = await Like.findOneAndDelete({ post: postId, likedBy: req.user._id });

    if (existingLike) {
        return res.status(200).json(
            new ApiResponse(200, {liked: false}, "Post unliked successfully")
        );
    }

    const newLike = await Like.create({
        post: postId,
        likedBy: req.user._id
    });

    return res.status(200).json(
        new ApiResponse(200, {liked: true}, "Post liked successfully")
    );
});

export { toggleLike };
