const router =require('express').Router()
const cloudinary = require('cloudinary')

const fs =require('fs')



//we will upkload image in cloudinary
cloudinary.config({
    cloud_name:"vikrant001",
    api_key:"862451545192832",
    api_secret:"VfyVhAhJYQRrG03zBhBfwEfOUyE"
})

router.post('/upload',(req,res)=>{
    try {
        console.log(req.files)
        if(!req.files || Object.keys(req.files).length===0)
        return res.status(400).json({msg:'No files were uploaded'})


        const file=req.files.file;
        if(file.size > 1024*1024){
            removeTemp(file.tempFilePath)
            return res.status(400).json({msg:"size too large"})

        }
        

        if(file.mimetype !=="image/jpeg" && file.mimetype!=="image/png"){
            removeTemp(file.tempFilePath)
            return res.status(400).json({msg:'File formate is incorrect '})
        }

            


        cloudinary.v2.uploader.upload(file.tempFilePath,{folder : "test"},async(err,result)=>{
            if(err) throw err;
            removeTemp(file.tempFilePath)
            res.json({public_id: result.public_id,url: result.secure_url})

        })


        // res.json('test upload')
    } catch (err) {
        return res.status(500).json({msg: err.message})
    }
})
router.post('/destroy',(req,res) =>{
    try {   
        const {public_id} = req.body;
        if(!public_id) return res.status(400).json({msg: 'No images Selected'})


        cloudinary.v2.uploader.destroy(public_id, async(err, result) =>{
            if(err) throw err;

            res.json({msg: "Deleted Image"})
        })
    
    } catch (err) {
         return res.status(500).json({msg: err.message})
    }
    
})


const removeTemp =(path)=>{
    fs.unlink(path,err =>{
        if(err) throw err;
    })

}

module.exports=router