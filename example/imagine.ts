import "dotenv/config";
import { Midjourney } from "../src";
/**
 *
 * a simple example of how to use the imagine command
 * ```
 * npx tsx example/imagine.ts
 * ```
 */
async function main() {
  const client = new Midjourney({
    ServerId: <string>process.env.SERVER_ID,
    ChannelId: <string>process.env.CHANNEL_ID,
    SalaiToken: <string>process.env.SALAI_TOKEN,
    Debug: true,
  });

  const msg = await client.Imagine(
    "Red hamster smoking a cigaret, https://media.discordapp.net/attachments/1108515696385720410/1118385339732590682/DanielH_A_giant_hamster_monster._Friendly_in_a_business_suit_si_d4be1836-a4e1-41a8-b1d7-99eebc521220.png?width=1878&height=1878",
    (uri: string, progress: string) => {
      console.log("loading", uri, "progress", progress);
    }
  );
  console.log({ msg });
}
main().catch((err) => {
  console.error(err);
  process.exit(1);
});
