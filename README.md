# solana-test-validator-js

Spin-up solana-test-validator instance in JavaScript, intended to be use with framework.

It also create connection instance and funded account ready to be use in test !

It is recommended to use in combination with [Mocha](https://mochajs.org) ☕.

## Requirement

- solana-tool-suite

verify by running `solana-test-validator --version`

## Setup

install dependencies

```sh
$ npm i -D solana-test-validator-js @solana/web3.js
```

in your .gitignore

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
