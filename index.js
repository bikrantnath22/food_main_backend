const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
// const fileUpload = require('express-fileupload')
const userRouter = require("./routers/userRouter");

const path = require("path");

const morgan = require('morgan') ;

const app = express();
app.use(express.static('avatars'));
// app.use(express.static('file-store'))//✔ 
app.use(function (req, res, next) {
  res.header("Content-Type", "application/json;charset=UTF-8");
  res.header("Access-Control-Allow-Credentials", true);
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    optionsSuccessStatus: 200,
    origin: true,
    credentials:true
    
  })
);
mongoose.set("strictQuery", false);
app.use(morgan('tiny'))
// app.use(fileUpload({
//   useTempFiles: true
// }))


app.use("/user",require('./routers/userRouter'));
app.use('/api',require("./routers/resrturentRouter"))
app.use('/api',require("./routers/driverRouter"))
app.use('/api',require("./routers/categoryRouter"))
app.use('/api',require("./routers/foodRouter"))
app.use('/api',require('./routers/upload'))


const URI =
  "mongodb+srv://admin:admin@cluster0.jde1w66.mongodb.net/?retryWrites=true&w=majority";

mongoose.connect(
  URI,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
  (err) => {
    if (err) throw err;
    console.log("Connected to MongoDB");
  }
);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log("Server is running on port", PORT);
});