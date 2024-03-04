#!/bin/bash

# directory="C:\Users\MZG\Desktop\PersonalProject\annual-punch"
directory= pwd

# 获取当前日期和时间
current_date=$(date +%Y-%m-%d)
current_time=$(date +%H:%M:%S)
# read -p "请输入提交项目本地路径: " directory
# 执行命令
cd "$directory"
read -p "请输入提交消息: " message
# 提交代码到Git
git add .
git commit -m "$message"
git push

echo -e "\033[0;32m Submit Success."
