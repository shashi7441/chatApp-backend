// import passport from "passport";
// require("./passport");

// export let data = (req: any, res: any) => {
//   try {
//     console.log("lkkkkkk");

//     passport.authenticate("google", { scope: ["profile", "email"] });
//   } catch (e: any) {}
// };

// export let googleCallback = (req: any, res: any) => {
//   try {
//     passport.authenticate("google", { failureRedirect: "/failed" }),
//       function (req: any, res: any) {
//         console.log("WWWWWWWWW", req.user.email);
//         const value = req.user.email;

//         res.redirect("/good");
//       };
//   } catch (e: any) {
//     return res.json({
//       statusCode: 400,
//       message: e.message,
//     });
//   }
// };
