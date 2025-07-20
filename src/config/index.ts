import type { Config } from '../types/index.js';

export const DEFAULT_CONFIG: Config = {
  commitTypes: [
    'feat',
    'fix',
    'docs',
    'release',
    'style',
    'workflow',
    'types',
    'ci',
    'revert',
    'wip',
    'build',
    'perf',
    'dx',
    'chore',
    'refactor',
    'test',
  ],
  maxDescriptionLength: 50,
  allowBreakingChanges: true,
  pushAfterCommit: true,
  addAllFiles: true,
};

export const COMMIT_TYPE_DESCRIPTIONS: Record<string, string> = {
  feat: '新功能 (new feature)',
  fix: '修复 bug (bug fix)',
  docs: '文档修改 (documentation)',
  release: '版本发布记录 (release notes)',
  style: '样式修改 (UI/styling changes)',
  workflow: '工作流相关修改 (workflow changes)',
  types: '项目数据类型的修改 (type changes)',
  ci: '自动化流程配置或脚本修改 (CI/CD changes)',
  revert: '回退某个 commit 提交 (revert changes)',
  wip: '备份当前进度（表示还未完成） (work in progress)',
  build: '构建系统或外部依赖项的更改 (build system changes)',
  perf: '优化相关，比如提升性能、体验 (performance improvements)',
  dx: '开发体验相关修改 (developer experience)',
  chore: '其他修改 (maintenance tasks)',
  refactor: '重构代码 (code refactoring)',
  test: '增加测试 (adding tests)',
};

export const COMMIT_MESSAGE_REGEX =
  /^(revert: )?(feat|fix|docs|dx|style|refactor|perf|test|workflow|build|ci|chore|types|wip|release)(\(.+\))?: .{1,50}/;