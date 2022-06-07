import fetch from "node-fetch";
import { Args } from "./startValidator";
import chalk from "chalk";
import { Keypair } from "@solana/web3.js";

/**
 * @internal
 */
function stringify(args: Args[]) {
  return args?.map((a) => {
    if (typeof a === "string") return a;
    return a.toBase58();
  });
}

/**
 * @internal
 */
function wait(ms: number) {
  return new Promise<void>((resolve) => setTimeout(() => resolve(), ms));
}

/**
 * @internal
 */
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

/**
 * @internal
 */
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
 *
 * @internal
 */
function logger(message: string) {
  const solana = chalk.rgb(0, 255, 163)("[solana");
  const test = chalk.rgb(3, 225, 255)("-test-");
  const validator = chalk.rgb(220, 31, 255)("validator]");

  const name = chalk.bold(solana + test + validator);

  console.log(name, chalk.red.bold("\n❯"), message);
}

/**
 * Find and return port from arguments
 *
 * @returns port
 *
 * @internal
 */
function getPortFromArgs(args: string[]): string | null {
  let portIndex = args.findIndex((arg) => arg === "--rpc-port");
  if (portIndex === -1) return null;
  else return args[portIndex + 1];
}

/**
 * @description Get array of Keypair
 *
 * @param total - number of accounts to be returned
 *
 * @returns array of Keypair
 */
function getAccounts(total: number) {
  if (total > 256) throw new Error("maximum accounts exceeded");

  const accounts: Keypair[] = [];
  const buffer = Buffer.alloc(32);

  for (let i = 0; i < total; i++) {
    const seed = Uint8Array.from(buffer);
    seed[seed.length - 1] = i;
    accounts.push(Keypair.fromSeed(seed));
  }

  return accounts;
}

export {
  stringify,
  wait,
  waitUntilRpcAvailable,
  validateRpc,
  logger,
  getPortFromArgs,
  getAccounts,
};
