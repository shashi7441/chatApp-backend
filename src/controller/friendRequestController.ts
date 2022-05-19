const { conversation, users } = require("../../models/");
import { Op, UUIDV4 } from "sequelize";
import { Request, Response, NextFunction } from "express";
import { ApiError } from "../services/error";
import { v4 as uuid, validate } from "uuid";
// import UUID, { isUuid } from "uuidv4";
import { jobs_v4 } from "googleapis";
// interface error {
//   message: String;
// }

export let sendFriendRequest = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const myId = uuid();
    const id = req.params.id;
    const numberId: any = id.replace(/[' "]+/g, "");

    const checkId = validate(numberId);
    if (checkId === false) {
      return next(new ApiError("please put valid id ", 400));
    }
    const recieverData: any = await users.findOne({
      where: {
        id: numberId,
      },
    });

    if (numberId == req.id) {
      return next(new ApiError("you can not send request", 400));
    }

    if (!recieverData) {
      return next(new ApiError("no user found", 400));
    }

    const cheackFriendRequest = await conversation.findOne({
      where: {
        senderId: { [Op.or]: [req.id, numberId] },
        recieverId: { [Op.or]: [req.id, numberId] },
      },
    });

    if (cheackFriendRequest) {
      const senderId = cheackFriendRequest.dataValues.senderId;
      const status = cheackFriendRequest.dataValues.state;
      if (status === "blocked") {
        return next(new ApiError("you can not send request", 400));
      }
      if (status === "accepted") {
        return next(new ApiError("you are already friend", 400));
      }
      if (status === "pending" && senderId === req.id) {
        return next(new ApiError("you have alredy send request", 400));
      }
      if (status === "pending") {
        return next(new ApiError("you have recieve request ", 400));
      }
    }
    if (!cheackFriendRequest) {
      const createData = await conversation.create({
        senderId: req.id,
        recieverId: numberId,
        id: myId,
      });
      return res.json({
        statusCode: 201,
        message: "friend request is send",
      });
    }
  } catch (e: any) {
    console.log("eeeeeeeeee", e);

    return next(new ApiError(e.message, 400));
  }
};

export let friendRequestAccept = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = req.params.id;
    const numberId: any = id.replace(/[' "]+/g, "");

    const checkId = validate(numberId);
    if (checkId === false) {
      return next(new ApiError("please put valid id ", 400));
    }
    if (req.id == numberId) {
      return next(new ApiError("can not accept request", 404));
    }

    const recieverData: any = await users.findOne({
      where: {
        id: numberId,
      },
    });
    if (!recieverData) {
      return next(new ApiError("no user found", 404));
    }
    const cheackFriendRequest = await conversation.findOne({
      where: {
        senderId: { [Op.or]: [req.id, numberId] },
        recieverId: { [Op.or]: [req.id, numberId] },
      },
    });

    if (!cheackFriendRequest) {
      return next(new ApiError("no conversation found", 400));
    }
    if (cheackFriendRequest) {
      const recieverId = cheackFriendRequest.dataValues.recieverId;
      const match = req.id === recieverId;
      const value = cheackFriendRequest.dataValues.state;

      if (value === "pending" && match == false) {
        return next(new ApiError("sender can not accept request", 400));
      }

      if (value === "accepted" && match == true) {
        return next(new ApiError("already accepted ", 400));
      }

      if (value === "pending" && match == true) {
        console.log(req.id);
        console.log(numberId);

        await conversation.update(
          { state: "accepted" },
          {
            where: {
              // senderId: parseInt(numberId),
              recieverId: req.id,
            },
          }
        );
        return next(new ApiError("friend request is  accepted ", 200));
      }
    }
  } catch (e: any) {
    console.log(e);

    return next(new ApiError(e.message, 400));
  }
};

