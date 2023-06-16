import "dotenv/config";
import { DefaultMJConfig, Midjourney, WsMessage } from "../src";
import { nextNonce } from "../src/utls";
/**
 *
 * a simple example of how to use the imagine command
 * ```
 * npx tsx test/test.ts
 * ```
 */

function test2() {
  const config = {
    ...DefaultMJConfig,
    ...{},
  };
}
test2();
