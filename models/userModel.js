const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,

      default: "",
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      default: "",
    },
    password: {
      type: String,
      default: "",
    },

    role: {
      type: String,
      default: "user",
    },

    address: {
      type: String,
      default: "",
    },
    phone: {
      type: Number,
      default: "",
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },

    avatar: {
      type: {},
      default: {
        download_url: "",
        file_name: "",
      },
    },
    image: {
      type: {},
      default: {
        download_url:
          "https://th.bing.com/th/id/OIP.Z306v3XdxhOaxBFGfHku7wHaHw?pid=ImgDet&rs=1",
        file_name: "",
      },
    },
    food: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Food",
      },
    ],

    cart: [
      {
        food: {},
        count: {
          type: Number,
          default: 0,
        },
      },
    ],

    order: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order",
      },
    ],
    
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);
