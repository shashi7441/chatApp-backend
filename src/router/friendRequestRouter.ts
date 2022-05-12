import express from "express";

export let friendRequestRoutes = express.Router();
import { tokenVarify } from "../services/userService";
import {
  friendRequestAccept,
  sendFriendRequest,
  seeFriendRequest,
  friendRequestReject,
} from "../controller/friendRequestController";

friendRequestRoutes.patch(
  "/acceptRequest/:id",
  tokenVarify,
  friendRequestAccept
);
friendRequestRoutes.post("/sendRequest/:id", tokenVarify, sendFriendRequest);
friendRequestRoutes.patch("/reject/:id", tokenVarify, friendRequestReject);
friendRequestRoutes.get("/friendrequest", tokenVarify, seeFriendRequest);
