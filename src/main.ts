// ماژول‌های مورد نیاز را وارد کنید
import { Midjourney } from ".";
import authRouter from "./routes/auth.router";
import mongoConn from "./configs/mongodb.configs";
import { authenticateToken } from "./middlewares/auth.middlewares"
import Query from "./models/query.models";

const express = require("express");
const { v4: uuidv4 } = require("uuid");


// اتصال به MongoDB
(async () => {
  await mongoConn;
})();

const app = express();

app.use(express.json());
app.use('/auth', authRouter);



app.post("/query", authenticateToken, async (req: any, res: any) => {
  const query = req.body.query;
  const uuid = uuidv4();
  const newQuery = new Query({ uuid, query, result: "waiting" });

  await newQuery.save();

  // شروع فرآیند غیرهمزمان
  processQuery(newQuery);

  res.json({ uuid });
});

async function processQuery(queryDoc: any) {
  const client = new Midjourney({
    ServerId: <string>process.env.SERVER_ID,
    ChannelId: <string>process.env.CHANNEL_ID,
    SalaiToken: <string>process.env.SALAI_TOKEN,
    HuggingFaceToken: <string>process.env.HUGGINGFACE_TOKEN,
    Debug: true,
    Ws: true,
  });
  await client.Connect();
  const Imagine = await client.Imagine(
    queryDoc.query,
    (uri: string, progress: string) => {
      console.log("Imagine.loading", uri, "progress", progress);
    }
  ).catch((err) => {
    console.log(`imagine error ${err}`)
  });
  // if (!Imagine) {
  //   queryDoc.result = 'error';
  //   await queryDoc.save();
  //   return
  // }
  queryDoc.result = JSON.stringify(Imagine);
  await queryDoc.save();
}

app.get("/query/:uuid", async (req: any, res: any) => {
  const uuid = req.params.uuid;
  const query = await Query.findOne({ uuid });

  if (query) {
    res.json({ result: query.result });
  } else {
    res.status(404).json({ message: "Not found" });
  }
});

app.listen(3000, () => console.log("Listening on port 3000"));
