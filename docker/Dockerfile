FROM node:20.18.1-alpine3.20 AS base
RUN apk update --no-cache && apk add --no-cache \
    tzdata \
    make \
    g++ \
    pixman-dev \
    cairo-dev \
    pango-dev \
    pkgconfig
COPY . /app
WORKDIR /app

FROM base AS builder
ENV NODE_OPTIONS="--max-old-space-size=8192"
RUN npm install --frozen-lockfile
RUN npm run build:h5-netlify

FROM nginx:alpine AS final
ENV TZ=Asia/Shanghai

# 复制 nginx 配置文件
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

# 复制构建产物
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
