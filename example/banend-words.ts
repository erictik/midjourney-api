import "dotenv/config";
import { Midjourney, detectBannedWords } from "../src";
/**
 *
 * a simple example of how to use the banned words
 * ```
 * npx tsx example/banend-words.ts
 * ```
 */
async function main() {
  var prompt = "horny girl";
  var message = detectBannedWords(prompt);
  if (message.length > 0) {
    console.error("banned words detected");
  }
  console.log(message);
}
main().catch((err) => {
  console.error(err);
  process.exit(1);
});
