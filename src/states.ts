import { Connection } from "@solana/web3.js";

/**
 * @description Connection, managed internally
 */
let connection: Connection;

/**
 * Connection instance setter, should not be use manually
 * @internal
 */
function setConnection(conn: Connection) {
  connection = conn;
}

export { connection, setConnection };
