import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";
import bodyParser from 'body-parser';

import authRoute from "./routes/auth.js";
import subjectRoute from "./routes/subject.js";
import resultRoute from "./routes/result.js";
import adminRoute from "./routes/admin.js";
import groupRoute from "./routes/group.js";
import degreeRoute from "./routes/degree.js";
import VerifyRoute from "./routes/verify.js";

//blokchain action
// import loadNetwork from "./loaders/fabric-loader.js"
import {
  fabric_initial_system,
  create_user,
  InitializeNFT,
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
      serverSelectionTimeoutMS: 30000, // Tăng thời gian chờ lên 30 giây
      socketTimeoutMS: 45000, // Tăng thời gian chờ cho socket lên 45 giây
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
app.use(express.json({ limit: '50mb' }));
app.use(bodyParser.json({ limit: '50mb' }));
// app.use(express.json());
// app.use(cors());
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true, // Cho phép sử dụng cookies và chứng thực
}));
app.use(cookieParser());

//Route
app.use("/auth", authRoute);
app.use("/subject", subjectRoute);
app.use("/result", resultRoute);
app.use("/admin", adminRoute);
app.use("/group", groupRoute);
app.use("/degree", degreeRoute);
app.use('/verify', VerifyRoute);
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true, parameterLimit: 100000 }));

// loadNetwork("Org1MSP");
await fabric_initial_system("Org1MSP");
await create_user("appUser", 'admin');
await create_user("rector@gmail.com", 'rector');
await create_user("anhvh1412@gmail.com", 'admin');
await create_user("anhg1906001@gmail.com", "teacher"); // create teacher
// create NFT smart contract
await InitializeNFT();
// testConnect();

app.listen(port, () => {
  connect();
  console.log("Server listen port at:", port);
});
