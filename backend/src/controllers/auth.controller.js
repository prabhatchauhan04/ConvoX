import User from "../models/user.model.js";
import bcrypt, { genSalt } from "bcryptjs";
import {generateToken} from "../lib/utils.js";
import cloudinary from "../lib/cloudinary.js";

export const signup = async (req,res)=>{

    const {fullName,email,password} = req.body;

    try {
        if (!fullName || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }
        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters" });
        }

        const user = await User.findOne({email}); // checking if already user exists with given email or not
        
        if (user) return res.status(400).json({ message: "Email already exists" }); // if user with given email already exists

        // hashing the password
        const salt = await bcrypt.genSalt(10); // generating salt
        const hashedPassword = await bcrypt.hash(password , salt);

        const newUser = new User({
            fullName, // this means "fullName: fullName"
            email,
            password: hashedPassword
        });

        if(newUser){
            // generating jwt token here
            generateToken(newUser._id,res);
            await newUser.save(); // saving new user in database

            res.status(201).json({
                _id: newUser._id,
                fullName: newUser.fullName,
                email: newUser.email,
                profilePic: newUser.profilePic,
            })

        }else{
            res.status(400).json({ message: "Invalid User Data" });
        }

    } catch (error) {
        console.log("Error in signup controller", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    generateToken(user._id, res);

    res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      profilePic: user.profilePic,
    });
  } catch (error) {
    console.log("Error in login controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const logout = (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.log("Error in logout controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const updateProfile = async (req, res) => {
  try {

    const { profilePic } = req.body;
    const userId = req.user._id; // we can now access "_id" directly because the protectRoute function already authenticated the user

    if (!profilePic) {
      return res.status(400).json({ message: "Profile pic is required" });
    }

    const uploadResponse = await cloudinary.uploader.upload(profilePic); // cloudinary is like a bucket for images 
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profilePic: uploadResponse.secure_url }, // cloudinary provides "uploadResponse.secure_url" after uploading image
      { new: true }
    );

    res.status(200).json(updatedUser);

  } catch (error) {
    console.log("error in update profile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


// we will call this function whenever page is refreshed to tell if we take user to signup page or login page
export const checkAuth = (req, res) => {
  try {
    res.status(200).json(req.user); // sent user back to the client
  } catch (error) {
    console.log("Error in checkAuth controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


