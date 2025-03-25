export interface GitHubTreeResponse {
  tree: TreeNode[];
}

export interface TreeNode {
  path: string;
  mode: string;
  type: string;
  sha: string;
  size: number;
  url: string;
}

export interface ReviewIssue {
  type: string;
  description: string;
  severity: "low" | "medium" | "high";
  suggestedFix: string;
}

export interface CodeReview {
  fileName: string;
  isGoodQuality: boolean;
  issues: ReviewIssue[];
  overallRating: number;
  reasonForRating: string;
}

export interface GitUrlResponse {
  status: string;
  data: CodeReview[];
}
