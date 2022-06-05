import { Connection, Keypair, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { Cleanup, startSolanaTestValidator } from "../src/index";
import { assert } from "chai";

describe("startSolanaTestValidator", function () {
  let connection: Connection;
  let accounts: Keypair[];
  let cleanUp: Cleanup;

  before(async function () {
    this.timeout(30000);
    [connection, accounts, cleanUp] = await startSolanaTestValidator([], {
      logging: true,
      accounts: {
        number: 2,
        lamports: LAMPORTS_PER_SOL * 10000,
      },
    });
  });

  after(function () {
    cleanUp();
  });

  it("should return expected value", function () {
    assert.isArray(accounts);
    assert.isFunction(cleanUp);
    assert.instanceOf(connection, Connection);
    assert.instanceOf(accounts[0], Keypair);
    assert.instanceOf(accounts[1], Keypair);
  });
});
