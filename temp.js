// 判断当前目录是否是一个git仓库
// const { exec } = require('child_process');

// function isGitRepository() {
//     return new Promise((resolve, reject) => {
//         exec('git rev-parse --is-inside-work-tree', (error, stdout, stderr) => {
//             if (error) {
//                 console.error(`执行的错误: ${error}`);
//                 return resolve(false);
//             }
//             if (stderr) {
//                 console.error(`stderr: ${stderr}`);
//                 return resolve(false);
//             }
//             resolve(stdout.trim() === 'true');
//         });
//     });
// }

// // 使用这个函数
// isGitRepository().then(isGit => {
//     if (isGit) {
//         console.log('当前目录是一个git仓库');
//     } else {
//         console.log('当前目录不是一个git仓库');
//     }
// });




// 方式二：
// # 使用npm安装
// npm install is-git-repository --save-dev

// # 使用yarn安装
// yarn add is-git-repository --dev

// const isGitRepository = require('is-git-repository');

// if (isGitRepository()) {
//     console.log('当前目录是一个git仓库');
// } else {
//     console.log('当前目录不是一个git仓库');
// }
