import mongoose from "mongoose";
import Post from "../models/Post.model.js";
import Like from "../models/Like.model.js";
import PostView from "../models/Views.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../config/cloudinary.js";

const createPost = asyncHandler(async (req, res) => {
    const {title, description} = req.body;

    if (!title || !description) {
        throw new ApiError(400, "All fields are required");
    }

    const imageLocalPath = req.file?.path;

    let imageUrl = "";
    if (imageLocalPath) {
        const image = await uploadOnCloudinary(imageLocalPath);
        imageUrl = image?.url || "";
    }

    const post = await Post.create({
        title,
        description,
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
    const { title, description } = req.body;

    if (!mongoose.Types.ObjectId.isValid(postId)) {
        throw new ApiError(400, "Invalid postId");
    }

    if (title != null && description != null && (title.trim() === "" || description.trim() === "")) {
        throw new ApiError(400, "All fields are required");
    }

    const updatePost = await Post.findByIdAndUpdate(
        {_id : postId, owner : req?.user._id},
        {
          $set : {title, description}
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
  const { userId } = req.params;

  const { page = 1, limit = 10 } = req.query;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new ApiError(400, "Invalid user id");
  }

  const [posts, totalPosts] = await Promise.all([

    Post.find({
      owner: userId,
      isPublished: true
    })
      .populate("owner", "username avatar")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .lean(),

    Post.countDocuments({
      owner: userId,
      isPublished: true
    })
  ]);

  const postsWithLikes = await Promise.all(
    posts.map(async (post) => {

      const [likesCount, liked] = await Promise.all([

        Like.countDocuments({
          post: post._id
        }),

        req.user?._id
          ? Like.findOne({
              post: post._id,
              likedBy: req.user._id
            })
          : null
      ]);

      return {
        ...post,
        likesCount,
        isLiked: !!liked
      };
    })
  );

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        totalPosts,
        posts: postsWithLikes
      },
      "User posts fetched successfully"
    )
  );
});


const getPostById = asyncHandler(async (req, res) => {
  const { postId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(postId)) {
    throw new ApiError(400, "Invalid post id");
  }

  const post = await Post.findOne({
    _id: postId,
    isPublished: true
  }).populate("owner", "username avatar");

  if (!post) {
    throw new ApiError(404, "Post not found");
  }

  // check already viewed or not
  const alreadyViewed = await PostView.findOne({
    post: postId,
    viewedBy: req.user._id
  });

  // if not viewed before
  if (!alreadyViewed) {

    await Promise.all([

      // save view record
      PostView.create({
        post: postId,
        viewedBy: req.user._id
      }),

      // increment view
      Post.findByIdAndUpdate(
        postId,
        {
          $inc: { views: 1 }
        }
      )
    ]);
  }

  // parallel queries
  const [
    likesCount,
    likedUsers,
    liked
  ] = await Promise.all([

    Like.countDocuments({
      post: postId
    }),

    Like.find({
      post: postId
    }).populate("likedBy", "username avatar"),

    Like.findOne({
      post: postId,
      likedBy: req.user._id
    })
  ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        post: {
          ...post.toObject(),
          views: alreadyViewed
            ? post.views
            : post.views + 1
        },

        likesCount,
        likedUsers,
        isLiked: !!liked
      },
      "Post fetched successfully"
    )
  );
});

const getAllPosts = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search = "" } = req.query;

  const query = {
    title: { $regex: search, $options: "i" }
  };

  if (req.user?.role !== "admin") {
    query.isPublished = true;
  }

  // parallel execution
  const [posts, totalPosts] = await Promise.all([

    Post.find(query)
      .populate({
        path: "owner",
        match:
          req.user?.role === "admin"
            ? {}
            : { isBlocked: false },
        select: "username avatar"
      })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .lean(),

    Post.countDocuments(query)
  ]);

  // add likes data
  const postsWithLikes = await Promise.all(

    posts.map(async (post) => {

      const [likesCount, liked] = await Promise.all([

        Like.countDocuments({
          post: post._id
        }),

        req.user?._id
          ? Like.findOne({
              post: post._id,
              likedBy: req.user._id
            })
          : null
      ]);

      return {
        ...post,
        likesCount,
        isLiked: !!liked
      };
    })
  );

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        posts: postsWithLikes,
        totalPosts
      },
      "Posts fetched successfully"
    )
  );
});

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
