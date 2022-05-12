const { conversation, users } = require("../../models/");
import sequelize from "sequelize";
import { Request, Response } from "express";

export let sendFriendRequest = async (req: any, res: Response) => {
  try {
    const id = req.params.id;
    const numberId: any = id.replace(/[' "]+/g, "");

    if (Number.isNaN(parseInt(numberId)) === true) {
      return res.json({
        statusCode: 400,
        message: "id type is string",
      });
    }

    const recieverData: any = await users.findOne({
      where: {
        id: numberId,
      },
    });
    console.log(recieverData);

    if (!recieverData) {
      return res.json({
        statusCode: 404,
        message: "data not found",
      });
    } else {
      const cheackFriendRequest = await conversation.findOne({
        where: {
          recieverId: numberId,
        },
      });
      if (cheackFriendRequest) {
        return res.json({
          statusCode: 400,
          message: "already send friend request",
        });
      }

      const createData = await conversation.create({
        senderId: req.id,
        recieverId: numberId,
      });

      return res.json({
        statusCode: 201,
        message: "friend request is send",
      });
    }
  } catch (e: any) {
    return res.json({
      statusCode: 400,
      message: e.message,
    });
  }
};

export let friendRequestAccept = async (req: any, res: Response) => {
  try {
    const id = req.params.id;
    const numberId: any = id.replace(/[' "]+/g, "");

    if (Number.isNaN(parseInt(numberId)) === true) {
      return res.json({
        statusCode: 400,
        message: "id type is string",
      });
    }

    const recieverData: any = await users.findOne({
      where: {
        id: numberId,
      },
    });

    if (!recieverData) {
      return res.json({
        statusCode: 404,
        message: "data not found",
      });
    } else {
      const cheackFriendRequest = await conversation.findOne({
        where: {
          senderId: numberId,
          recieverId: req.id,
          isAccepted: true,
        },
      });
      if (cheackFriendRequest) {
        return res.json({
          statusCode: 400,
          message: "already accepted",
        });
      }

      const updateData = await conversation.update(
        { isAccepted: true, isRejected: false },
        {
          where: {
            senderId: numberId,
            recieverId: req.id,
          },
        }
      );
      return res.json({
        statusCode: 201,
        message: "friend request is accepted",
      });
    }
  } catch (e: any) {
    return res.json({
      statusCode: 400,
      message: e.message,
    });
  }
};

export let friendRequestReject = async (req: any, res: Response) => {
  try {
    const id = req.params.id;
    const numberId: any = id.replace(/[' "]+/g, "");

    if (Number.isNaN(parseInt(numberId)) === true) {
      return res.json({
        statusCode: 400,
        message: "id type is string",
      });
    }

    const recieverData: any = await users.findOne({
      where: {
        id: numberId,
      },
    });

    if (!recieverData) {
      return res.json({
        statusCode: 404,
        message: "data not found",
      });
    } else {
      const cheackFriendRequest = await conversation.findOne({
        where: {
          recieverId: req.id,
          senderId: numberId,
          isAccepted: false,
        },
      });
      if (cheackFriendRequest) {
        return res.json({
          statusCode: 400,
          message: "already reject request",
        });
      }

      const DeleteData = await conversation.destroy({
        where: {
          senderId: numberId,
          recieverId: req.id,
        },
      });
      return res.json({
        statusCode: 201,
        message: "friend request is rejected",
      });
    }
  } catch (e: any) {
    return res.json({
      statusCode: 400,
      message: e.message,
    });
  }
};

export let seeFriendRequest = async (req: any, res: Response) => {
  try {
    const id = req.id;

    const userData = await conversation.findAll({
      where: {
        recieverId: id,
      },
      attributes: ["recieverId"],
      include: [
        {
          model: users,
          attributes: ["email", "fullName", "id"],
          as: "users",
        },
      ],
    });
    if (userData.length == 0) {
      return res.json({
        statusCode: 404,
        message: "data not found",
      });
    }

    return res.json({
      statusCode: 200,
      data: userData,
    });
  } catch (e: any) {
    return res.json({
      statusCode: 400,
      message: e.message,
    });
  }
};
