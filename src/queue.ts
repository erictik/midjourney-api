import async from "async";
type TaskFunction<T> = () => Promise<T>;
export interface QueueTask<T> {
  task: TaskFunction<T>;
  callback?: (result: T) => void;
}
// const queue = async.queue(async ({ task, callback }: QueueTask<any>) => {
//   const result = await task();
//   callback(result);
// }, 10);

// const task1: TaskFunction<number> = async () => {
//   // do some async work
//   return 42;
// };
// queue.push({
//   task: task1,
//   callback: (result: number) => {
//     console.log(result); // output: 42
//   },
// });
export function CreateQueue<T>(concurrency: number) {
  return async.queue(async ({ task, callback }: QueueTask<any>) => {
    const result = await task();
    callback && callback(result);
  }, concurrency);
}
