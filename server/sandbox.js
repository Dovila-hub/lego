import * as avenuedelabrique from './websites/avenuedelabrique.js';
import * as vinted from './websites/vinted.js';
import * as dealabs from './websites/dealabs.js';

async function scrapeDealabs(url = 'https://www.dealabs.com/groupe/lego') {
  try {
    console.log(`🕵️‍♀️  scraping ${url}`);
    const deals = await dealabs.scrapeAndSave(url, './deals.json');
    console.log(deals);
    console.log('done');
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

const [,, param] = process.argv;
scrapeDealabs(param);