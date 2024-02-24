import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { z } from "zod";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloundinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { deleteLocalFiles } from "../utils/deleteLocalFiles.js";

const UserRegistrationSchema = z.object({
  fullName: z.string().min(1, { message: "Full name is required" }),
  email: z.string().email({ message: "Invalid email address" }),
  username: z.string().min(1, { message: "Username is required" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters long" }),
});
const registerUser = asyncHandler(async (req, res, next) => {
  try {
    const validatedData = UserRegistrationSchema.parse(req.body);
    const { fullName, email, username, password } = req.body;

    const existedUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existedUser) {
      const filesToDelete = [
        req.files?.avatar?.[0]?.path,
        req.files?.coverImage?.[0]?.path,
      ].filter(Boolean); // Remove undefined paths
      deleteLocalFiles(filesToDelete);
      throw new ApiError(409, "User with email or username already exist");
    }

    if (!req.files?.avatar || req.files.avatar.length === 0) {
      throw new ApiError(400, "Avatar file is required");
    }
    const avatarLocalPath = req.files.avatar[0].path;

    // coverImage is optional
    const coverImageLocalPath = req.files?.coverImage?.[0]?.path || "";
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    let coverImage = {};
    if (coverImageLocalPath) {
      coverImage = await uploadOnCloudinary(coverImageLocalPath);
    }
    const user = await User.create({
      fullName,
      email,
      password,
      username: username.toLowerCase(),
      avatar: avatar?.url,
      coverImage: coverImage?.url || "",
    });

    const createdUser = await User.findById(user._id).select(
      "-password -refreshToken"
    );
    if (!createdUser) {
      throw new ApiError(500, "Something went wrong while creating error");
    }
    const apiResponse = new ApiResponse(
      201,
      createdUser,
      "User registered successfully"
    );

    return res.status(201).json(apiResponse);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const filesToDelete = [
        req.files?.avatar?.[0]?.path,
        req.files?.coverImage?.[0]?.path,
      ].filter(Boolean); // Remove undefined paths
      deleteLocalFiles(filesToDelete);
      // Extract validation errors
      const validationErrors = error.errors.map((err) => ({
        field: err.path[0], // Field name
        message: err.message, // Error message
      }));

      throw new ApiError(400, "Validation error", validationErrors);
    }

    next(error);
  }
});

export { registerUser };
