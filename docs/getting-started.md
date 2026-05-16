# 🚀 Getting Started with doocs/md

Welcome! This guide will help you get started with **doocs/md** - the most elegant WeChat Markdown editor. Whether you're a blogger, developer, or content creator, you'll find this tool incredibly useful for creating beautifully formatted WeChat articles.

---

## 📋 Table of Contents

- [What is doocs/md?](#what-is-doocsmd)
- [Quick Start Options](#quick-start-options)
  - [Option 1: Online Editor (Recommended)](#option-1-online-editor-recommended)
  - [Option 2: Browser Extension](#option-2-browser-extension)
  - [Option 3: Docker Deployment](#option-3-docker-deployment)
  - [Option 4: CLI Tool](#option-4-cli-tool)
- [Next Steps](#next-steps)
- [Getting Help](#getting-help)

---

## What is doocs/md?

doocs/md is a **Markdown-to-WeChat** editor that instantly converts your Markdown documents into beautifully formatted WeChat articles. No more struggling with WeChat's native editor!

### ✨ Key Features

- 🎨 **Live Preview** - See your changes in real-time
- 🖼️ **Image Hosting** - Support for 13+ image hosting services
- 🤖 **AI Integration** - Built-in support for DeepSeek, OpenAI, and more
- 📊 **Diagrams** - Mermaid, PlantUML, and GFM alerts
- 📝 **Math Formulas** - LaTeX support for technical writing
- 🎭 **Custom Themes** - Personalize your article styling
- 💾 **Auto-Save** - Never lose your work

---

## Quick Start Options

### Option 1: Online Editor (Recommended) ⭐

The fastest way to start - no installation required!

**🔗 [https://md.doocs.org](https://md.doocs.org)**

1. Open the link above (Chrome browser recommended)
2. Start typing Markdown on the left
3. See the formatted preview on the right
4. Copy and paste into WeChat!

> 💡 **Tip**: Your content is automatically saved to local storage.

---

### Option 2: Browser Extension

For seamless integration with your workflow:

#### Chrome Extension

1. Visit [Chrome Web Store](https://chrome.google.com/webstore/detail/doocs-md/jgmdofbiodocggnpggeiikdagkghkjg)
2. Click "Add to Chrome"
3. Access the editor anytime from your browser toolbar

#### Firefox Extension

1. Visit [Firefox Add-ons](https://addons.mozilla.org/firefox/addon/doocs-md/)
2. Click "Add to Firefox"
3. Start editing offline!

#### Manual Installation (Development)

```bash
# Clone the repository
git clone https://github.com/doocs/md.git
cd md

# Install dependencies
pnpm i

# Build Chrome extension
pnpm web ext:zip

# Load the extension
# 1. Open chrome://extensions/
# 2. Enable "Developer mode"
# 3. Click "Load unpacked"
# 4. Select apps/web/.output/chrome-mv3-dev
```

---

### Option 3: Docker Deployment

Deploy your own private instance:

```bash
# Run with Docker
docker run -d -p 8080:80 doocs/md:latest

# Access your instance
open http://localhost:8080
```

#### Docker Compose (Advanced)

```yaml
version: '3'
services:
  md:
    image: doocs/md:latest
    ports:
      - "8080:80"
    restart: unless-stopped
    container_name: doocs-md
```

> 📚 For more Docker options, see [docker-md repository](https://github.com/doocs/docker-md)

---

### Option 4: CLI Tool

For developers who prefer command line:

```bash
# Install globally
npm i -g @doocs/md-cli

# Start the server
md-cli

# Or specify a custom port
md-cli port=8899

# Access
open http://127.0.0.1:8800
```

#### CLI Options

| Parameter | Description | Default |
|-----------|-------------|---------|
| `port` | Server port | 8800 |
| `spaceId` | DCloud service space ID | - |
| `clientSecret` | DCloud client secret | - |

---

## Next Steps

Now that you have doocs/md running, here's what to explore next:

### 📖 Learn the Syntax

New to Markdown? Check out our [**Markdown Syntax Guide**](./markdown-guide.md) for a complete reference of all supported features, including:

- Basic Markdown syntax
- WeChat-specific formatting
- Math formulas (LaTeX)
- Diagrams (Mermaid & PlantUML)
- Custom Ruby annotations

### 📝 Try Example Content

Want to see what your articles can look like? Browse our [**Example Content**](./example-content.md) for inspiration and reference templates.

### ⚙️ Configure Image Hosting

Set up your preferred image hosting service:

1. Click the **Settings** (⚙️) icon
2. Select **Image Upload**
3. Choose your preferred hosting service
4. Enter your credentials

> 🔐 Your credentials are stored locally in your browser.

---

## Getting Help

### 🤔 Common Questions

**Q: Is my data secure?**  
A: Yes! All content is processed locally in your browser. We don't store any of your data on our servers.

**Q: Can I use this commercially?**  
A: Absolutely! doocs/md is released under WTFPL - do whatever you want with it.

**Q: Does it work offline?**  
A: The browser extension and CLI versions work completely offline. The online version requires internet.

**Q: Can I contribute?**  
A: We'd love your help! See our [Contributing Guide](../CONTRIBUTING.md).

### 🆘 Need More Help?

- 📋 [GitHub Issues](https://github.com/doocs/md/issues) - Report bugs or request features
- 💬 [Discussions](https://github.com/doocs/md/discussions) - Ask questions and share ideas
- 👥 [WeChat Group](https://github.com/doocs/md#-feedback-and-exchange) - Join our community (QR code in main README)

---

## 🌟 Support the Project

If you find doocs/md helpful, please consider:

- ⭐ [Star us on GitHub](https://github.com/doocs/md)
- 🍴 [Fork and contribute](https://github.com/doocs/md/fork)
- ☕ [Buy us a coffee](https://github.com/doocs/md#-support-us)

---

**Happy Writing!** 🎉

*Last updated: April 2026*
