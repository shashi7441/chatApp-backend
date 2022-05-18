const { messages, conversation, users } = require("../../models/");




import sequelize, { Op, Sequelize } from "sequelize";
import crypto from "crypto";

import { Request, Response, NextFunction } from "express";
import { ApiError } from "../services/error";
export let sendMessage = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const Op = sequelize.Op;
    const id = req.params.id;
    const { message } = req.body;
    const numberId: any = id.replace(/[' "]+/g, "");
    if (Number.isNaN(parseInt(numberId)) === true) {
      return next(new ApiError("id type is string", 400));
    }
    const randomValue = crypto.randomBytes(2).toString("hex");
    if (message.length == 0) {
      return res.json({
        statusCode: 400,
        message: "message not be empty",
      });
    }
    const messageTrim: string = message.trim();

    const cheackFriendRequest = await conversation.findOne({
      where: {
        id: numberId,
        isAccepted: true,
      },
    });

    if (!cheackFriendRequest) {
      return next(new ApiError("you are not friend", 404));
    }

    const cheacksender = await conversation.findOne({
      where: {
        senderId: req.id,
        isAccepted: true,
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
        recieverId: req.id,
        isAccepted: true,
      },
      include: [
        {
          model: users,
          attributes: ["fullName"],
          as: "reciever",
        },
      ],
    });

    const messageData = await messages.findOne({
      where: {
        conversationId: numberId,
      },
    });
    if (messageData) {
      const blockValue = messageData.dataValues.isBlocked;
      if (blockValue === true) {
        return res.json({
          statusCode: 400,
          message: "account is blocked you can not  send message",
        });
      }
    }
    if (cheacksender) {
      const senderName = cheacksender.sender.dataValues.fullName;
      const senderData = `${randomValue}-${senderName}:${messageTrim}`;
      if (!messageData) {
        const createData = await messages.create({
          messages: [senderData],
          conversationId: numberId,
        });
        return res.json({
          statusCode: 200,
          message: "message send successfully",
        });
      } else {
        const value = messageData.dataValues.messages;
        const data = value.push(`${randomValue}-${senderName}:${messageTrim}`);
        const updateData = await messages.update(
          {
            messages: [data],
          },
          {
            where: {
              conversationId: numberId,
            },
          }
        );
        return res.json({
          statusCode: 200,
          message: "message send successfully",
        });
      }
    } else if (cheackReciever) {
      const recieverName = cheackReciever.reciever.dataValues.fullName;
      const recieverData = `${randomValue}-${recieverName}:${messageTrim}`;
      if (!messageData) {
        const createData = await messages.create({
          messages: [recieverData],
          conversationId: numberId,
        });
        return res.json({
          statusCode: 200,
          message: "message send successfully",
        });
      } else {
        const value = messageData.dataValues.messages;

        const data = value.push(
          `${randomValue}-${recieverName}:${messageTrim}`
        );
        const updateData = await messages.update(
          {
            messages: value,
          },
          {
            where: {
              conversationId: numberId,
            },
          }
        );
        return res.json({
          statusCode: 200,
          message: "message send successfully",
        });
      }
    }
  } catch (e: any) {
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
    if (Number.isNaN(parseInt(numberId)) === true) {
      return next(new ApiError("id type is string", 404));
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
    const messageData = await messages.findOne({
      where: {
        conversationId: numberId,
      },
    });
    if (!conversationData) {
      return next(new ApiError("invalid credential", 404));
    }
    if (!messageData) {
      return next(new ApiError("data not found", 404));
    }
    if (messageData) {
      const data = messageData.dataValues.messages;
      const filterValue = data.map((element) => {
        const filterElement = element.split("-");
        return filterElement[1];
      });
      if (conversationData) {
        return res.json({
          statusCode: 200,
          messages: filterValue,
          data: messageData,
        });
      }
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
    const filterId = numberId.toString().toLowerCase();
    if (filterId.length != 4) {
      return res.json({
        messages: "id length should be 4",
      });
    }
    const { conversationId, ...other } = req.query;
    if (Object.entries(other).length != 0) {
      return res.json({
        statusCode: 400,
        message: "wrong Field",
      });
    }

    if (!conversationId) {
      return res.json({
        statusCode: 400,
        message: "conversation id is required",
      });
    }

    const conversationData = await conversation.findOne({
      where: {
        id: conversationId,
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
    if (!conversation) {
      return res.json({
        statusCode: 404,
        message: "you are not friend",
      });
    }

    if (conversation) {
      const messageData: any = await messages.findOne({
        where: {
          conversationId: conversationData.dataValues.id,
        },
      });
      const messsagesIterator = messageData.dataValues.messages;
      let result = messsagesIterator.find((element: any) => {
        if (element.includes(filterId)) {
          return true;
        }
      });

      if (!result) {
        return res.json({
          statusCode: 404,
          message: "no chat found",
        });
      }

      if (result) {
        const arrayIndex = messsagesIterator.indexOf(result);
        let result2 = messsagesIterator.splice(arrayIndex, 1);
        const updateData = await messages.update(
          { messages: messsagesIterator },
          {
            where: {
              conversationId: conversationData.dataValues.id,
            },
          }
        );
        return res.json({
          statusCode: 200,
          message: "chat deleted successfully",
        });
      }
    }
  } catch (e: any) {
    return next(new ApiError(e.message, 400));
  }
};

export let blockMessage = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = req.params.id;
    const numberId: any = id.replace(/[' "]+/g, "");
    if (Number.isNaN(parseInt(numberId)) === true) {
      return next(new ApiError("id type is string", 400));
    }
    const messageData = await messages.findOne({
      where: {
        conversationId: numberId,
      },
    });

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
        isAccepted: true,
      },
    });
    if (!messageData) {
      return next(new ApiError("no message found", 400));
    }
    if (!conversationData) {
      return next(new ApiError("no message found", 400));
    }
    if (messageData) {
      let value = messageData.isBlocked;
      if (value === false) {
        const updateData = await messages.update(
          { isBlocked: true },
          {
            where: {
              conversationId: numberId,
            },
          }
        );
        return res.json({
          statusCode: 200,
          message: "account is Blocked",
        });
      } else {
        const updateData = await messages.update(
          { isBlocked: false },
          {
            where: {
              conversationId: numberId,
            },
          }
        );
        return res.json({
          statusCode: 200,
          message: "account is un-Blocked",
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

export let deleteAllChat = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const numberId = req.params.id;
    if (Number.isNaN(parseInt(numberId)) === true) {
      return next(new ApiError("id type is string", 400));
    }
    const conversationData = await conversation.findOne({
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

    if (!conversationData) {
      return res.json({
        statusCode: 400,
        message: "you are not friend",
      });
    }

    let messageData = await messages.findOne({
      where: {
        conversationId: numberId,
      },
    });

    if (!messageData) {
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
      const deleteAllChat = await messages.update(
        { messages: [] },
        {
          where: {
            conversationId: numberId,
          },
        }
      );
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

export let searchMessages = async (req: Request, res: Response) => {
  try {
  } catch (e: any) {
    return res.json({
      statusCode: 400,
      message: e.message,
    });
  }
};
