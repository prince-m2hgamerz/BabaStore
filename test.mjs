// npm install spider-browser
import { SpiderBrowser } from "spider-browser";

const browser = new SpiderBrowser({ apiKey: "sk-75ed953c-8242-4e74-bbeb-05e9778b831c" });
await browser.init();

await browser.page.goto("https://fastdl.app");
const content = await browser.page.content();
console.log(content);

await browser.close();