const { Schema, models, model } = require("mongoose");


const ForumSchema = new Schema(
    {
      userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      title: { type: String, required: true },
      content: { type: String, required: true },
      upvotes: { type: Number, default: 0 },
      downvotes: { type: Number, default: 0 },
      votes: [
        {
          userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
          type: { type: String, enum: ["upvote", "downvote"], required: true },
        },
      ],
      commentThread: [
        {
          userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
          reply: { type: String, required: true },
          createdAt: { type: Date, default: Date.now },
        },
      ],
      createdAt: { type: Date, default: Date.now },
    },
    { timestamps: true }
  );
  
export const Forum = models?.Forum || model("Forum", ForumSchema); 