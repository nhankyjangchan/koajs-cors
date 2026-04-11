---
name: Bug report
about: Create a report to help solve the problem
title: "[BUG] "
labels: bug
assignees: nhankyjangchan

---

**Describe the bug**
A clear and concise description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:
1. Setup Koa with CORS: `app.use(cors({...}))`
2. Make request from origin: `http://localhost:3000`
3. See error

**CORS configuration**
```js
app.use(cors({
  // paste your config here
}));
```

**Expected behavior**
A clear and concise description of what you expected to happen.

**Environment (please complete the following information):**
 - OS: [e.g. Ubuntu 24.04]
 - Runtime: [e.g. Bun]
 - Runtime version: [e.g. v1.3.12]
 - Package version: [e.g. v1.2.0]

**Additional context**
Add any other context about the problem here.
