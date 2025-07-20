import { GitService } from './git.js';
import { CommitValidator } from './validator.js';
import { Logger } from '../utils/logger.js';
import type { GitStatus, ValidationResult, Config } from '../types/index.js';

export class CommitService {
  private config: Config;

  constructor(config: Config) {
    this.config = config;
  }

  /**
   * Check if we can proceed with commit
   */
  async checkPreconditions(): Promise<{ canProceed: boolean; status: GitStatus }> {
    Logger.info('Checking preconditions...');

    const status = GitService.getStatus();

    if (!status.isRepo) {
      Logger.error('Not in a git repository');
      return { canProceed: false, status };
    }

    if (!status.hasChanges) {
      Logger.warn('No changes to commit');
      return { canProceed: false, status };
    }

    if (!GitService.checkRemote()) {
      Logger.warn('No remote repository configured');
    }

    Logger.info('Preconditions check completed');
    return { canProceed: true, status };
  }

  /**
   * Execute the complete commit workflow
   */
  async executeCommit(message: string, status: GitStatus): Promise<boolean> {
    try {
      Logger.info('Starting commit workflow...');

      // 1. Validate commit message
      const validation = CommitValidator.validate(message);
      if (!validation.isValid) {
        Logger.error('Invalid commit message format');
        return false;
      }

      // 2. Stage files (if configured)
      if (this.config.addAllFiles) {
        Logger.info('Staging all files...');
        const addResult = GitService.addAll();
        if (!addResult.success) {
          Logger.error('Failed to stage files');
          return false;
        }
      }

      // 3. Commit changes
      Logger.info('Creating commit...');
      const commitResult = GitService.commit(message);
      if (!commitResult.success) {
        Logger.error('Failed to create commit');
        return false;
      }

      // 4. Push to remote (if configured)
      if (this.config.pushAfterCommit) {
        Logger.info('Pushing to remote...');
        const pushResult = GitService.push(status.currentBranch);
        if (!pushResult.success) {
          Logger.error('Failed to push changes');
          return false;
        }
      }

      Logger.success('Commit workflow completed successfully');
      return true;
    } catch (error) {
      Logger.error('Commit workflow failed', error as Error);
      return false;
    }
  }

  /**
   * Get suggested commit messages based on changed files
   */
  getSuggestedMessages(status: GitStatus): string[] {
    const suggestions: string[] = [];
    const files = [...status.stagedFiles, ...status.unstagedFiles];

    if (files.length === 0) {
      return suggestions;
    }

    // Analyze file patterns for suggestions
    const fileTypes = new Set(files.map(file => {
      const ext = file.split('.').pop()?.toLowerCase();
      const parts = file.split('/');
      const dir = parts.length > 1 ? parts[0] : '';
      
      if (ext === 'ts' || ext === 'js') {
        return 'feat';
      } else if (ext === 'md' || ext === 'txt') {
        return 'docs';
      } else if (ext === 'test.ts' || ext === 'spec.ts') {
        return 'test';
      } else if (dir === 'config' || dir === '.github') {
        return 'ci';
      } else {
        return 'chore';
      }
    }));

    // Generate suggestions based on detected patterns
    fileTypes.forEach(type => {
      const scopes = files
        .map(f => f.split('/')[0])
        .filter(s => s && s !== '.' && s !== '..')
        .slice(0, 3);
      
      const scope = scopes.length > 0 ? `(${scopes[0]})` : '';
      suggestions.push(`${type}${scope}: update ${files.length} file(s)`);
    });

    return suggestions.slice(0, 3);
  }
}