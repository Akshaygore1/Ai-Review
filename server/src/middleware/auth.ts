import session from "express-session";
import { Express } from "express";
import passport from "../config/passport";
import { authConfig } from "../config/auth";

export function setupAuth(app: Express) {
  // Initialize session middleware
  app.use(session(authConfig.session));

  // Initialize passport and session support
  app.use(passport.initialize());
  app.use(passport.session());
}

export function isAuthenticated(req: any, res: any, next: any) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: "Not authenticated" });
}
