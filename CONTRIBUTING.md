# Contributing to DevTrace Lion

Thank you for your interest in contributing to DevTrace Lion! We welcome contributions ranging from bug reports and documentation enhancements to new code generators and diagnostic rules.

---

## Development Workflow

1. **Fork and Clone**:
   ```bash
   git clone https://github.com/malilion/devtrace-lion.git
   cd devtrace-lion
   ```

2. **Install Dependencies**:
   ```bash
   pnpm install
   ```

3. **Run Dev Mode**:
   ```bash
   pnpm dev
   ```

4. **Run Verification Suite**:
   ```bash
   pnpm test
   pnpm typecheck
   pnpm build
   ```

---

## Code Quality Standards

- **TypeScript Strictness**: No `any` types (except inside the isolated `getContent` browser compatibility wrapper).
- **Pure Functions**: Code generators, normalizers, diff calculators, and diagnostic insights must remain pure functions independent of `chrome.devtools`.
- **Unit Test Coverage**: Every new code generator or diagnostic rule must be accompanied by comprehensive unit tests and fixtures in `tests/unit/`.
- **Zero Permissions**: Never add permissions to `manifest` without architectural approval.

---

## Good First Issues

Looking for a great way to start contributing? Consider picking up one of these:

- [ ] **Add Python `requests` code generator** in `lib/codegen/python.ts`
- [ ] **Add Go `net/http` code generator** in `lib/codegen/go.ts`
- [ ] **Add PHP `curl` code generator** in `lib/codegen/php.ts`
- [ ] **Add HTTPie CLI code generator** in `lib/codegen/httpie.ts`
- [ ] **Add specialized insight rule** for Cloudflare 52x status codes
- [ ] **Add new HAR fixtures** for GraphQL or multipart form data

---

## Pull Request Process

1. Create a descriptive feature branch (`git checkout -b feat/python-codegen`).
2. Commit your changes with clear commit messages following Conventional Commits (`feat(codegen): add python requests generator`).
3. Ensure all tests (`pnpm test`) and typechecks (`pnpm typecheck`) pass.
4. Submit a Pull Request targeting `main`.
