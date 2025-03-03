import User from "../models/user.model.js";
import Message from '../models/message.model.js'
import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";

export const getUsersForSidebar = async (req, res) => {
    try {
        const loggedInUserId = req.user._id;
        const loggedInUser = await User.findById(loggedInUserId).populate('friends', '-password');
        const friendIds = loggedInUser.friends.map(friend => friend._id)

        const filteredUsers = await User.find({
            _id: { $nin: [loggedInUserId, ...friendIds] }, // $nin excludes IDs
        }).select('-password');

        res.status(200).json(filteredUsers)
    } catch (error) {
        console.error("Error in getUsersForSidebar controller: ", error.message);
        res.status(500).json({message: "Internal Server Error"})
    }
}

export const getFriendsForMessages = async (req, res) => {
    try {
        const loggedInUserId = req.user._id;

        // Find the logged-in user and populate the `friends` field directly
        const loggedInUser = await User.findById(loggedInUserId).populate({
            path: "friends",
            select: "fullName email profilePic", // Include the fields you want to populate
        });

        if (!loggedInUser) {
            return res.status(404).json({ message: "User not found" });
        }

        // Map over the populated friends array
        const friends = loggedInUser.friends.map((friend) => ({
            _id: friend._id,
            fullName: friend.fullName,
            email: friend.email,
            profilePic: friend.profilePic,
        }));

        res.status(200).json(friends);
    } catch (error) {
        console.error("Error in getFriendsForMessages controller:", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const getMessages = async (req, res) => {
    try {
       const { id:userToChatId } = req.params
       const myId = req.user._id

       const messages = await Message.find({
        $or: [
            {senderId: myId, receiverId: userToChatId},
            {senderId: userToChatId, receiverId: myId}
        ]
       })

       res.status(200).json(messages)
    } catch (error) {
        console.error("Error in getMessages controller: ", error.message);
        res.status(500).json({message: "Internal Server Error"})
    }
}

export const sendMessage = async (req, res) => {
    try {
        const {text, image} = req.body
        const {id: receiverId} = req.params
        const senderId = req.user._id;

        let imageUrl;
        if(image) {
            // upload base64 image to cloudinary
            const uploadResponse = await cloudinary.uploader.upload(image)
            imageUrl = uploadResponse.secure_url
        }

        const newMessage = new Message({
            senderId,
            receiverId,
            text,
            image: imageUrl
        });

        await newMessage.save();

        const receiverSocketId = getReceiverSocketId(receiverId);
        if(receiverSocketId) {
            io.to(receiverSocketId).emit("newMessage", newMessage)
        }

        res.status(201).json(newMessage)

    } catch (error) {
        console.error("Error in sendMessage controller: ", error.message);
        res.status(500).json({message: "Internal Server Error"})
    }
}