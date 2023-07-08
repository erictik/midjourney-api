import async from "async";
/**
 *
 * a simple example of how to use the imagine command
 * ```
 * npx tsx test/test2.ts
 * ```
 */

const processRequest = async ({
  request,
  callback,
}: {
  request: any;
  callback: (any) => void;
}) => {
  // 在这里执行实际的HTTP请求
  // 可以使用任何HTTP库，比如axios或node-fetch
  // console.log("Request processed:", request, new Date());

  // 这里只是一个示例，使用setTimeout模拟一个异步请求
  await new Promise((resolve) => setTimeout(resolve, 1000));
  callback(request + " processed");
  await new Promise((resolve) => setTimeout(resolve, 2000));
  return "sleep processed";
};
const queue = async.queue(processRequest, 1);
const addRequest = (request: any) => {
  console.log("Request queued:", request, new Date());
  return new Promise((resolve, reject) => {
    queue.push(
      {
        request,
        callback: (any) => {
          resolve(any);
        },
      },
      (error: any, result: any) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    );
  });
};

const safeRequest = async (request: any) => {
  const dd = await addRequest(request);
  return dd + " safeRequest" + new Date();
};
async function test2() {
  safeRequest("1").then((result) => console.log(result));
  safeRequest("2").then((result) => console.log(result));
  safeRequest("3").then((result) => console.log(result));
  safeRequest("4").then((result) => console.log(result));
  safeRequest("5").then((result) => console.log(result));
  safeRequest("6").then((result) => console.log(result));
  const dd = await safeRequest("32");
  console.log(dd);
}
test2();
