import "dotenv/config";
import { Midjourney } from "../src";
import { nextNonce } from "../src/utls";
/**
 *
 * a simple example of how to use the imagine command
 * ```
 * npx tsx test/test.ts
 * ```
 */

function test2() {
  console.log(nextNonce());
  console.log(nextNonce());
}
test2();
