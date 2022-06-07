# solana-test-validator-js

Spin-up solana-test-validator instance in JavaScript, intended to be use with test framework.

It create connection instance and funded account ready to be use in test !

highly recommended to use in combination with [Mocha](https://mochajs.org) ☕.

## Documentation

documentation for all API is generated via [TypeDoc](https://typedoc.org) at [littleboycoding.github.io/solana-test-validator-js](https://littleboycoding.github.io/solana-test-validator-js)

## Requirement

- [solana-tool-suite](https://docs.solana.com/cli/install-solana-cli-tools)

verify by running `solana-test-validator --version`

## Setup

Install dependencies

```sh
$ npm i -D solana-test-validator-js@0.2 @solana/web3.js
```

In your .gitignore

```gitignore
test-ledger/
```

## Examples

### Mocha & TypeScript

Create and connect with startAndConnect

this function spawn solana-test-validator process then create connection instance

additionally, it also create funded accounts with given number

```typescript
import { Connection, Keypair, LAMPORTS_PER_SOL } from "@solana/web3.js";
import {
  startAndConnect,
  getAccounts,
  Cleanup,
} from "solana-test-validator-js";

describe("Test", function () {
  let connection: Connection;
  let cleanup: Cleanup;

  const accounts = getAccounts(1);

  this.timeout(60000);

  before(async function () {
    [connection, cleanup] = startAndConnect([], {
      number: 1,
      lamports: LAMPORTS_PER_SOL * 10000,
    });
  });

  after(function () {
    cleanup();
  });
});
```

### Deploy mock program

`startAndConnect` accept all solana-test-validator arguments, this example use `--bpf-program` to deploy mock program !

```typescript
import { Connection, Keypair } from "@solana/web3.js";
import {
  startAndConnect,
  Cleanup,
  getAccounts,
} from "solana-test-validator-js";

describe("Test", function () {
  let connection: Connection;
  let cleanup: Cleanup;

  const accounts = getAccounts(1);

  this.timeout(60000);

  before(async function () {
    [connection, cleanup] = startAndConnect([
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

### Mocha global fixture

Mocha's global fixture make it easy to setup test that guaranteed to run only once

`fixture.ts`

```typescript
import { startAndConnect } from "solana-test-validator-js";

export async function MochaGlobalSetup() {
  const [, cleanup] = startAndConnect();
  this.cleanup();
}

export function MochaGlobalTeardown() {
  if (this.cleanup) this.cleanup();
}
```

`test.ts`

```typescript
import {
  startAndConnect,
  getAccounts,
  connection,
} from "solana-test-validator-js";

describe("Test", function () {
  const accounts = getAccounts(1);

  this.timeout(60000);

  it("should work", async function () {
    const account = await connection.getAccountInfo(accounts[0].publicKey);
  });
});
```

## Note

This project is highly inspired by awesome projects [Hardhat](https://hardhat.org) 👷 and [Truffle](https://trufflesuite.com) 🍫 !
