import { Router } from "express";
import passport from "passport";
import { Config } from "../../config";
import axios from "axios";
import { get } from "http";
import { getRepos } from "../lib/utils";

const router = Router();

router.get("/github", passport.authenticate("github"));

router.get(
  "/github/callback",
  passport.authenticate("github", {
    failureRedirect: "/login",
    successRedirect: `${Config.CLIENT_URL}`,
  })
);

router.get("/logout", (req, res) => {
  req.logout(() => {
    res.redirect("/");
  });
});

router.get("/user", async (req, res) => {
  if (req.isAuthenticated() && req.user) {
    const user = req.user as any;
    const reposUrl = user._json?.repos_url;
    const repos = await getRepos(reposUrl);
    res.json({
      name: user.name || user.displayName,
      username: user.login || user.username,
      repos_url: user.repos_url || user._json?.repos_url,
      repos: repos,
    });
  } else {
    res.status(401).json({ error: "Not authenticated" });
  }
});

export default router;
