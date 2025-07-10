# ResilientDB SDK Project

This project contains the ResilientDB SDK and examples for building AI agents.

## Project Structure

```
ResSDK/
├── resilient-sdk/     # The main SDK package
│   ├── src/          # SDK source code
│   ├── examples/     # Example applications
│   ├── openapi.yaml  # OpenAPI specification
│   ├── package.json  # SDK dependencies
│   └── tsconfig.json # TypeScript config
└── README.md        # This file
```

## Quick Start

### 1. Build the SDK
```bash
cd resilient-sdk
npm install
npm run generate
npm run build
```

### 2. Run Examples
```bash
cd resilient-sdk/examples
npm install
npm run start
```

## SDK Features

- **Type-safe API calls** - Full TypeScript support
- **OpenAPI compliant** - Generated from OpenAPI specification
- **Simple interface** - Easy to use for AI agents
- **Error handling** - Comprehensive error types

## Examples

- `resilient-sdk/examples/example.ts` - Basic getTransactions usage

## For AI Agents

The SDK is designed to work seamlessly with AI agent frameworks like LangChain, providing:

- Structured API calls
- Type-safe parameters
- Clear error handling
- Easy integration with tool calling

## Development

### Adding New Endpoints

1. Update `resilient-sdk/openapi.yaml`
2. Run `npm run generate` in resilient-sdk
3. Update wrapper in `resilient-sdk/src/index.ts`

### Adding New Examples

1. Create new TypeScript file in `resilient-sdk/examples/`
2. Import SDK: `import { ResilientDB } from '../dist/index'`
3. Add your example code

## License

MIT
