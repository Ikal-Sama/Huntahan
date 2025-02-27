import { generateToken } from '../lib/utils.js'
import User from '../models/user.model.js'
import bcrypt from 'bcryptjs'
import cloudinary from '../lib/cloudinary.js'

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