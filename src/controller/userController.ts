import { Request, Response } from "express";
const { users } = require("../../models");
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import otpGenerator from "otp-generator";
import sequelize from "sequelize";

import { sendMail } from "../services/userService";
import { userSignupValidation } from "../middleware/userValidation";
dotenv.config();
export let signup = async (req: Request, res: Response) => {
  try {
    const createOtp = await otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      specialChars: false,
      digits: true,
      lowerCaseAlphabets: false,
    });

    const secretKey: any = process.env.SECRET_KEY;
    let {
      fullName,
      email,
      otp,
      password,
    }: { fullName: string; email: string; otp: number; password: string } =
      req.body;
    const emailTrim = email.trim();
    let passwordTrim = password.trim();
    let fullNameTrim = fullName.trim();
    const salt: any = await bcrypt.genSalt(10);
    const hash: string = await bcrypt.hash(passwordTrim, salt);
    const findData = await users.findOne({
      where: {
        email: emailTrim,
      },
    });
    if (!findData) {
      const createData = await users.create({
        fullName: fullNameTrim,
        email: emailTrim,
        password: hash,
      });
      const findCreateData = await users.findOne({
        where: { email: emailTrim },
      });

      const updateData = await users.update(
        { otp: createOtp },
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

      await sendMail(req, res, result);

      const databaseId = findCreateData.dataValues.id;
      const databasePassword = findCreateData.dataValues.password;
      const passwordMatch = await bcrypt.compare(
        passwordTrim,
        databasePassword
      );
      const values = findCreateData.dataValues.isVerified;
      if (!passwordMatch) {
        return res.json({
          statusCode: 400,
          message: "Invalid credential",
        });
      }
      if (values === false) {
        return res.json({
          statusCode: 400,
          message: "please verify by email ",
        });
      }
      if (values === true) {
        if (passwordMatch) {
          const jwtToken = await jwt.sign({ id: databaseId }, secretKey, {
            expiresIn: "24h",
          });
          return res.json({
            statusCode: 400,
            message: "login successfully",
            data: jwtToken,
          });
        }
      }
    } else {
      const myName = findData.dataValues.fullName;

      const loginPassword = findData.dataValues.password;
      const loginId = findData.dataValues.id;
      const verified = findData.dataValues.isVerified;
      const passwordMatch = await bcrypt.compare(passwordTrim, loginPassword);

      const updateData = await users.update(
        { otp: createOtp },
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
      await sendMail(req, res, result);

      if (!passwordMatch) {
        return res.json({
          statusCode: 400,
          message: "Invalid credential",
        });
      }
      if (myName != fullNameTrim) {
        return res.json({
          statusCode: 400,
          message: "invalid credential",
        });
      }

      if (verified === false) {
        return res.json({
          statusCode: 400,
          message: "please verify email",
        });
      }
      if (verified === true) {
        if (passwordMatch) {
          const jwtToken = await jwt.sign({ id: loginId }, secretKey, {
            expiresIn: "24h",
          });
          return res.json({
            statusCode: 400,
            message: "login successfully",
            data: jwtToken,
          });
        }
      }
    }
  } catch (e: any) {
    console.log(e);

    return res.status(400).json({
      statusCode: 400,
      message: e.message,
    });
  }
};

export let searchFriend = async (req: Request, res: Response) => {
  try {
    const search: any = req.query.search;

    if (search) {
      const originalSearch = search.replace(/[' "]+/g, "");
      const Op = sequelize.Op;
      const userData = await users.findAll({
        where: {
          fullName: {
            [Op.iRegexp]: `${originalSearch}`,
          },
        },
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
    } else {
      const userData = await users.findAll({});
      return res.json({
        statusCode: 200,
        data: userData,
      });
    }
  } catch (e: any) {
    console.log(e);

    return res.json({
      statusCode: 400,
      message: e.message,
    });
  }
};
