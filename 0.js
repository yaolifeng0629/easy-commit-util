let arr = [
    "resolve conflict：解决冲突",
    "merge branch：合并分支",
    "feat ： 添加的新功能说明",
    "fix ：修复的 bug 说明",
    "initial project：初始化项目",
    "style ： 修改的样式范围",
    "perf ： 优化的范围",
    "release ： 发布新版本",
    "docs： 文档修改",
    "refactor： 代码重构",
    "revert： 还原之前的版本",
    "dependencies： 依赖项修改",
    "dev dependencies： 开发依赖修改",
    "review：复习，回顾",
    "strengthen： 加强，巩固",
]

let newArr = arr.map(item => {
    let [key, value] = item.split('：')
    return [key.trim(), value.trim()];
});
console.log(newArr);

// [
//     { key: 'resolve conflict', value: '解决冲突' },
//     { key: 'merge branch', value: '合并分支' },
//     { key: 'feat', value: '添加的新功能说明' },
//     { key: 'fix', value: '修复的 bug 说明' },
//     { key: 'initial project', value: '初始化项目' },
//     { key: 'style', value: '修改的样式范围' },
//     { key: 'perf', value: '优化的范围' },
//     { key: 'release', value: '发布新版本' },
//     { key: 'docs', value: '文档修改' },
//     { key: 'refactor', value: '代码重构' },
//     { key: 'revert', value: '还原之前的版本' },
//     { key: 'dependencies', value: '依赖项修改' },
//     { key: 'dev dependencies', value: '开发依赖修改' },
//     { key: 'review', value: '复习，回顾' },
//     { key: 'strengthen', value: '加强，巩固' }
//   ]

// [
//     [ 'resolve conflict', '解决冲突' ],
//     [ 'merge branch', '合并分支' ],
//     [ 'feat', '添加的新功能说明' ],
//     [ 'fix', '修复的 bug 说明' ],
//     [ 'initial project', '初始化项目' ],
//     [ 'style', '修改的样式范围' ],
//     [ 'perf', '优化的范围' ],
//     [ 'release', '发布新版本' ],
//     [ 'docs', '文档修改' ],
//     [ 'refactor', '代码重构' ],
//     [ 'revert', '还原之前的版本' ],
//     [ 'dependencies', '依赖项修改' ],
//     [ 'dev dependencies', '开发依赖修改' ],
//     [ 'review', '复习，回顾' ],
//     [ 'strengthen', '加强，巩固' ]
//   ]
