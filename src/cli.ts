#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { CLI } from './ui/cli.js';
import { CommitService } from './services/commit.js';
import { CommitValidator } from './services/validator.js';
import { ConfigManager } from './config/config.js';
import { Logger } from './utils/logger.js';

const program = new Command();

program
  .name('easy-commit')
  .description('Easy git commit tool with conventional commits')
  .version('2.0.0');

program
  .command('commit')
  .alias('c')
  .description('Create a new commit with conventional format')
  .option('-m, --message <message>', 'Commit message')
  .option('-i, --interactive', 'Use interactive mode')
  .option('-n, --no-push', 'Skip pushing to remote')
  .option('-a, --no-add', 'Skip adding all files')
  .option('-v, --verbose', 'Enable verbose logging')
  .action(async (options) => {
    try {
      if (options.verbose) {
        Logger.setLevel(3); // DEBUG level
      }

      const config = ConfigManager.load();

      // Override config with CLI options
      if (options.push === false) {
        config.pushAfterCommit = false;
      }
      if (options.add === false) {
        config.addAllFiles = false;
      }

      const cli = new CLI();
      const commitService = new CommitService(config);

      await cli.displayWelcome();

      // Check preconditions
      const { canProceed, status } = await commitService.checkPreconditions();
      if (!canProceed) {
        process.exit(1);
      }

      await cli.displayStatus(status);

      let message: string;

      // Get commit message
      if (options.message) {
        message = options.message;
      } else if (options.interactive) {
        message = await cli.promptCommitMessage() || '';
      } else {
        message = await cli.promptManualMessage() || '';
      }

      if (!message) {
        console.log('Commit cancelled');
        process.exit(0);
      }

      // Validate message
      const validation = CommitValidator.validate(message);
      if (!validation.isValid) {
        cli.displayValidationErrors(validation);
        const retry = await cli.confirm('Would you like to try again?');
        if (retry) {
          message = await cli.promptManualMessage() || '';
        } else {
          process.exit(1);
        }
      }

      // Confirm operation
      const confirmed = await cli.confirm(`Commit with message: "${message}"?`);
      if (!confirmed) {
        console.log('Commit cancelled');
        process.exit(0);
      }

      // Execute commit
      cli.startProgress('Creating commit...');
      const success = await commitService.executeCommit(message, status);

      if (success) {
        cli.succeedProgress('Commit created successfully!');
        cli.displaySummary(true, [
          `Message: ${message}`,
          `Branch: ${status.currentBranch}`,
          config.pushAfterCommit ? 'Pushed to remote' : 'Ready to push',
        ]);
      } else {
        cli.failProgress('Commit failed');
        process.exit(1);
      }

    } catch (error) {
      Logger.error('Unexpected error', error as Error);
      process.exit(1);
    }
  });

program
  .command('status')
  .alias('s')
  .description('Show repository status')
  .action(async () => {
    const cli = new CLI();
    const commitService = new CommitService(ConfigManager.load());

    const { status } = await commitService.checkPreconditions();
    await cli.displayStatus(status);
  });

program
  .command('config')
  .description('Manage configuration')
  .option('--reset', 'Reset to default configuration')
  .option('--sample', 'Create sample configuration file')
  .action((options) => {
    if (options.reset) {
      ConfigManager.reset();
      console.log('Configuration reset to defaults');
    } else if (options.sample) {
      ConfigManager.createSample();
      console.log(`Sample configuration created at: ${ConfigManager.getConfigPath()}`);
    } else {
      console.log(`Configuration file location: ${ConfigManager.getConfigPath()}`);
      console.log('Use --reset to reset to defaults or --sample to create sample config');
    }
  });

program
  .command('validate')
  .description('Validate a commit message')
  .argument('<message>', 'Commit message to validate')
  .action((message) => {
    const validation = CommitValidator.validate(message);

    if (validation.isValid) {
      console.log(chalk.green('✅  Valid commit message'));
    } else {
      console.log(chalk.red('❌  Invalid commit message:'));
      validation.errors.forEach((error, index) => {
        console.log(`   ${index + 1}. ${error}`);
      });
      process.exit(1);
    }
  });

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  Logger.error('Uncaught exception', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  Logger.error('Unhandled rejection', reason as Error);
  process.exit(1);
});

program.parse();
