const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    cart: [],
    total: {
      type: String,
      required: true,
    },
    totalDiscount: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      default: "confirm",
    },

    deliveryStatus: {
      type: String,
      default: "pending", //confirm , pickup , delivered
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    delivery: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Order", orderSchema);
