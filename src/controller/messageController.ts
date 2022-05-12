const { messages, conversation, users } = require("../../models/");
import sequelize, { where } from "sequelize";
import { Request, Response } from "express";

export let sendMessage = async (req: any, res: Response) => {
  try {
    const Op = sequelize.Op;
   const id = req.params.id;
    const { message } = req.body;
    const numberId: any = id.replace(/[' "]+/g, "");
    if (Number.isNaN(parseInt(numberId)) === true) {
      return res.json({
        statusCode: 400,
        message: "id type is string",
      });
    }

    const cheackFriendRequest = await conversation.findOne({
      where: {
        id: numberId,
        isAccepted: true,
      },
    });
    if (!cheackFriendRequest) {
      return res.json({
        statusCode: 404,
        message: "you are not friend",
      });
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

    if (cheacksender) {
      const senderName = cheacksender.sender.dataValues.fullName;
      const senderData = `${messageData.dataValues.messages[0]} ,${senderName}:${message}`;
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
        const data: any = `${messageData.dataValues.messages}, ${senderName}:${message}`;
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
      const recieverData = `${messageData.dataValues.messages[0]} ,${recieverName}:${message}`;
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
        const data: any = `${messageData.dataValues.messages}, ${recieverName}:${message}`;
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
    }
  } catch (e: any) {
    console.log(e);

    return res.json({
      statusCode: 400,
      message: e.message,
    });
  }
};
