# midjourney-api

Node.js client for the unofficial MidJourney API.

<div align="center">
	<p>
		<a href="https://discord.gg/GavuGHQbV4"><img src="https://img.shields.io/discord/1082500871478329374?color=5865F2&logo=discord&logoColor=white" alt="Discord server" /></a>
		<a href="https://www.npmjs.com/package/midjourney"><img src="https://img.shields.io/npm/v/midjourney.svg?maxAge=3600" alt="npm version" /></a>
	</p>
</div>

[discord bot example](https://github.com/erictik/midjourney-discord-wrapper/)

[web ui example](https://github.com/erictik/midjourney-ui/)  

## Install

npm

```bash
npm i midjourney
```

yarn

```bash
yarn add midjourney
```

## Usage

```typescript
import { Midjourney } from "midjourney";
  const client = new Midjourney({
    ServerId: <string>process.env.SERVER_ID,
    ChannelId: <string>process.env.CHANNEL_ID,
    SalaiToken: <string>process.env.SALAI_TOKEN,
    Debug: true,
    Ws:true,
  });
const msg = await client.Imagine("A little pink elephant", (uri: string) => {
  console.log("loading", uri);
});
console.log({ msg });
```

## Example

To run the included example, you must have [Node.js](https://nodejs.org/en/) installed. Then, run the following commands in the root directory of this project:

1. clone the repository

```bash
git clone https://github.com/erictik/midjourney-api.git
cd midjourney-api
```

2. install dependencies

```bash
yarn
# or npm
npm install
```

3. set the environment variables
   [How to get your Discord SALAI_TOKEN:](https://www.androidauthority.com/get-discord-token-3149920/)

```bash
export SERVER_ID="108250087147832934"
export CHANNEL_ID="109489299228171884"
export SALAI_TOKEN="your-salai-token"
```

Then, run the example with the following command:

```bash
npx tsx example/imagine-ws.ts
```

```bash
npx tsx example/upscale-ws.ts
```

```bash
npx tsx example/variation-ws.ts
```


## route-map
- [x] websocket get message
- [x] call back error
- [ ] add `/info`  `/fast` and `/relax`



## Star History
[![Star History Chart](https://api.star-history.com/svg?repos=erictik/midjourney-api&type=Date)](https://star-history.com/#erictik/midjourney-api&Date)
