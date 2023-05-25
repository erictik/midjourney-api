import { Snowflake } from "./snowflake";

export * from "./snowflake";

export const sleep = async (ms: number): Promise<void> =>
  await new Promise((resolve) => setTimeout(resolve, ms));

export const random = (min: number, max: number): number =>
  Math.floor(Math.random() * (max - min) + min);

const snowflake = new Snowflake(random(0, 1023));
export const nextNonce = (): string => snowflake.nextId().toString();
