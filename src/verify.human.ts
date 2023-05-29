import { HfInference } from "@huggingface/inference";
export class VerifyHuman {
  private inference: HfInference;

  constructor(HuggingFaceToken: string) {
    if (HuggingFaceToken === "") {
      throw new Error("HuggingFaceToken is required");
    }
    this.inference = new HfInference(HuggingFaceToken);
  }

  async verify(imageUri: string, categories: string[]) {
    console.log("verify----start", imageUri, categories);
    const imageCates = await this.inference.imageClassification({
      data: await (await fetch(imageUri)).blob(),
      model: "google/vit-base-patch16-224",
    });
    console.log("verify----response", { imageCates });
    for (const imageCate of imageCates) {
      const { label } = imageCate;
      for (const category of categories) {
        if (label.includes(category)) {
          return category;
        }
      }
    }
  }
}
