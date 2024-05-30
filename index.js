#!/usr/bin/env node

import { promisify } from 'util';
import { exec as execCb, execSync } from 'child_process';
import readlineCb from 'readline';
import chalk from 'chalk';
import boxen from 'boxen';

const exec = promisify(execCb);
const readline = readlineCb.createInterface({
    input: process.stdin,
    output: process.stdout,
});

async function isGitRepository() {
    try {
        const { stdout, stderr } = await exec('git rev-parse --is-inside-work-tree');
        if (stderr) {
            console.error(`stderr: ${stderr}`);
            return false;
        }
        return stdout.trim() === 'true';
    } catch (error) {
        console.error(`Judge whether there is a repos error.: ${error}`);
        return false;
    }
}

function gitCommitAndPush(message) {
    try {
        if (validateCommitMessage(message)) {
            execSync('git add .', { stdio: 'inherit' });
            execSync(`git commit -m "${message}"`, { stdio: 'inherit' });
            execSync(`git push origin ${getCurrentBranch()}`, { stdio: 'inherit' });
            console.log('\x1b[32m', 'Submit Success.');
        }
    } catch (error) {
        console.error(`Commit error: ${error}`);
    }
}

async function main() {
    displayGuide();

    console.log(chalk.gray('Canonical format Reference: https://www.conventionalcommits.org/en/v1.0.0/#specification'));
    console.log(chalk.gray(''));

    const directory = process.cwd();
    process.chdir(directory);

    if (await isGitRepository()) {
        const isChange = isModify();
        if (!isChange) {
            console.log(chalk.yellow('There are no modifications to the current storage card'));
            process.exit();
        }

        readline.question('Please enter a submission message: ', message => {
            gitCommitAndPush(message);
            readline.close();
        });
    } else {
        console.log(chalk.red('The current directory is not a git repository'));
        process.exit();
    }
}

function displayGuide() {
    const guideData = boxen(
        `\n 1.  feat：新功能 \n 2.  fix：修复 bug \n 3.  docs：文档修改 \n 4.  release：版本发布记录 \n 5.  style：样式修改(ui 校验) \n 6.  workflow：工作流相关修改 \n 7.  types：项目数据类型的修改 \n 8.  ci：自动化流程配置或脚本修改 \n 9.  revert：回退某个 commit 提交 \n 11. wip：备份当前进度（表示还未完成） \n 10. build：构建系统或外部依赖项的更改 \n 12. perf：优化相关，比如提升性能、体验 \n 13. dx： 开发体验相关修改，例如构建流程 \n 14. chore：其他修改, 比如构建流程、依赖管理 \n 15. refactor：重构代码(无功能、无 bug 修复) \n 16. test：增加测试，包括单元测试、集成测试等
        `,
        {
            width: 60,
            height: 20,
            padding: 10,
            title: 'easy-commit-util 🚀 ',
            titleAlignment: 'center',
            borderColor: 'cyanBright',
            margin: {
                top: 1,
                right: 0,
                bottom: 1,
                left: 0,
            },
        }
    );

    console.log(chalk.yellow(guideData));
}

function isModify() {
    const anyFixed = execSync('git status --porcelain').toString();

    // Check temporary and staging area modifications
    const resultUnstaged = execSync('git diff --name-only').toString();
    const resultStaged = execSync('git diff --cached --name-only').toString();

    // List of modified files merging temporary and staging areas
    const filesModified = (anyFixed + '\n' + resultUnstaged + '\n' + resultStaged)
        .split('\n')
        .map(line => line.trim())
        .filter(file => file);

    return filesModified.length > 0;
}

function getCurrentBranch() {
    const result = execSync('git branch --show-current').toString();
    return result.trim();
}

function validateCommitMessage(message) {
    const commitRE =
        /^(revert: )?(feat|fix|docs|dx|style|refactor|perf|test|workflow|build|ci|chore|types|wip|release)(\(.+\))?: .{1,50}/;

    if (!commitRE.test(message)) {
        console.log();
        console.error(
            `  ${chalk.white(chalk.bgRed(' ERROR: '))} ${chalk.yellowBright(`${message}`)} ${chalk.red(
                `invalid commit message format.`
            )}\n\n` +
                chalk(
                    `Proper commit message format is required for automated changelog generation. \n\nExamples:\n\n`
                ) +
                `    ${chalk.green(`feat(scope): add 'comments' option`)}\n` +
                `    ${chalk.green(`fix(scope): handle events on blur (close #28)`)}\n\n` +
                chalk.gray(`We refer to the vue3 scheme for more details: \n`) +
                chalk.gray.underline(`https://github.com/vuejs/core/blob/main/.github/commit-convention.md \n`)
        );
        process.exit(1);
    } else {
        return true;
    }
}

main();
