import { Request, Response, NextFunction } from "express";
const { users } = require("../../models");
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import { ApiError } from "../services/error";
import sequelize, { Op } from "sequelize";
import { html, createOtp, realOtp } from "../services/otpMailTemplate";
import { sendMail } from "../services/userService";
import { v4 as uuid } from "uuid";
dotenv.config();

export let signup = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const myId = uuid();
    const secretKey: any = process.env.SECRET_KEY;
    const otpExp = new Date(new Date().getTime() + 5 * 60000);
    let { email, password }: { email: string; password: string } = req.body;
    const emailTrim = email.trim();
    let passwordTrim = password.trim();
    const salt: any = await bcrypt.genSalt(10);
    const hash: string = await bcrypt.hash(passwordTrim, salt);
    const findData = await users.findOne({
      where: {
        email: emailTrim,
      },
    });
    if (!findData) {
      const { fullName }: { fullName: string } = req.body;
      if (!fullName) {
        return res.json({
          statusCode: 422,
          message: "fullName is required",
        });
      }
      if (fullName.length < 3) {
        return res.json({
          statusCode: 400,
          message: "charcter lenght should be 3",
        });
      }
      let fullNameTrim: string = fullName.trim();
      const createData = await users.create({
        fullName: fullNameTrim,
        email: emailTrim,
        password: hash,
        id: myId,
      });
      const findCreateData = await users.findOne({
        where: { email: emailTrim },
      });
      const updateData = await users.update(
        { otp: realOtp, otpExpTime: otpExp },

        {
          where: {
            email: emailTrim,
          },
        }
      );
      const originalData = await users.findOne({
        where: {
          email: emailTrim,
        },
      });
      const result: number = originalData.dataValues.otp;
      await sendMail(req, res, html);
      const databaseId = findCreateData.dataValues.id;
      const databasePassword = findCreateData.dataValues.password;
      const passwordMatch = await bcrypt.compare(
        passwordTrim,
        databasePassword
      );
      const values = findCreateData.dataValues.isVerified;
      if (!passwordMatch) {
        return next(new ApiError("Invalid credential", 400));
      }
      if (values === false) {
        return next(new ApiError("please verify by email ", 400));
      }
      if (values === true) {
        if (passwordMatch) {
          const jwtToken = await jwt.sign({ id: databaseId }, secretKey, {
            expiresIn: "24h",
          });
          return res.json({
            statusCode: 200,
            message: "login successfully",
            data: jwtToken,
          });
        }
      }
    } else {
      const loginPassword = findData.dataValues.password;
      const loginId = findData.dataValues.id;
      const verified = findData.dataValues.isVerified;
      const passwordMatch = await bcrypt.compare(passwordTrim, loginPassword);
      const updateData = await users.update(
        { otp: realOtp, otpExpTime: otpExp },
        {
          where: {
            email: emailTrim,
          },
        }
      );
      const originalData = await users.findOne({
        where: {
          email: emailTrim,
        },
      });
      const result: number = originalData.dataValues.otp;
      await sendMail(req, res, html);
      const { fullName } = req.body;

      if (fullName) {
        return next(new ApiError("fullName not required", 400));
      }

      if (!passwordMatch) {
        return next(new ApiError("Invalid credential", 400));
      }
      if (verified === false) {
        return next(new ApiError("please verify email", 400));
      }
      if (verified === true) {
        if (passwordMatch) {
          const jwtToken = await jwt.sign({ id: loginId }, secretKey, {
            expiresIn: "24h",
          });
          return res.json({
            statusCode: 200,
            message: "login successfully",
            data: jwtToken,
          });
        }
      }
    }
  } catch (e: any) {
    console.log(e);

    return next(new ApiError(e.message, 400));
  }
};

export let searchFriend = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const search: any = req.query.search;

    if (search) {
      const originalSearch = search.replace(/[' "]+/g, "");
      const Op = sequelize.Op;
      const userData = await users.findAll(
        {
          where: {
            id: {
              [Op.ne]: [req.id],
            },

            fullName: {
              [Op.iRegexp]: `${originalSearch}`,
            },
            isVerified: true,
          },
        },
        { attributes: ["email", "fullName", "id"] }
      );
      if (userData.length == 0) {
        return next(new ApiError("data not found", 400));
      }

      return res.json({
        statusCode: 200,
        data: userData,
      });
    } else {
      const userData = await users.findAll({
        where: {
          id: {
            [Op.ne]: [req.id],
          },
        },
        attributes: ["email", "fullName", "id"],
      });
      return res.json({
        statusCode: 200,
        data: userData,
      });
    }
  } catch (e: any) {
    return next(new ApiError(e.message, 400));
  }
};
