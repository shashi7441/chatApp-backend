import {Request, Response } from "express";
import express from 'express'
import db from "../models/";
require("./controller/passport");
const app = express();
import path from "path";
const port = process.env.PORT;
import userRoutes from "./router";
import { googleRoutes } from "./router/googleRoutes";
import {friendRequestRoutes} from './router/friendRequestRouter'
import{ messageRoutes} from './router/messageRouter'
 
app.use(express.json());
app.use("/api/auth/user", userRoutes);
app.use("/", googleRoutes);
app.use('/api', friendRequestRoutes)
app.use('/api',messageRoutes)

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.get("/failed", (req, res) => {
  return res.json({
    statusCode: 400,
    message: "Invalid credential",
  });
});

app.get("/", (req: Request, res: Response) => {
  res.render("pages/index");
});

app.listen(port, async () => {
  await db.sequelize.authenticate({ logging: false }).then(() => {
    console.log("database connected successfully");
  });
  console.log(`server live at ${port}`);
});
