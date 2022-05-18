import express from "express";

export let messageRoutes = express.Router();
import { tokenVarify } from "../services/userService";
import { mesageValidation } from "../middleware/messageValidation";
import {
  sendMessage,
  seeMessages,
  blockMessage,
  deleteChats,
  deleteAllChat,
} from "../controller/messageController";
messageRoutes.post(
  "/conversation/message/:id",
  tokenVarify,
  mesageValidation,
  sendMessage
);

messageRoutes.get("/conversation/message/:id", tokenVarify, seeMessages);

messageRoutes.patch("/conversation/message/:id", tokenVarify, blockMessage);

messageRoutes.delete("/conversation/message/:id", tokenVarify, deleteChats);

messageRoutes.delete(
  "/conversation/message/allchat/:id",
  tokenVarify,
  deleteAllChat
);
