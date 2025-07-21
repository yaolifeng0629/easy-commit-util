import { ValidationResult, CommitType } from '../types/index.js';

export class ValidationUtil {
  private static readonly COMMIT_REGEX =
    /^(revert: )?(feat|fix|docs|dx|style|refactor|perf|test|workflow|build|ci|chore|types|wip|release)(\(.+\))?: .{1,50}/;

  static readonly COMMIT_TYPES: CommitType[] = [
    { type: 'feat', description: '新功能', emoji: '✨' },
    { type: 'fix', description: '修复 bug', emoji: '🐛' },
    { type: 'docs', description: '文档修改', emoji: '📚' },
    { type: 'release', description: '版本发布记录', emoji: '🚀' },
    { type: 'style', description: '样式修改(ui 校验)', emoji: '💄' },
    { type: 'workflow', description: '工作流相关修改', emoji: '⚙️ ' },
    { type: 'types', description: '项目数据类型的修改', emoji: '🏷️ ' },
    { type: 'ci', description: '自动化流程配置或脚本修改', emoji: '🔧' },
    { type: 'revert', description: '回退某个 commit 提交', emoji: '⏪' },
    { type: 'wip', description: '备份当前进度（表示还未完成）', emoji: '🚧' },
    { type: 'build', description: '构建系统或外部依赖项的更改', emoji: '📦' },
    { type: 'perf', description: '优化相关，比如提升性能、体验', emoji: '⚡' },
    { type: 'dx', description: '开发体验相关修改，例如构建流程', emoji: '💻' },
    { type: 'chore', description: '其他修改，比如构建流程、依赖管理', emoji: '🧹' },
    { type: 'refactor', description: '重构代码(无功能、无 bug 修复)', emoji: '♻️ ' },
    { type: 'test', description: '增加测试，包括单元测试、集成测试等', emoji: '🧪' }
  ];

  /**
   * Validate commit message format
   */
  static validateCommitMessage(message: string): ValidationResult {
    if (!message || message.trim().length === 0) {
      return {
        isValid: false,
        error: 'Commit message cannot be empty',
        suggestion: 'Please enter a valid commit message'
      };
    }

    if (!this.COMMIT_REGEX.test(message)) {
      return {
        isValid: false,
        error: `Invalid commit message format: "${message}"`,
        suggestion: this.generateFormatSuggestion()
      };
    }

    return { isValid: true };
  }

  /**
   * Generate format suggestion for invalid messages
   */
  private static generateFormatSuggestion(): string {
    return [
      'Proper commit message format is required for automated changelog generation.',
      '',
      'Examples:',
      '  feat(scope): add \'comments\' option',
      '  fix(scope): handle events on blur (close #28)',
      '',
      'Format: type(scope): description',
      '  type: ' + this.COMMIT_TYPES.map(t => t.type).join(', '),
      '  scope: optional, describes the affected area',
      '  description: brief description (max 50 chars)'
    ].join('\n');
  }

  /**
   * Extract commit type from message
   */
  static extractCommitType(message: string): string | null {
    const match = message.match(/^(\w+)(\(.+\))?:/);
    return match ? match[1] : null;
  }

  /**
   * Get commit type details
   */
  static getCommitTypeDetails(type: string): CommitType | undefined {
    return this.COMMIT_TYPES.find(t => t.type === type);
  }

  /**
   * Check if message length is within limits
   */
  static validateLength(message: string, maxLength: number = 50): ValidationResult {
    const description = message.replace(/^(\w+)(\(.+\))?:\s*/, '');
    if (description.length > maxLength) {
      return {
        isValid: false,
        error: `Description too long (${description.length} chars, max ${maxLength})`,
        suggestion: `Please shorten the description to ${maxLength} characters or less`
      };
    }
    return { isValid: true };
  }
}
