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
        execSync('git add .', { stdio: 'inherit' });
        execSync(`git commit -m "${message}"`, { stdio: 'inherit' });
        execSync(`git push origin ${getCurrentBranch()}`, { stdio: 'inherit' });

        console.log('\x1b[32m', 'Submit Success.');
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
        `\n 1. feat：新功能 \n 2. fix：修复 bug \n 3. docs：文档修改 \n 4. style：样式修改(ui 校验) \n 5. ci：自动化流程配置或脚本修改 \n 6. revert：回退某个 commit 提交 \n 7. build：构建系统或外部依赖项的更改 \n 8. perf：优化相关，比如提升性能、体验 \n 9. chore：其他修改, 比如构建流程、依赖管理 \n 10. refactor：重构代码(无功能、无 bug 修复) \n 11. test：增加测试，包括单元测试、集成测试等`,
        {
            width: 60,
            height: 15,
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
main();
