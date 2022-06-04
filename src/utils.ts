import fetch from "node-fetch";
import { Args } from "./index";
import chalk from "chalk";

function stringify(args: Args[]) {
  return args?.map((a) => {
    if (typeof a === "string") return a;
    return a.toBase58();
  });
}

function wait(ms: number) {
  return new Promise<void>((resolve) => setTimeout(() => resolve(), ms));
}

async function validateRpc(port: string | number) {
  const body = {
    jsonrpc: "2.0",
    id: 1,
    method: "getHealth",
  };

  const json = await fetch(`http://localhost:${port}`, {
    method: "POST",
    body: JSON.stringify(body),
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((r) => r.json())
    .catch(() => null);

  return json?.result === "ok";
}

async function waitUntilRpcAvailable(port: string | number): Promise<void> {
  while (true) {
    if (await validateRpc(port)) return;
    await wait(1000);
  }
}

/**
 * Colorized logger
 *
 * @param message - message to be logged
 *
 * @returns colorized string
 */
function logger(message: string) {
  const solana = chalk.rgb(0, 255, 163)("[solana");
  const test = chalk.rgb(3, 225, 255)("-test-");
  const validator = chalk.rgb(220, 31, 255)("validator]");

  const name = chalk.bold(solana + test + validator);

  console.log(name, chalk.red.bold("\n>"), message);
}

export { stringify, wait, waitUntilRpcAvailable, validateRpc, logger };
