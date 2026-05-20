import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../config/cloudinary.js";
import User from "../models/User.model.js";

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

export { addAvatar, addCoverImage, addBio };
