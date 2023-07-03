const router = require("express").Router();

const foodCtrl = require("../controller/foodCtrl");

router.post("/add-food", foodCtrl.addFood);

router.delete('/delete-food/:id',foodCtrl.deleteFood)

router.patch('/update/:id', foodCtrl.updateFood)

router.get('/get_food/:id',foodCtrl. getFood_byID)




module.exports = router;
