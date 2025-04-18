import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    uid: {
      type: String,
      unique: true,
    },
    email: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
    },
    instanceStatus: {
      type: String,
      default: "inactive",
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;
