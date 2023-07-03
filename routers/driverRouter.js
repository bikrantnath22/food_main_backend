const router = require("express").Router();

const driverCtrl = require("../controller/driverCtrl");

router.post("/add-driver", driverCtrl.addDriver);

router.get("/drivers", driverCtrl.getDriver);




module.exports = router;
