import express from "express";

export let friendRequestRoutes = express.Router();
import { tokenVarify } from "../services/userService";
import {
  friendRequestAccept,
  sendFriendRequest,
  seeFriendRequest,
  friendRequestReject,
  blockMessage
} from "../controller/friendRequestController";

friendRequestRoutes.post("/sendRequest/:id", tokenVarify, sendFriendRequest);
friendRequestRoutes.get("/friendrequest", tokenVarify, seeFriendRequest);
friendRequestRoutes.patch(
  "/acceptRequest/:id",
  tokenVarify,
  friendRequestAccept
);
friendRequestRoutes.patch("/reject/:id", tokenVarify, friendRequestReject);
friendRequestRoutes.patch("/user/block/:id",tokenVarify,blockMessage )

