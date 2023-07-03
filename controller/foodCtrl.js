const Users = require("../models/userModel");
const Food = require("../models/foodModel");
const bcrypt = require("bcrypt");
const { getAuthDetails } = require("../middleware/auth");
const { IncomingForm } = require("formidable");
const path = require("path");
const _ = require("lodash");

const deleteFileFromDisk = async (filePath) => {
  try {
    await unlink(filePath);
  } catch (error) {}
};

const foodCtrl = {
  getResturents: async (req, res) => {
    try {
      const user = await Users.find({ role: "resturent" });
      res.json(user);
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },

  addFood: async (req, res) => {
    const options = {
      uploadDir: path.join(__dirname, "..", "avatars"),
      keepExtensions: true,
      maxFileSize: 5 * 1024 * 1024,
    };
    // const { user_id } = getAuthDetails(req);
    // console.log(user_id)
    const form = new IncomingForm(options);
    let newFood = null;

    try {
      
      
      form.parse(req, async (err, fields, files) => {
        const { name, Price, DiscountPrice, description, user } = fields;

        if (err) {
          if (err.code === 1009)
            return res
              .status(500)
              .json({ msg: "Maximum supported file is 5mb" });
          else return res.status(500).json({ msg: "Somethings went wrong!" });
        }

        if (_.isEmpty(files)) {
          //✅  empty
          newFood = await Food.create({
            name,
            Price,
            DiscountPrice,
            description,
            user,
          });
        } else {
          // ❌ files are present
          console.log(files);
          const newAvatar = {
            download_url: `https://food-main-backend.onrender.com/${files.avatar.newFilename}`,
            file_name: files.avatar.newFilename,
          };
          newFood = await Food.create({
            name,
            Price,
            DiscountPrice,
            description,

            user,
            avatar: newAvatar,
          });
        }

        await newFood.save();
        console.log(newFood)
        await Users.findByIdAndUpdate(user, {
          $addToSet: { food: newFood._id },
        });
        
        res.json({ msg: "Food created" });
      });
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: "YOU BITCH!" });
    }
  },
  deleteFood: async (req, res) => {
    try {
      const { id } = req.params;
      console.log(id)
      const user = await Food.findById(id);
      if (!user) return res.status(400).json({ msg: "User does not exist." });
      const userName = user.avatar.file_name;
      const deleteFilePath = path.join(__dirname, "..", "avatars", userName);
      await deleteFileFromDisk(deleteFilePath);
      await Food.findByIdAndDelete(id);
      return res.status(200).json({ msg: "Delete was a success" });
    } catch (err) {
      console.log(err);
      return res.status(500).json({ msg: err.message });
    }
  },


  updateFood: async (req, res) => {
    const { id } = req.params;
    const options = {
      uploadDir: path.join(__dirname, "..", "avatars"),
      keepExtensions: true,
      maxFileSize: 5 * 1024 * 1024,
    };
    const form = new IncomingForm(options);

    try {
      const user = await Food.findById(id);
      if (!user) return res.status(400).json({ msg: "food does not exist." });
      form.parse(req, async (err, fields, files) => {
        if (err) {
          if (err.code === 1009)
            return res
              .status(500)
              .json({ msg: "Maximum supported file is 5mb" });
          else return res.status(500).json({ msg: "Somethings went wrong!" });
        }
        console.log(fields);
        if (_.isEmpty(files)) {
          const updatedUser = await Food.findByIdAndUpdate(id, {
            name: fields.name,
            Price: fields.Price,
            DiscountPrice: fields.DiscountPrice,
            description: fields.description,
          
          });
          console.log(updatedUser);
          return res.status(200).json({ msg: "UPDATE WAS OK!" });
        }
        const newAvatar = {
          download_url: `https://food-main-backend.onrender.com/${files.avatar.newFilename}`,
          file_name: files.avatar.newFilename,
        };
        await Food.findByIdAndUpdate(id, {
          avatar: newAvatar,
          name: fields.name,
          Price: fields.Price,
          DiscountPrice: fields.DiscountPrice,
          description: fields.description,
          
        });
        return res.status(200).json({ msg: "UPDATE WAS OK!" });
      });
    } catch (err) {
      console.log(err);
      return res.status(500).json({ msg: err.message });
    }
  },
  getFood_byID: async (req, res) => {
    const userDetail = getAuthDetails(req);
    console.log(userDetail);
    console.log(userDetail);
    try {
      const user = await Food.findById(req.params.id).select("-password");
      if (!user) return res.status(400).json({ msg: "Food does not exist." });

      res.status(200).json(user);
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
};
module.exports = foodCtrl;
