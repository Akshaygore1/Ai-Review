import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Github, Loader2 } from "lucide-react";

export default function Login() {
  const { login, isLoading, error } = useAuth();

  return (
    <div className="w-full flex items-center justify-center">
      <Card className="w-full max-w-md shadow-xl bg-black border-black">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white dark:text-white">
            <Github className="w-6 h-6 text-red-600" />
            AI Code Reviewer
          </CardTitle>
          <CardDescription className="dark:text-slate-300">
            Sign in to analyze GitHub repositories
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Button
            onClick={login}
            disabled={isLoading}
            className="w-full bg-gray-800 hover:bg-gray-700"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Connecting to GitHub...
              </>
            ) : (
              <>
                <Github className="mr-2 h-4 w-4" />
                Login with GitHub
              </>
            )}
          </Button>

          {error && (
            <p className="text-red-500 text-sm mt-4 text-center">{error}</p>
          )}
        </CardContent>

        <CardFooter>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            We'll only request access to analyze your repositories.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
