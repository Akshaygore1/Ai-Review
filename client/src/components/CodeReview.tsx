"use client";

import { useState } from "react";
import {
  AlertTriangle,
  CheckCircle,
  ChevronRight,
  Code,
  FileCode,
  Lock,
  ShieldAlert,
  Zap,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export interface ReviewDataType {
  fileName: string;
  isGoodQuality: boolean;
  issues: {
    type: string;
    description: string;
    severity: string;
    suggestedFix: string;
  }[];
  overallRating: number;
  reasonForRating: string;
}

export default function CodeReviewDashboard({
  reviewData,
}: {
  reviewData: ReviewDataType[];
}) {
  const [selectedFile, setSelectedFile] = useState<ReviewDataType | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const totalFiles = reviewData.length;
  const goodQualityFiles = reviewData.filter(
    (file) => file.isGoodQuality
  ).length;
  const totalIssues = reviewData.reduce(
    (acc, file) => acc + file.issues.length,
    0
  );
  const averageRating = (
    reviewData.reduce((acc, file) => acc + file.overallRating, 0) / totalFiles
  ).toFixed(1);

  const securityIssues = reviewData.reduce(
    (acc, file) =>
      acc + file.issues.filter((issue) => issue.type === "security").length,
    0
  );
  const performanceIssues = reviewData.reduce(
    (acc, file) =>
      acc + file.issues.filter((issue) => issue.type === "performance").length,
    0
  );
  const bestPracticeIssues = reviewData.reduce(
    (acc, file) =>
      acc +
      file.issues.filter((issue) => issue.type === "best practice").length,
    0
  );

  const openFileDetails = (file: ReviewDataType) => {
    setSelectedFile(file);
    setIsDialogOpen(true);
  };

  const getIssueIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "security":
        return <ShieldAlert className="h-4 w-4 text-destructive" />;
      case "performance":
        return <Zap className="h-4 w-4 text-amber-500" />;
      case "best practice":
        return <Code className="h-4 w-4 text-blue-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case "high":
        return "bg-destructive text-destructive-foreground";
      case "medium":
        return "bg-amber-500 text-white";
      case "low":
        return "bg-blue-500 text-white";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 8) return "text-green-500";
    if (rating >= 6) return "text-amber-500";
    return "text-destructive";
  };

  const getRatingProgressColor = (rating: number) => {
    if (rating >= 8) return "bg-green-500";
    if (rating >= 6) return "bg-amber-500";
    return "bg-destructive";
  };

  return (
    <div className="container mx-auto py-8 px-4 text-white">
      <h1 className="text-3xl font-bold mb-6">Code Review Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">
              Files Reviewed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold">{totalFiles}</div>
              <FileCode className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="text-sm text-muted-foreground mt-2">
              {goodQualityFiles} good quality (
              {Math.round((goodQualityFiles / totalFiles) * 100)}%)
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">
              Average Rating
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold">{averageRating}/10</div>
              <div
                className={`text-2xl ${getRatingColor(
                  Number.parseFloat(averageRating)
                )}`}
              >
                {Number.parseFloat(averageRating) >= 7 ? (
                  <CheckCircle className="h-8 w-8" />
                ) : (
                  <AlertTriangle className="h-8 w-8" />
                )}
              </div>
            </div>
            <Progress
              value={Number.parseFloat(averageRating) * 10}
              max={100}
              className={`h-2 mt-2 ${getRatingProgressColor(
                Number.parseFloat(averageRating)
              )}`}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Total Issues</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold">{totalIssues}</div>
              <AlertTriangle className="h-8 w-8 text-amber-500" />
            </div>
            <div className="grid grid-cols-3 gap-1 mt-2">
              <div className="flex items-center text-xs">
                <div className="h-2 w-2 rounded-full bg-destructive mr-1"></div>
                <span>{securityIssues} Security</span>
              </div>
              <div className="flex items-center text-xs">
                <div className="h-2 w-2 rounded-full bg-amber-500 mr-1"></div>
                <span>{performanceIssues} Perf</span>
              </div>
              <div className="flex items-center text-xs">
                <div className="h-2 w-2 rounded-full bg-blue-500 mr-1"></div>
                <span>{bestPracticeIssues} Best Prac</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">
              Security Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold">
                {securityIssues === 0
                  ? "A+"
                  : securityIssues <= 2
                  ? "B"
                  : securityIssues <= 4
                  ? "C"
                  : "D"}
              </div>
              <Lock
                className={`h-8 w-8 ${
                  securityIssues === 0 ? "text-green-500" : "text-amber-500"
                }`}
              />
            </div>
            <div className="text-sm text-muted-foreground mt-2">
              {securityIssues} security{" "}
              {securityIssues === 1 ? "issue" : "issues"} found
            </div>
          </CardContent>
        </Card>
      </div>

      {/* File List */}
      <Tabs defaultValue="all" className="mb-8">
        <TabsList className="mb-4">
          <TabsTrigger value="all">All Files</TabsTrigger>
          <TabsTrigger value="issues">Files with Issues</TabsTrigger>
          <TabsTrigger value="good">Good Quality</TabsTrigger>
          <TabsTrigger value="bad">Needs Improvement</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reviewData.map((file, index) => (
              <FileCard
                key={index}
                file={file}
                onClick={() => openFileDetails(file)}
                getRatingColor={getRatingColor}
                getRatingProgressColor={getRatingProgressColor}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="issues" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reviewData
              .filter((file) => file.issues.length > 0)
              .map((file, index) => (
                <FileCard
                  key={index}
                  file={file}
                  onClick={() => openFileDetails(file)}
                  getRatingColor={getRatingColor}
                  getRatingProgressColor={getRatingProgressColor}
                />
              ))}
          </div>
        </TabsContent>

        <TabsContent value="good" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reviewData
              .filter((file) => file.isGoodQuality)
              .map((file, index) => (
                <FileCard
                  key={index}
                  file={file}
                  onClick={() => openFileDetails(file)}
                  getRatingColor={getRatingColor}
                  getRatingProgressColor={getRatingProgressColor}
                />
              ))}
          </div>
        </TabsContent>

        <TabsContent value="bad" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reviewData
              .filter((file) => !file.isGoodQuality)
              .map((file, index) => (
                <FileCard
                  key={index}
                  file={file}
                  onClick={() => openFileDetails(file)}
                  getRatingColor={getRatingColor}
                  getRatingProgressColor={getRatingProgressColor}
                />
              ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* File Details Dialog */}
      {selectedFile && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold flex items-center">
                <FileCode className="mr-2 h-5 w-5" />
                {selectedFile.fileName}
              </DialogTitle>
              <DialogDescription>
                <div
                  className={`text-lg font-semibold ${getRatingColor(
                    selectedFile.overallRating
                  )}`}
                >
                  Rating: {selectedFile.overallRating}/10
                </div>
              </DialogDescription>
            </DialogHeader>

            <div className="mt-4">
              <h3 className="text-lg font-semibold mb-2">Review Summary</h3>
              <p className="text-muted-foreground">
                {selectedFile.reasonForRating}
              </p>

              {selectedFile.issues.length > 0 ? (
                <>
                  <h3 className="text-lg font-semibold mt-6 mb-2">
                    Issues ({selectedFile.issues.length})
                  </h3>
                  <ScrollArea className="h-[300px] rounded-md border p-4">
                    <div className="space-y-4">
                      {selectedFile.issues.map((issue, index) => (
                        <div key={index} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center">
                              {getIssueIcon(issue.type)}
                              <span className="ml-2 font-medium">
                                {issue.type}
                              </span>
                            </div>
                            <Badge className={getSeverityColor(issue.severity)}>
                              {issue.severity}
                            </Badge>
                          </div>
                          <p className="text-sm mb-2">{issue.description}</p>
                          <div className="bg-muted p-3 rounded-md text-sm">
                            <strong>Suggested Fix:</strong> {issue.suggestedFix}
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </>
              ) : (
                <div className="flex items-center justify-center p-8 mt-4 bg-muted/50 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-500 mr-2" />
                  <span className="text-lg font-medium">
                    No issues found in this file
                  </span>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

// File Card Component
function FileCard({
  file,
  onClick,
  getRatingColor,
  getRatingProgressColor,
}: {
  file: ReviewDataType;
  onClick: () => void;
  getRatingColor: (rating: number) => string;
  getRatingProgressColor: (rating: number) => string;
}) {
  return (
    <Card
      className="overflow-hidden transition-all hover:shadow-md cursor-pointer"
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium truncate">
          {file.fileName}
        </CardTitle>
        <CardDescription>
          {file.issues.length} {file.issues.length === 1 ? "issue" : "issues"}{" "}
          found
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="flex items-center justify-between mb-2">
          <span
            className={`text-2xl font-bold ${getRatingColor(
              file.overallRating
            )}`}
          >
            {file.overallRating}/10
          </span>
          <Badge variant={file.isGoodQuality ? "outline" : "destructive"}>
            {file.isGoodQuality ? "Good Quality" : "Needs Improvement"}
          </Badge>
        </div>
        <Progress
          value={file.overallRating * 10}
          max={100}
          className={`h-2 ${getRatingProgressColor(file.overallRating)}`}
        />
      </CardContent>
      <CardFooter className="pt-0">
        <Button variant="ghost" size="sm" className="ml-auto">
          View Details <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </CardFooter>
    </Card>
  );
}
