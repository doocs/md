#!/bin/bash

set -euo pipefail

RELEASE_DIR="./docker"
# 使用环境变量或默认值
REPO_NAME="${DOCKER_IMAGE_TAG:-doocs/md}"
PLATFORMS="linux/amd64,linux/arm64"

echo "🔧 Multi-arch Docker build started..."
echo "📁 Scanning directory: $RELEASE_DIR"
echo "🏷️  Target repository: $REPO_NAME"

for app_ver in "$RELEASE_DIR"/*; do
    [ -d "$app_ver" ] || continue

    tag=$(basename "$app_ver")
    env_file="$app_ver/.env"

    if [ ! -f "$env_file" ]; then
        echo "⚠️ Skipping $tag - missing .env file"
        continue
    fi

    set -a
    . "$env_file"
    set +a

    echo "🚀 Building images for version: $tag"
    echo "    VER_APP: $VER_APP"
    echo "    VER_NGX: $VER_NGX"
    echo "    VER_GOLANG: $VER_GOLANG"
    echo "    VER_ALPINE: $VER_ALPINE"
    echo "    TARGET_REPO: $REPO_NAME"

    # 构建 base 镜像
    if [ -f "$app_ver/Dockerfile.base" ]; then
        echo "📦 Building base image: $REPO_NAME:${VER_APP}-assets"
        docker buildx build \
            --platform "$PLATFORMS" \
            --build-arg VER_APP="$VER_APP" \
            -f "$app_ver/Dockerfile.base" \
            -t "$REPO_NAME:${VER_APP}-assets" \
            --push \
            "$app_ver"
    fi

    # 构建 nginx 镜像
    if [ -f "$app_ver/Dockerfile.nginx" ]; then
        echo "📦 Building nginx image: $REPO_NAME:${VER_APP}-nginx"
        docker buildx build \
            --platform "$PLATFORMS" \
            --build-arg VER_APP="$VER_APP" \
            --build-arg VER_NGX="$VER_NGX" \
            -f "$app_ver/Dockerfile.nginx" \
            -t "$REPO_NAME:${VER_APP}-nginx" \
            --push \
            "$app_ver"
    fi

    # 构建 standalone 镜像
    if [ -f "$app_ver/Dockerfile.standalone" ]; then
        echo "📦 Building standalone image: $REPO_NAME:${VER_APP}"
        docker buildx build \
            --platform "$PLATFORMS" \
            --build-arg VER_APP="$VER_APP" \
            --build-arg VER_NGX="$VER_NGX" \
            -f "$app_ver/Dockerfile.standalone" \
            -t "$REPO_NAME:${VER_APP}" \
            --push \
            "$app_ver"
        
        # 为主版本同时打上 latest 标签
        if [ "$VER_APP" != "latest" ]; then
            echo "📦 Tagging as latest: $REPO_NAME:latest"
            docker buildx build \
                --platform "$PLATFORMS" \
                --build-arg VER_APP="$VER_APP" \
                --build-arg VER_NGX="$VER_NGX" \
                -f "$app_ver/Dockerfile.standalone" \
                -t "$REPO_NAME:latest" \
                --push \
                "$app_ver"
        fi
    fi

    # 构建 static 镜像
    if [ -f "$app_ver/Dockerfile.static" ]; then
        echo "📦 Building static image: $REPO_NAME:${VER_APP}-static"
        docker buildx build \
            --platform "$PLATFORMS" \
            --build-arg VER_APP="$VER_APP" \
            --build-arg VER_NGX="$VER_NGX" \
            -f "$app_ver/Dockerfile.static" \
            -t "$REPO_NAME:${VER_APP}-static" \
            --push \
            "$app_ver"
    fi

    echo "✅ Completed version: $tag"
done

echo "🎉 All images built and pushed successfully to $REPO_NAME"
