import { Snowyflake, Epoch } from "snowyflake";
import { MJOptions } from "../interfaces";

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
