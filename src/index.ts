#!/usr/bin/env node

import { GitService } from './services/git.service.js';
import { ValidationUtil } from './utils/validation.util.js';
import { CLIInterface } from './ui/cli.ui.js';

class EasyCommitCLI {
    private gitService: GitService;
    private cliInterface: CLIInterface;

    constructor() {
        this.gitService = new GitService();
        this.cliInterface = new CLIInterface();
    }

    async run(): Promise<void> {
        try {
            await this.initializeCLI();
            await this.executeWorkflow();
        } catch (error) {
            this.handleError(error);
        } finally {
            this.cleanup();
        }
    }

    private async initializeCLI(): Promise<void> {
        // Display welcome message with commit type guide
        this.cliInterface.displayWelcome(ValidationUtil.COMMIT_TYPES);
    }

    private async executeWorkflow(): Promise<void> {
        // Check if we're in a git repository
        const isRepo = await this.gitService.isGitRepository();
        if (!isRepo) {
            this.cliInterface.displayError('The current directory is not a git repository\n');
            process.exit(1);
        }

        // Get git status
        const gitStatus = this.gitService.getGitStatus();
        this.cliInterface.displayGitStatus(gitStatus.hasChanges, gitStatus.modifiedFiles.length);

        if (gitStatus.hasChanges) {
            this.cliInterface.displayFileList(gitStatus.modifiedFiles);
        }

        if (!gitStatus.hasChanges) {
            this.cliInterface.displayWarning('There are no modifications to commit\n');
            return;
        }

        // Get commit message from user
        const commitMessage = await this.cliInterface.getCommitMessage();
        if (!commitMessage) {
            this.cliInterface.displayWarning('No commit message provided\n');
            return;
        }

        // Validate commit message
        const validation = ValidationUtil.validateCommitMessage(commitMessage);
        if (!validation.isValid) {
            this.cliInterface.displayValidationError(commitMessage, validation.suggestion);
            process.exit(1);
        }

        // Validate message length
        const lengthValidation = ValidationUtil.validateLength(commitMessage);
        if (!lengthValidation.isValid) {
            this.cliInterface.displayValidationError(commitMessage, lengthValidation.suggestion);
            process.exit(1);
        }

        // Execute git workflow
        try {
            this.cliInterface.displayProgress('Staging changes');
            this.gitService.stageAll();
            this.cliInterface.completeProgress('Changes staged successfully\n');

            this.cliInterface.displayProgress('Committing changes');
            this.gitService.commit(commitMessage);
            this.cliInterface.completeProgress('Changes committed successfully\n');

            const currentBranch = this.gitService.getCurrentBranch();
            const remoteExists = this.gitService.remoteBranchExists(currentBranch);

            if (!remoteExists) {
                this.cliInterface.displayInfo(`🌱  Publishing new branch ${currentBranch} to remote...`);
            } else {
                this.cliInterface.displayProgress('Pushing changes to remote');
            }

            this.gitService.push();
            this.cliInterface.completeProgress('Changes pushed successfully\n');

            this.cliInterface.displaySuccess('🎉  All operations completed successfully!\n');
        } catch (error) {
            this.cliInterface.displayError(
                `Git operation failed: ${error instanceof Error ? error.message : String(error)}`
            );
            process.exit(1);
        }
    }

    private handleError(error: unknown): void {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        this.cliInterface.displayError(errorMessage);
    }

    private cleanup(): void {
        this.cliInterface.close();
    }
}

// Entry point
const cli = new EasyCommitCLI();
cli.run().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
});
