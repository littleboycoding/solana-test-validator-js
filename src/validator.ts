import {
  Connection,
  ConnectionConfig,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import cp from "child_process";
import {
  waitUntilRpcAvailable,
  logger,
  getPortFromArgs,
  getAccounts,
} from "./utils";
import { Client as rpcWebSocketClient } from "rpc-websockets";
import { setConnection } from "./states";

/**
 * default port for solana test validator
 */
const PORT = "8899";
/**
 * default executable name for solana test validator
 */
const SOLANA_TEST_VALIDATOR_EXECUTABLE = "solana-test-validator";

export interface Option {
  logging: boolean;
  exec: string;
  connectionConfig?: ConnectionConfig;
  accounts: Account;
}

export interface Account {
  number: number;
  lamports: number;
}

/**
 * @description teardown function to close all created process
 */
export type Cleanup = () => void;

/**
 * @description solana-test-validator arguments
 *
 * @see https://docs.solana.com/developing/test-validator
 */
export type Args = string[];

const DEFAULT_OPTION: Option = {
  exec: SOLANA_TEST_VALIDATOR_EXECUTABLE,
  accounts: {
    number: 1,
    lamports: LAMPORTS_PER_SOL * 10000,
  },
  logging: true,
  connectionConfig: undefined,
};

/**
 * @description Spin-up solana-test-validator
 *
 * @param args - solana-test-validator arguments
 * @param option - option for Initializing
 *
 * @returns [connection instance, cleanup function]
 *
 * @example
 * start and connect with default args
 * ```
 * const [connection, cleanup] = await startAndConnect();
 * ```
 * @example
 * connection instance can also be obtained from anywhere else by import
 * ```
 * import { connection } from "solana-test-validator-js"
 * ```
 *
 * @see https://docs.solana.com/developing/test-validator
 */
async function startAndConnect(
  args: string[] = [],
  option: Option = DEFAULT_OPTION
): Promise<[Connection, Cleanup]> {
  const port = getPortFromArgs(args) || PORT;

  const [validator, solanaLogger] = await start(
    args,
    option.logging,
    option.exec
  );
  const connection = new Connection(
    `http://localhost:${port}`,
    option.connectionConfig
  );

  setConnection(connection);

  await fundAccounts(connection, option.accounts);

  const cleanup = () => {
    const ws = (<any>connection)._rpcWebSocket as rpcWebSocketClient;
    ws.close();
    ws.close = function () {};

    if (validator) validator.kill();
    if (solanaLogger) solanaLogger.kill();

    if (option.logging)
      logger("Waiting for instances to gracfully close... ⛵");
  };

  return [connection, cleanup];
}

/**
 * Fund accounts
 *
 * @param connection - Connection instance
 * @param account - Account option
 *
 * @internal
 */
async function fundAccounts(connection: Connection, account: Account) {
  const accounts = getAccounts(account.number);
  const promises = [];

  for (let i = 0; i < accounts.length; i++) {
    const promise = connection
      .requestAirdrop(accounts[i].publicKey, account.lamports)
      .then((signature) =>
        connection.getLatestBlockhash().then((res) => ({ ...res, signature }))
      )
      .then((strat) => connection.confirmTransaction(strat));

    promises.push(promise);
  }

  await Promise.all(promises);
}

/**
 *  @description Create solana-test-validator instance
 *
 *  @param args - arguments that get passed to solana-test-validator
 *  @param logging - whether to output logging or not
 *  @param exec solana-test-validator executable
 *
 *  @internal
 *
 *  @returns Promise which resolve as [Connection, payer, cleanup]
 */
async function start(
  args: string[],
  logging: boolean,
  exec: string = SOLANA_TEST_VALIDATOR_EXECUTABLE
) {
  const preparedArgs = [...args];

  if (!preparedArgs.find((arg) => arg === "--reset"))
    preparedArgs.push("--reset");

  const port = getPortFromArgs(args) || PORT;

  const process = cp.spawn(exec, preparedArgs);

  await waitUntilRpcAvailable(port);

  if (!logging) return [process, null];

  logger("Initialized solana-test-validator ⚓");

  const solanaLogger = cp.spawn("solana", [
    "logs",
    "-u",
    `http://localhost:${port}`,
  ]);
  solanaLogger.stdout.on("data", (data: Buffer) => logger(data.toString()));

  return [process, solanaLogger];
}

export { start, startAndConnect };
