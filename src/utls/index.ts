import { Snowyflake, Epoch } from "snowyflake";

export const sleep = async (ms: number): Promise<void> =>
  await new Promise((resolve) => setTimeout(resolve, ms));

export const random = (min: number, max: number): number =>
  Math.floor(Math.random() * (max - min) + min);

// const snowflake = new Snowflake(1);
const snowflake = new Snowyflake({
  workerId: 1n,
  epoch: Epoch.Twitter, // BigInt timestamp
});

export const nextNonce = (): string => snowflake.nextId().toString();
