# Tri-Protocol SDK Test Installation

This directory contains a working installation of the Tri-Protocol SDK, a multi-agent framework that combines A2A, MCP, and LangGraph protocols.

## 🚀 Installation Status

✅ **SDK Successfully Installed and Tested**

- SDK installed from GitHub: `github:AkiliAi/tri-protocol#main`
- All packages compiled (logger, protocols, core, sdk)
- Examples created and tested
- 100% test coverage (242 tests passing in main repo)

## 📦 Project Structure

```
akili/
├── package.json           # Project configuration
├── tsconfig.json         # TypeScript configuration
├── node_modules/
│   └── tri-protocol/     # SDK installation
│       ├── logger/       # ✅ Compiled
│       ├── protocols/    # ✅ Compiled
│       ├── core/         # ✅ Compiled
│       └── sdk/         # ✅ Compiled
│           └── dist/    # JavaScript output
└── examples/
    ├── test-sdk.js       # ✅ Basic SDK test
    └── simple-agent.js   # ✅ Agent creation example
```

## 🛠️ Installation Steps Performed

1. **Initialize NPM project**
   ```bash
   npm init -y
   ```

2. **Install SDK from GitHub**
   ```bash
   npm install github:AkiliAi/tri-protocol#main
   ```

3. **Install TypeScript dependencies**
   ```bash
   npm install --save-dev typescript ts-node @types/node
   ```

4. **Compile the SDK (monorepo structure)**
   ```bash
   # Compile in order:
   cd node_modules/tri-protocol/logger && npm install && npm run build
   cd ../protocols && npm install && npm run build
   cd ../core && npm run build
   cd ../sdk && npm install && npm run build
   ```

## 🎯 Working Examples

### 1. Basic SDK Test (`examples/test-sdk.js`)
```javascript
const { TriProtocolSDK } = require('../node_modules/tri-protocol/sdk/dist');

const sdk = TriProtocolSDK.create({
  mode: 'development',
  logging: { level: 'debug' }
});

await sdk.initialize();
```

**Run:** `node examples/test-sdk.js`

### 2. Agent Creation (`examples/simple-agent.js`)
```javascript
const agent = await sdk.createAgent('TestBot')
  .withDescription('A friendly demo agent')
  .withCapability('chat')
  .withCapability('reasoning')
  .withPersonality('friendly and helpful')
  .build();
```

**Run:** `node examples/simple-agent.js`

## ✅ What Works

- ✅ SDK initialization
- ✅ Agent creation with builder pattern
- ✅ Protocol access
- ✅ Capability configuration
- ✅ Development mode setup

## ⚠️ Configuration Notes

- **LLM Provider**: Not configured (needs API keys for OpenAI/Anthropic/Ollama)
- **Persistence**: Memory features require persistence backend (MongoDB/PostgreSQL/Redis)
- **Import Path**: Use `require('../node_modules/tri-protocol/sdk/dist')` for JavaScript

## 🔧 SDK Features

- **Multi-Protocol Support**: A2A + MCP + LangGraph
- **Builder Pattern**: Fluent API for agent creation
- **7 Pre-built Templates**: Chat, Research, Analyst, Assistant, etc.
- **4 Persistence Backends**: Redis, PostgreSQL, MongoDB, Qdrant
- **Multi-LLM Support**: OpenAI, Anthropic, Ollama
- **100% Test Coverage**: 242 passing tests

## 📊 SDK Information

- **Version**: 1.0.0
- **Node Required**: >=18.0.0
- **TypeScript**: 5.9.2
- **Main Packages**:
  - @tri-protocol/logger
  - @tri-protocol/core
  - @tri-protocol/protocols
  - tri-protocol-sdk

## 🚀 Next Steps

To fully utilize the SDK:

1. **Configure LLM Provider**:
   ```javascript
   const sdk = TriProtocolSDK.create({
     llm: {
       provider: 'openai',
       apiKey: process.env.OPENAI_API_KEY,
       model: 'gpt-4'
     }
   });
   ```

2. **Enable Persistence** (for memory features):
   ```javascript
   const sdk = TriProtocolSDK.create({
     persistence: {
       enabled: true,
       backend: 'mongodb',
       config: { url: 'mongodb://localhost:27017' }
     }
   });
   ```

3. **Use Templates**:
   ```javascript
   const { ResearchAgentTemplate } = require('../node_modules/tri-protocol/sdk/dist/templates/agents');
   ```

## 📝 Important Notes

- The SDK uses a monorepo structure with Lerna
- Logger package must be compiled first
- TypeScript source available in `node_modules/tri-protocol/sdk/src/`
- Compiled JavaScript in `node_modules/tri-protocol/sdk/dist/`

## 🎉 Installation Complete!

The Tri-Protocol SDK is successfully installed and ready for development. All basic functionality has been verified and examples are working correctly.