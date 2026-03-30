import * as vinted from './websites/vinted.js';

async function scrapeVinted(lego = '77255') {
  try {
    console.log(`🕵️‍♀️  scraping lego ${lego} from vinted.fr`);
    const sales = await vinted.scrape(lego);
    console.log(sales);
    console.log('done');
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

const [,, param] = process.argv;
scrapeVinted(param);