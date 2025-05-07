import { HfInference } from "@huggingface/inference";
import { MJConfig } from "./interfaces";

import Replicate from "replicate";

export interface IHumanVerifier {
  verify(imageUri: string, categories: string[]): Promise<string | null>;
}

export class VerifyHumanFactory {
  public static create(config: MJConfig): IHumanVerifier | null {
    if (config.ReplicateToken) {
      return new VerifyHumanReplicate(config);
    }

    if (config.HuggingFaceToken) {
      return new VerifyHumanHF(config);
    }

    return null;
  }
}

export class VerifyHumanHF implements IHumanVerifier {
  private inference: HfInference;

  constructor(public config: MJConfig) {
    const { HuggingFaceToken } = config;
    if (HuggingFaceToken === "" || !HuggingFaceToken) {
      throw new Error("HuggingFaceToken is required");
    }
    this.inference = new HfInference(HuggingFaceToken);
  }

  async verify(imageUri: string, categories: string[]) {
    console.log("verify----start", imageUri, categories);
    const imageCates = await this.inference.imageClassification({
      data: await (await this.config.fetch(imageUri)).blob(),
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

    return null;
  }
}

export class VerifyHumanReplicate implements IHumanVerifier {
  private inference: Replicate;

  constructor(public config: MJConfig) {
    const { ReplicateToken } = config;
    if (ReplicateToken === "" || !ReplicateToken) {
      throw new Error("ReplicateToken is required");
    }
    this.inference = new Replicate({
      auth: ReplicateToken,
    });
  }

  async verify(imageUri: string, categories: string[]) {
    console.log("verify----start", imageUri, categories);
    const question = "What is in the image? Options: " + categories.join(", ");
    let output = await this.inference.run(
      "andreasjansson/blip-2:4b32258c42e9efd4288bb9910bc532a69727f9acd26aa08e175713a0a857a608",
      {
        input: {
          image: imageUri,
          question: question,
        },
      }
    );

    if (typeof output !== "string") {
      throw new Error("output is not a string");
    }
    const label = output as string;
    console.log("verify----response", { output });
    for (const category of categories) {
      if (label.includes(category)) {
        return category;
      }
    }
    return null;
  }
}
