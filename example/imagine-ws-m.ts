import "dotenv/config";
import { Midjourney } from "../src";
/**
 *
 * a simple example of using the imagine api with ws
 * ```
 * npx tsx example/imagine-ws-m.ts
 * ```
 */
async function main() {
  const client = new Midjourney({
    ServerId: <string>process.env.SERVER_ID,
    ChannelId: <string>process.env.CHANNEL_ID,
    SalaiToken: <string>process.env.SALAI_TOKEN,
    HuggingFaceToken: <string>process.env.HUGGINGFACE_TOKEN,
    Debug: true,
    Ws: true,
  });
  await client.init();
  client
    .Imagine("A little pink elephant", (uri) => {
      console.log("loading123---", uri);
    })
    .then(function (msg) {
      console.log("msg123", msg);
    });

  client
    .Imagine("A little pink dog", (uri) => {
      console.log("loading234---", uri);
    })
    .then(function (msg) {
      console.log("msg234", msg);
    });
}
main()
  .then(() => {
    console.log("finished");
    // process.exit(0);
  })
  .catch((err) => {
    console.log("finished");
    console.error(err);
    process.exit(1);
  });
