#!/bin/bash

RELEASE_DIR='./docker';
REPO_NAME='doocs/md'

for app_ver in $RELEASE_DIR/*; do

    tag=$(echo $app_ver | cut -b 10-);

    if [ -f "$app_ver/Dockerfile.base" ]; then
        # 推送构建产物，方便其他的用户和爱好者进行二次封装
        docker push $REPO_NAME:$tag-assets
    fi

    if [ -f "$app_ver/Dockerfile.standalone" ]; then
        # 推送单个二进制的镜像
        docker push $REPO_NAME:$tag
    fi

    if [ -f "$app_ver/Dockerfile.nginx" ]; then
        # 推送使用 Nginx 的镜像
        docker push $REPO_NAME:$tag-nginx
    fi

    if [ -f "$app_ver/Dockerfile.static" ]; then
        # 推送使用 lipanski/docker-static-website 的镜像
        docker push $REPO_NAME:$tag-static
    fi

done