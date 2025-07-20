import type { CommitMessage, ValidationResult } from '../types/index.js';
import { COMMIT_MESSAGE_REGEX, COMMIT_TYPE_DESCRIPTIONS } from '../config/index.js';

export class CommitValidator {
  private static readonly MAX_DESCRIPTION_LENGTH = 50;
  private static readonly MAX_HEADER_LENGTH = 72;

  /**
   * Parse a commit message into structured components
   */
  static parse(message: string): CommitMessage | null {
    const match = message.match(COMMIT_MESSAGE_REGEX);
    if (!match) {
      return null;
    }

    const [, revert, type, scope, description] = match;
    
    return {
      type,
      scope: scope?.slice(1, -1), // Remove parentheses
      description,
      isBreaking: message.includes('BREAKING CHANGE') || description.startsWith('!'),
    };
  }

  /**
   * Validate a commit message
   */
  static validate(message: string): ValidationResult {
    const errors: string[] = [];

    if (!message || message.trim().length === 0) {
      errors.push('Commit message cannot be empty');
      return { isValid: false, errors };
    }

    if (message.length > this.MAX_HEADER_LENGTH) {
      errors.push(`Commit message header should not exceed ${this.MAX_HEADER_LENGTH} characters`);
    }

    const parsed = this.parse(message);
    if (!parsed) {
      errors.push(...this.getFormatErrors(message));
      return { isValid: false, errors };
    }

    // Validate type
    const validTypes = Object.keys(COMMIT_TYPE_DESCRIPTIONS);
    if (!validTypes.includes(parsed.type)) {
      errors.push(`Invalid commit type '${parsed.type}'. Valid types: ${validTypes.join(', ')}`);
    }

    // Validate scope (if present)
    if (parsed.scope && !this.isValidScope(parsed.scope)) {
      errors.push('Scope should only contain lowercase letters, numbers, and hyphens');
    }

    // Validate description
    if (parsed.description.length > this.MAX_DESCRIPTION_LENGTH) {
      errors.push(`Description should not exceed ${this.MAX_DESCRIPTION_LENGTH} characters`);
    }

    if (!/^[a-z]/.test(parsed.description)) {
      errors.push('Description should start with a lowercase letter');
    }

    if (!/^[a-z0-9\s\-_]+$/.test(parsed.description)) {
      errors.push('Description should only contain lowercase letters, numbers, spaces, hyphens, and underscores');
    }

    if (parsed.description.endsWith('.')) {
      errors.push('Description should not end with a period');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Get examples for valid commit messages
   */
  static getExamples(): string[] {
    return [
      'feat: add user authentication',
      'fix(auth): resolve login redirect issue',
      'docs: update API documentation',
      'refactor(utils): simplify validation logic',
      'test: add unit tests for auth module',
      'chore: update dependencies',
      'perf: optimize database queries',
    ];
  }

  /**
   * Get detailed format help
   */
  static getFormatHelp(): string {
    return `
Format: <type>[<scope>]: <description>

Examples:
${this.getExamples().map(ex => `  ${ex}`).join('\n')}

Rules:
- Type must be one of: ${Object.keys(COMMIT_TYPE_DESCRIPTIONS).join(', ')}
- Scope is optional, lowercase, no spaces
- Description starts with lowercase, no period, max ${this.MAX_DESCRIPTION_LENGTH} chars
- Use imperative mood ("add" not "added" or "adding")
`.trim();
  }

  private static getFormatErrors(message: string): string[] {
    const errors: string[] = [];
    
    if (!message.includes(':')) {
      errors.push('Missing colon separator between type/scope and description');
    } else {
      const [typeScope, ...descriptionParts] = message.split(':');
      const description = descriptionParts.join(':').trim();

      if (!description) {
        errors.push('Missing description after colon');
      }

      if (!typeScope) {
        errors.push('Missing type/scope before colon');
      } else {
        const typeMatch = typeScope.match(/^(feat|fix|docs|dx|style|refactor|perf|test|workflow|build|ci|chore|types|wip|release)(\([^)]+\))?$/);
        if (!typeMatch) {
          errors.push('Invalid type format. Must be one of the valid types');
        }
      }
    }

    return errors;
  }

  private static isValidScope(scope: string): boolean {
    return /^[a-z0-9-]+$/.test(scope);
  }
}