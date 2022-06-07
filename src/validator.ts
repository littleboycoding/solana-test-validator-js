import {
  Connection,
  ConnectionConfig,
  Keypair,
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
import { Cleanup, setConnection } from "./states";

/**
 * default port for solana test validator
 */
const PORT = "8899";
/**
 * default executable name for solana test validator
 */
const SOLANA_TEST_VALIDATOR_EXECUTABLE = "solana-test-validator";

interface Option {
  logging: boolean;
  exec: string;
  connectionConfig?: ConnectionConfig;
  accounts: Account;
}

interface Account {
  number: number;
  lamports: number;
}

const DEFAULT_OPTION: Option = {
  exec: SOLANA_TEST_VALIDATOR_EXECUTABLE,
  accounts: {
    number: 1,
    lamports: LAMPORTS_PER_SOL * 10000,
  },
  logging: true,
  connectionConfig: undefined,
};

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

    if (option.logging) logger("Waiting for instances to gracfully close... ⛵");
  };

  return [connection, cleanup];
}

/**
 * Fund accounts
 *
 * @param connection - Connection instance
 * @param account - Account option
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

  return Promise.all(promises);
}

/**
 *  Create solana-test-validator instance
 *
 *  @param args - arguments that get passed to solana-test-validator
 *  @param logging - whether to output logging or not
 *  @param exec solana-test-validator executable
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
