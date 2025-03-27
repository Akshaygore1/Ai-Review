import { Config } from "../../config";

export const authConfig = {
  github: {
    clientID: Config.GITHUB_CLIENT_ID,
    clientSecret: Config.GITHUB_CLIENT_SECRET,
    callbackURL: `http://localhost:${Config.PORT}/auth/github/callback`,
    scope: ["user:email", "read:user"],
  },
  session: {
    secret: "your-session-secret", // Change this to a secure secret in production
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  },
};
