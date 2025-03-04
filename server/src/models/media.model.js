import mongoose from "mongoose";

const mediaSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
      },
      description: {
        type: String,
        required: true,
        trim: true,
      },
      files: [
        {
          url: {
            type: String,
            required: true,
          },
          type: {
            type: String,
            enum: ["image", "video"], // Restrict file types to image or video
            required: true,
          },
        },
      ],
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },

}, {timestamps: true});

const Media = mongoose.model("Media", mediaSchema);

export default Media;