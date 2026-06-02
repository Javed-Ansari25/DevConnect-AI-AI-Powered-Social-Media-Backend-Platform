import bcrypt from 'bcryptjs';
import redisClient from '../config/redis.js';
import { generateOTP } from '../utils/generateOTP.js';

const OTP_EXPIRY = 300; // 5 min
const MAX_ATTEMPTS = 5;

export const generateAndStoreOTP = async (email) => {
  const otp = generateOTP();

  const hashedOtp = await bcrypt.hash(otp.toString(), 10);
  await redisClient.set(`otp:${email}`, hashedOtp, 'EX', OTP_EXPIRY);
  await redisClient.set(`otp_attempts:${email}`, '0', 'EX', OTP_EXPIRY);

  return otp;
};

export const verifyStoredOTP = async (email, enteredOtp) => {
  const storedOtp = await redisClient.get(`otp:${email}`);

  if (!storedOtp) {
    return {
      success: false,
      message: 'OTP expired',
    };
  }

  const attempts = Number(
    (await redisClient.get(`otp_attempts:${email}`)) || 0,
  );

  if (attempts >= MAX_ATTEMPTS) {
    await clearOTP(email);

    return {
      success: false,
      message: 'Too many invalid attempts. Please request a new OTP.',
    };
  }

  const isValid = await bcrypt.compare(enteredOtp.toString(), storedOtp);

  if (!isValid) {
    await redisClient.incr(`otp_attempts:${email}`);

    return {
      success: false,
      message: 'Invalid OTP',
    };
  }

  return {
    success: true,
  };
};

export const clearOTP = async (email) => {
  await redisClient.del(`otp:${email}`);
  await redisClient.del(`otp_attempts:${email}`);
};
