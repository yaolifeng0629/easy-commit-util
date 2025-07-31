import { execSync, exec } from 'child_process';
import { promisify } from 'util';
import { GitStatus, GitConfig } from '../types/index.js';

const execAsync = promisify(exec);

export class GitService {
  /**
   * Check if current directory is a git repository
   */
  async isGitRepository(): Promise<boolean> {
    try {
      const { stdout, stderr } = await execAsync('git rev-parse --is-inside-work-tree');
      return !stderr && stdout.trim() === 'true';
    } catch (error) {
      return false;
    }
  }

  /**
   * Get current git branch name
   */
  getCurrentBranch(): string {
    try {
      const result = execSync('git branch --show-current', { encoding: 'utf-8' });
      return result.trim();
    } catch (error) {
      throw new Error('Failed to get current branch');
    }
  }

  /**
   * Check if remote branch exists
   */
  remoteBranchExists(branch: string, remote: string = 'origin'): boolean {
    try {
      const result = execSync(`git ls-remote --heads ${remote} ${branch}`, { encoding: 'utf-8' });
      return result.trim().length > 0;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get remote repository URL
   */
  getRemoteUrl(remote: string = 'origin'): string | null {
    try {
      const result = execSync(`git config --get remote.${remote}.url`, { encoding: 'utf-8' });
      return result.trim();
    } catch (error) {
      return null;
    }
  }

  /**
   * Get comprehensive git status with detailed file info
   */
  getGitStatus(): GitStatus {
    try {
      const anyChanges = execSync('git status --porcelain', { encoding: 'utf-8' });
      const unstaged = execSync('git diff --name-only', { encoding: 'utf-8' });
      const staged = execSync('git diff --cached --name-only', { encoding: 'utf-8' });

      const modifiedFiles = anyChanges.split('\n').map(line => line.trim()).filter(Boolean);
      const unstagedFiles = unstaged.split('\n').map(line => line.trim()).filter(Boolean);
      const stagedFiles = staged.split('\n').map(line => line.trim()).filter(Boolean);

      return {
        isRepo: true,
        hasChanges: modifiedFiles.length > 0,
        currentBranch: this.getCurrentBranch(),
        modifiedFiles,
        stagedFiles,
        unstagedFiles
      };
    } catch (error) {
      return {
        isRepo: false,
        hasChanges: false,
        currentBranch: '',
        modifiedFiles: [],
        stagedFiles: [],
        unstagedFiles: []
      };
    }
  }

  /**
   * Stage all changes
   */
  stageAll(): void {
    try {
      execSync('git add .', { stdio: 'inherit' });
    } catch (error) {
      throw new Error('Failed to stage changes');
    }
  }

  /**
   * Commit changes with message
   */
  commit(message: string): void {
    try {
      execSync(`git commit -m "${message}"`, { stdio: 'inherit' });
    } catch (error) {
      throw new Error('Failed to commit changes');
    }
  }

  /**
   * Push to remote repository with branch handling
   */
  push(remote: string = 'origin', branch?: string): void {
    try {
      const targetBranch = branch || this.getCurrentBranch();

      if (this.remoteBranchExists(targetBranch, remote)) {
        // Remote branch exists, push normally
        execSync(`git push ${remote} ${targetBranch}`, { stdio: 'inherit' });
      } else {
        // Remote branch doesn't exist, set upstream
        console.log(`🌱  Creating new remote branch ${targetBranch}...`);
        execSync(`git push -u ${remote} ${targetBranch}`, { stdio: 'inherit' });
      }
    } catch (error) {
      throw new Error(`Failed to push changes: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Set upstream branch for the first push
   */
  setUpstreamBranch(remote: string = 'origin', branch?: string): void {
    try {
      const targetBranch = branch || this.getCurrentBranch();
      execSync(`git push --set-upstream ${remote} ${targetBranch}`, { stdio: 'inherit' });
    } catch (error) {
      throw new Error(`Failed to set upstream branch: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Complete git workflow: stage, commit, and push with branch handling
   */
  async commitAndPush(message: string, config: GitConfig = { remoteName: 'origin', branchName: '' }): Promise<void> {
    const targetBranch = config.branchName || this.getCurrentBranch();

    this.stageAll();
    this.commit(message);

    if (!this.remoteBranchExists(targetBranch, config.remoteName)) {
      console.log(`📤  Publishing new branch ${targetBranch} to ${config.remoteName}...`);
      this.setUpstreamBranch(config.remoteName, targetBranch);
    } else {
      this.push(config.remoteName, targetBranch);
    }
  }
}
