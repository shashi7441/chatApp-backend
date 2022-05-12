import express from "express";

export let messageRoutes = express.Router();
import { tokenVarify } from "../services/userService";
import { mesageValidation } from "../middleware/messageValidation";
import { sendMessage } from "../controller/messageController";
messageRoutes.post(
  "/conversation/message/:id",
  tokenVarify,
  mesageValidation,
  sendMessage
);
