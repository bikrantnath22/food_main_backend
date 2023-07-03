const Users = require("../models/userModel");
const orderModel = require("../models/orderModel");
const bcrypt = require("bcrypt");
const { getAuthDetails, paymentStore } = require("../middleware/auth");
const { IncomingForm } = require("formidable");
const path = require("path");
const _ = require("lodash");
const stripe = require("stripe")(
  "sk_test_51IlCj4SJiIZMEXxoa1GgKIlFjV4xShOWGFUjchisnJbN9Y39XwldPgQdVEucmHMSjGUeiXXtUi7XAR1YhJlfcGWf00g9q9xqju"
);

const userCtrl = {
  register: async (req, res) => {
    try {
      const { name, email, password } = req.body;

      const user = await Users.findOne({ email });
      if (user)
        return res.status(400).json({ msg: "The email already exists." });
      if (password.length < 6)
        return res
          .status(400)
          .json({ msg: "Password is at least 6 characters long." });

      // Password Encryption
      const passwordHash = await bcrypt.hash(password, 10);
      const newUser = new Users({
        name,
        email,

        password: passwordHash,
      });

      // Save mongodb
      await newUser.save();
      res.json({
        msg: "User created successfully.",
      });
    } catch (err) {
      console.log(err);
      return res.status(500).json({ msg: err.message });
    }
  },
  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      const user = await Users.findOne({ email: email });
      if (!user) return res.status(400).json({ msg: "User does not exist." });

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(400).json({ msg: "Incorrect password." });

      // If login success , create access token and refresh token

      res.cookie("role", user.role, {
        httpOnly: true,

        maxAge: 7 * 24 * 60 * 60 * 1000, // 7d
      });
      res.cookie("user_id", user._id, {
        httpOnly: true,

        maxAge: 7 * 24 * 60 * 60 * 1000, // 7d
      });
      res.cookie("isLoggedIn", true, {
        httpOnly: true,

        maxAge: 7 * 24 * 60 * 60 * 1000, // 7d
      });

      res
        .status(200)
        .json({ status: true, role: user.role, user_id: user._id });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  logout: async (req, res) => {
    try {
      res.clearCookie("role");
      res.clearCookie("user_id");
      res.clearCookie("isLoggedIn");
      res.json({ msg: "Logout successfully." });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },

  getResbyID: async (req, res) => {
    const { id } = req.params;
    try {
      const user = await Users.findById(id)
        .select("-password")
        .populate("food");
      if (!user) return res.status(400).json({ msg: "User does not exist." });
      console.log(user);
      res.status(200).json(user);
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },

  getOrderbyID: async (req, res) => {
    const { id } = req.params;
    try {
      const user = await orderModel
        .findById(id)
        .select("-password")
        .populate("restaurant")
        .populate("user")
        .populate("delivery")
      if (!user) return res.status(400).json({ msg: "User does not exist." });
      console.log(user);
      res.status(200).json(user);
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },

  getProfile: async (req, res) => {
    const userDetail = getAuthDetails(req);

    try {
      const user = await Users.findById(userDetail.user_id)
        .select("-password")
        .populate("food")
        .populate({
          path: "order",
          populate: [
            {
              path: "user",
            },
            {
              path: "restaurant",
            },
            {
              path: "delivery",
            },
          ],
        });

      if (!user) return res.status(400).json({ msg: "User does not exist." });

      res.status(200).json(user);
    } catch (err) {
      console.log(err);
      return res.status(500).json({ msg: err.message });
    }
  },

  updateProfile: async (req, res) => {
    const userDetail = getAuthDetails(req);
    const options = {
      uploadDir: path.join(__dirname, "..", "avatars"),
      keepExtensions: true,
      maxFileSize: 5 * 1024 * 1024,
    };
    const form = new IncomingForm(options);
    console.log(userDetail);
    try {
      const user = await Users.findById(userDetail.user_id);
      if (!user) return res.status(400).json({ msg: "User does not exist." });
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
          const updatedUser = await Users.findByIdAndUpdate(
            userDetail.user_id,
            {
              name: fields.name,
            }
          );
          console.log(updatedUser);
          return res.status(200).json({ msg: "UPDATE WAS OK!" });
        }
        const newAvatar = {
          download_url: `https://food-main-backend.onrender.com//${files.avatar.newFilename}`,
          file_name: files.avatar.newFilename,
        };
        await Users.findByIdAndUpdate(userDetail.user_id, {
          avatar: newAvatar,
          name: fields.name,
        });
        return res.status(200).json({ msg: "UPDATE WAS OK!" });
      });
    } catch (err) {
      console.log(err);
      return res.status(500).json({ msg: err.message });
    }
  },

  addCart: async (req, res) => {
    const { user_id } = getAuthDetails(req);
    try {
      const user = await Users.findById(user_id);
      if (!user) return res.status(400).json({ msg: "User does not exist." });

      await Users.findOneAndUpdate(
        { _id: user_id },
        {
          cart: req.body.cart,
        }
      );

      return res.json({ msg: "Added to cart ho gaya" });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  increment: async (req, res) => {
    const { user_id } = getAuthDetails(req);
    try {
      const user = await Users.findById(user_id);
      if (!user) return res.status(400).json({ msg: "User does not exist." });
      const { food } = req.body;
      await Users.updateOne(
        { _id: user_id, "cart.food._id": food._id },
        {
          $inc: {
            "cart.$.count": 1,
          },
        }
      );

      return res.json({ msg: "incremented" });
    } catch (err) {
      console.log(err);
      return res.status(500).json({ msg: err.message });
    }
  },
  decrement: async (req, res) => {
    try {
      const { user_id } = getAuthDetails(req);
      const user = await Users.findById(user_id);
      if (!user) return res.status(400).json({ msg: "User does not exist." });
      const { food } = req.body;
      await Users.updateOne(
        { _id: user_id, "cart.food._id": food._id },
        {
          $inc: {
            "cart.$.count": -1,
          },
        }
      );

      return res.json({ msg: "decrement" });
    } catch (err) {
      console.log(err);
      return res.status(500).json({ msg: err.message });
    }
  },
  remove: async (req, res) => {
    try {
      const { user_id } = getAuthDetails(req);
      const user = await Users.findById(user_id);
      if (!user) return res.status(400).json({ msg: "User does not exist." });
      const { food } = req.body;
      await Users.updateOne(
        { _id: user_id },
        {
          $pull: {
            cart: {
              "food._id": food._id,
            },
          },
        }
      );

      return res.json({ msg: "removed" });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  createPaymentIntent: async (req, res) => {
    const { product } = req.body;
    const { user_id } = getAuthDetails(req);
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: product.total * 100,
        currency: "INR",
      });
      console.log(product);
      const newPayment = {
        cart: product.cart,
        total: product.total,
        totalDiscount: product.totalDiscount,
        address: product.address,
        phone: product.phone,
        user: user_id,
        restaurant: product.cart[0].food.user,
      };
      paymentStore.set(user_id, newPayment);
      return res.json({
        ClientSecret: paymentIntent.client_secret,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        msg: "Something went wrong!",
      });
    }
  },

  createOrder: async (req, res) => {
    try {
      const { user_id } = getAuthDetails(req);
      console.log(getAuthDetails(req));
      const payment = paymentStore.get(user_id);
      if (!payment) {
        return res.status(400).json({
          msg: "no such payment exist!!",
        });
      }
      const newOrder = new orderModel(payment);
      await newOrder.save();
      const restaurant_id = payment.cart[0].food.user;
      await Users.findByIdAndUpdate(user_id, {
        $addToSet: {
          order: newOrder._id,
        },
        $set: {
          cart: [],
        },
      });
      await Users.findByIdAndUpdate(restaurant_id, {
        $addToSet: {
          order: newOrder._id,
        },
      });
      await Users.updateMany(
        { role: "driver" },
        {
          $addToSet: {
            order: newOrder._id,
          },
        }
      );
      paymentStore.delete(user_id);
      res.json({ msg: "Booked!" });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        msg: "Something went wrong!",
      });
    }
  },
  acceptOrderDelivery: async (req, res) => {
    try {
      const { user_id } = getAuthDetails(req);
      const { id } = req.params;
      console.log(id, user_id);
      const orderConfirmed = await orderModel.findById(id);
      if (orderConfirmed.deliveryStatus !== "pending")
        return res.status(400).json({
          msg: "Order has been confirmed already!",
        });
      await orderModel.findByIdAndUpdate(id, {
        delivery: user_id,
        deliveryStatus: "confirm",
      });
      return res.json({
        msg: "updated successfully!",
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        msg: "Something went wrong!",
      });
    }
  },
  updateOrderDelivery: async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      await orderModel.findByIdAndUpdate(id, {
        deliveryStatus: status,
      });
      return res.json({
        msg: "updated successfully!",
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        msg: "Something went wrong!",
      });
    }
  },
};

module.exports = userCtrl;
