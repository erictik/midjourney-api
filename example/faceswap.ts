import "dotenv/config";
import { Midjourney, detectBannedWords } from "../src";
import { url } from "inspector";
/**
 *
 * a simple example of how to use faceSwap
 * ```
 * npx tsx example/faceswap.ts
 * ```
 */
async function main() {
  const source = `https://cdn.discordapp.com/attachments/1107965981839605792/1129362418775113789/3829c5d7-3e7e-473c-9c7b-b858e3ec97bc.jpeg`;
  // const source = `https://cdn.discordapp.com/attachments/1108587422389899304/1129321826804306031/guapitu006_Cute_warrior_girl_in_the_style_of_Baten_Kaitos__111f39bc-329e-4fab-9af7-ee219fedf260.png`;
  const target = `https://cdn.discordapp.com/attachments/1108587422389899304/1129321837042602016/guapitu006_a_girls_face_with_david_bowies_thunderbolt_71ee5899-bd45-4fc4-8c9d-92f19ddb0a03.png`;
  const client = new Midjourney({
    ServerId: <string>process.env.SERVER_ID,
    ChannelId: <string>process.env.CHANNEL_ID,
    SalaiToken: <string>process.env.SALAI_TOKEN,
    Debug: true,
    HuggingFaceToken: <string>process.env.HUGGINGFACE_TOKEN,
  });
  const info = await client.FaceSwap(target, source);
  console.log(info?.uri);
}
main()
  .then(() => {
    console.log("finished");
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
