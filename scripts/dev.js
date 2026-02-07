const { readFileSync } = require("fs");
const { spawn } = require("child_process");

let port = 3000;
try {
  const env = readFileSync(".env.local", "utf8");
  const match = env.match(/^PORT=(\d+)/m);
  if (match) port = match[1];
} catch {}

const child = spawn("npx", ["next", "dev", "--turbopack", "-p", port], {
  stdio: "inherit",
  shell: true,
});
child.on("exit", (code) => process.exit(code));
