const { messages, conversation, users } = require("../../models/");
import sequelize, { Op, Sequelize } from "sequelize";
import crypto from "crypto";
import { Request, Response, NextFunction } from "express";
import { ApiError } from "../services/error";
import { v4 as uuid, validate } from "uuid";

export let sendMessage = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const Op = sequelize.Op;
    const id = req.params.id;
    const myId = uuid();
    const { message } = req.body;
    const numberId: any = id.replace(/[' "]+/g, "");
    const checkId = validate(numberId);
    if (checkId === false) {
      return next(new ApiError("please put valid id ", 400));
    }
    if (message.length == 0) {
      return res.json({
        statusCode: 400,
        message: "message not be empty",
      });
    }
    const messageTrim: string = message.trim();

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
      return next(new ApiError("you are not friend", 404));
    }

    const cheacksender = await conversation.findOne({
      where: {
        id: numberId,
        senderId: req.id,
      },
      include: [
        {
          model: users,
          attributes: ["fullName"],
          as: "sender",
        },
      ],
    });

    const cheackReciever = await conversation.findOne({
      where: {
        id: numberId,
        recieverId: req.id,
      },
      include: [
        {
          model: users,
          attributes: ["fullName"],
          as: "reciever",
        },
      ],
    });

    // console.log(cheacksender);
    // console.log(cheackReciever);

    if (cheacksender) {
      const value = cheacksender.dataValues.state;
      if (value === "blocked") {
        return res.json({
          statusCode: 400,
          message: "blocked user can not send request",
        });
      }
      if (value === "pending") {
        return res.json({
          statusCode: 400,
          message: "you are not friend",
        });
      }
      if (value === "unfriend") {
        return res.json({
          statusCode: 400,
          message: "you are unfriend",
        });
      }
      if (value === "accepted") {
        await messages.create({
          id: myId,
          to: cheacksender.dataValues.recieverId,
          from: cheacksender.dataValues.senderId,
          conversationId: numberId,
          message: messageTrim,
          state: "unedited",
        });
        return res.json({
          statusCode: 200,
          message: "message send successfully",
        });
      }
    }

    if (cheackReciever) {
      const value = cheackReciever.dataValues.state;
      if (value === "blocked") {
        return res.json({
          statusCode: 400,
          message: "blocked user can not send request",
        });
      }
      if (value === "pending") {
        return res.json({
          statusCode: 400,
          message: "you are not friend",
        });
      }
      if (value === "unfriend") {
        return res.json({
          statusCode: 400,
          message: "you are unfriend",
        });
      }
      if (value === "accepted") {
        await messages.create({
          id: myId,
          to: cheackReciever.dataValues.senderId,
          from: cheackReciever.dataValues.recieverId,
          conversationId: numberId,
          state: "unedited",
          message: messageTrim,
        });
        return res.json({
          statusCode: 200,
          message: "message send successfully",
        });
      }
    }
  } catch (e: any) {
    console.log("dddd", e);

    return next(new ApiError(e.message, 404));
  }
};

export let seeMessages = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = req.params.id;
    const Op = sequelize.Op;
    const numberId: any = id.replace(/[' "]+/g, "");
    const checkId = validate(numberId);
    if (checkId === false) {
      return next(new ApiError("please put valid id ", 400));
    }
    const messageData = await messages.findAll({
      where: {
        conversationId: numberId,
        [Op.or]: [
          {
            to: req.id,
          },
          {
            from: req.id,
          },
        ],
      },
      include: [
        {
          model: users,
          as: "reciever",
          attributes: ["fullName", "id"],
        },
        {
          model: users,
          as: "sender",
          attributes: ["fullName", "id"],
        },
      ],
    });

    if (!messageData) {
      return res.json({
        statusCode: 200,
        message: "no chat found",
      });
    }
    if (messageData) {
      return res.json({
        statusCode: 200,
        messages: messageData,
      });
    }
  } catch (e: any) {
    return next(new ApiError(e.message, 404));
  }
};

export let deleteChats = async (
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
    const messageData = await messages.findOne({
      where: {
        id: numberId,
        [Op.or]: [
          {
            to: req.id,
          },
          {
            from: req.id,
          },
        ],
      },
    });
    if (!messageData) {
      return res.json({
        statusCode: 404,
        messages: "no chat found ",
      });
    }
    if (messageData) {
      const conversationId = messageData.dataValues.conversationId;
      const deleteChat = await messages.destroy({
        where: {
          conversationId: conversationId,
        },
      });
      return res.json({
        statusCode: 200,
        message: "chat deleted successfully",
      });
    }
  } catch (e: any) {
    return next(new ApiError(e.message, 400));
  }
};

export let deleteAllChat = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    let messageData = await messages.findAll({
      where: {
        from: req.id,
      },
    });

    if (messageData.length == 0) {
      return res.json({
        statusCode: "no chat found",
      });
    }

    if (messageData) {
      const checkMessage = messageData.dataValues.messages;
      if (checkMessage.length === 0) {
        return res.json({
          statusCode: 400,
          message: "chats already deleted",
        });
      }
      const deleteAllChat = await messages.destroy({
        where: {
          from: req.id,
        },
      });
      return res.json({
        statusCode: 400,
        messages: "all chat deleted successfully",
      });
    }
  } catch (e: any) {
    return res.json({
      statusCode: 400,
      message: e.message,
    });
  }
};

export let editmessage = async (
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
    let { message }: { message: string } = req.body;
    if (!message) {
      return res.json({
        statusCode: 400,
        message: "message is required",
      });
    }
    if (message.length == 0) {
      return res.json({
        statusCode: 400,
        message: "message not be empty",
      });
    }
    const messageTrim: string = message.trim();

    const messageData = await messages.findOne({
      where: {
        id: numberId,
        [Op.or]: [
          {
            to: req.id,
          },
          {
            from: req.id,
          },
        ],
      },
    });
    if (!messageData) {
      return res.json({
        statusCode: 400,
        message: "no chat found",
      });
    }
    const messageId = messageData.from;
    if (messageId != req.id) {
      return res.json({
        statusCode: 400,
        message: "you can not edit message",
      });
    } else {
      await messages.update(
        {
          message: messageTrim,
          state: "edited",
        },
        {
          where: {
            from: req.id,
          },
        }
      );
      return res.json({
        statusCode: 200,
        message: "message edited successfully",
      });
    }
  } catch (e: any) {
    return res.json({
      statusCode: 400,
      message: e.message,
    });
  }
};
