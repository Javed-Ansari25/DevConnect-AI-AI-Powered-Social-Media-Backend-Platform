import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/User.model.js';
import OTP from '../models/Otp.model.js';

import { ApiError } from '../utils/ApiError.js'; 
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { generateTokens, cookieOptions } from '../utils/token.js';
import { sendEmailOTP } from '../services/email.service.js';
import { generateOTP } from '../utils/generateOtp.js';

const register = asyncHandler(async (req, res) => {
  const { fullName, username, email, password } = req.body;

  if (![fullName, username, email, password].every(Boolean)) {
    throw new ApiError(400, 'All fields are required');
  }

  const existingUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existingUser) {
    throw new ApiError(409, 'User already exists, please login');
  }

  const user = await User.create({
    fullName,
    username,
    email,
    password,
    isVerified: false,
  });

  // delete old otp if exists
  await OTP.deleteMany({ user: user._id });

  // generate otp
  const otp = generateOTP();

  // save otp
  await OTP.create({
    user: user._id,
    otp,
    expiresAt: new Date(Date.now() + 60 * 1000), // valid for 1 minute
  });

  // send email
  await sendEmailOTP(email, otp);

  return res.status(201).json(
    new ApiResponse(
      201,
      {
        _id: user._id,
        email: user.email,
      },
      'OTP sent to email. Please verify your account',
    ),
  );
});

const verifyOTP = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    throw new ApiError(400, 'Email and OTP are required');
  }

  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  if (user.isVerified) {
    throw new ApiError(400, 'User already verified');
  }

  const otpDoc = await OTP.findOne({ user: user._id });

  if (!otpDoc) {
    throw new ApiError(400, 'OTP expired');
  }

  // check expiry
  if (otpDoc.expiresAt < new Date()) {
    await OTP.deleteOne({ _id: otpDoc._id });

    throw new ApiError(400, 'OTP expired');
  }

  // check attempts
  if (otpDoc.Attempts >= 5) {
    await OTP.deleteOne({ _id: otpDoc._id });

    throw new ApiError(429, 'Too many attempts, please request a new OTP');
  }

  // validate otp
  const isOtpCorrect = await otpDoc.isOtpValid(otp);

  if (!isOtpCorrect) {
    otpDoc.Attempts += 1;
    await otpDoc.save();

    throw new ApiError(400, 'Invalid OTP');
  }

  user.isVerified = true;
  const { accessToken, refreshToken } = await generateTokens(user);
  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });
  await OTP.deleteOne({ _id: otpDoc._id });

  return res
    .status(200)
    .cookie('accessToken', accessToken, cookieOptions)
    .cookie('refreshToken', refreshToken, cookieOptions)
    .json(
      new ApiResponse(
        200,
        {
          _id: user._id,
          username: user.username,
          email: user.email,
          accessToken,
        },
        'Email verified and login successful',
      ),
    );
});

const resendOTP = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    throw new ApiError(400, 'Email is required');
  }

  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  if (user.isVerified) {
    throw new ApiError(400, 'User already verified');
  }

  // delete previous otp
  await OTP.deleteMany({ user: user._id });

  // generate new otp
  const otp = generateOTP();

  // save otp
  await OTP.create({
    user: user._id,
    otp,
    expiresAt: new Date(Date.now() + 60 * 1000), // valid for 1 minute
  });

  // send email
  await sendEmailOTP(email, otp);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, 'New OTP sent successfully'));
});

const login = asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    throw new ApiError(404, 'All field are required');
  }

  const user = await User.findOne({
    $or: [{ username }, { email: username }],
  }).select('+password +refreshToken');

  if (!user) {
    throw new ApiError(401, 'Invalid credentials');
  }

  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(401, 'Invalid credentials');
  }

  if (!user.isVerified) {
    // delete old otp
    await OTP.deleteMany({ user: user._id });

    // generate new otp
    const otp = generateOTP();

    // save otp
    await OTP.create({
      user: user._id,
      otp,
      expiresAt: new Date(Date.now() + 60 * 1000),
    });

    // send otp
    await sendEmailOTP(user.email, otp);

    throw new ApiError(401, 'Email not verified. New OTP sent to your email');
  }

  if (user.isBlocked) {
    throw new ApiError(403, 'Your account is blocked');
  }

  const { accessToken, refreshToken } = await generateTokens(user);

  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .cookie('accessToken', accessToken, cookieOptions)
    .cookie('refreshToken', refreshToken, cookieOptions)
    .json(
      new ApiResponse(
        200,
        {
          _id: user._id,
          username: user.username,
          email: user.email,
        },
        'User logged in successfully',
      ),
    );
});

const logout = asyncHandler(async (req, res) => {
  await User.updateOne({ _id: req?.user._id }, { $unset: { refreshToken: 1 } });

  return res
    .status(200)
    .clearCookie('accessToken', cookieOptions)
    .clearCookie('refreshToken', cookieOptions)
    .json(new ApiResponse(200, {}, 'User logged out successfully'));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select(
    '-password -refreshToken',
  );
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  return res
    .status(200)
    .json(new ApiResponse(200, user, 'Current user fetched successfully'));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies?.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, 'Refresh token is required');
  }

  let decoded;
  try {
    decoded = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET,
    );
  } catch (error) {
    throw new ApiError(401, 'Invalid refresh token');
  }

  const user = await User.findById(decoded._id).select('+refreshToken');
  if (!user) {
    throw new ApiError(401, 'Invalid refresh token');
  }

  if (incomingRefreshToken !== user.refreshToken) {
    throw new ApiError(401, 'Refresh token expired or reused');
  }

  const { accessToken, refreshToken } = await generateTokens(user);
  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .cookie('accessToken', accessToken, cookieOptions)
    .cookie('refreshToken', refreshToken, cookieOptions)
    .json(
      new ApiResponse(
        200,
        { accessToken },
        'Access token refreshed successfully',
      ),
    );
});

export {
  register,
  login,
  logout,
  getCurrentUser,
  refreshAccessToken,
  resendOTP,
  verifyOTP,
};
