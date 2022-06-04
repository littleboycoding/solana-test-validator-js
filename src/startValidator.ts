import {
  Connection,
  ConnectionConfig,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
} from "@solana/web3.js";
import cp from "child_process";
import { Client as rpcWebSocketClient } from "rpc-websockets";
import { waitUntilRpcAvailable, stringify, logger, wait } from "./utils";

export interface Option {
  logging?: boolean;
  exec?: string;
  /**
   * Connection config
   */
  connectionConfig?: ConnectionConfig;
  /**
   * List of pre-created account
   */
  accounts?: {
    number: number;
    lamports: number;
  };
}

export interface Account {
  number: number;
  lamports: number;
}

export type Args = PublicKey | string;

export type Cleanup = () => Promise<void>;

const DEFAULT_OPTION = {
  exec: "solana-test-validator",
  accounts: {
    number: 1,
    lamports: LAMPORTS_PER_SOL * 10000,
  },
  logging: false,
  connectionConfig: undefined,
};

/**
 *  Spin-up solana-test-validator
 *
 *  @param args - arguments that get passed to solana-test-validator
 *  @param option - option for initialization
 *
 *  @returns Promise which resolve as [Connection, payer, cleanup]
 *
 *  @example
 *  ```
 *  const [conncetion, payer, cleanup] = await startSolanaTestValidator(["--ledger", ".ledger", "--reset"]);
 *  ```
 */
async function startSolanaTestValidator(
  args?: Args[],
  option?: Option
): Promise<[Connection, Keypair[], Cleanup]> {
  const stringifyArgs = stringify(args ?? []);

  const portIndex = stringifyArgs?.findIndex((a) => a === "--rpc-port");
  const port = portIndex === -1 ? "8899" : stringifyArgs[portIndex + 1];

  // enforce --reset argument
  if (!stringifyArgs.find((s) => s === "--reset"))
    stringifyArgs.push("--reset");

  // spawn process
  await wait(1000);
  const process = cp.spawn(option?.exec || DEFAULT_OPTION.exec, stringifyArgs);
  // optionally logger process
  let loggerProcess: cp.ChildProcessWithoutNullStreams;

  await waitUntilRpcAvailable(port);

  const connection = new Connection(
    `http://localhost:${port}`,
    option?.connectionConfig || DEFAULT_OPTION.connectionConfig
  );

  if (option?.logging || DEFAULT_OPTION.logging) {
    logger("Initialized solana-test-validator ⚓");

    loggerProcess = cp.spawn("solana", [
      "logs",
      "-u",
      "http://localhost:" + port,
    ]);

    loggerProcess.stdout.on("data", (data: Buffer) => {
      logger(data.toString());
    });
  }

  const accounts: Keypair[] = [];
  const airdropPromises: Promise<any>[] = [];

  for (
    let i = 0;
    i < (option?.accounts?.number || DEFAULT_OPTION.accounts.number);
    i++
  ) {
    const account = Keypair.generate();

    accounts.push(account);

    const promise = connection
      .requestAirdrop(
        account.publicKey,
        option?.accounts?.lamports || DEFAULT_OPTION.accounts.lamports
      )
      .then((signature) =>
        connection.getLatestBlockhash().then((res) => ({ ...res, signature }))
      )
      .then((strat) => connection.confirmTransaction(strat));

    airdropPromises.push(promise);
  }

  await Promise.all(airdropPromises);

  const close: Cleanup = async () => {
    const ws = (<any>connection)._rpcWebSocket as rpcWebSocketClient;
    ws.close();
    // prevent error logging
    ws.close = function () {};
    process.kill();
    loggerProcess?.kill();
  };

  return [connection, accounts, close];
}

export { startSolanaTestValidator };
