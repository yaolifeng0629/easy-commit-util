import { execSync, spawn } from 'child_process';
import type { GitStatus, GitCommandResult, GitOperationError } from '../types/index.js';

export class GitService {
  /**
   * Check if current directory is a git repository
   */
  static isRepository(): boolean {
    try {
      execSync('git rev-parse --is-inside-work-tree', { stdio: 'pipe' });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get comprehensive git status information
   */
  static getStatus(): GitStatus {
    if (!this.isRepository()) {
      return {
        isRepo: false,
        hasChanges: false,
        currentBranch: '',
        modifiedFiles: [],
        stagedFiles: [],
        unstagedFiles: [],
      };
    }

    try {
      const currentBranch = execSync('git branch --show-current', { encoding: 'utf8' }).trim();

      // Get status in porcelain format for parsing
      const statusOutput = execSync('git status --porcelain', { encoding: 'utf8' });
      const files = statusOutput
        .split('\n')
        .filter(line => line.trim())
        .map(line => ({
          status: line.slice(0, 2),
          filename: line.slice(3),
        }));

      const stagedFiles = files
        .filter(f => f.status[0] !== ' ' && f.status[0] !== '?')
        .map(f => f.filename);

      const unstagedFiles = files
        .filter(f => f.status[1] !== ' ')
        .map(f => f.filename);

      const modifiedFiles = [...new Set([...stagedFiles, ...unstagedFiles])];

      return {
        isRepo: true,
        hasChanges: files.length > 0,
        currentBranch,
        modifiedFiles,
        stagedFiles,
        unstagedFiles,
      };
    } catch (error) {
      throw this.createError('git', 'Failed to get git status', error);
    }
  }

  /**
   * Execute git add command
   */
  static addAll(): GitCommandResult {
    try {
      const stdout = execSync('git add .', { encoding: 'utf8', stdio: 'pipe' });
      return { success: true, stdout, stderr: '', exitCode: 0 };
    } catch (error) {
      throw this.createError('git', 'Failed to stage files', error);
    }
  }

  /**
   * Execute git commit command
   */
  static commit(message: string): GitCommandResult {
    try {
      // Validate message to prevent shell injection
      const safeMessage = message.replace(/"/g, '\\"');
      const stdout = execSync(`git commit -m "${safeMessage}"`, {
        encoding: 'utf8',
        stdio: 'pipe',
      });
      return { success: true, stdout, stderr: '', exitCode: 0 };
    } catch (error) {
      throw this.createError('git', 'Failed to commit changes', error);
    }
  }

  /**
   * Execute git push command
   */
  static push(branch: string): GitCommandResult {
    try {
      const stdout = execSync(`git push origin ${branch}`, {
        encoding: 'utf8',
        stdio: 'pipe',
      });
      return { success: true, stdout, stderr: '', exitCode: 0 };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes('permission denied')) {
        throw this.createError(
          'network',
          'Permission denied when pushing to remote',
          'Please check your authentication credentials'
        );
      } else if (errorMessage.includes('failed to push')) {
        throw this.createError(
          'network',
          'Failed to push changes',
          'Make sure the remote branch exists and you have permission to push'
        );
      }
      throw this.createError('git', 'Failed to push changes', error);
    }
  }

  /**
   * Check if remote exists and is accessible
   */
  static checkRemote(): boolean {
    try {
      execSync('git ls-remote --exit-code', { stdio: 'pipe' });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get remote repository URL
   */
  static getRemoteUrl(): string | null {
    try {
      const url = execSync('git config --get remote.origin.url', {
        encoding: 'utf8',
        stdio: 'pipe',
      }).trim();
      return url;
    } catch {
      return null;
    }
  }

  private static createError(
    type: 'git' | 'validation' | 'network' | 'unknown',
    message: string,
    details?: any,
    suggestion?: string
  ): GitOperationError {
    return {
      type,
      message,
      details: details instanceof Error ? details.message : String(details),
      suggestion,
    };
  }
}