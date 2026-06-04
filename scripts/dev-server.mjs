import { execFileSync, spawn } from "node:child_process";
import { rmSync } from "node:fs";
import { setTimeout as wait } from "node:timers/promises";

const port = process.env.PORT ?? "3000";
const host = process.env.HOST ?? "0.0.0.0";
const localOrigin = `http://127.0.0.1:${port}`;

function killPortUsers() {
  let output = "";

  try {
    output = execFileSync("lsof", ["-tiTCP:" + port, "-sTCP:LISTEN"], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    });
  } catch {
    return;
  }

  const currentPid = String(process.pid);
  const pids = output
    .split(/\s+/)
    .map((pid) => pid.trim())
    .filter((pid) => pid && pid !== currentPid);

  for (const pid of pids) {
    try {
      process.kill(Number(pid), "SIGTERM");
      console.log(`[dev] stopped stale process ${pid} on port ${port}`);
    } catch {
      // The process may already be gone.
    }
  }
}

async function waitForRoute(pathname) {
  const url = `${localOrigin}${pathname}`;

  for (let attempt = 0; attempt < 80; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers: {
          "User-Agent": "jeffreys-dev-warmup",
        },
      });

      if (response.ok) {
        return await response.text();
      }
    } catch {
      // Server is not listening yet.
    }

    await wait(250);
  }

  throw new Error(`Timed out waiting for ${url}`);
}

async function warmAsset(assetPath) {
  try {
    const response = await fetch(`${localOrigin}${assetPath}`, {
      headers: {
        "User-Agent": "jeffreys-dev-warmup",
      },
    });

    if (!response.ok) {
      console.warn(`[dev] warmup skipped ${assetPath}: ${response.status}`);
    }
  } catch (error) {
    console.warn(`[dev] warmup skipped ${assetPath}: ${error.message}`);
  }
}

async function warmMenu() {
  const html = await waitForRoute("/menu");
  const assetPaths = new Set();
  const assetPattern = /(?:href|src)="([^"]*\/_next\/static\/[^"]+)"/g;
  let match;

  while ((match = assetPattern.exec(html)) !== null) {
    const url = new URL(match[1], localOrigin);

    if (
      url.pathname.endsWith(".css") ||
      url.pathname.endsWith(".js") ||
      url.pathname.endsWith(".woff2")
    ) {
      assetPaths.add(`${url.pathname}${url.search}`);
    }
  }

  await Promise.all([...assetPaths].map((assetPath) => warmAsset(assetPath)));
  console.log(`[dev] warmed /menu and ${assetPaths.size} static assets`);
}

killPortUsers();

try {
  rmSync(".next", {
    recursive: true,
    force: true,
  });
  console.log("[dev] removed stale .next cache");
} catch (error) {
  console.warn(`[dev] could not remove .next: ${error.message}`);
}

const nextProcess = spawn(
  "next",
  ["dev", "--hostname", host, "--port", port],
  {
    env: process.env,
    shell: true,
    stdio: ["inherit", "pipe", "pipe"],
  },
);

let warmupStarted = false;

function forwardOutput(stream) {
  stream.on("data", (chunk) => {
    const text = chunk.toString();
    process.stdout.write(text);

    if (!warmupStarted && /Ready in|Local:/.test(text)) {
      warmupStarted = true;
      warmMenu().catch((error) => {
        console.warn(`[dev] warmup failed: ${error.message}`);
      });
    }
  });
}

forwardOutput(nextProcess.stdout);
forwardOutput(nextProcess.stderr);

function shutdown(signal) {
  if (!nextProcess.killed) {
    nextProcess.kill(signal);
  }
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

nextProcess.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 0);
});
