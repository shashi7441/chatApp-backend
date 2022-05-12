import expres from "express";
import { userSignupValidation } from "../middleware/userValidation";
import { signup , searchFriend} from "../controller/userController";
import { userVerifiedEmail } from "../services/userService";
export let userRoutes = expres.Router();

userRoutes.post("/signup", userSignupValidation, signup);
userRoutes.get("/verifyEmail/:otp", userVerifiedEmail);

userRoutes.get("/", searchFriend)