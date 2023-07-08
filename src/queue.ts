import PQueue from "p-queue";

class ConcurrentQueue {
  private limit: any;
  constructor(concurrency: number) {
    this.limit = new PQueue({ concurrency });
  }
  public async addTask<T>(task: () => Promise<T>): Promise<T> {
    return await this.limit.add(async () => {
      const result = await task();
      return result;
    });
  }
}
export function CreateQueue(concurrency: number) {
  return new ConcurrentQueue(concurrency);
}
