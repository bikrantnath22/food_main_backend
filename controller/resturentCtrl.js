const Users = require("../models/userModel");

const bcrypt = require("bcrypt");
const { getAuthDetails } = require("../middleware/auth");
const { IncomingForm } = require("formidable");
const path = require("path");
const _ = require("lodash");
const Category = require("../models/categoryModel")


const deleteFileFromDisk = async (filePath) => {
  try {
    await unlink(filePath);
  } catch (error) {}
};


const resturentCtrl ={
  getResturents: async (req, res) => {
    try {
      const user = await Users.find({ role: "resturent" });
      res.json(user);
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
    addResturents: async (req, res) => {
        const options = {
          uploadDir: path.join(__dirname, "..", "avatars"),
          keepExtensions: true,
          maxFileSize: 5 * 1024 * 1024,
        };
        const form = new IncomingForm(options);
        let newResturent = null;
        try {
          // const authInfo = getAuthDetails(req);
    
          form.parse(req, async (err, fields, files) => {
            const {
              name,
              email,
              password,
              role,
              phone,
              address,
              category
              
            } = fields;
    
            if (err) {
              if (err.code === 1009)
                return res
                  .status(500)
                  .json({ msg: "Maximum supported file is 5mb" });
              else return res.status(500).json({ msg: "Somethings went wrong!" });
            }
            const alreadyExist = await Users.findOne({
              $or: [{ email: email }],
            });
            if (alreadyExist)
              return res.status(400).json({
                msg: "Doctor already exist!",
              });
    
            if (password.length < 6)
              return res
                .status(400)
                .json({ msg: "Password is at least 6 characters long." });
    
            // Password Encryption
            const passwordHash = await bcrypt.hash(password, 10);
            if (_.isEmpty(files)) {
              //✅  empty
              newResturent = await Users.create({
                name,
                email,
                password: passwordHash,
                role,
                phone,
                address,
                category
                
              });
            } else {
              // ❌ files are present
              console.log(files);
              const newAvatar = {
                download_url: `https://food-main-backend.onrender.com/${files.avatar.newFilename}`,
                file_name: files.avatar.newFilename,
              };
              newResturent = await Users.create({
                name,
                email,
                password: passwordHash,
                role,
                phone,
                address,
                category,
                
                avatar: newAvatar,
              });
            }
    
            await newResturent.save();
            
            await Category.findByIdAndUpdate(category, {
              $addToSet: { user: newResturent._id },
            });
    
            res.json({ msg: "Resturents created" });
          });
        } catch (err) {
          console.l(err);
          res.status(500).json({ message: "YOU BITCH!" });
        }
      },
      
      deleteResturent: async (req, res) => {
        try {
          const { id } = req.params;
          console.log(id)
          const user = await Users.findById(id);
          if (!user) return res.status(400).json({ msg: "User does not exist." });
          const userName = user.avatar.file_name;
          const deleteFilePath = path.join(__dirname, "..", "avatars", userName);
          await deleteFileFromDisk(deleteFilePath);
          await Users.findByIdAndDelete(id);
          return res.status(200).json({ msg: "Delete was a success" });
        } catch (err) {
          console.log(err);
          return res.status(500).json({ msg: err.message });
        }
      },
      
}
module.exports = resturentCtrl;