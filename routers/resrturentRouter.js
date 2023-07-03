const router = require("express").Router();

const resturentCtrl = require("../controller/resturentCtrl");

router.post("/add-res", resturentCtrl.addResturents);

router.get("/resturents", resturentCtrl.getResturents);

router.delete('/delete-res/:id',resturentCtrl.deleteResturent)




module.exports = router;
