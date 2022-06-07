import { Keypair } from "@solana/web3.js";
import { expect } from "chai";
import { getAccounts } from "../src/utils";

describe("utils", function () {
  describe("getAccounts", function () {
    const TOTAL_ACCOUNTS = 256;
    let accounts: Keypair[];

    before(function () {
      accounts = getAccounts(TOTAL_ACCOUNTS);
    });

    it("should output array of uniques keypair", function () {
      const setOfAccounts = new Set(
        accounts.map((account) => account.publicKey.toBase58())
      );

      expect(accounts).to.be.an("array").and.have.lengthOf(TOTAL_ACCOUNTS);
      expect(setOfAccounts).to.have.lengthOf(TOTAL_ACCOUNTS);
    });

    it("should give exact same output", function () {
      const otherAccounts = getAccounts(TOTAL_ACCOUNTS);

      expect(otherAccounts).to.eql(accounts);
    });

    it("should thrown when input more than 256 accounts", function () {
      expect(() => getAccounts(257)).to.be.throw();
    });
  });
});
