import dotenv from "dotenv";
dotenv.config();

export const Config = {
  GITHUB_TOKEN: process.env.GITHUB_TOKEN,
  PORT: process.env.PORT,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY as string,
  GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID as string,
  GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET as string,
  SESSION_SECRET: process.env.SESSION_SECRET as string,
  CLIENT_URL: process.env.CLIENT_URL as string,
};
