import 'dotenv/config'
import { Midjourney } from '../src';
/**
 * 
 * a simple example of how to use the Upscale command
 * ```
 * npx tsx example/upscale.ts
 * ```
 */
async function main() {
    const client = new Midjourney(<string>process.env.SERVER_ID, <string>process.env.CHANNEL_ID, <string>process.env.SALAI_TOKEN, true)
    const msg = await client.Imagine("a cool cat, blue ears, red hat")
    console.log({ msg })
    if (!msg) {
        console.log("no message")
        return
    }
    const msg2 = await client.Upscale(msg.content, 2, msg.id, msg.hash, (uri: string) => {
        console.log("loading", uri)
    })
    console.log({ msg2 })
}
main().catch((err) => {
    console.error(err);
    process.exit(1);
});