# Quickstart

> #### **Step1: Get your Discord Token**[Join the Beta](https://discord.com/invite/GavuGHQbV4)

{% content-ref url="broken-reference" %}
[Broken link](broken-reference)
{% endcontent-ref %}

> #### **Step2: Join Discord Server**

{% content-ref url="broken-reference" %}
[Broken link](broken-reference)
{% endcontent-ref %}

> #### **Step3: Install** midjourney

{% content-ref url="install.md" %}
[install.md](install.md)
{% endcontent-ref %}

> #### **Step3:** Use the imagine api

{% tabs %}
{% tab title="Typescirpt" %}
{% code overflow="wrap" lineNumbers="true" %}
```typescript
import { Midjourney } from "midjourney";

const client = new Midjourney({
  ServerId: "1082500871478329374",
  ChannelId: "1094892992281718894",
  SalaiToken: "your discord token",
  Debug: true,
});

const msg = await client.Imagine(
  "A little white elephant",
  (uri: string, progress: string) => {
    console.log("loading:", uri, "progress:", progress);
  }
);
console.log({ msg });
```
{% endcode %}
{% endtab %}

{% tab title="Javascirpt" %}
{% code overflow="wrap" lineNumbers="true" %}
```javascript
const { Midjourney } = require("midjourney");

  const client = new Midjourney({
    ServerId: "1082500871478329374",
    ChannelId: "1094892992281718894",
    SalaiToken: "your discord token",
    Debug: true,
    Ws:true,
  });
  const msg = await client.Imagine("A little pink elephant", (uri, progress) => {
    console.log("loading:", uri, "progress:", progress);
  });
  console.log({ msg });


```
{% endcode %}
{% endtab %}
{% endtabs %}
