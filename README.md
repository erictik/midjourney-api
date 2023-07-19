# midjourney-client

Node.js client for the unofficial MidJourney api.

English / [中文文档](readme_zh.md)

<div align="center">
	<p>
		<a href="https://discord.gg/GavuGHQbV4"><img src="https://img.shields.io/discord/1082500871478329374?color=5865F2&logo=discord&logoColor=white" alt="Discord server" /></a>
		<a href="https://www.npmjs.com/package/midjourney"><img src="https://img.shields.io/npm/v/midjourney.svg?maxAge=3600" alt="npm version" /></a>
	</p>
</div>

## What's new

- [face swap](https://github.com/erictik/midjourney-client/blob/main/example/faceswap.ts)
- [niji bot](https://github.com/erictik/midjourney-client/blob/main/example/imagine-niji.ts)
- [custom zoom](https://github.com/erictik/midjourney-client/blob/main/example/customzoom.ts)
- [remix mode](https://github.com/erictik/midjourney-client/blob/main/example/variation-ws.ts)

## Example

To run the included example, you must have [Node.js](https://nodejs.org/en/) installed. Then, run the following commands in the root directory of this project:

1. clone the repository

   ```bash
   git clone https://github.com/erictik/midjourney-client.git
   cd midjourney-client
   ```

2. install dependencies

   ```bash
   yarn
   # or npm
   npm install
   ```

3. set the environment variables

- [Login Discord](https://discord.com/channels/@me)  
  `F12` _OR_ `Ctrl + Shift + I` (or `Command + Option + I` on Mac) to open the developer tools _AND_ paste the following code into the console

  ```javascript
  window.webpackChunkdiscord_app.push([
    [Math.random()],
    {},
    (req) => {
      for (const m of Object.keys(req.c)
        .map((x) => req.c[x].exports)
        .filter((x) => x)) {
        if (m.default && m.default.getToken !== undefined) {
          return copy(m.default.getToken());
        }
        if (m.getToken !== undefined) {
          return copy(m.getToken());
        }
      }
    },
  ]);
  console.log("%cWorked!", "font-size: 50px");
  console.log(`%cYou now have your token in the clipboard!`, "font-size: 16px");
  ```

  OR [use network your Discord TOKEN](https://www.androidauthority.com/get-discord-token-3149920/)

- [Join my discord server](https://discord.com/invite/GavuGHQbV4)
  ```
  export SERVER_ID="1082500871478329374"
  export CHANNEL_ID="1094892992281718894"
  ```
- OR [Create a server](https://discord.com/blog/starting-your-first-discord-server) and [Invite Midjourney Bot to Your Server](https://docs.midjourney.com/docs/invite-the-bot)
  ```bash
  # How to get server and channel ids:
  when you click on a channel in your server in the browser expect to have the follow URL pattern `https://discord.com/channels/$SERVER_ID/$CHANNEL_ID`
  export SERVER_ID="your-server-id"
  export CHANNEL_ID="your-channel-id"
  ```
- wirte your token to `.env` file or set the environment variables

  ```bash
    #example variables, please set up yours

    export SERVER_ID="1082500871478329374"
    export CHANNEL_ID="1094892992281718894"
    export SALAI_TOKEN="your-discord-token"
  ```

- Then, run the example with the following command:

  ```bash
  npx tsx example/imagine-ws.ts
  ```

  OR

  ```bash
  yarn example:imagine
  # or npm
  npm run example:imagine
  ```

- [more example](./example/)

## Usage

1. Install

   ```bash
   npm i midjourney
   # or
   yarn add midjourney
   ```

2. Use Imagine 、Variation and Upscale

   ```typescript
   import { Midjourney } from "midjourney";
   const client = new Midjourney({
     ServerId: <string>process.env.SERVER_ID,
     ChannelId: <string>process.env.CHANNEL_ID,
     SalaiToken: <string>process.env.SALAI_TOKEN,
     Debug: true,
     Ws: true,
   });
   await client.Connect();
   const Imagine = await client.Imagine(
     "A little pink elephant",
     (uri: string, progress: string) => {
       console.log("Imagine", uri, "progress", progress);
     }
   );
   console.log({ Imagine });

   const Variation = await client.Variation({
     index: 2,
     msgId: <string>Imagine.id,
     hash: <string>Imagine.hash,
     flags: Imagine.flags,
     loading: (uri: string, progress: string) => {
       console.log("Variation.loading", uri, "progress", progress);
     },
   });
   console.log({ Variation });
   const Upscale = await client.Upscale({
     index: 2,
     msgId: <string>Variation.id,
     hash: <string>Variation.hash,
     flags: Variation.flags,
     loading: (uri: string, progress: string) => {
       console.log("Upscale.loading", uri, "progress", progress);
     },
   });
   console.log({ Upscale });
   ```

## route-map

- [x] `/imagine` `variation` `upscale` `reroll` `blend` `zoomout` `vary`
- [x] `/info`
- [x] `/fast ` and `/relax `
- [x] [`/prefer remix`](https://github.com/erictik/midjourney-client/blob/main/example/prefer-remix.ts)
- [x] [`variation (remix mode)`](https://github.com/erictik/midjourney-client/blob/main/example/variation-ws.ts)
- [x] `/describe`
- [x] [`/shorten`](https://github.com/erictik/midjourney-client/blob/main/example/shorten.ts)
- [x] `/settings` `reset`
- [x] verify human
- [x] [proxy](https://github.com/erictik/midjourney-discord/blob/main/examples/proxy.ts)
- [x] [niji bot](https://github.com/erictik/midjourney-client/blob/main/example/imagine-niji.ts)
- [x] [custom zoom](https://github.com/erictik/midjourney-client/blob/main/example/customzoom.ts)
- [x] autoload command payload

---

## Projects

- [midjourney-ui](https://github.com/erictik/midjourney-ui/) next.js + vercel
- [midjourney-discord](https://github.com/erictik/midjourney-discord)-bot
- [phrame](https://github.com/jakowenko/phrame)
- [guapitu](https://www.guapitu.com/zh/draw?code=RRXQNF)

---

## Support

If you find it valuable and would like to show your support, any donations would be greatly appreciated. Your contribution helps me maintain and improve the program.

<span style="word-spacing:20px">
<img src="images/ali.png" height="300"/>&nbsp;&nbsp;
<img src="images/wechat.png" height="300"/>
<a href='https://ko-fi.com/erictik' target='_blank'><img height='36' style='border:0px;height:36px;' src='https://storage.ko-fi.com/cdn/kofi1.png?v=3' border='0' alt='Buy Me a Coffee' /></a>
</span>

## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=erictik/midjourney-client&type=Date)](https://star-history.com/#erictik/midjourney-client&Date)
