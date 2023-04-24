import 'dotenv/config'
import { Midjourney } from '../src';
/**
 * 
 * a simple example of how to use the imagine command
 * ```
 * npx tsx example/imagine.ts
 * ```
 */
async function main() {
    const client = new Midjourney(<string>process.env.SERVER_ID, <string>process.env.CHANNEL_ID, <string>process.env.SALAI_TOKEN, true)
    const msg = await client.Imagine("A little pink elephant", (uri: string) => {
        console.log("loading", uri)
    })
    console.log({ msg })
}
main().catch((err) => {
    console.error(err);
    process.exit(1);
});