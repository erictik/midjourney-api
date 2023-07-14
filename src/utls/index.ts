import { Snowyflake, Epoch } from "snowyflake";
import { MJInfo, MJOptions } from "../interfaces";

export const sleep = async (ms: number): Promise<void> =>
  await new Promise((resolve) => setTimeout(resolve, ms));

export const random = (min: number, max: number): number =>
  Math.floor(Math.random() * (max - min) + min);

const snowflake = new Snowyflake({
  workerId: 0n,
  processId: 0n,
  epoch: Epoch.Discord, // BigInt timestamp
});

export const nextNonce = (): string => snowflake.nextId().toString();

export const formatPrompts = (prompts: string) => {
  const regex = /(\d️⃣ .+)/g;
  const matches = prompts.match(regex);
  if (matches) {
    const shortenedPrompts = matches.map((match) => match.trim());
    return shortenedPrompts;
  } else {
    return [];
  }
};

export const formatOptions = (components: any) => {
  var data: MJOptions[] = [];
  for (var i = 0; i < components.length; i++) {
    const component = components[i];
    if (component.components && component.components.length > 0) {
      const item = formatOptions(component.components);
      data = data.concat(item);
    }
    if (!component.custom_id) continue;
    data.push({
      type: component.type,
      style: component.style,
      label: component.label || component.emoji?.name,
      custom: component.custom_id,
    });
  }
  return data;
};

export const formatInfo = (msg: string) => {
  let jsonResult: MJInfo = {
    subscription: "",
    jobMode: "",
    visibilityMode: "",
    fastTimeRemaining: "",
    lifetimeUsage: "",
    relaxedUsage: "",
    queuedJobsFast: "",
    queuedJobsRelax: "",
    runningJobs: "",
  }; // Initialize jsonResult with empty object
  msg.split("\n").forEach(function (line) {
    const colonIndex = line.indexOf(":");
    if (colonIndex > -1) {
      const key = line.substring(0, colonIndex).trim().replaceAll("**", "");
      const value = line.substring(colonIndex + 1).trim();
      switch (key) {
        case "Subscription":
          jsonResult.subscription = value;
          break;
        case "Job Mode":
          jsonResult.jobMode = value;
          break;
        case "Visibility Mode":
          jsonResult.visibilityMode = value;
          break;
        case "Fast Time Remaining":
          jsonResult.fastTimeRemaining = value;
          break;
        case "Lifetime Usage":
          jsonResult.lifetimeUsage = value;
          break;
        case "Relaxed Usage":
          jsonResult.relaxedUsage = value;
          break;
        case "Queued Jobs (fast)":
          jsonResult.queuedJobsFast = value;
          break;
        case "Queued Jobs (relax)":
          jsonResult.queuedJobsRelax = value;
          break;
        case "Running Jobs":
          jsonResult.runningJobs = value;
          break;
        default:
        // Do nothing
      }
    }
  });
  return jsonResult;
};

export const uriToHash = (uri: string) => {
  return uri.split("_").pop()?.split(".")[0] ?? "";
};

export const content2progress = (content: string) => {
  if (!content) return "";
  const spcon = content.split("<@");
  if (spcon.length < 2) {
    return "";
  }
  content = spcon[1];
  const regex = /\(([^)]+)\)/; // matches the value inside the first parenthesis
  const match = content.match(regex);
  let progress = "";
  if (match) {
    progress = match[1];
  }
  return progress;
};

export const content2prompt = (content: string) => {
  if (!content) return "";
  const pattern = /\*\*(.*?)\*\*/; // Match **middle content
  const matches = content.match(pattern);
  if (matches && matches.length > 1) {
    return matches[1]; // Get the matched content
  } else {
    console.log("No match found.", content);
    return content;
  }
};

export function custom2Type(custom: string) {
  if (custom.includes("upsample")) {
    return "upscale";
  } else if (custom.includes("variation")) {
    return "variation";
  } else if (custom.includes("reroll")) {
    return "reroll";
  } else if (custom.includes("CustomZoom")) {
    return "customZoom";
  } else if (custom.includes("Outpaint")) {
    return "variation";
  } else if (custom.includes("remaster")) {
    return "reroll";
  }
  return null;
}

export const toRemixCustom = (customID: string) => {
  const parts = customID.split("::");
  const convertedString = `MJ::RemixModal::${parts[4]}::${parts[3]}::1`;
  return convertedString;
};

export async function base64ToBlob(base64Image: string): Promise<Blob> {
  // 移除 base64 图像头部信息
  const base64Data = base64Image.replace(
    /^data:image\/(png|jpeg|jpg);base64,/,
    ""
  );

  // 将 base64 数据解码为二进制数据
  const binaryData = atob(base64Data);

  // 创建一个 Uint8Array 来存储二进制数据
  const arrayBuffer = new ArrayBuffer(binaryData.length);
  const uint8Array = new Uint8Array(arrayBuffer);
  for (let i = 0; i < binaryData.length; i++) {
    uint8Array[i] = binaryData.charCodeAt(i);
  }

  // 使用 Uint8Array 创建 Blob 对象
  return new Blob([uint8Array], { type: "image/png" }); // 替换为相应的 MIME 类型
}
