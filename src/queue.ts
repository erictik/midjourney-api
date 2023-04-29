import async from "async";
type TaskFunction<T> = () => Promise<T>;
export interface QueueTask<T> {
  task: TaskFunction<T>;
  callback?: (result: T) => void;
}
export function CreateQueue<T>(concurrency: number) {
  return async.queue(async ({ task, callback }: QueueTask<any>) => {
    const result = await task();
    callback && callback(result);
  }, concurrency);
}
