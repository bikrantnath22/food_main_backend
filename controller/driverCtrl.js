const Users = require("../models/userModel");

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

const driverCtrl = {
  getDriver: async (req, res) => {
    try {
      const user = await Users.find({ role: "driver" });
      res.json(user);
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  addDriver: async (req, res) => {
    const options = {
      uploadDir: path.join(__dirname, "..", "avatars"),
      keepExtensions: true,
      maxFileSize: 5 * 1024 * 1024,
    };
    const form = new IncomingForm(options);
    let newDriver = null;
    try {
      // const authInfo = getAuthDetails(req);

      form.parse(req, async (err, fields, files) => {
        const { name, email, password, role, phone, address } = fields;

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
          newDriver = await Users.create({
            name,
            email,
            password: passwordHash,
            role,
            phone,
            address,
          });
        } else {
          // ❌ files are present
          console.log(files);
          const newAvatar = {
            download_url: `https://food-main-backend.onrender.com/${files.avatar.newFilename}`,
            file_name: files.avatar.newFilename,
          };
          const newDoc = {
            download_url: `https://food-main-backend.onrender.com/${files.image.newFilename}`,
            file_name: files.image.newFilename,
          };
          newDriver = await Users.create({
            name,
            email,
            password: passwordHash,
            role,
            phone,
            address,
            image: newDoc,

            avatar: newAvatar,
          });
        }

        await newDriver.save();

        res.json({ msg: "Driver created" });
      });
    } catch (err) {
      console.l(err);
      res.status(500).json({ message: "YOU BITCH!" });
    }
  },
};
module.exports = driverCtrl;
