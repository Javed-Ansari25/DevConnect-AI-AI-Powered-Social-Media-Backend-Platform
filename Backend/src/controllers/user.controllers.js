import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../config/cloudinary.js";
import User from "../models/User.model.js";
import Follow from "../models/followers.model.js";

const getProfile = asyncHandler(async (req, res) => {
  const [user, followersCount, followingCount] = await Promise.all([
     User.findById(req.user?._id).select("-password -refreshToken"),
     Follow.countDocuments({ following: req.user?._id }),
     Follow.countDocuments({ follower: req.user?._id })
  ]);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return res.status(200).json(
    new ApiResponse(200, {user, followersCount, followingCount}, "Profile retrieved successfully")
  );
});

const addAvatar = asyncHandler(async (req, res) => {
  const avatarLocalPath = req.file?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);

  if (!avatar?.url) {
    throw new ApiError(500, "Avatar upload failed");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {$set: { avatar: avatar.url }},
    { new: true }
  );

  if (!user) {
    throw new ApiError(400, "Failed to add avatar");
  }

  return res.status(200).json(
    new ApiResponse(200, {avatar : avatar.url}, "Avatar added successfully")
  );
});

const addCoverImage = asyncHandler(async (req, res) => {
  const coverImageLocalPath = req.file?.path;

  if (!coverImageLocalPath) {
    throw new ApiError(400, "Cover image file is required");
  }

  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!coverImage?.url) {
    throw new ApiError(500, "Cover image upload failed");
  }   

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {$set: { coverImage: coverImage.url }},
    { new: true }
  );

  if (!user) {
    throw new ApiError(400, "Failed to add cover image");
  }

  return res.status(200).json(
    new ApiResponse(200, {coverImage : coverImage.url}, "Cover image added successfully")
  );
});

const addBio = asyncHandler(async (req, res) => {
  const {bio} = req.body;
  if (bio.trim() === "") {
    throw new ApiError(400, "Bio is required");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {$set: { bio }},
    { new: true }
  );

  if (!user) {
    throw new ApiError(400, "Failed to add bio");
  }

  return res.status(200).json(
    new ApiResponse(200, {bio}, "Bio added successfully")
  );
});

const updateProfile = asyncHandler(async (req, res) => {
  const {fullName, bio} = req.body;
  const updateData = {};

  if (fullName !== undefined) {
    if (fullName.trim() === "") {
      throw new ApiError(400, "Full name cannot be empty");
    }

    updateData.fullName = fullName;
  }

  if (bio !== undefined) {
    if (bio.trim() === "") {
      throw new ApiError(400, "Bio cannot be empty");
    }
    updateData.bio = bio;
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {$set: updateData},
    { new: true }
  );

  if (!user) {
    throw new ApiError(400, "Failed to update profile");
  }

  return res.status(200).json(
    new ApiResponse(200, {user}, "Profile updated successfully")
  );
});

const changePassword = asyncHandler(async (req, res) => {
  const {oldPassword, newPassword} = req.body;

  if (!oldPassword || !newPassword) {
    throw new ApiError(400, "Old password and new password are required");
  }

  const user = await User.findById(req.user?._id).select("+password");

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

  if (!isPasswordCorrect) {
    throw new ApiError(400, "Old password is incorrect");
  }

  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  return res.status(200).json(
    new ApiResponse(200, null, "Password changed successfully")
  );
});

const deleteProfile = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndDelete(req.user?._id);

  if (!user) {
    throw new ApiError(400, "Failed to delete profile");
  }

  return res.status(200).json(
    new ApiResponse(200, null, "Profile deleted successfully")
  );
});

export { addAvatar, addCoverImage, addBio, updateProfile, getProfile, deleteProfile, changePassword };
