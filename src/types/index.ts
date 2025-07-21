export interface GitStatus {
  isRepo: boolean;
  hasChanges: boolean;
  currentBranch: string;
  modifiedFiles: string[];
  stagedFiles: string[];
  unstagedFiles: string[];
}

export interface CommitType {
  type: string;
  description: string;
  emoji?: string;
}

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  suggestion?: string;
}

export interface GitConfig {
  remoteName: string;
  branchName: string;
}

export interface CLIOptions {
  dryRun?: boolean;
  skipValidation?: boolean;
  verbose?: boolean;
}