import dotenv from "dotenv";
dotenv.config();

export const Config = {
  GITHUB_TOKEN: process.env.GITHUB_TOKEN,
  PORT: process.env.PORT,
  GOOGLE_API_KEY: process.env.GEMINI_KEY as string,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY as string,
};
