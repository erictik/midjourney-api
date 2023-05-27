import { HfInference } from "@huggingface/inference";
export class VerifyHuman {
  private inference: HfInference;

  constructor(accessToken: string) {
    this.inference = new HfInference(accessToken);
  }

  async verify(imageUri: string, categories: string[]) {
    const xxx = await this.inference.imageClassification({
      data: await (await fetch(imageUri)).blob(),
      model: "google/vit-base-patch16-224",
    });
    const { label, score } = xxx[0];
    for (const category of categories) {
      if (label.includes(category) && score > 0.6) {
        return category;
      }
    }
  }
}
