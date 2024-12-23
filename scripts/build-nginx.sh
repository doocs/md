#!/bin/bash

RELEASE_DIR='./docker';
REPO_NAME='doocs/md'

for app_ver in $RELEASE_DIR/*; do

    if [ -f "$app_ver/Dockerfile.nginx" ]; then

        tag=$(echo $app_ver | cut -b 10-);
        echo "Build: $tag";
        set -a
            . "$app_ver/.env"
        set +a

        echo $app_ver
        echo "VER_APP: $VER_APP"
        echo "VER_NGX: $VER_NGX"
        echo "VER_GOLANG: $VER_GOLANG"
        echo "VER_ALPINE: $VER_ALPINE"

        docker build --build-arg VER_APP=$VER_APP --build-arg VER_NGX=$VER_NGX -f "$app_ver/Dockerfile.nginx" -t "$REPO_NAME:${VER_APP}-nginx" "$app_ver"
    fi

done