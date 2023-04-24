# midjourney-api

Node.js client for the unofficial MidJourney API.

## Example
To run the included example, you must have [Node.js](https://nodejs.org/en/) installed. Then, run the following commands in the root directory of this project:
1. clone the repository
```bash
git clone https://github.com/erictik/midjourney-api.git
cd midjourney-api
```
2. install dependencies
```bash
yarn install
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
npx tsx example/imagine.ts4
```