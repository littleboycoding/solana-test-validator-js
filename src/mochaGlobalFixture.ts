import { startAndConnect } from "./validator";

export async function mochaGlobalSetup(this: Mocha.Context) {
  const [, cleanup] = await startAndConnect();
  this.cleanup = cleanup;
}

export function mochaGlobalTeardown(this: Mocha.Context) {
  if (this.cleanup) this.cleanup();
}
