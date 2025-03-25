import express, { Request, Response, NextFunction } from "express";
import { Config } from "../config";
import {
  extractJsonFromMarkdown,
  fetchRepoTree,
  getAIResponse,
  reviewFile,
} from "./lib/utils";
import { CodeReview, GitUrlResponse, TreeNode } from "./lib/interfaces";
import cors from "cors";
// Enable CORS for all routes

const app = express();
app.use(cors());

app.use(express.json());

const port = Config.PORT;

app.get("/", (req: Request, res: Response) => {
  res.send("Hello, TypeScript!");
});

app.post("/gitUrl", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { gitUrl } = req.body;
    if (!gitUrl) {
      res.status(400).json({ error: "Git URL is required" });
      return;
    }

    const match = gitUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
    if (!match) {
      res.status(400).json({ error: "Invalid GitHub URL" });
      return;
    }

    const [_, owner, repo] = match;
    const data: Partial<TreeNode>[] = await fetchRepoTree(owner, repo);

    const fileTree = data.map((node) => node.path);

    const prompt = `
      I have a list of files from a GitHub repository. Analyze the file structure and identify which files are **useful for a code review** and which should be ignored.
      ### **Instructions:**
      - **Include:** Source code files (e.g., .js, .ts, .jsx, .tsx, .py, .java, .go, .cpp, .cs, etc.).
      - **Exclude:**
        - Configuration files (e.g., .env, .gitignore, package.json, package-lock.json, yarn.lock, tsconfig.json, webpack.config.js).
        - Dependency files (e.g., node_modules, vendor, .cache).
        - Build outputs (e.g., dist/, out/, build/).
        - Documentation files (e.g., README.md, LICENSE, CHANGELOG.md).
        - Assets (e.g., images, fonts, icons, .png, .jpg, .svg, .woff).

      ### **Expected Output:**
      Return only a **JSON array** of the relevant files for code review. **Do not include additional text, explanations, or metadata.**

      **File Tree for Analysis:**
      \`\`\`json
      ${JSON.stringify(fileTree)}
      \`\`\`
    `;

    const aiRes = await getAIResponse(prompt);
    const jsonContent = extractJsonFromMarkdown(aiRes);
    if (!jsonContent) {
      res.status(500).json({ error: "Failed to parse AI response" });
      return;
    }

    const filteredData = data.filter(
      (node) =>
        node.path && jsonContent.includes(node.path) && node.type === "blob"
    );

    const fullReview: CodeReview[] = [];
    for (const node of filteredData) {
      try {
        const review = await reviewFile(node.url!, node.path!);
        fullReview.push(review);
      } catch (error) {
        console.error(`Error reviewing ${node.path}:`, error);
      }
    }

    const response: GitUrlResponse = {
      status: "success",
      data: fullReview,
    };

    res.json(response);
  } catch (error) {
    console.error("Error processing GitHub URL:", error);
    res.status(500).json({
      error: "Internal server error",
      details: error instanceof Error ? error.message : String(error),
    });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
