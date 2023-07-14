import { client } from "./gradio/index";

export class faceSwap {
  public hf_token?: string;
  constructor(hf_token?: string) {
    this.hf_token = hf_token;
  }
  async changeFace(Target: Blob, Source: Blob) {
    const app = await client("https://felixrosberg-face-swap.hf.space/", {
      hf_token: this.hf_token as any,
    });
    // console.log("app", app);
    const result: any = await app.predict(1, [
      Target, // blob in 'Target' Image component
      Source, // blob in 'Source' Image component
      0, // number (numeric value between 0 and 100) in 'Anonymization ratio (%)' Slider component
      0, // number (numeric value between 0 and 100) in 'Adversarial defense ratio (%)' Slider component
      "Compare", // string[] (array of strings) in 'Mode' Checkboxgroup component
    ]);
    // result.data;
    return result.data;
    // console.log(result.data[0]);
  }
}
