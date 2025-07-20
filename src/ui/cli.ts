import chalk from 'chalk';
import boxen from 'boxen';
import inquirer from 'inquirer';
import ora from 'ora';
import { GitService } from '../services/git.js';
import { CommitValidator } from '../services/validator.js';
import { COMMIT_TYPE_DESCRIPTIONS } from '../config/index.js';
import type { GitStatus, ValidationResult } from '../types/index.js';

export class CLI {
  private spinner = ora();

  /**
   * Display welcome banner with commit type guide
   */
  async displayWelcome(): Promise<void> {
    console.clear();

    const title = boxen(
      chalk.cyan.bold('🚀  Easy Commit Util') + '\n' + '\n' +
      chalk.gray('Simplify your git workflow with conventional commits'),
      {
        padding: 1,
        margin: 1,
        borderStyle: 'round',
        borderColor: 'cyan',
      }
    );

    console.log(title);

    // Display commit types in a formatted table
    const typeTable = Object.entries(COMMIT_TYPE_DESCRIPTIONS)
      .map(([type, description]) =>
        `${chalk.green(type.padEnd(10))} ${chalk.gray(description)}`
      )
      .join('\n');

    const guide = boxen(
      'Commit Types:\n' + typeTable +
      '\n\n' + chalk.yellow('Format: type(scope): description'),
      {
        padding: 1,
        margin: 1,
        borderStyle: 'round',
        borderColor: 'yellow',
      }
    );

    console.log(guide);
  }

  /**
   * Display repository status
   */
  async displayStatus(status: GitStatus): Promise<void> {
    if (!status.isRepo) {
      console.log(chalk.red('❌  Not in a git repository'));
      return;
    }

    console.log(chalk.blue('📁  Repository Status:'));
    console.log(`   Branch: ${chalk.cyan(status.currentBranch)}`);

    if (status.hasChanges) {
      console.log(chalk.green(`   ✅  ${status.modifiedFiles.length} file(s) with changes`));

      if (status.stagedFiles.length > 0) {
        console.log(chalk.yellow(`   📋  ${status.stagedFiles.length} staged file(s)`));
      }

      if (status.unstagedFiles.length > 0) {
        console.log(chalk.blue(`   📝  ${status.unstagedFiles.length} unstaged file(s)`));
      }
    } else {
      console.log(chalk.yellow('⚠️  No changes detected'));
    }

    console.log(); // Empty line
  }

  /**
   * Interactive commit message input with validation
   */
  async promptCommitMessage(): Promise<string | null> {
    const answers = await inquirer.prompt([
      {
        type: 'list',
        name: 'type',
        message: 'Select commit type:',
        choices: Object.entries(COMMIT_TYPE_DESCRIPTIONS).map(([type, description]) => ({
          name: `${chalk.green(type)} - ${description}`,
          value: type,
        })),
        pageSize: 10,
      },
      {
        type: 'input',
        name: 'scope',
        message: 'Scope (optional, e.g., auth, ui, api):',
        validate: (input) => {
          if (input && !/^[a-z0-9-]*$/.test(input)) {
            return 'Scope should only contain lowercase letters, numbers, and hyphens';
          }
          return true;
        },
        filter: (input) => input.trim() || undefined,
      },
      {
        type: 'input',
        name: 'description',
        message: 'Description:',
        validate: (input) => {
          if (!input.trim()) {
            return 'Description is required';
          }
          if (input.length > 50) {
            return 'Description should be 50 characters or less';
          }
          return true;
        },
      },
      {
        type: 'confirm',
        name: 'isBreaking',
        message: 'Is this a breaking change?',
        default: false,
      },
      {
        type: 'input',
        name: 'body',
        message: 'Body (optional):',
        when: (answers) => answers.isBreaking,
      },
    ]);

    let message = `${answers.type}`;
    if (answers.scope) {
      message += `(${answers.scope})`;
    }
    if (answers.isBreaking) {
      message += '!';
    }
    message += `: ${answers.description}`;

    if (answers.body) {
      message += `\n\n${answers.body}`;
    }

    return message;
  }

  /**
   * Manual commit message input with real-time validation
   */
  async promptManualMessage(): Promise<string | null> {
    const { message } = await inquirer.prompt([
      {
        type: 'input',
        name: 'message',
        message: 'Enter commit message:',
        validate: (input) => {
          if (!input.trim()) {
            return 'Commit message cannot be empty';
          }

          const validation = CommitValidator.validate(input);
          if (!validation.isValid) {
            return validation.errors.join('; ');
          }

          return true;
        },
      },
    ]);

    return message.trim();
  }

  /**
   * Display validation errors
   */
  displayValidationErrors(validation: ValidationResult): void {
    console.log(chalk.red('\n❌  Validation Errors:'));
    validation.errors.forEach((error, index) => {
      console.log(`   ${index + 1}. ${error}`);
    });
    console.log();

    console.log(chalk.blue('💡  Format help:'));
    console.log(CommitValidator.getFormatHelp());
  }

  /**
   * Display progress with spinner
   */
  startProgress(text: string): void {
    this.spinner.start(text);
  }

  updateProgress(text: string): void {
    this.spinner.text = text;
  }

  succeedProgress(text: string): void {
    this.spinner.succeed(text);
  }

  failProgress(text: string): void {
    this.spinner.fail(text);
  }

  /**
   * Display operation summary
   */
  displaySummary(success: boolean, details: string[]): void {
    if (success) {
      console.log(chalk.green('\n✅  Commit completed successfully!'));
      details.forEach(detail => console.log(`   ${chalk.gray('•')} ${detail}`));
    } else {
      console.log(chalk.red('\n❌  Operation failed'));
      details.forEach(detail => console.log(`   ${chalk.gray('•')} ${detail}`));
    }
  }

  /**
   * Ask user for confirmation
   */
  async confirm(message: string): Promise<boolean> {
    const { confirmed } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirmed',
        message,
        default: true,
      },
    ]);
    return confirmed;
  }

  /**
   * Display error with suggestions
   */
  displayError(error: Error, suggestion?: string): void {
    console.log(chalk.red('\n❌  Error:'));
    console.log(`   ${error.message}`);

    if (suggestion) {
      console.log(chalk.yellow(`\n💡  Suggestion: ${suggestion}`));
    }
  }
}
