import axios, { AxiosError } from "axios";
import { Config } from "../../config";
import { TreeNode, GitHubTreeResponse, CodeReview } from "./interfaces";
import OpenAI from "openai";

const headers = {
  ...(Config.GITHUB_TOKEN && {
    Authorization: `Bearer ${Config.GITHUB_TOKEN}`,
  }),
  Accept: "application/vnd.github.v3+json",
};

const client = new OpenAI({
  apiKey: Config.OPENAI_API_KEY,
});

export async function fetchRepoTree(
  owner: string,
  repo: string
): Promise<Partial<TreeNode>[]> {
  try {
    const response = await axios.get<GitHubTreeResponse>(
      `https://api.github.com/repos/${owner}/${repo}/git/trees/main?recursive=1`,
      { headers }
    );

    if (!response.data?.tree) {
      throw new Error(
        "Invalid or missing 'tree' property in the response data."
      );
    }

    return response.data.tree.map((node) => ({
      path: node.path,
      url: node.url,
      type: node.type,
    }));
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      throw new Error(
        `GitHub API Error: ${axiosError.response?.status} - ${axiosError.response?.statusText}`
      );
    }
    throw new Error(
      `Error fetching repo tree: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

export async function getAIResponse(prompt: string): Promise<string> {
  try {
    const completion = await client.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error("No response received from AI.");
    }

    return response;
  } catch (error) {
    throw new Error(
      `Failed to get AI response: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

export async function fetchFileContent(url: string): Promise<string> {
  try {
    const response = await axios.get(url, { headers });
    if (!response.data?.content) {
      throw new Error("No content received from GitHub API");
    }
    return atob(response.data.content);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      throw new Error(
        `GitHub API Error: ${axiosError.response?.status} - ${axiosError.response?.statusText}`
      );
    }
    throw new Error(
      `Failed to fetch file content: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

export async function reviewFile(
  url: string,
  file: string
): Promise<CodeReview> {
  try {
    const decodedContent = await fetchFileContent(url);
    const prompt = `
            You are a senior code reviewer. Carefully analyze the following file: **${file}**.

            ### **Review Guidelines**:
            - Assess the code for **best practices, readability, maintainability, performance, security, and style**.
            - Identify potential **bugs, inefficiencies, security vulnerabilities, and naming inconsistencies**.
            - Ensure adherence to **proper error handling, API status codes, and modularity principles**.
            - If applicable, check for **unused variables, redundant code, and optimization opportunities**.
            Return only a **JSON array** of the relevant files for code review. **Do not include additional text, explanations, or metadata.**
            ### **Output Format (JSON)**:
            \`\`\`json
            {
              "fileName": "${file}",
              "isGoodQuality": boolean,
              "issues": [
                {
                  "type": "string (e.g., performance, security, style, best practice)",
                  "description": "Detailed explanation of the issue",
                  "severity": "low/medium/high",
                  "suggestedFix": "Recommended solution to improve the code"
                }
              ],
              "overallRating": "number between 0-10 (based on code quality, readability, and best practices)"
              "resoneForRating": "string (explanation for the overall rating)"
            }
            \`\`\`

            ### **Code to Review**:
            \`\`\`
            ${decodedContent}
            \`\`\`
    `;
    const response = await getAIResponse(prompt);
    const parsedResponse = extractJsonFromMarkdown(response);

    if (!parsedResponse) {
      throw new Error("Failed to parse AI response as JSON");
    }

    const review = JSON.parse(parsedResponse) as CodeReview;
    return review;
  } catch (error) {
    throw new Error(
      `Failed to review file ${file}: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

export function extractJsonFromMarkdown(response: string) {
  try {
    const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/);
    if (!jsonMatch) {
      // If no JSON block found, try parsing the entire response as JSON
      JSON.parse(response);
      return response;
    }
    const jsonContent = jsonMatch[1].trim();
    // Validate that the extracted content is valid JSON
    JSON.parse(jsonContent);
    return jsonContent;
  } catch (error) {
    return null;
  }
}

export async function getRepos(url: string | null | undefined) {
  if (!url) {
    return [];
  }
  const match = url.match(/github\.com\/([^/]+)\/([^/]+)/);
  if (!match) {
    return [];
  }
  const response = await axios.get(url, { headers });
  // const response = await axios.get(url);
  const repos = response.data.map((repo: any) => {
    return {
      name: repo.name,
      url: repo.html_url,
    };
  });

  return repos;
}
