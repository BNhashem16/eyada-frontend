#!/usr/bin/env node
/**
 * Reads .mcp.local.json and registers each personal MCP server with Claude
 * Code at user scope (`-s local`) so the server is available in this project
 * without committing secrets to .mcp.json.
 *
 * Usage:
 *   node scripts/register-local-mcp.js                # register all
 *   node scripts/register-local-mcp.js trello github  # register a subset
 *   node scripts/register-local-mcp.js --dry-run      # print commands only
 *
 * Requires `claude` CLI on PATH.
 */

const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const repoRoot = path.resolve(__dirname, "..");
const localFile = path.join(repoRoot, ".mcp.local.json");

if (!fs.existsSync(localFile)) {
  console.error(
    `[register-local-mcp] .mcp.local.json not found. Copy .mcp.local.example.json to .mcp.local.json and fill in your secrets first.`,
  );
  process.exit(1);
}

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const requested = args.filter((a) => !a.startsWith("--"));

let json;
try {
  json = JSON.parse(fs.readFileSync(localFile, "utf8"));
} catch (err) {
  console.error(
    `[register-local-mcp] failed to parse .mcp.local.json: ${err.message}`,
  );
  process.exit(1);
}

const servers = json.mcpServers || {};
const names = requested.length > 0 ? requested : Object.keys(servers);

if (names.length === 0) {
  console.log("[register-local-mcp] nothing to register.");
  process.exit(0);
}

const claudeCmd = process.platform === "win32" ? "claude.cmd" : "claude";

let failed = 0;
for (const name of names) {
  const conf = servers[name];
  if (!conf) {
    console.error(
      `[register-local-mcp] server "${name}" not in .mcp.local.json`,
    );
    failed++;
    continue;
  }

  const command = conf.command;
  const cmdArgs = Array.isArray(conf.args) ? conf.args : [];
  const env = conf.env || {};

  const cliArgs = ["mcp", "add", "-s", "local", name];
  for (const [k, v] of Object.entries(env)) {
    cliArgs.push("--env", `${k}=${v}`);
  }
  cliArgs.push("--", command, ...cmdArgs);

  if (dryRun) {
    console.log(
      `${claudeCmd} ${cliArgs.map((a) => (/[\s"]/.test(a) ? JSON.stringify(a) : a)).join(" ")}`,
    );
    continue;
  }

  console.log(`[register-local-mcp] registering "${name}"...`);
  const removed = spawnSync(claudeCmd, ["mcp", "remove", "-s", "local", name], {
    stdio: "ignore",
  });
  void removed;

  const result = spawnSync(claudeCmd, cliArgs, { stdio: "inherit" });
  if (result.status !== 0) {
    console.error(
      `[register-local-mcp] failed to register "${name}" (exit ${result.status}).`,
    );
    failed++;
  }
}

if (failed > 0) {
  process.exit(1);
}
console.log("[register-local-mcp] done.");
