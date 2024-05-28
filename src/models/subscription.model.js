import mongoose, { Schema } from "mongoose";

const subcriptionSchema = new mongoose.Schema(
  {
    subscriber: {
      type: Schema.Types.ObjectId, //one who is subscribing.
      ref: "User",
    },
    channel: {
      type: Schema.Types.ObjectId, //channel which is subscribe
      ref: "User",
    },
  },
  { timestamps: true }
);

export const subcriptionUser = mongoose.model("Subsciber", subcriptionSchema);
