import passport from "passport";
import { Strategy as GitHubStrategy } from "passport-github2";
import { Config } from "../../config";
import { Profile } from "passport-github2";
import { Request, Response, NextFunction } from "express";

passport.serializeUser(
  (user: Express.User, done: (err: any, id?: any) => void) => {
    done(null, user);
  }
);

passport.deserializeUser(
  (
    user: Express.User,
    done: (err: any, user?: Express.User | false | null) => void
  ) => {
    done(null, user);
  }
);

passport.use(
  new GitHubStrategy(
    {
      clientID: Config.GITHUB_CLIENT_ID,
      clientSecret: Config.GITHUB_CLIENT_SECRET,
      callbackURL: `http://localhost:${Config.PORT}/auth/github/callback`,
      scope: ["user:email", "read:user"],
    },
    async (
      accessToken: string,
      refreshToken: string,
      profile: Profile,
      done: (error: any, user?: Express.User | false | null) => void
    ) => {
      try {
        // Here you can implement user storage logic
        // For now, we'll just pass the profile
        return done(null, profile as Express.User);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

export default passport;
