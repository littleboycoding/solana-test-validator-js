import { Connection, Keypair } from "@solana/web3.js";
import { Cleanup, startSolanaTestValidator, states } from "../src/index";
import { assert } from "chai";

describe("startSolanaTestValidator", function () {
  let connection: Connection;
  let accounts: Keypair[];
  let cleanup: Cleanup;

  before(async function () {
    this.timeout(30000);
    [connection, accounts, cleanup] = await startSolanaTestValidator([], {
      logging: true,
    });
  });

  after(function () {
    cleanup();
  });

  it("should setup successfully", function () {
    const glboalStates = states();

    // Assert local state
    assert.instanceOf(connection, Connection);
    assert.isArray(accounts);
    assert.instanceOf(accounts[0], Keypair);
    assert.isFunction(cleanup);

    // Assert global state
    assert.instanceOf(glboalStates?.connection, Connection);
    assert.isArray(glboalStates?.accounts);
    assert.instanceOf(glboalStates?.accounts?.[0], Keypair);
    assert.isFunction(glboalStates?.cleanup);
  });
});
