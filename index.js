import { promisify } from 'util';
import { exec as execCb, execSync } from 'child_process';
import readlineCb from 'readline';
import chalk from 'chalk';

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
    // console.log(chalk.blue(getTableData()));
    // return;
    const directory = process.cwd();
    process.chdir(directory);

    if (await isGitRepository()) {
        readline.question('请输入提交消息: ', message => {
            gitCommitAndPush(message);
            readline.close();
        });
    } else {
        console.log('The current directory is not a git repository');
    }
}

async function getTableData() {
    var table = new Table({
        head: ['type', 'Description'],
        colWidths: [150, 400],
    });

    table.push(
        ['resolve conflict', '解决冲突'],
        ['merge branch', '合并分支'],
        ['feat', '添加的新功能说明'],
        ['fix', '修复的 bug 说明'],
        ['initial project', '初始化项目'],
        ['style', '修改的样式范围'],
        ['perf', '优化的范围'],
        ['release', '发布新版本'],
        ['docs', '文档修改'],
        ['refactor', '代码重构'],
        ['revert', '还原之前的版本'],
        ['dependencies', '依赖项修改'],
        ['dev dependencies', '开发依赖修改'],
        ['review', '复习，回顾'],
        ['strengthen', '加强，巩固']
    );

    return table.toString();
}

main();
