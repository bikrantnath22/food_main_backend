const router = require('express').Router()
const categoryCtrl =require('../controller/categoryCtrl')



router.route('/category')
    .get(categoryCtrl.getCategories)
    .post(categoryCtrl.addCategory)

router.route('/category/:id')
    .delete(categoryCtrl.deleteCategory)
    .put( categoryCtrl.updateCategory)


router.get('/get_category/:id',categoryCtrl. getCategory_byID)


    module.exports= router