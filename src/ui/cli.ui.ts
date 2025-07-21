import chalk from 'chalk';
import boxen from 'boxen';
import { createInterface } from 'readline';
import { CommitType } from '../types/index.js';

export class CLIInterface {
  private rl = createInterface({
    input: process.stdin,
    output: process.stdout
  });

  /**
   * Display welcome banner with commit type guide
   */
  displayWelcome(availableTypes: CommitType[]): void {
    const guideContent = this.formatCommitGuide(availableTypes);

    const welcomeBox = boxen(guideContent, {
      title: '🚀 easy-commit-util',
      titleAlignment: 'center',
      borderColor: 'cyan',
      borderStyle: 'round',
      padding: 1,
      margin: 1
    });

    console.log(chalk.yellow(welcomeBox));

    // Display reference link
    console.log(chalk.gray('📖 Reference: https://www.conventionalcommits.org/en/v1.0.0/#specification'));
    console.log();
  }

  /**
   * Format commit types for display
   */
  private formatCommitGuide(types: CommitType[]): string {
    const maxTypeLength = Math.max(...types.map(t => t.type.length));

    return types
      .map(type => {
        const paddedType = type.type.padEnd(maxTypeLength);
        const emoji = type.emoji || '📝';
        return `${emoji} ${chalk.cyan(paddedType)}  ${type.description}`;
      })
      .join('\n');
  }

  /**
   * Display error message
   */
  displayError(message: string): void {
    console.error(chalk.red('❌ Error:'), message);
  }

  /**
   * Display warning message
   */
  displayWarning(message: string): void {
    console.warn(chalk.yellow('⚠️  Warning:'), message);
  }

  /**
   * Display success message
   */
  displaySuccess(message: string): void {
    console.log(chalk.green('✅ Success:'), message);
  }

  /**
   * Display info message
   */
  displayInfo(message: string): void {
    console.log(chalk.blue('ℹ️  Info:'), message);
  }

  /**
   * Get user input for commit message
   */
  async getCommitMessage(): Promise<string> {
    return new Promise((resolve, reject) => {
      this.rl.question(chalk.cyan('📝 Please enter a commit message: \n'), (answer) => {
        resolve(answer.trim());
      });

      this.rl.on('close', () => {
        reject(new Error('User cancelled input'));
      });
    });
  }

  /**
   * Display validation error with suggestions
   */
  displayValidationError(message: string, suggestion?: string): void {
    console.error();
    console.error(chalk.white.bgRed.bold(' ERROR '));
    console.error(chalk.red(`Invalid commit message: "${message}"`));

    if (suggestion) {
      console.error();
      console.error(chalk.yellow('💡 Suggestion:'));
      console.error(suggestion);
    }
    console.error();
  }

  /**
   * Display git status information
   */
  displayGitStatus(hasChanges: boolean, fileCount: number): void {
    if (hasChanges) {
      console.log(chalk.green(`📁 Found ${fileCount} changed file${fileCount > 1 ? 's' : ''}`));
    } else {
      console.log(chalk.yellow('📁 No changes detected in the repository'));
    }
  }

  /**
   * Display list of changed files
   */
  displayFileList(files: string[]): void {
    if (files.length === 0) return;

    console.log(chalk.gray('\nChanged files:'));
    files.forEach((file, index) => {
      const status = file.substring(0, 2).trim();
      const filename = file.substring(3);
      let statusColor = chalk.gray;
      let statusText = status;

      switch (status) {
        case 'M': statusColor = chalk.yellow; statusText = 'modified'; break;
        case 'A': statusColor = chalk.green; statusText = 'added'; break;
        case 'D': statusColor = chalk.red; statusText = 'deleted'; break;
        case 'R': statusColor = chalk.blue; statusText = 'renamed'; break;
        case 'C': statusColor = chalk.cyan; statusText = 'copied'; break;
        case '??': statusColor = chalk.gray; statusText = 'untracked'; break;
        default: statusText = status;
      }

      console.log(`  ${chalk.gray(`${index + 1}.`)} ${statusColor(statusText)} ${filename}`);
    });
    console.log();
  }

  /**
   * Close readline interface
   */
  close(): void {
    this.rl.close();
  }

  /**
   * Display commit type selection menu
   */
  async selectCommitType(types: CommitType[]): Promise<string | null> {
    console.log(chalk.cyan('\n🎯 Select commit type:'));

    types.forEach((type, index) => {
      console.log(`${chalk.gray(`${index + 1}.`)} ${type.emoji} ${chalk.cyan(type.type)} - ${type.description}`);
    });

    return new Promise((resolve) => {
      this.rl.question(chalk.cyan('\nEnter type (number or name): '), (answer) => {
        const input = answer.trim();

        // Handle numeric selection
        const num = parseInt(input);
        if (!isNaN(num) && num >= 1 && num <= types.length) {
          resolve(types[num - 1].type);
          return;
        }

        // Handle direct type input
        const type = types.find(t => t.type === input.toLowerCase());
        resolve(type ? type.type : null);
      });
    });
  }

  /**
   * Display progress indicator
   */
  displayProgress(message: string): void {
    process.stdout.write(chalk.blue(`⏳ ${message}...\n`));
  }

  /**
   * Complete progress
   */
  completeProgress(message: string): void {
    process.stdout.write(`\r${chalk.green('✅')} ${message}\n`);
  }
}
