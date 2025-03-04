import { generateToken } from '../lib/utils.js'
import User from '../models/user.model.js'
import Message from '../models/message.model.js'
import bcrypt from 'bcryptjs'
import cloudinary from '../lib/cloudinary.js'
import { getReceiverSocketId, io } from '../lib/socket.js'

export const signup = async(req, res) => {
    const {fullName, email, password} = req.body
    try {
        if(!fullName || !email || !password) {
            return res.status(400).json({message: "All fields are required"})

        }

        // check password if it's less than 6 characters
        if(password.length < 6) {
            return res.status(400).json({message: "Password must be at least 6 characters"})
        }

        // find user
        const user = await User.findOne({email})

        // return if the email is already exists
        if(user) return res.status(400).json({message: "Email already exists"})

        // hashed the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt)

        // create user
        const newUser = new User({
            fullName,
            email,
            password: hashedPassword
        })

        if(newUser) {
            // generate jwt token
            generateToken(newUser._id, res);
            await newUser.save()

            res.status(201).json({
                _id: newUser._id,
                fullName: newUser.fullName,
                email: newUser.email,
                profilePic: newUser.profilePic
            })

        }else{
            return res.status(400).json({message: "Invalid user data"})  
        }

    } catch (error) {
        console.log("Error in signup controller", error.message);
        res.status(500).json({message: "Internal Server Error"})  
    }
}

export const login = async(req, res) => {
   const {email, password} = req.body
   try {
        const user = await User.findOne({email})

        if(!user) {
            return res.status(400).json({message: "Invalid credentials"})
        }
        const isPasswordCorrect = await bcrypt.compare(password, user.password)
        if(!isPasswordCorrect) {
            return res.status(400).json({message: "Invalid credentials"})
        }
        generateToken(user._id, res)
        res.status(200).json({
            _id: user._id,
            fullName: user.fullName,
            email: user.email,
            profilePic: user.profilePic
        })
   } catch (error) {
        console.log("Error in login controler", error.message);
        res.status(500).json({message: "Internal Server Error"})
   }
}

export const logout = (req, res) => {
    try {
        res.cookie("jwt_token", "", {maxAge:0})
        res.status(200).json({message: "Logged out successfully"})

    } catch (error) {
        console.log("Error in logout controler", error.message);
        res.status(500).json({message: "Internal Server Error"})
    }
}

