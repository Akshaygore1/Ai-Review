import express from "express";
import { Config } from "../config";
import cors from "cors";
import session from "express-session";
import passport from "passport";
import gitUrlRouter from "./routes/gitUrl";
import authRouter from "./routes/auth";
import { errorHandler } from "./middleware/errorHandler";
import "./config/passport";

const app = express();

// Middleware
app.use(
  cors({
    origin: Config.CLIENT_URL.replace(/\/$/, ""), // Remove trailing slash if present
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Accept",
      "X-Requested-With",
    ],
    exposedHeaders: ["Set-Cookie"],
  })
);

app.use(express.json());
app.use(
  session({
    secret: Config.SESSION_SECRET || "your-secret-key",
    resave: false,
    saveUninitialized: false,
    proxy: true,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000,
      httpOnly: true,
      path: "/",
      domain: process.env.NODE_ENV === "production" ? undefined : "localhost",
    },
  })
);

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.get("/", (_, res) => {
  res.json({ status: "ok", message: "AI Code Reviewer API" });
});
app.use("/auth", authRouter);
app.use("/gitUrl", gitUrlRouter);

// Error handling
app.use(errorHandler);

const port = Config.PORT;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
