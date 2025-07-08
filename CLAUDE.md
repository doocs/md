# MD - WeChat Markdown Editor Development Guide

## Overview

MD is a sophisticated WeChat Markdown editor built with Vue 3, TypeScript, and Vite. It provides a feature-rich editing experience with live preview, multiple themes, AI assistance, and extensive customization options.

## Common Development Commands

### Installation & Setup

```bash
# Install Node version (requires Node ≥ 20)
nvm i && nvm use

# Install dependencies
npm install
```

### Development

```bash
# Start development server (alias for npm run dev)
npm start

# Start development server with host access
npm run dev

# Build the application (deploy at /md)
npm run build

# Build for Netlify deployment (deploy at root /)
npm run build:h5-netlify

# Build with bundle analysis
npm run build:analyze

# Preview production build
npm run preview
```

### Browser Extension Development

```bash
# Start extension development
npm run ext:dev

# Build extension ZIP
npm run ext:zip

# Firefox-specific commands
npm run firefox:dev
npm run firefox:zip

# Compile VS Code extension
npm run compile:extension

# Package VS Code extension
npm run package:extension
```

### Code Quality

```bash
# Run ESLint with auto-fix
npm run lint

# Run TypeScript type checking
npm run type-check
```

### CLI Tool

```bash
# Build CLI package
npm run build:cli

# Release new CLI version
npm run release:cli
```

## High-Level Architecture

### Technology Stack

- **Frontend Framework**: Vue 3 with Composition API
- **Language**: TypeScript
- **Build Tool**: Vite
- **State Management**: Pinia
- **Styling**:
  - UnoCSS (Utility-first CSS)
  - Tailwind CSS
  - Less preprocessor
- **Editor**: CodeMirror 5
- **Markdown Processing**:
  - marked (rendering)
  - remark (parsing/stringifying)
- **UI Components**: Custom component library based on Radix Vue

### Project Structure

```
md/
├── src/                      # Source code
│   ├── App.vue              # Root component
│   ├── main.ts              # Application entry point
│   ├── assets/              # Static resources
│   │   ├── example/         # Default content examples
│   │   ├── images/          # Image assets
│   │   └── less/            # Global styles
│   ├── components/          # Vue components
│   │   ├── ui/              # Reusable UI components
│   │   ├── AIPolish/        # AI assistant features
│   │   └── CodemirrorEditor/# Editor-related components
│   ├── composables/         # Vue composables
│   ├── config/              # Configuration files
│   │   ├── ai-services.ts   # AI service configurations
│   │   ├── style.ts         # Style configurations
│   │   └── theme.ts         # Theme definitions
│   ├── stores/              # Pinia stores
│   │   ├── index.ts         # Main application store
│   │   ├── AIConfig.ts      # AI configuration store
│   │   └── useQuickCommands.ts # Quick commands store
│   ├── utils/               # Utility functions
│   │   ├── renderer.ts      # Markdown renderer
│   │   ├── editor.ts        # Editor utilities
│   │   └── clipboard.ts     # Clipboard operations
│   ├── views/               # Page components
│   ├── extension/           # VS Code extension
│   └── entrypoints/         # Browser extension entry points
├── public/                  # Public assets
├── docker/                  # Docker configurations
├── md-cli/                  # CLI tool package
├── functions/               # Serverless functions
└── example/                 # Example worker configuration
```

### Core Components

#### 1. **Editor System**

- **CodeMirror Integration**: The main editor is built on CodeMirror 5 with custom configurations for Markdown editing
- **Live Preview**: Real-time Markdown to HTML conversion with WeChat-specific styling
- **Multi-document Support**: Manage multiple documents with tree structure and history tracking

#### 2. **State Management**

- **Main Store** (`src/stores/index.ts`):
  - Document management (CRUD operations)
  - Editor configuration and preferences
  - Theme and styling management
  - Export/import functionality
- **Display Store**: UI state management (dialogs, panels)
- **AI Config Store**: AI service configurations and API keys

#### 3. **Rendering Pipeline**

1. **Markdown Processing**:
   - Custom renderer based on marked
   - Support for extensions (Mermaid, KaTeX, alerts)
   - WeChat-specific optimizations
2. **Style System**:
   - Multiple built-in themes
   - Custom CSS editor
   - Real-time style updates
   - Theme persistence

#### 4. **Image Hosting**

Supports multiple image hosting services:

- GitHub
- Alibaba Cloud OSS
- Tencent Cloud COS
- Qiniu Cloud
- MinIO
- WeChat Official Account
- Cloudflare R2
- Custom upload endpoints

#### 5. **AI Integration**

- Multiple AI providers (OpenAI, DeepSeek, Qwen, etc.)
- Content polishing and generation
- Quick commands system
- Customizable prompts

#### 6. **Extension System**

- **Browser Extension**: Inject editor into WeChat MP platform
- **VS Code Extension**: Markdown editing in VS Code
- **CLI Tool**: Run editor locally via npm

### Build Configuration

The project uses Vite with several optimizations:

- Code splitting for vendor chunks
- Separate chunks for large dependencies (KaTeX, Mermaid, highlight.js)
- Node.js polyfills for browser compatibility
- Auto-imports for Vue, Pinia, and VueUse
- Component auto-registration

### Development Workflow

1. **Git Hooks**: Pre-commit linting via simple-git-hooks
2. **Code Style**:
   - ESLint with @antfu/eslint-config
   - Prettier for formatting
   - TypeScript strict mode
3. **Testing**: Manual testing (no unit tests currently)
4. **Deployment**:
   - Static site deployment (Netlify, GitHub Pages)
   - Docker containers
   - NPM package for CLI

### Key Features Implementation

1. **Real-time Preview**: Uses a custom renderer that processes Markdown and applies WeChat-specific styles
2. **Theme System**: CSS-in-JS approach with dynamic style injection
3. **File Management**: Local storage-based with import/export capabilities
4. **Image Upload**: Abstracted upload interface supporting multiple providers
5. **AI Assistant**: Modular AI service integration with streaming support

## Notes for Contributors

- Follow the established code style (backtick strings, no semicolons)
- Components use Vue 3 Composition API with `<script setup>`
- State management should go through Pinia stores
- UI components should be placed in `src/components/ui/`
- Utility functions belong in `src/utils/`
- Keep browser compatibility in mind (Chrome is primary target)
