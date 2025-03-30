import React, { use, useEffect, useState } from "react";
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
import CodeReviewDashboard, { ReviewDataType } from "@/components/CodeReview";
import axios from "axios";
import { useAuth } from "@/contexts/AuthContext";
import Login from "@/components/Login";
import { Navigate } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const URL = import.meta.env.VITE_API_URL;

const isValidGitHubUrl = (url: string): boolean => {
  const githubUrlPattern =
    /^(https?:\/\/)?(www\.)?github\.com\/[\w-]+\/[\w-]+\/?$/;
  return githubUrlPattern.test(url.trim());
};

export default function Dashboard() {
  const { user } = useAuth();
  const [repoUrl, setRepoUrl] = useState("");
  const [urlError, setUrlError] = useState("");
  const [reviewData, setReviewData] = useState<ReviewDataType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [queryError, setQueryError] = useState<Error | null>(null);
  const [selectedRepo, setSelectedRepo] = useState<string>("");

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
    setUrlError("");

    if (!isValidGitHubUrl(repoUrl)) {
      setUrlError("Invalid GitHub repository URL");
      return;
    }

    try {
      setIsLoading(true);
      const data = await fetchAnalysis(repoUrl);
      setReviewData(data.data);
    } catch (error) {
      console.error("Error", error);
      setUrlError("Failed to analyze repository. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      <Navigate to="/login" />;
    }
  }, [user]);

  return (
    <div className="w-full flex justify-center items-center">
      {reviewData.length > 0 ? (
        <CodeReviewDashboard reviewData={reviewData} />
      ) : (
        <Card className="w-full max-w-md mx-auto shadow-xl bg-black border-black ">
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
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Select
                    value={selectedRepo}
                    onValueChange={(value) => {
                      setSelectedRepo(value);
                      setRepoUrl(
                        user?.repos.find((repo) => repo.name === value)?.url ||
                          ""
                      );
                    }}
                    disabled={isLoading}
                  >
                    <SelectTrigger className="w-full text-white">
                      <SelectValue placeholder="Select repo" />
                    </SelectTrigger>
                    <SelectContent>
                      {user?.repos.map((repo) => (
                        <SelectItem key={repo.name} value={repo.name}>
                          {repo.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {(urlError || queryError) && (
                  <div className="flex items-center text-red-500 text-sm">
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
