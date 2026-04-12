---
name: 🔴 Bug report
about: Create a report to help solve the problem
title: '[BUG] '
labels: bug
assignees: nhankyjangchan
---

**Describe the bug**
A clear and concise description of what the bug is.

<details>
<summary><b>📋 Example</b></summary>

> When I make a request from `http://localhost:8080`, the `Access-Control-Allow-Origin` header is missing even though I configured CORS.

</details>

---

**To Reproduce**
Steps to reproduce the behavior:

1. Setup Koa with CORS: `app.use(cors({...}))`
2. Make request from origin: `http://localhost:8080`
3. See error

<details>
<summary><b>🔁 Minimal reproduction code</b></summary>

```js
import Koa from 'koa';
import cors from '@nhankyjangchan/koajs-cors';

const app = new Koa();
app.use(
    cors({
        // your config here
    })
);
// ...
```

</details>

---

**CORS configuration used**

```js
// paste your actual config here
cors({
    origin: 'https://koajs.com/',
    allowMethods: ['HEAD', 'GET', 'POST', 'PUT', 'DELETE'],
    exposeHeaders: ['X-Pagination-Offset', 'X-Response-Time'],
    allowHeaders: ['Content-Type', 'Authorization'],
    maxAge: 3600,
    credentials: true,
    privateNetworkAccess: false,
    originOpenerPolicy: false,
    originEmbedderPolicy: false,
    keepHeadersOnError: true,
    shouldSkip: false
});
```

---

**Expected behavior**
A clear and concise description of what you expected to happen.

<details>
<summary><b>✅ Example</b></summary>

> I expected the response to include `Access-Control-Allow-Origin: http://localhost:8080` and the preflight request to return 204.

</details>

---

**Environment (please complete the following information):**

- **OS:** [e.g. Ubuntu 24.04, macOS 14.5]
- **Runtime:** [e.g. Node v20.11.0, Bun v1.3.12]
- **Package version:** [e.g. v1.3.0]

---

**Additional context / Screenshots**
Add any other context about the problem here. Screenshots of network tab or error logs are helpful.

<details>
<summary><b>📸 Logs / Network tab</b></summary>

```
Paste error logs or cURL commands here
```

</details>

---

<sub>💙 Thanks for helping improve this library!</sub>
