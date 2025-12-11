# Testing Guide

## Overview
This project uses [Vitest](https://vitest.dev/) for unit and integration testing.

## Running Tests
To run all tests:
```bash
pnpm test
```

To run tests in watch mode:
```bash
pnpm test --watch
```

## Writing Tests
- Place test files next to the source files they test, named `*.test.ts` or `*.test.tsx`.
- Use `vi.mock` to mock external dependencies like Cloudflare bindings or `fetch`.

## Coverage
Ensure core logic, especially API routes and data transformations, are covered.
