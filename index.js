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
        execSync('git push', { stdio: 'inherit' });

        console.log('\x1b[32m', 'Submit Success.');
    } catch (error) {
        console.error(`Commit error: ${error}`);
    }
}

async function main() {
    displayGuide();

    const directory = process.cwd();
    process.chdir(directory);

    if (await isGitRepository()) {
        readline.question('Please enter a submission message: ', message => {
            gitCommitAndPush(message);
            readline.close();
        });
    } else {
        console.log('The current directory is not a git repository');
    }
}

function displayGuide() {
    const guideData = boxen(
        `\n 1. resolve conflict：解决冲突 \n 2. merge branch：合并分支 \n 3. feat： 添加的新功能说明 \n 4. fix：修复的 bug 说明 \n 5. initial project：初始化项目 \n 6. style： 修改的样式范围 \n 7. perf： 优化的范围 \n 8. release： 发布新版本 \n 9. docs： 文档修改 \n 10. refactor： 代码重构 \n 11. revert： 还原之前的版本 \n 12. dependencies： 依赖项修改 \n 13. dev dependencies： 开发依赖修改 \n 14. review：复习，回顾 \n 15. strengthen： 加强，巩固 \n",`,
        {
            width: 60,
            height: 18,
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

main();
