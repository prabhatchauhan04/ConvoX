import User from "../models/user.model.js";
import Message from "../models/message.model.js";

import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";

export const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id; 
    const filteredUsers = await User.find({ _id: { $ne: loggedInUserId } }).select("-password"); // selects user with _id not equal to our _id
    // because we dont want to see ourself in our contacts list 

    res.status(200).json(filteredUsers);
  } catch (error) {
    console.error("Error in getUsersForSidebar: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params; // Access the 'id' parameter from the URL
    const myId = req.user._id; // currently authenticated user (which is me)

    // find all messages where i m sender or i m receiver
    // "$or" is "OR operator" of mongodb / mongoose
    const messages = await Message.find({
      $or: [ 
        { senderId: myId, receiverId: userToChatId }, // i sent these messages
        { senderId: userToChatId, receiverId: myId }, // i received these messages
      ], 
    });

    res.status(200).json(messages);

} catch (error) {
    console.log("Error in getMessages controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id; // this is me

    let imageUrl;
    if (image) {
      // Upload base64 image to cloudinary
      const uploadResponse = await cloudinary.uploader.upload(image); // uploads image and gives a response
      imageUrl = uploadResponse.secure_url;
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl,
    });

    await newMessage.save(); // saving messages

    // socket io use
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    res.status(201).json(newMessage);

  } catch (error) {
    console.log("Error in sendMessage controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
