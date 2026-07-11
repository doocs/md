#!/bin/bash

RELEASE_DIR='./docker';
REPO_NAME='doocs/md'

for app_ver in $RELEASE_DIR/*; do

    tag=$(echo $app_ver | cut -b 10-);

    if [ -f "$app_ver/Dockerfile.base" ]; then
        # Push build assets for downstream re-packaging
        docker push $REPO_NAME:$tag-assets
    fi

    if [ -f "$app_ver/Dockerfile.standalone" ]; then
        # Push standalone binary image
        docker push $REPO_NAME:$tag
    fi

    if [ -f "$app_ver/Dockerfile.nginx" ]; then
        # Push Nginx-based image
        docker push $REPO_NAME:$tag-nginx
    fi

    if [ -f "$app_ver/Dockerfile.static" ]; then
        # Push lipanski/docker-static-website image
        docker push $REPO_NAME:$tag-static
    fi

done