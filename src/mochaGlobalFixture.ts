import { startAndConnect } from "./validator";

export async function mochaGlobalSetup(this: Mocha.Context) {
  this.timeout(60000);
  const [, cleanup] = await startAndConnect();
  this.cleanup = cleanup;
}

export function mochaGlobalTeardown(this: Mocha.Context) {
  if (this.cleanup) this.cleanup();
}
