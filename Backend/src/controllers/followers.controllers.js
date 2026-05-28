import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import Follow from "../models/followers.model.js";

const followUser = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new ApiError(400, "Invalid user ID");
    }

    if (userId === req.user?._id.toString()) {
        throw new ApiError(400, "You cannot follow yourself");
    }

    const alreadyFollowing = await Follow.findOne({
        follower: req.user?._id,
        following: userId
    });

    if (alreadyFollowing) {
        throw new ApiError(400, "You are already following this user");
    }

    const follower = await Follow.create({
        follower: req.user?._id,
        following: userId
    });

    return res.status(200).json(
        new ApiResponse(200, follower, "User followed successfully")
    );
});

const unfollowUser = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new ApiError(400, "Invalid user ID");
    }

    const alreadyFollowing = await Follow   .findOne({
        follower: req.user?._id,
        following: userId
    });

    if (!alreadyFollowing) {
        throw new ApiError(400, "You are not following this user");
    }

    await Follow.findOneAndDelete({
        follower: req.user?._id,
        following: userId
    });

    return res.status(200).json(
        new ApiResponse(200, null, "User unfollowed successfully")
    );
});

const getFollowers = asyncHandler(async (req, res) => {

    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new ApiError(400, "Invalid user ID");
    }

    const skip = (page - 1) * limit;

    const [followersCount, followers] = await Promise.all([

        Follow.countDocuments({
            following: userId
        }),

        Follow.find({
            following: userId
        })
        .populate("follower", "username fullName avatar")
        .skip(skip)
        .limit(Number(limit))
        .sort({ createdAt: -1 })

    ]);

    const totalPages = Math.ceil(followersCount / limit);

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                followersCount,
                totalPages,
                currentPage: Number(page),
                limit: Number(limit),
                followers
            },
            "Followers retrieved successfully"
        )
    );
});

const getFollowing = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new ApiError(400, "Invalid user ID");
    }

    const skip = (page - 1) * limit;

    const [followingCount, following] = await Promise.all([

        Follow.countDocuments({
            follower: userId
        }),

        Follow.find({
            follower: userId
        })
        .populate("following", "username fullName avatar")
        .skip(skip)
        .limit(Number(limit))
        .sort({ createdAt: -1 })

    ]);

    const totalPages = Math.ceil(followingCount / limit);

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                followingCount,
                totalPages,
                currentPage: Number(page),
                limit: Number(limit),
                following
            },
            "Following retrieved successfully"
        )
    );
});

export { followUser, unfollowUser, getFollowers, getFollowing };
