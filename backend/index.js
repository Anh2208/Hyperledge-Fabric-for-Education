import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";

import authRoute from "./routes/auth.js"
import subjectRoute from "./routes/subject.js"
import resultRoute from "./routes/result.js"
import adminRoute from "./routes/admin.js"

dotenv.config();
const app = express();
const port = process.env.PORT || 8000

//connect database
// mongoose.set("strictQuery", false);
const connect = async () => {
    try {
        await mongoose.connect(process.env.mongoURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        })
        console.log("Mongo database Connected Success!!!");
    } catch(error){
        console.log('Mongo database connection failed');
    }
};


//middleware
app.use(express.json());
app.use(cors());
app.use(cookieParser());

//Route
app.use('/auth', authRoute);
app.use('/subject', subjectRoute);
app.use('/result', resultRoute);
app.use('/admin', adminRoute);

app.listen(port, () => {
    connect();
    console.log('Server listen port at:', port);
})