const { conversation, users } = require("../../models/");
import { Op } from "sequelize";
import { Request, Response, NextFunction } from "express";
import { ApiError } from "../services/error";

// interface error {
//   message: String;
// }

export let sendFriendRequest = async (
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
    } else {
      const cheackFriendRequest = await conversation.findOne({
        where: {
          senderId: { [Op.or]: [req.id, numberId] },
          recieverId: { [Op.or]: [req.id, numberId] },
        },
      });

      if (cheackFriendRequest) {
        return next(new ApiError("already send friend request", 400));
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

    if (Number.isNaN(parseInt(numberId)) === true) {
      return next(new ApiError("id type is string", 400));
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
    } else {
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
        const value = cheackFriendRequest.dataValues.isAccepted;
        if (value == true) {
          return next(new ApiError("already friend request accepted", 400));
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
    }
  } catch (e: any) {
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

    if (Number.isNaN(parseInt(numberId)) === true) {
      return next(new ApiError("id type is string", 400));
    }

    const recieverData: any = await users.findOne({
      where: {
        id: numberId,
      },
    });

    if (req.id == numberId) {
      return next(new ApiError("can not reject request ", 404));
    }

    if (!recieverData) {
      return next(new ApiError("no user found", 404));
    } else {
      const cheackFriendRequest = await conversation.findOne({
        where: {
          senderId: { [Op.or]: [req.id, numberId] },
          recieverId: { [Op.or]: [req.id, numberId] },
        },
      });
      if (!cheackFriendRequest) {
        return next(new ApiError("no conversation found ", 400));
      }
      if (cheackFriendRequest) {
        const value = cheackFriendRequest.dataValues.isRejected;
        if (value === true) {
          return next(new ApiError("already reject request", 400));
        } else {
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
        isAccepted: false,
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

    // if (e instanceof Error) = e.message
    return next(new ApiError(e, 404));
  }
};
