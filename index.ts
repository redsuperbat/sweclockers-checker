import Parser from "rss-parser";
import notifier from "node-notifier";
import os from "os";
import Nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const createTransporter = () => {
  if (!process.env.EMAIL_HOST) return;
  return Nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  });
};

const transporter = createTransporter();

const osType = os.type() as "Linux" | "Darwin" | "Windows_NT";

const parser = new Parser();
let cachedFeed3060_3070: Parser.Item[] | undefined;
let cachedFeed3080_3090: Parser.Item[] | undefined;

const checkSweclockers = async (
  url: string,
  cachedFeed: Parser.Item[] | undefined
) => {
  const feed = await parser.parseURL(url);
  if (!cachedFeed) {
    cachedFeed = feed.items;
  }
  const latestFeedItem = feed.items[0];
  const cachedLastestFeedItem = cachedFeed[0];

  if (!latestFeedItem || !latestFeedItem.isoDate) return;
  if (!cachedLastestFeedItem || !cachedLastestFeedItem.isoDate) return;

  const latestDate = Date.parse(latestFeedItem.isoDate);
  const cachedLatestDate = Date.parse(cachedLastestFeedItem.isoDate);

  if (latestDate > cachedLatestDate) {
    console.log(
      "Quick there is a graphics card on the loose!",
      `${latestFeedItem.title} ${latestFeedItem.contentSnippet}`
    );
    if (osType === "Linux") {
      notifier.notify(
        `${latestFeedItem.title} ${latestFeedItem.contentSnippet}`
      );
    } else {
      notifier.notify({
        title: latestFeedItem.title,
        open: latestFeedItem.link,
      });
    }
    if (transporter) {
      await transporter.sendMail({
        to: [process.env.EMAIL1 as string, process.env.EMAIL2 as string],
        subject: latestFeedItem.title,
        html: latestFeedItem.content,
        from: "noreply@rss-checker.com",
      });
    }
  }
  cachedFeed = feed.items;
};

checkSweclockers(
  "https://www.sweclockers.com/feeds/forum/trad/1625960",
  cachedFeed3060_3070
);
checkSweclockers(
  "https://www.sweclockers.com/feeds/forum/trad/1625959",
  cachedFeed3080_3090
);
setInterval(() => {
  console.log("Checking sweclockers", new Date().toLocaleString());
  checkSweclockers(
    "https://www.sweclockers.com/feeds/forum/trad/1625960",
    cachedFeed3060_3070
  );
  checkSweclockers(
    "https://www.sweclockers.com/feeds/forum/trad/1625959",
    cachedFeed3080_3090
  );
}, 1000 * 60);
