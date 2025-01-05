const { Schema, models, model } = require("mongoose");

const CartSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: false }, // null for guest users
  items: [
    {
      productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
      quantity: { type: Number, required: true, min: 1 },
    },
  ],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export const Cart = models?.Cart || model("Cart", CartSchema);
