import { Router } from "express";
import passport from "passport";
import { Config } from "../../config";

const router = Router();

router.get("/github", passport.authenticate("github"));

router.get(
  "/github/callback",
  passport.authenticate("github", {
    failureRedirect: "/login",
    successRedirect: Config.CLIENT_URL,
  })
);

router.get("/logout", (req, res) => {
  req.logout(() => {
    res.redirect("/");
  });
});

router.get("/user", (req, res) => {
  if (req.isAuthenticated()) {
    console.log(req.user);
    res.json(req.user);
  } else {
    res.status(401).json({ error: "Not authenticated" });
  }
});

export default router;
