require("dotenv").config()
const express = require("express")
const cors = require("cors")
const mongoose = require("mongoose")
const {userRouter} = require("./routes/user")
const {courseRouter} = require("./routes/course")
const {adminRouter} = require("./routes/admin")
const app = express();
app.use(cors())
app.use(express.json());
const port = 3000;
app.use("/api/v1/user",userRouter)
app.use("/api/v1/course",courseRouter)
app.use("/api/v1/admin",adminRouter)
async function main(){
await mongoose.connect(process.env.MONGODB_URL);
app.listen(port,()=>{
    console.log(`Server is listening on port number ${port}`)
})
}
main();