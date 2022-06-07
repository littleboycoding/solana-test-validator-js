# solana-test-validator-js

Spin-up solana-test-validator instance in JavaScript, intended to be use with test framework.

It also create connection instance and funded account ready to be use in test !

highly recommended to use in combination with [Mocha](https://mochajs.org) ☕.

## This documentation is outdated ❗

Originally written for `solana-test-validator-js@0.1`

**for `solana-test-validator-js@0.2` rewriting is in progress 🚧**

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
import {
  startAndConnect,
  getAccounts,
  Cleanup,
} from "solana-test-validator-js";

describe("Test", function () {
  let connection: Connection;
  let cleanup: Cleanup;

  const payer = getAccounts(1);

  this.timeout(60000);

  before(async function () {
    [connection, cleanup] = startAndConnect();
  });

  after(function () {
    cleanup();
  });
});
```

### Deploy mock program

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

  const payer = getAccounts(1);

  this.timeout(60000);

  before(async function () {
    [connection, [payer], cleanup] = startAndConnect([
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

- fixture.ts

```typescript
import { startAndConnect } from "solana-test-validator-js";

export async function mochaGlobalSetup() {
  const [, cleanup] = startAndConnect();
  this.cleanup = cleanup;
}

export function mochaGlobalTeardown() {
  if (this.cleanup) this.cleanup();
}
```

- test.ts

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

- .mocharc.js
```javascript
module.exports = {
  require: ["ts-node/register", "./fixture.ts"]
};
```

## Note

This project is highly inspired by awesome projects [Hardhat](https://hardhat.org) 👷 and [Truffle](https://trufflesuite.com) 🍫 !
