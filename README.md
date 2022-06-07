# solana-test-validator-js

Spin-up solana-test-validator instance in JavaScript, intended to be use with test framework.

It also create connection instance and funded account ready to be use in test !

highly recommended to use in combination with [Mocha](https://mochajs.org) ☕.

## This documentation is outdated ❗

Originally written for ``solana-test-validator-js@0.1``

**for ``solana-test-validator-js@0.2`` rewriting is in progress 🚧**

## Requirement

- [solana-tool-suite](https://docs.solana.com/cli/install-solana-cli-tools)

verify by running `solana-test-validator --version`

## Setup

Install dependencies

```sh
$ npm i -D solana-test-validator-js @solana/web3.js
```

In your .gitignore

```gitignore
test-ledger/
```

## Examples

### Mocha & TypeScript

```typescript
import { Connection, Keypair } from "@solana/web3.js";
import { startSolanaTestValidator, Cleanup } from "solana-test-validator-js";

describe("Test", function () {
  let connection: Connection;
  let payer: Keypair;
  let cleanup: Cleanup;

  this.timeout(60000);

  before(async function () {
    [connection, [payer], cleanup] = startSolanaTestValidator();
  });

  after(function () {
    cleanup();
  });
});
```

### Deploy mock program

```typescript
import { Connection, Keypair } from "@solana/web3.js";
import { startSolanaTestValidator, Cleanup } from "solana-test-validator-js";

describe("Test", function () {
  let connection: Connection;
  let payer: Keypair;
  let cleanup: Cleanup;

  this.timeout(60000);

  before(async function () {
    [connection, [payer], cleanup] = startSolanaTestValidator([
      "--bpf-program",
      PROGRAM_ADDRESS,
      "<path-to-program.so>",
    ]);
  });

  after(function () {
    cleanup();
  });
});
```

## Note

This project is highly inspired by awesome projects [Hardhat](https://hardhat.org) 👷 and [Truffle](https://trufflesuite.com) 🍫 !
