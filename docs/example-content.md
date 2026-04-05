# 📝 Example Content - Reference Templates

A collection of example articles demonstrating the full capabilities of doocs/md. Use these as templates or inspiration for your own WeChat articles.

---

## 📋 Table of Contents

- [Template 1: Technical Tutorial](#template-1-technical-tutorial)
- [Template 2: Product Announcement](#template-2-product-announcement)
- [Template 3: Weekly Newsletter](#template-3-weekly-newsletter)
- [Template 4: Academic Article](#template-4-academic-article)

---

## Template 1: Technical Tutorial

### Example: Getting Started with Docker

```markdown
# 🐳 Getting Started with Docker: A Beginner's Guide

Docker has revolutionized how we build, ship, and run applications. In this tutorial, you'll learn the basics of containerization and how to containerize your first application.

---

## What is Docker?

Docker is an open platform for developing, shipping, and running applications. It enables you to separate your applications from your infrastructure so you can deliver software quickly.

> [!TIP]
> Think of Docker containers as lightweight, standalone, executable packages that include everything needed to run an application.

---

## Installing Docker

### On macOS

\`\`\`bash
# Using Homebrew
brew install --cask docker

# Or download from Docker Desktop
curl -o Docker.dmg https://desktop.docker.com/mac/main/amd64/Docker.dmg
\`\`\`

### On Ubuntu

\`\`\`bash
# Update package index
sudo apt-get update

# Install prerequisites
sudo apt-get install ca-certificates curl gnupg

# Add Docker's official GPG key
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# Add repository
sudo chmod a+r /etc/apt/keyrings/docker.gpg
echo "deb [arch="$(dpkg --print-architecture)" signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu "$(. /etc/os-release && echo "$VERSION_CODENAME")" stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker
sudo apt-get update
sudo apt-get install docker-ce docker-ce-cli containerd.io
\`\`\`

---

## Your First Container

Let's run a simple "Hello World" container:

\`\`\`bash
# Run hello-world container
docker run hello-world
\`\`\`

**Expected output:**

\`\`\`
Hello from Docker!
This message shows that your installation appears to be working correctly.
\`\`\`

---

## Building Your Own Image

Create a simple Dockerfile:

\`\`\`dockerfile
# Use official Node.js runtime as base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application code
COPY . .

# Expose port
EXPOSE 3000

# Start application
CMD ["node", "server.js"]
\`\`\`

Build and run:

\`\`\`bash
# Build the image
docker build -t my-node-app .

# Run the container
docker run -p 3000:3000 my-node-app
\`\`\`

---

## Common Commands Cheat Sheet

| Command | Description |
|---------|-------------|
| \`docker ps\` | List running containers |
| \`docker ps -a\` | List all containers |
| \`docker images\` | List images |
| \`docker stop <id>\` | Stop a container |
| \`docker rm <id>\` | Remove a container |
| \`docker rmi <id>\` | Remove an image |
| \`docker logs <id>\` | View container logs |

---

## Conclusion

You've learned:
- ✅ What Docker is and why it's useful
- ✅ How to install Docker on your system
- ✅ How to run your first container
- ✅ How to build custom Docker images

> [!IMPORTANT]
> Next step: Learn about Docker Compose for multi-container applications!

---

*Published on 2026-04-05*  
*Author: Your Name*  
*Tags: #docker #devops #tutorial #containers*
```

---

## Template 2: Product Announcement

### Example: Introducing Our New Feature

```markdown
# 🚀 Announcing AI-Powered Code Review: Smarter, Faster Development

We're excited to introduce our most requested feature yet: **AI-Powered Code Review**. Starting today, every pull request gets intelligent feedback powered by advanced language models.

---

## What's New?

### 🤖 Intelligent Code Analysis

Our AI analyzes your code changes and provides:

- **Bug Detection**: Catch potential issues before they reach production
- **Performance Insights**: Identify optimization opportunities
- **Best Practice Suggestions**: Learn modern patterns and conventions
- **Security Warnings**: Detect common vulnerabilities

> [!NOTE]
> AI suggestions are advisory. Always review recommendations with your team's context in mind.

---

## How It Works

\`\`\`mermaid
flowchart LR
    A[Push Code] --> B[Create PR]
    B --> C[AI Analysis]
    C --> D[Generate Report]
    D --> E[Review & Merge]
\`\`\`

1. **Push your code** to any branch
2. **Create a pull request** as usual
3. **AI automatically analyzes** your changes
4. **Review the suggestions** inline with your code
5. **Merge with confidence** knowing you've had an extra pair of (artificial) eyes

---

## Key Features

### ⚡ Real-time Analysis

Suggestions appear within seconds of creating your PR. No waiting, no delays.

### 🎯 Context-Aware

The AI understands:
- Your project's coding standards
- Framework-specific patterns
- Language idioms and best practices

### 🛡️ Privacy First

- Code is processed in isolated environments
- No training on your private repositories
- SOC 2 Type II compliant infrastructure

---

## Getting Started

### For Repository Admins

Enable AI Code Review in your repository settings:

1. Go to **Settings** → **Code Review**
2. Toggle **AI-Powered Review** to ON
3. Configure sensitivity level (Conservative / Balanced / Aggressive)
4. Save changes

### For Developers

No action needed! AI review starts automatically on your next PR.

---

## Pricing

| Plan | AI Reviews | Price |
|------|------------|-------|
| Free | 50/month | $0 |
| Pro | Unlimited | $12/user/month |
| Enterprise | Unlimited + Custom Models | Contact us |

---

## FAQ

**Q: Does AI review replace human reviewers?**  
A: No! AI augments your team's review process but doesn't replace human judgment.

**Q: Can I disable specific types of suggestions?**  
A: Yes, fully customizable in repository settings.

**Q: What languages are supported?**  
A: Python, JavaScript, TypeScript, Go, Rust, Java, C++, Ruby, and more.

---

## Try It Today

Ready to supercharge your code reviews?

[→ Enable AI Code Review](https://example.com/enable)  
[→ Read Documentation](https://example.com/docs)  
[→ Join Our Discord](https://discord.gg/example)

---

*Questions? Contact us at support@example.com*

*Published on 2026-04-01*
```

---

## Template 3: Weekly Newsletter

### Example: Tech Weekly Digest

```markdown
# 📰 Tech Weekly - Issue #42

*Your weekly dose of tech news, tutorials, and community highlights*

---

## 🔥 This Week's Highlights

### 1. Rust 1.80 Released

The Rust team announced version 1.80 with exciting new features:

- **Lazy Type Aliases**: More flexible generic programming
- **Improved Error Messages**: Better diagnostics for complex types
- **Performance Boosts**: Up to 15% faster compile times

> [!TIP]
> Update with: \`rustup update stable\`

---

### 2. OpenAI GPT-5 Preview

OpenAI teased their next-generation model at the developer conference:

| Feature | GPT-4 | GPT-5 (Preview) |
|---------|-------|-----------------|
| Context Window | 128K | 1M tokens |
| Multimodal | Text + Image | Text + Image + Audio + Video |
| Reasoning | Good | Enhanced chain-of-thought |

---

### 3. Linux Kernel 6.10

Linus Torvalds released Linux 6.10 with:

- New scheduler improvements
- Better ARM64 support
- Initial Rust driver support

\`\`\`bash
# Check your current kernel
uname -r

# Ubuntu users can upgrade
sudo apt update && sudo apt upgrade
\`\`\`

---

## 📚 Tutorial of the Week

### Building Real-time Apps with WebSockets

Learn how to build a real-time chat application:

\`\`\`javascript
// Server-side with Node.js
const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', (ws) => {
  ws.on('message', (message) => {
    // Broadcast to all clients
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  });
});
\`\`\`

[Read full tutorial →](https://example.com/tutorial)

---

## 🛠️ Tool of the Week

### ripgrep - Fast Text Search

\`\`\`bash
# Install
brew install ripgrep  # macOS
apt install ripgrep   # Ubuntu

# Usage examples
rg "TODO"              # Find all TODOs
rg "function" -t js    # Search in JS files only
rg "pattern" --context 3  # Show 3 lines of context
\`\`\`

---

## 🎓 Learning Resources

- [System Design Primer](https://github.com/donnemartin/system-design-primer) - Learn系统设计
- [Effective Rust](https://www.lurklurk.org/effective-rust/) - 35 Rust best practices
- [The Missing Semester](https://missing.csail.mit.edu/) - Essential computing skills

---

## 💬 Community Spotlight

### Project of the Week: Starship

Cross-shell prompt written in Rust:

\`\`\`bash
# Install
curl -sS https://starship.rs/install.sh | sh

# Add to .bashrc
eval "$(starship init bash)"
\`\`\`

Features:
- ⚡ Fast - renders in milliseconds
- 🎨 Customizable - extensive theming
- 📦 Rich info - git status, runtime versions, etc.

---

## 📅 Upcoming Events

| Date | Event | Location |
|------|-------|----------|
| Apr 10 | Rust Meetup | Online |
| Apr 15 | KubeCon EU | Amsterdam |
| Apr 20 | React Conf | Las Vegas |

---

## 🎯 Challenge of the Week

Write a function that finds the first non-repeating character in a string:

\`\`\`python
def first_unique(s: str) -> str:
    # Your solution here
    pass

# Test cases
assert first_unique("leetcode") == "l"
assert first_unique("loveleetcode") == "v"
assert first_unique("aabb") == ""
\`\`\`

Submit your solution in our [Discord](https://discord.gg/example)!

---

## 📮 Subscribe

Get Tech Weekly delivered to your inbox every Monday:

[Subscribe Now →](https://example.com/subscribe)

---

*Thanks for reading! Share this newsletter with your fellow developers.*

*Published on 2026-04-05*  
*Issue #42*  
*[View Archive](https://example.com/archive)*
```

---

## Template 4: Academic Article

### Example: Introduction to Machine Learning

```markdown
# 机器学习基础：从理论到实践

机器学习（Machine Learning）是人工智能的核心分支。本文将介绍机器学习的基本概念、主要类型和实际应用。

---

## 什么是机器学习？

机器学习是一种让计算机从数据中自动学习和改进的方法，而无需进行明确的编程。

> [!DEFINITION]
> 机器学习是计算机科学的一个领域，它使计算机能够在没有明确编程的情况下进行学习。 —— Arthur Samuel, 1959

---

## 机器学习的类型

### 1. 监督学习（Supervised Learning）

在监督学习中，算法从标记的训练数据中学习，建立一个将输入映射到输出的模型。

\`\`\`python
# 示例：线性回归
from sklearn.linear_model import LinearRegression
import numpy as np

# 训练数据
X = np.array([[1], [2], [3], [4], [5]])
y = np.array([2, 4, 6, 8, 10])

# 创建并训练模型
model = LinearRegression()
model.fit(X, y)

# 预测
prediction = model.predict([[6]])
print(f"预测结果: {prediction[0]}")  # 输出: 12.0
\`\`\`

**常见算法：**
- 线性回归（Linear Regression）
- 逻辑回归（Logistic Regression）
- 决策树（Decision Trees）
- 支持向量机（SVM）
- 神经网络（Neural Networks）

---

### 2. 无监督学习（Unsupervised Learning）

无监督学习处理未标记的数据，发现数据中隐藏的模式和结构。

\`\`\`python
# 示例：K-means聚类
from sklearn.cluster import KMeans
import numpy as np

# 数据点
X = np.array([[1, 2], [1, 4], [1, 0],
              [4, 2], [4, 4], [4, 0]])

# 聚类
kmeans = KMeans(n_clusters=2, random_state=0)
kmeans.fit(X)

print(f"聚类中心: {kmeans.cluster_centers_}")
print(f"标签: {kmeans.labels_}")
\`\`\`

**常见算法：**
- K-means聚类
- 层次聚类
- 主成分分析（PCA）
- 关联规则学习

---

### 3. 强化学习（Reinforcement Learning）

强化学习通过与环境的交互来学习最优行为策略。

\`\`\`mermaid
graph LR
    A[Agent] -->|Action| B[Environment]
    B -->|State + Reward| A
\`\`\`

**核心要素：**
- **Agent（智能体）**：学习者或决策者
- **Environment（环境）**：智能体所处的外部世界
- **State（状态）**：环境的当前状况
- **Action（动作）**：智能体可以执行的操作
- **Reward（奖励）**：环境对动作的反馈

---

## 数学基础

### 线性代数

机器学习中大量使用向量和矩阵运算：

$$
\mathbf{y} = \mathbf{X}\mathbf{w} + \mathbf{b}
$$

其中：
- $\mathbf{X}$ 是输入特征矩阵
- $\mathbf{w}$ 是权重向量
- $\mathbf{b}$ 是偏置项
- $\mathbf{y}$ 是预测输出

### 概率论

贝叶斯定理是机器学习的重要基础：

$$
P(A|B) = \frac{P(B|A) \cdot P(A)}{P(B)}
$$

### 微积分

梯度下降算法需要计算损失函数的导数：

$$
\theta_{new} = \theta_{old} - \alpha \nabla J(\theta)
$$

---

## 实际应用

| 领域 | 应用场景 | 典型算法 |
|------|----------|----------|
| 计算机视觉 | 图像分类、目标检测 | CNN |
| 自然语言处理 | 机器翻译、情感分析 | Transformer |
| 推荐系统 | 商品推荐、内容推荐 | 协同过滤 |
| 金融 | 信用评分、欺诈检测 | 随机森林 |
| 医疗 | 疾病诊断、药物发现 | 深度学习 |

---

## 学习资源

### 在线课程

- [吴恩达机器学习课程](https://www.coursera.org/learn/machine-learning)
- [Fast.ai 深度学习课程](https://www.fast.ai/)
- [Stanford CS229](http://cs229.stanford.edu/)

### 推荐书籍

| 书名 | 作者 | 难度 |
|------|------|------|
| 《机器学习》 | 周志华 | ⭐⭐⭐ |
| 《深度学习》 | Goodfellow et al. | ⭐⭐⭐⭐ |
| 《统计学习方法》 | 李航 | ⭐⭐⭐ |

---

## 总结

本文介绍了机器学习的三大类型：

1. ✅ **监督学习** - 从标记数据中学习
2. ✅ **无监督学习** - 从未标记数据中发现模式
3. ✅ **强化学习** - 通过与环境交互学习

> [!IMPORTANT]
> 机器学习是一个快速发展的领域，持续学习是成功的关键。

---

## 参考

[1] Mitchell, T. (1997). Machine Learning. McGraw Hill.  
[2] Goodfellow, I., Bengio, Y., & Courville, A. (2016). Deep Learning. MIT Press.  
[3] 周志华. (2016). 机器学习. 清华大学出版社.

---

*Published on 2026-04-05*  
*Author: [Your Name]*  
*Category: #machine-learning #tutorial #ai #education*
```

---

## 🎨 Customizing These Templates

### Change Colors

Add custom CSS in the editor:

```css
h1 { color: #2c3e50; }
h2 { color: #3498db; border-bottom: 2px solid #ecf0f1; }
blockquote { border-left: 4px solid #3498db; }
```

### Add Your Branding

Include a header image:

```markdown
<div align="center">
  <img src="your-logo.png" alt="Logo" width="200">
</div>
```

### Interactive Elements

Embed polls or quizzes using custom HTML (where supported).

---

## 💡 Tips for Great WeChat Articles

1. **Start with a hook** - Grab attention in the first paragraph
2. **Use visual hierarchy** - Headers, lists, and quotes break up text
3. **Include examples** - Show, don't just tell
4. **Add diagrams** - Mermaid charts explain complex concepts
5. **End with CTA** - What should readers do next?

---

*These templates are released under CC0 - feel free to use and modify them!*

*Last updated: April 2026*
