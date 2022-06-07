import { Connection, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { expect } from "chai";
import { startAndConnect } from "../src/validator";
import { connection } from "../src/states";

describe("validator", function () {
  this.timeout(60000);

  before(async function () {
    const [connection, cleanup] = await startAndConnect([], {
      exec: "solana-test-validator",
      logging: false,
      accounts: {
        lamports: LAMPORTS_PER_SOL * 1000,
        number: 5,
      },
    });

    this.cleanup = cleanup;
    this.connection = connection;
  });

  after(function () {
    if (this.cleanup) this.cleanup();
  });

  describe("startAndConnect", function () {
    it("should start and connect to solana-test-validator successfully", function () {
      expect(this.connection).to.be.instanceof(Connection);
      expect(connection).to.be.instanceof(Connection);
      expect(this.cleanup).to.be.an("function");
    });
  });
});
