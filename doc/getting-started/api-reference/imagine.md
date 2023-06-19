# imagine



<pre class="language-typescript"><code class="lang-typescript"><strong>import { Midjourney } from "midjourney";
</strong>async function main() {
  const client = new Midjourney({
    ServerId: "1082500871478329374",
    ChannelId: "1094892992281718894",
    SalaiToken: "your discord token",
  });
  await client.Connect();
  const Imagine = await client.Imagine(
    "Red hamster smoking a cigaret",
    (uri: string, progress: string) => {
      console.log("Imagine.loading", uri, "progress", progress);
    }
  );
  console.log( Imagine );
  client.Close();
}

</code></pre>
