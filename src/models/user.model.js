// This file contain the user model, jwt, bcrypt .

import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import dotenv from 'dotenv';

dotenv.config();

const userSchema = new mongoose.Schema(
  // This is the model of user.
  {
    username: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
      required: true,
      index: true,
    },
    email: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
      required: true,
    },
    fullname: {
      type: String,
      unique: true,

      trim: true,
      required: true,
      index: true,
    },
    avatar: {
      type: String,
      required: true,
    },
    coverimage: {
      type: String,
    },
    watchHistory: [
      {
        type: Schema.Types.ObjectId,
        ref: "Video",
      },
    ],
    password: {
      type: String,
      required: [true, "password is required"],
    },
    refreshtoken: {
      type: String,
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  // This function return the encrypt password to store in the database.

  // the below line checks if password is modified or not if it is then only encrypt it otherwise retrun next.
  if (!this.isModified("password")) return next();
  // If password is modified then encrypt it.
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.isPasswordCorrect = async function (password) {
  // Compare password while retriving from database.
  return await bcrypt.compare(password, this.password);
};



userSchema.methods.generateAccessToken = function () {
  // This function returns the  unique jwt token of every sign in.
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      _username: this.username,
    },
    process.env.ACCESS_TOKEN_SECRET,
    
    
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};
userSchema.methods.generateRefreshToken = function () {
  // This function returns the jwt refreshtoken of every sign in.
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      _username: this.username,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
};

export const User = mongoose.model("User", userSchema);
