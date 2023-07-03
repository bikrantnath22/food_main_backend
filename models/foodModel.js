const mongoose = require("mongoose");

const foodSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    Price: {
      type: Number,
      required: true,
    },
    DiscountPrice: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    avatar: {
      type: {},
      default: {
        download_url: "",
        file_name: "",
      },
    },
    
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Food", foodSchema);
