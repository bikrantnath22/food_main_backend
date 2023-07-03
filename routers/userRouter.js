const router = require("express").Router();

const userCtrl = require("../controller/userCtrl");

const { auth } = require("../middleware/auth");

router.post("/register", userCtrl.register);

router.post("/login", userCtrl.login);

router.get("/logout", userCtrl.logout);

router.get("/userByid/:id", userCtrl.getResbyID);

router.get("/orderByid/:id", userCtrl.getOrderbyID);

router.get("/profile", userCtrl.getProfile);

router.patch("/update_profile", auth, userCtrl.updateProfile);

router.patch("/addcart", userCtrl.addCart);
router.patch("/increment", userCtrl.increment);
router.patch("/decrement", userCtrl.decrement);
router.patch("/remove", userCtrl.remove);

router.post("/create-payment-intent", userCtrl.createPaymentIntent);

router.post("/create-order", userCtrl.createOrder);
router.patch("/delivery/accept/:id", userCtrl.acceptOrderDelivery);
router.patch("/delivery/update/:id", userCtrl.updateOrderDelivery);

module.exports = router;
