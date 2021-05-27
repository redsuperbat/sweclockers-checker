import Parser from "rss-parser";
import notifier from "node-notifier";
import os from "os";

const osType = os.type() as "Linux" | "Darwin" | "Windows_NT";

const parser = new Parser();

let cachedFeed: Parser.Item[] = [{ isoDate: "1980-05-27T08:07:04.000Z" }];

const checkSweclockers = async () => {
  const feed = await parser.parseURL(
    "https://www.sweclockers.com/feeds/forum/trad/1625960"
  );
  const latestFeedItem = feed.items[0];
  const cachedLastestFeedItem = cachedFeed[0];

  if (!latestFeedItem || !latestFeedItem.isoDate) return;
  if (!cachedLastestFeedItem || !cachedLastestFeedItem.isoDate) return;

  const latestDate = Date.parse(latestFeedItem.isoDate);
  const cachedLatestDate = Date.parse(cachedLastestFeedItem.isoDate);

  if (latestDate > cachedLatestDate) {
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
  }
  cachedFeed = feed.items;
};

checkSweclockers();
setInterval(() => {
  console.log("Checking sweclockers");

  checkSweclockers();
}, 1000 * 60);
