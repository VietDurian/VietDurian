import User from "@/model/userModel.js";
import Message from "@/model/messageModel.js";
import Conversation from "@/model/conversationModel.js";
import cloudinary from "../../node_modules/cloudinary/cloudinary.js";
import { getReceiverSocketId, io } from "@/lib/socket.js";

const getContacts = async (req, res) => {
  try {
    const myId = req.user._id;

    const conversations = await Conversation.find({
      participants: myId,
    }).populate("participants", "-password");

    // Return the other participant from each conversation
    const contacts = (
      await Promise.all(
        conversations.map(async (conv) => {
          const other = conv.participants.find(
            (p) => p._id.toString() !== myId.toString(),
          );

          if (other) return other;

          const lastPairMessage = await Message.findOne({
            conversationId: conv._id,
            $or: [{ senderId: myId }, { receiverId: myId }],
          })
            .sort({ createdAt: -1 })
            .select("senderId receiverId");

          if (!lastPairMessage) return null;

          const otherUserId =
            lastPairMessage.senderId.toString() === myId.toString()
              ? lastPairMessage.receiverId
              : lastPairMessage.senderId;

          if (!otherUserId || otherUserId.toString() === myId.toString()) {
            return null;
          }

          return User.findById(otherUserId).select("-password");
        }),
      )
    ).filter(Boolean);

    const uniqueContactsMap = new Map();
    contacts.forEach((contact) => {
      uniqueContactsMap.set(contact._id.toString(), contact);
    });

    res.status(200).json(Array.from(uniqueContactsMap.values()));
  } catch (error) {
    console.log("Error in getContacts controller: ", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    const filteredUsers = await User.find({
      _id: { $ne: loggedInUserId },
    }).select("-password");

    res.status(200).json(filteredUsers);
  } catch (error) {
    console.log("Error in getUsersForSidebar", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user._id;

    let conversation = await Conversation.findOne({
      participants: { $all: [myId, userToChatId] },
    });

    if (!conversation) {
      const latestPairMessage = await Message.findOne({
        $or: [
          { senderId: myId, receiverId: userToChatId },
          { senderId: userToChatId, receiverId: myId },
        ],
      })
        .sort({ createdAt: -1 })
        .select("conversationId");

      if (latestPairMessage) {
        conversation = await Conversation.findOne({
          _id: latestPairMessage.conversationId,
          participants: myId,
        });
      }
    }

    if (!conversation) {
      return res.status(200).json([]);
    }

    const messages = await Message.find({
      conversationId: conversation._id,
    }).sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (error) {
    console.log("Error in getMessages controller: ", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    let imageUrl;
    if (image) {
      // Upload base64 image to cloudinary
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    // Find existing conversation or create a new one
    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] },
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [senderId, receiverId],
      });
    }

    const newMessage = new Message({
      conversationId: conversation._id,
      senderId,
      receiverId,
      text,
      image: imageUrl,
    });

    await newMessage.save();

    // Update the lastMessage field on the conversation
    conversation.lastMessage = {
      text: text || "",
      senderId,
      createdAt: newMessage.createdAt,
    };
    await conversation.save();

    const receiverSocketId = getReceiverSocketId(receiverId);

    // If user is online, send the event in real time
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    res.status(201).json(newMessage);
  } catch (error) {
    console.log("Error in sendMessage controller: ", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const deleteConversation = async (req, res) => {
  try {
    const { id: userToDeleteConversationWith } = req.params;
    const myId = req.user._id;

    const conversation = await Conversation.findOne({
      participants: { $all: [myId, userToDeleteConversationWith] },
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found",
      });
    }

    const updatedConversation = await Conversation.findByIdAndUpdate(
      conversation._id,
      {
        $pull: { participants: myId },
      },
      { new: true },
    );

    if (updatedConversation && updatedConversation.participants.length === 0) {
      await Message.deleteMany({ conversationId: conversation._id });
      await Conversation.findByIdAndDelete(conversation._id);
    }

    return res.status(200).json({
      success: true,
      message: "Conversation removed for current user",
    });
  } catch (error) {
    console.log("Error in deleteConversation controller: ", error.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const messageController = {
  getContacts,
  getUsersForSidebar,
  getMessages,
  sendMessage,
  deleteConversation,
};
