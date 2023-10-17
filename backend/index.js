import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";

import authRoute from "./routes/auth.js";
import subjectRoute from "./routes/subject.js";
import resultRoute from "./routes/result.js";
import adminRoute from "./routes/admin.js";
import groupRoute from "./routes/group.js";

//blokchain action
// import loadNetwork from "./loaders/fabric-loader.js"
import {
  fabric_initial_system,
  create_user,
} from "./controller/hyperledgerController.js";
// import { testConnect } from "./test-connect.js";

dotenv.config();
const app = express();
const port = process.env.PORT || 8000;

//connect database
mongoose.set("strictQuery", false);
const connect = async () => {
  try {
    await mongoose.connect(process.env.mongoURI, {
      // serverSelectionTimeoutMS: 30000, // Tăng thời gian chờ lên 30 giây
      // socketTimeoutMS: 45000, // Tăng thời gian chờ cho socket lên 45 giây
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Mongo database Connected Success!!!");
  } catch (error) {
    console.log("Mongo database connection failed", error);
  }
};
// mongoose.connect('mongodb://localhost/mydatabase', {
//   serverSelectionTimeoutMS: 30000, // Tăng thời gian chờ lên 30 giây
//   socketTimeoutMS: 45000, // Tăng thời gian chờ cho socket lên 45 giây
// });

//middleware
app.use(express.json());
// app.use(cors());
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true, // Cho phép sử dụng cookies và chứng thực
}));
app.use(cookieParser());

//Route
app.use("/auth", authRoute);
app.use("/subject", subjectRoute);
app.use("/result", resultRoute);
app.use("/admin", adminRoute);
app.use("/group", groupRoute);

// loadNetwork("Org1MSP");
await fabric_initial_system("Org1MSP");
await create_user("appUser");
// // testConnect();

app.listen(port, () => {
  connect();
  console.log("Server listen port at:", port);
});
