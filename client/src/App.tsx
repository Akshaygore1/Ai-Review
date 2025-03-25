import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, GitBranch, AlertCircle } from "lucide-react";
import CodeReviewDashboard, { ReviewDataType } from "./components/CodeReview";
import axios from "axios";

// read env from vite application
const URL = import.meta.env.VITE_API_URL;
const isValidGitHubUrl = (url: string): boolean => {
  const githubUrlPattern =
    /^(https?:\/\/)?(www\.)?github\.com\/[\w-]+\/[\w-]+\/?$/;
  return githubUrlPattern.test(url.trim());
};

export default function App() {
  const [repoUrl, setRepoUrl] = useState("");
  const [urlError, setUrlError] = useState("");
  const [reviewData, setReviewData] = useState<ReviewDataType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [queryError, setQueryError] = useState<Error | null>(null);

  const fetchAnalysis = async (url: string) => {
    try {
      const response = await axios.post(`${URL}/gitUrl`, { gitUrl: url });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          error.response?.data?.message || "Failed to fetch analysis"
        );
      }
      throw error;
    }
  };

  const handleAnalyzeRepository = async () => {
    // Reset previous states
    setUrlError("");

    // Validate before proceeding
    if (!isValidGitHubUrl(repoUrl)) {
      setUrlError("Invalid GitHub repository URL");
      return;
    }

    try {
      setIsLoading(true);
      const data = await fetchAnalysis(repoUrl);
      setReviewData(data.data);
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);

      console.error("Error", error);
      setUrlError("Failed to analyze repository. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputUrl = e.target.value;
    setRepoUrl(inputUrl);

    // Validate URL in real-time
    if (inputUrl && !isValidGitHubUrl(inputUrl)) {
      setUrlError("Please enter a valid GitHub repository URL");
    } else {
      setUrlError("");
    }
  };
  console.log("reviewData", reviewData);
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 p-4">
      {reviewData.length > 0 ? (
        <CodeReviewDashboard reviewData={reviewData} />
      ) : (
        <Card className="w-full max-w-md shadow-xl bg-black border-black">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white dark:text-white">
              <GitBranch className="w-6 h-6 text-red-600" />
              Code Review Dashboard
            </CardTitle>
            <CardDescription className="dark:text-slate-300">
              Analyze GitHub repositories for code quality
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="space-y-4">
              <div>
                <Input
                  placeholder="Enter GitHub repository URL"
                  value={repoUrl}
                  onChange={handleUrlChange}
                  className="text-white"
                  disabled={isLoading}
                />
                {(urlError || queryError) && (
                  <div className="flex items-center text-red-500 text-sm mt-2">
                    <AlertCircle className="mr-2 w-4 h-4" />
                    {urlError ||
                      (queryError instanceof Error
                        ? queryError.message
                        : "An error occurred")}
                  </div>
                )}
              </div>

              <Button
                onClick={handleAnalyzeRepository}
                disabled={!isValidGitHubUrl(repoUrl) || isLoading}
                className="w-full bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  "Analyze Repository"
                )}
              </Button>
            </div>
          </CardContent>

          <CardFooter>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Our AI will evaluate code quality, security, and best practices.
            </p>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