export const updateProfile = async(req, res) => {
    try {
        const {profilePic} = req.body
        const userId = req.user._id

        if(!profilePic) {
            return res.status(400).json({message: "Profile picture is required"})
        }
        const uploadResponse =  await cloudinary.uploader.upload(profilePic, {
            resource_type: "image",
            allowed_formats: ["jpg", "png", "jpeg"],
            transformation: [{ quality: "auto" }], // Auto-compress
            chunk_size: 6000000, // Chunk size for large files (6MB)
            max_bytes: 5000000 // Limit file size (5MB)
        })
        const updatedUser = await User.findByIdAndUpdate(userId, {profilePic: uploadResponse.secure_url}, {new: true});

        res.status(200).json(updatedUser)
    } catch (error) {
        console.log("Error in update profile", error);
        if (error.http_code === 400 && error.message.includes("too Large")) {
            return res.status(413).json({ message: "File size exceeds the limit. Please upload a smaller file." });
        }
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export const checkAuth = async(req, res) => {
    try {
        res.status(200).json(req.user);
    } catch (error) {
        console.log("Error in checkAuth controller:", error.message);
        res.status(500).json({message: "Internal Server Error"});
    }
}

export const addFriend = async (req, res) => {
  const { _id: userId } = req.user; // Logged-in user's ID (sender)
  const { friendId } = req.params; // Recipient's ID

  try {
    if (userId.toString() === friendId) {
      return res.status(400).json({ message: "You cannot add yourself as a friend" });
    }

    const user = await User.findById(userId); // Sender
    const friend = await User.findById(friendId); // Recipient

    if (!user || !friend) {
      return res.status(404).json({ message: "User or friend not found" });
    }

    // Check if a friend request already exists
    const existingRequest = friend.friendRequests.find(
      (request) => request.senderId.toString() === userId
    );

    if (existingRequest) {
      return res.status(400).json({ message: "Friend request already sent" });
    }

    // Add the friend request to the recipient's friendRequests array
    friend.friendRequests.push({
      senderId: userId,
      status: "pending",
    });
    await friend.save();

    // Add the sent request to the sender's sentRequests array
    user.sentRequests.push({
      receiverId: friendId,
      status: "pending",
    });
    await user.save();

    // Notify the recipient via socket
    const recipientSocketId = getReceiverSocketId(friendId);
    if (recipientSocketId) {
      io.to(recipientSocketId).emit("friendRequest", {
        senderId: userId,
        senderName: user.fullName,
        senderProfilePic: user.profilePic,
      });
    }

    res.status(200).json({ message: "Friend request sent successfully" });
  } catch (error) {
    console.log("Error in addFriend controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const acceptFriendRequest = async (req, res) => {
  const { _id: userId } = req.user; // Recipient's ID
  const { senderId } = req.params; // Sender's ID

  try {
    const recipient = await User.findById(userId); // Recipient
    const sender = await User.findById(senderId); // Sender

    if (!recipient || !sender) {
      return res.status(404).json({ message: "User or sender not found" });
    }

    // Find the friend request in the recipient's friendRequests array
    const friendRequest = recipient.friendRequests.find(
      (request) =>
        request.senderId.toString() === senderId && request.status === "pending"
    );

    if (!friendRequest) {
      return res.status(400).json({ message: "Friend request not found or already accepted" });
    }

    // Use atomic operations to update the database
    await User.updateOne(
      { _id: userId }, // Recipient's ID
      {
        $pull: { friendRequests: { senderId: senderId } }, // Remove the friend request
        $addToSet: { friends: senderId }, // Add the sender to the recipient's friends list
      }
    );

    await User.updateOne(
      { _id: senderId }, // Sender's ID
      {
        $pull: { sentRequests: { receiverId: userId } }, // Remove the sent request
        $addToSet: { friends: userId }, // Add the recipient to the sender's friends list
      }
    );

    // Notify the sender that the request was accepted
    const senderSocketId = getReceiverSocketId(senderId);
    if (senderSocketId) {
      console.log("Emitting friendRequestAccepted to sender:", senderSocketId);
      io.to(senderSocketId).emit("friendRequestAccepted", {
        recipientId: userId,
        recipientName: recipient.fullName,
        recipientProfilePic: recipient.profilePic,
      });
    } else {
      console.log("Sender is not connected to the socket.");
    }

    // Return a success response
    res.status(200).json({
      message: "Friend request accepted",
    });

  } catch (error) {
    console.log("Error accepting friend request:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const cancelFriendRequest = async (req, res) => {
  const { _id: userId } = req.user; // Current user's ID
  const { friendId } = req.params; // Friend's ID

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Remove the friend request from the recipient's friendRequests array
    const recipient = await User.findById(friendId);
    recipient.friendRequests = recipient.friendRequests.filter(
      (request) => request.senderId.toString() !== userId
    );
    await recipient.save();

    // Remove the sent request from the sender's sentRequests array
    user.sentRequests = user.sentRequests.filter(
      (request) => request.receiverId.toString() !== friendId
    );
    await user.save();

    res.status(200).json({ message: "Friend request canceled" });
  } catch (error) {
    console.log("Error in cancelFriendRequest: ", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const declineFriendRequest = async (req, res) => {
  const { _id: userId } = req.user; // Recipient's ID
  const { senderId } = req.params; // Sender's ID

  try {
    const recipient = await User.findById(userId); // Recipient
    const sender = await User.findById(senderId); // Sender

    if (!recipient || !sender) {
      return res.status(404).json({ message: "User or sender not found" });
    }

    // Remove the friend request from the recipient's friendRequests array
    recipient.friendRequests = recipient.friendRequests.filter(
      (request) => request.senderId.toString() !== senderId
    );
    await recipient.save();

    // Notify the sender that their request has been declined
    const senderSocketId = getReceiverSocketId(senderId);
    if (senderSocketId) {
      io.to(senderSocketId).emit("friendRequestDeclined", {
        recipientId: userId,
        recipientName: recipient.fullName,
      });
    }

    res.status(200).json({ message: "Friend request declined" });
  } catch (error) {
    console.log("Error in declineFriendRequest: ", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const unFriend = async(req, res) => {
  try {
    const userId = req.user._id;
    const friendId = req.params.friendId;

    if(!friendId) {
      return res.status(400).json({ message: "Friend ID is required" });
    }

    const user = await User.findById(userId);
    const friend = await User.findById(friendId);

    if (!user || !friend) {
      return res.status(404).json({ message: "User or Friend not found" });
    }

    if (!user.friends.includes(friendId)) {
      return res.status(400).json({ message: "User is not your friend" });
    }


      // Atomic removal of friendId from user's friend list
      const userUpdate = User.updateOne(
        { _id: userId },
        { $pull: { friends: friendId } }
      );

      // Atomic removal of userId from friend's friend list
      const friendUpdate = User.updateOne(
        { _id: friendId },
        { $pull: { friends: userId } }
      );

      // Execute both updates in parallel
      await Promise.all([userUpdate, friendUpdate]);

      // Delete messages between both users
      await Message.deleteMany({
        $or: [
          { senderId: userId, receiverId: friendId },
          { senderId: friendId, receiverId: userId },
        ],
      });

    // send success message
    res.status(200).json({ message: "Unfriended successfully and messages deleted" });


  } catch (error) {
    console.error("Error in unFriend controller:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export const getFriendRequests = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId).populate({
      path: "friendRequests.senderId",
      select: "fullName profilePic",
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Filter out only the pending friend requests
    const pendingRequests = user.friendRequests
      .filter((request) => request.status === "pending")
      .map((request) => ({
        senderId: request.senderId._id,
        senderName: request.senderId.fullName,
        senderProfilePic: request.senderId.profilePic,
        status: request.status,
      }));

    res.status(200).json(pendingRequests || []);
  } catch (error) {
    console.error("Error fetching friend requests: ", error);
    res.status(500).json({ message: "Failed to fetch friend requests" });
  }
};