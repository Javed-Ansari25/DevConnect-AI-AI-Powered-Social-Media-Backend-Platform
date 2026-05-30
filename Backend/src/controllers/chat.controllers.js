import { Chat } from "../models/Chat.model.js";
import { getAIResponse } from "../services/Groqai.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";   

const chatWithAI = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { message } = req.body;

  if (!message?.trim()) {
    throw new ApiError(400, "Message is required");
  }

  let chats = await Chat.findOne({
    user: userId,
  });

  const oldMessages = chats?.messages || [];
  const recentMessages = oldMessages.slice(-10);

  // add current user message
  recentMessages.push({
    role: "user",
    content: message,
  });


  // generate AI response
  const aiReply = await getAIResponse(recentMessages);

  // create messages
  const userMessage = {
    role: "user",
    content: message,
  };

  const assistantMessage = {
    role: "assistant",
    content: aiReply,
  };


  // save in db
  if (!chats) {

    chats = await Chat.create({
      user: userId,
      messages: [userMessage, assistantMessage],
    });

  } else {

    chats.messages.push(
      userMessage,
      assistantMessage
    );

    await chats.save();
  }



  return res.status(200).json(
    new ApiResponse(
      200,
      {
        reply: aiReply,
      },
      "Reply generated successfully"
    )
  );
});

const getChatHistory = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const chat = await Chat.findOne({ user: userId });

    if (!chat) {
        throw new ApiError(404, "No chat history found");
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            chat.messages,
            "Chat history fetched successfully"
        )
    );
});

const clearChatHistory = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const chat = await Chat.findOneAndUpdate(
        { user: userId },
        {
            $set: {
                messages: [],
            },
        },
        { new: true }
    );

    if (!chat) {
        throw new ApiError(404, "No chat history found");
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            {},
            "Chat history cleared successfully"
        )
    );
});

export {
    chatWithAI,
    getChatHistory,
    clearChatHistory,
}