export let friendRequestReject = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = req.params.id;
    const numberId: any = id.replace(/[' "]+/g, "");

    const checkId = validate(numberId);
    if (checkId === false) {
      return next(new ApiError("please put valid id ", 400));
    }

    const recieverData: any = await users.findOne({
      where: {
        id: numberId,
      },
    });

    if (req.id == numberId) {
      return next(new ApiError("can not reject request ", 404));
    }

    const cheackFriendRequest = await conversation.findOne({
      where: {
        senderId: { [Op.or]: [req.id, numberId] },
        recieverId: { [Op.or]: [req.id, numberId] },
        state: "pending",
      },
    });

    if (!cheackFriendRequest) {
      return next(new ApiError("no conversation found", 400));
    }

    if (cheackFriendRequest) {
      const recieverId = cheackFriendRequest.dataValues.recieverId;
      const match = req.id === recieverId;
      const value = cheackFriendRequest.dataValues.state;

      if (value === "pending" && match == false) {
        return next(new ApiError("sender can not reject request", 400));
      }
      if (value === "pending" && match == true) {
        await conversation.destroy({
          where: {
            recieverId: req.id,
          },
        });
        return next(new ApiError("friend request is  reject ", 200));
      }
    }
  } catch (e: any) {
    return next(new ApiError(e.message, 400));
  }
};

export let seeFriendRequest = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = req.id;

    const userData = await conversation.findAll({
      where: {
        recieverId: id,
        state: "pending",
      },
      attributes: ["senderId"],
      include: [
        {
          model: users,
          attributes: ["email", "fullName", "id"],
          as: "sender",
        },
      ],
    });

    if (userData.length == 0) {
      return next(new ApiError("no  friend  request is found", 404));
    }

    return res.json({
      statusCode: 200,
      data: userData,
    });
  } catch (e: any) {
    return next(new ApiError(e, 404));
  }
};

export let seeSenderRequest = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = req.id;

    const userData = await conversation.findAll({
      where: {
        senderId: id,
        isAccepted: false,
      },
      attributes: ["senderId"],
      include: [
        {
          model: users,
          attributes: ["email", "fullName", "id"],
          as: "reciever",
        },
      ],
    });

    if (userData.length == 0) {
      return next(new ApiError("no  friend  request is found", 204));
    }

    return res.json({
      statusCode: 200,
      data: userData,
    });
  } catch (e: any) {
    // if (e instanceof Error) = e.message
    return next(new ApiError(e, 404));
  }
};

export let blockMessage = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const myId = uuid();
    const id = req.params.id;
    const numberId: any = id.replace(/[' "]+/g, "");
    const checkId = validate(numberId);
    if (checkId === false) {
      return res.json({
        statusCode: 400,
        message: "please put valid id",
      });
    }
    const conversationData = await conversation.findOne({
      where: {
        [Op.or]: [
          {
            senderId: req.id,
          },
          {
            recieverId: req.id,
          },
        ],
      },
    });
    if (!conversationData) {
      const connversationBlock = await conversation.create({
        id: myId,
        senderId: req.id,
        recieverId: numberId,

        state: "blocked",
      });

      return res.json({
        statusCode: 200,
        message: "user blocked successfully",
      });
    }
    if (conversationData) {
      const value = conversationData.dataValues.state;
      if (value === "blocked") {
        await conversationData.update(
          { state: "accepted" },
          {
            where: {
              senderId: req.id,
              recieverId: numberId,
            },
          }
        );
        return res.json({
          statusCode: 200,
          message: "user un-blocked successfully",
        });
      } else {
        await conversationData.update(
          { state: "blocked" },
          {
            where: {
              senderId: req.id,
              recieverId: numberId,
            },
          }
        );
        return res.json({
          statusCode: 200,
          message: "user blocked successfully",
        });
      }
    }
  } catch (e: any) {
    return res.json({
      statusCode: 400,
      message: e.message,
    });
  }
};

export let unFriend = async (req: any, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id;
    const numberId: any = id.replace(/[' "]+/g, "");

    const checkId = validate(numberId);
    if (checkId === false) {
      return next(new ApiError("please put valid id ", 400));
    }

    if (req.id == numberId) {
      return next(new ApiError("can not unfriend ", 404));
    }
    const cheackFriend = await conversation.findOne({
      where: {
        id: numberId,
        [Op.or]: [
          {
            senderId: req.id,
          },
          {
            recieverId: req.id,
          },
        ],
      },
    });
    if (!cheackFriend) {
      return res.json({
        statusCode: 404,
        message: "you are not friend",
      });
    }
    if (cheackFriend) {
      const state = cheackFriend.dataValues.state;
      if (state != "accepted") {
        return res.json({
          statusCode: 400,
          message: "you are not friend so you can not unfriend",
        });
      }
      if (state === "accepted") {
        await conversation.update(
          {
            state: "unfriend",
          },
          {
            where: {
              id: numberId,
            },
          }
        );
      }
    }
  } catch (e: any) {
    return next(new ApiError(e.message, 400));
  }
};
