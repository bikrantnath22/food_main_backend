const Category = require("..//models/categoryModel");
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

const categoryCtrl = {
  getCategories: async (req, res) => {
    try {
      const categories = await Category.find();
      res.json(categories);
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  getCategory_byID: async (req, res) => {
    const { id } = req.params;
    try {
      const user = await Category.findById(id)
        .select("-password")
        .populate("user");
      if (!user) return res.status(400).json({ msg: "User does not exist." });
      console.log(user);
      res.status(200).json(user);
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  addCategory: async (req, res) => {
    const options = {
      uploadDir: path.join(__dirname, "..", "avatars"),
      keepExtensions: true,
      maxFileSize: 5 * 1024 * 1024,
    };
    const form = new IncomingForm(options);
    let newCategory = null;
    try {
      // const authInfo = getAuthDetails(req);

      form.parse(req, async (err, fields, files) => {
        const { name } = fields;

        if (err) {
          if (err.code === 1009)
            return res
              .status(500)
              .json({ msg: "Maximum supported file is 5mb" });
          else return res.status(500).json({ msg: "Somethings went wrong!" });
        }
        const alreadyExist = await Category.findOne({
          $or: [{ name: name }],
        });
        if (alreadyExist)
          return res.status(400).json({
            msg: "Category already exist!",
          });

        if (_.isEmpty(files)) {
          //✅  empty
          newCategory = await Category.create({
            name,
          });
        } else {
          // ❌ files are present
          console.log(files);
          const newAvatar = {
            download_url: `https://food-manegment.onrender.com/${files.avatar.newFilename}`,
            file_name: files.avatar.newFilename,
          };
          newCategory = await Category.create({
            name,

            avatar: newAvatar,
          });
        }

        await newCategory.save();

        res.json({ msg: "Category created" });
      });
    } catch (err) {
      console.l(err);
      res.status(500).json({ message: "YOU BITCH!" });
    }
  },
  deleteCategory: async (req, res) => {
    try {
      const { id } = req.params;
      const category = await Category.findById(id);
      if (!category) return res.status(400).json({ msg: "category does not exist." });
      const categoryName = category.avatar.file_name;
      const deleteFilePath = path.join(__dirname, "..", "avatars", categoryName);
      await deleteFileFromDisk(deleteFilePath);
      await Category.findByIdAndDelete(id);
      return res.status(200).json({ msg: "Delete was a success" });
    } catch (err) {
      console.log(err);
      return res.status(500).json({ msg: err.message });
    }
  },
 

  // deleteCategory: async (req, res) => {
  //   try {
  //     await Category.findByIdAndDelete(req.params.id);
  //     res.json({ msg: "Deleted a Category" });
  //   } catch (err) {
  //     return res.status(500).json({ msg: err.message });
  //   }
  // },
  updateCategory: async (req, res) => {
    try {
      const { name, images } = req.body;
      await Category.findOneAndUpdate({ _id: req.params.id }, { name, images });

      res.json({ msg: "Updated a category" });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
};
module.exports = categoryCtrl;
