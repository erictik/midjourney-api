import "dotenv/config";
import { faceSwap } from "../src";
/**
 *
 * ```
 * npx tsx test/face.ts
 * ```
 */

async function test2() {
  const app = new faceSwap(process.env.HuggingFaceToken);
  const Target = await (
    await fetch(
      "https://cdn.discordapp.com/attachments/1108587422389899304/1129321837042602016/guapitu006_a_girls_face_with_david_bowies_thunderbolt_71ee5899-bd45-4fc4-8c9d-92f19ddb0a03.png"
    )
  ).blob();
  const Source = await (
    await fetch(
      "https://cdn.discordapp.com/attachments/1108587422389899304/1129321826804306031/guapitu006_Cute_warrior_girl_in_the_style_of_Baten_Kaitos__111f39bc-329e-4fab-9af7-ee219fedf260.png"
    )
  ).blob();

  await app.changeFace(Target, Source);
}
test2();
