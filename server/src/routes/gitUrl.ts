import { Router, Request, Response, NextFunction } from "express";
import { CodeReview, GitUrlResponse, TreeNode } from "../lib/interfaces";
import { GitService } from "../services/gitService";
import { HttpError } from "../middleware/errorHandler";

const router = Router();

router.post("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { gitUrl } = req.body;
    if (!gitUrl) {
      throw new HttpError("Git URL is required", 400);
    }

    const match = gitUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
    if (!match) {
      throw new HttpError("Invalid GitHub URL", 400);
    }

    const [_, owner, repo] = match;
    const data: Partial<TreeNode>[] = await GitService.fetchRepoTree(
      owner,
      repo
    );
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

    const aiRes = await GitService.getAIResponse(prompt);
    const jsonContent = GitService.extractJsonFromMarkdown(aiRes);
    if (!jsonContent) {
      throw new HttpError("Failed to parse AI response", 500);
    }

    const filteredData = data.filter(
      (node) =>
        node.path && jsonContent.includes(node.path) && node.type === "blob"
    );

    const fullReview: CodeReview[] = [];
    for (const node of filteredData) {
      try {
        const review = await GitService.reviewFile(node.url!, node.path!);
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

export default router;
