import nodemailer from "nodemailer";
import { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
const { users } = require("../../models/");
dotenv.config();

import * as jwt from "jsonwebtoken";

export let tokenVarify = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    let secretKey: any = process.env.SECRET_KEY;
    let token: any = req.headers.authorization;
    if (!token) {
      return res.status(400).json({
        message: "A token is required for authentication",
        status: 400,
        success: false,
      });
    } else {
      const authHeader: any = req.headers.authorization;
      const bearerToken: any = authHeader.split(" ");
      let myToken: any = bearerToken[1];
      jwt.verify(myToken, secretKey, async (error: any, payload: any) => {
        if (payload) {
          req.id = payload.id;
          next();
        } else {
          return res.status(400).json({
            success: false,
            message: "Invalid token",
            data: error.message,
          });
        }
      });
    }
  } catch (e: any) {
    return res.json({
      success: false,
      statusCode: 400,
      message: e.message,
    });
  }
};

export let sendMail = async (req: Request, res: Response, result) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.MY_MAIL,
        pass: process.env.MY_PASSWORD,
      },
    });
    const mailOptions = {
      from: process.env.MY_MAIL,
      to: req.body.email,
      subject: "Verify your mail",
      html: `<a href="http://localhost:8000/api/auth/user/verifyEmail/${result}"> verify otp </a>`,
      text: `Hey,it's our link to veriy the account and will going to expire in 10 mins `,
    };
    transporter.sendMail(mailOptions, function (error: any, info: any) {
      if (error) {
        console.log(">>>>>>>>>>", error);
      } else {
        console.log("Email sent: " + info.response);
      }
    });
  } catch (e: any) {
    return res.json({
      statusCode: 400,
      message: e.message,
    });
  }
};

export let userVerifiedEmail = async (req: Request, res: Response) => {
  try {
    const secretKey: any = process.env.SECRET_KEY;
    const otp = req.params.otp;
    const otpNumber = parseInt(otp);
    const findData = await users.findOne({
      where: {
        otp: otpNumber,
      },
    });
    if (!otp) {
      return res.json({
        statusCode: 400,
        message: "otp not found",
      });
    }
    if (!findData) {
      return res.json({
        statusCode: 400,
        message: "user not found",
      });
    }
    const id = findData.dataValues.id;
    const finalResult = findData.dataValues.otp;
    if (finalResult != otp) {
      return res.json({
        statusCode: 400,
        message: "otp are not match",
      });
    }
    const jwtToken = await jwt.sign({ id: id }, secretKey, {
      expiresIn: "24h",
    });

    const values = findData.dataValues.isVerified;
    if (values === true) {
      return res.json({
        statusCode: 400,
        message: "already verified",
        data: jwtToken,
      });
    }

    if (values === false) {
      const update = await users.update(
        { isVerified: true },
        {
          where: {
            otp: otpNumber,
          },
        }
      );
      return res.json({
        message: "Email verified successful",
        success: true,
        data: jwtToken,
      });
    }
  } catch (e: any) {
    console.log("<<<<<<<<<<", e);
    return res.json({
      success: false,
      statusCode: 400,
      message: e.message,
    });
  }
};
