export interface GitStatus {
  isRepo: boolean;
  hasChanges: boolean;
  currentBranch: string;
  modifiedFiles: string[];
  stagedFiles: string[];
  unstagedFiles: string[];
}

export interface CommitMessage {
  type: string;
  scope?: string;
  description: string;
  isBreaking: boolean;
  body?: string;
  footer?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface Config {
  commitTypes: string[];
  maxDescriptionLength: number;
  allowBreakingChanges: boolean;
  pushAfterCommit: boolean;
  addAllFiles: boolean;
}

export interface GitCommandResult {
  success: boolean;
  stdout: string;
  stderr: string;
  exitCode: number;
}

export interface GitOperationError {
  type: 'git' | 'validation' | 'network' | 'unknown';
  message: string;
  details?: string;
  suggestion?: string;
}