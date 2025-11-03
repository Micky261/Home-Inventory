# Frontend Setup Guide - Yarn Berry

This project uses **Yarn Berry (v4)** managed via Corepack.

## Quick Start

1. **Enable Corepack** (one-time setup):
   ```bash
   corepack enable
   ```

   If you get a permission error, you may need to run with sudo:
   ```bash
   sudo corepack enable
   ```

2. **Install dependencies**:
   ```bash
   yarn install
   ```

   Corepack will automatically use Yarn 4.0.2 as specified in `package.json`

3. **Start development server**:
   ```bash
   yarn start
   ```

## What is Corepack?

Corepack is a Node.js feature that manages package manager versions. It reads the `packageManager` field in `package.json` and automatically downloads and uses the specified version.

## Configuration

- **package.json**: Specifies `"packageManager": "yarn@4.0.2"`
- **.yarnrc.yml**: Configures Yarn to use `node-modules` linker (compatible with most tools)

## Common Commands

```bash
# Install dependencies
yarn install

# Start dev server
yarn start

# Build for production
yarn build

# Run Angular CLI commands
yarn ng <command>

# Add a package
yarn add <package-name>

# Remove a package
yarn remove <package-name>
```

## Troubleshooting

### "Cannot find module" error
Make sure Corepack is enabled:
```bash
corepack enable
```

### Version mismatch
Verify you're using the correct Yarn version:
```bash
yarn --version
# Should output: 4.0.2
```

If not, ensure corepack is enabled and try again.

### Reset everything
```bash
rm -rf node_modules .yarn/cache .yarn/install-state.gz
yarn install
```
