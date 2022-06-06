import { Connection, Keypair } from "@solana/web3.js";

/**
 * teardown function to close all created process
 */
export type Cleanup = () => Promise<void>;

declare global {
  /**
   * Internally global state
   * @internal
   */
  var _solanaTestValidator: States;
}

/**
 * variables that get updated on instance created, useful for test purpose
 */
export interface States {
  connection?: Connection;
  accounts?: Keypair[];
  cleanup?: Cleanup;
}

// initial states
global._solanaTestValidator = {
  cleanup: undefined,
  accounts: undefined,
  connection: undefined,
};

/**
 * current solana-test-validator-js states getter
 *
 * @returns states object containing connection, accounts, cleanup
 */
function states() {
  return global._solanaTestValidator;
}

/**
 * states setter
 *
 * @internal
 */
function setStates(newStates: States) {
  global._solanaTestValidator = newStates;
}

export { states, setStates };
