import WebSocket from "ws";
import "dotenv/config";
export const DISCORD_GATEWAY =
  "wss://gateway.discord.gg/?v=9&encoding=json&compress=zlib-stream";
import { createInflate, constants as ZlibConstants } from "zlib";
async function timeout(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  const sss = new WebSocket(DISCORD_GATEWAY);
  var heartbeatInterval = 0;
  function heartbeat() {
    console.log("heartbeat");
    if (sss.readyState !== WebSocket.OPEN) return;
    sss.send(
      JSON.stringify({
        op: 1,
        d: heartbeatInterval++,
      })
    );
    setTimeout(heartbeat, 1000 * 40);
  }

  sss.on("open", async function open() {
    console.log("open");
    sss.send(
      JSON.stringify({
        op: 2,
        d: {
          token: process.env.SALAI_TOKEN,
          capabilities: 8189,
          properties: {
            os: "Mac OS X",
            browser: "Chrome",
            device: "",
          },
          compress: false,
        },
      })
    );
    heartbeat();
  });
  console.log("sss");
  let zlibChunks: Buffer[] = [];
  const inflate = createInflate({ flush: ZlibConstants.Z_SYNC_FLUSH });
  inflate.on("data", (data) => zlibChunks.push(data));
  function handleFlushComplete() {
    const data =
      zlibChunks.length > 1 ? Buffer.concat(zlibChunks) : zlibChunks[0];

    zlibChunks = [];
    var jsonString = data.toString();
    console.log("jsonString", new Date().toJSON(), jsonString);
  }
  //   inflate.reset();
  sss.on("message", function incoming(data: Buffer) {
    inflate.write(data);
    // this.#inflate.write(data)
    console.log("data");
    if (data.length >= 4 && data.readUInt32BE(data.length - 4) === 0x0ffff) {
      console.log("解析 data");
      inflate.flush(ZlibConstants.Z_SYNC_FLUSH, () => handleFlushComplete());
    }
  });
}

main().catch(console.error);
