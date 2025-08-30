const chatModel = require("../models/chat.model");
const messageModel = require("../models/message.model")

async function createChat(req, res) {
  try {
    const { title } = req.body;

    // Ensure the user object exists
    const user = req.user;
    if (!user || !user._id) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    // Create the chat
    const chat = await chatModel.create({
      user: user._id,
      title,
    });

    // Respond with success
    res.status(201).json({
      message: "Chat created successfully",
      chat: {
        _id: chat._id,
        title: chat.title,
        lastActivity: chat.lastActivity,
        user: chat.user,
      },
    });
  } catch (error) {
    console.error("Error creating chat:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

async function getChats(req, res) {
    const user = req.user;

    const chats = await chatModel.find({ user: user._id });

    res.status(200).json({
        message: "Chats retrieved successfully",
        chats: chats.map(chat => ({
            _id: chat._id,
            title: chat.title,
            lastActivity: chat.lastActivity,
            user: chat.user
        }))
    });
}

async function getMessages(req, res) {

    const chatId = req.params.id;

    const messages = await messageModel.find({ chat: chatId }).sort({ createdAt: 1 });

    res.status(200).json({
        message: "Messages retrieved successfully",
        messages: messages
    })

}

module.exports = {
  createChat,
  getChats,
  getMessages
};