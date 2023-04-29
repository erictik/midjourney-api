import PLimit from "p-limit";
class ConcurrentQueue {
  private limit: any;
  private queue: (() => Promise<any>)[] = [];

  constructor(concurrency: number) {
    this.limit = PLimit(concurrency);
  }

  public getWaiting(): number {
    return this.queue.length;
  }

  public async addTask<T>(task: () => Promise<T>): Promise<T> {
    return await this.limit(async () => {
      const result = await task();
      return result;
    });
  }

  public async getResults(): Promise<any[]> {
    return Promise.allSettled(
      this.queue.map((task) => {
        return task().catch((err) => err);
      })
    );
  }
}

export function CreateQueue<T>(concurrency: number) {
  return new ConcurrentQueue(5);
}

// // Usage example:
// const queue = new ConcurrentQueue(5);

// for (let i = 0; i < 10; i++) {
//   queue.addTask(() =>
//     new Promise<number>((resolve, reject) => {
//       setTimeout(() => {
//         console.log('Task done:', i);
//         resolve(i * 2);
//       }, Math.random() * 1000);
//     })
//   );
// }

// console.log('Tasks waiting:', queue.getWaiting());

// setTimeout(() => {
//   queue.getResults().then((results) => {
//     console.log('Results:', results);
//   });
// }, 5000);
