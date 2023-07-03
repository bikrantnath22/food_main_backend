  
const mongoose = require('mongoose')


const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    avatar: {
        type: {},
        default: {
          download_url: "",
          file_name: "",
        },
    },
    user: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    
}, {
    timestamps: true
})

module.exports = mongoose.model("Category", categorySchema)