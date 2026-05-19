import { ApiError } from "./ApiError.js";

export const generateTokens = async (user) => {
    try {
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(500, "Token generation failed");
    }
} 

export const cookieOptions = {
    httpOnly: true,
    secure: true,         
    sameSite: "strict"
}
