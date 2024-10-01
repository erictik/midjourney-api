import "dotenv/config";
import { Midjourney } from "../src";
/**
 *
 * a simple example of how to use the imagine command
 * ```
 * npx tsx example/imagine-err.ts
 * ```
 */
async function main() {
  const client = new Midjourney({
    ServerId: <string>process.env.SERVER_ID,
    ChannelId: <string>process.env.CHANNEL_ID,
    SalaiToken: <string>process.env.SALAI_TOKEN,
    Debug: true,
  });
  await client.init();
  // `https://images.guapitu.com/chatgpt/5b9b907a/d3297338-ae3e-4276-9bd9-3b6ca27cedcf.png
  // https://images.guapitu.com/chatgpt/762a2db4/459d52f1-23fd-41c3-a912-317e65155fcc.png
  // https://images.guapitu.com/chatgpt/f86613ac/2e2497ae-9906-44d9-8396-e41abab2f47b.png
  // cat`
  const prompt = `%s %sTiny cute isometric Hcia illustration, a girl with long white hair, smile, seawater, colorful bubbles, dreamy portrait, Teana punk, more details, fiber tracking, snail core, Kuvshinov Ilya, yakamoz emoji, soft lighting, soft colors, matte clay, blender 3d, pastel background  --v 5.1  --ar 1:1  --s 350  --q 1`;
  const msg = await client.Imagine(prompt, (uri: string, progress: string) => {
    console.log("loading", uri, "progress", progress);
  });
  console.log({ msg });
}
main().catch((err) => {
  console.error(err);
  process.exit(1);
});
