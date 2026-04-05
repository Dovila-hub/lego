import * as cheerio from 'cheerio';
import { v5 as uuidv5 } from 'uuid';
import fs from 'fs';

const BASE_URL = 'https://www.avenuedelabrique.com';

/**
 * Fetch the real photo from a product page
 */
const fetchPhoto = async (link) => {
  try {
    const res = await fetch(link, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    });
    if (!res.ok) return '';
    const html = await res.text();
    const $ = cheerio.load(html, { xmlMode: true });
    const photo = $('img.prod-img, img.product-image, .prod-photo img, img[itemprop="image"]').first().attr('src')
      || $('meta[property="og:image"]').attr('content')
      || '';
    return photo.startsWith('http') ? photo : `${BASE_URL}${photo}`;
  } catch {
    return '';
  }
};

/**
 * Parse webpage data response
 */
const parse = async (data) => {
  const $ = cheerio.load(data, { xmlMode: true });
  const items = $('div.prods a').toArray();
  const deals = [];

  for (const element of items) {
    const link = $(element).attr('href');
    const title = $(element).attr('title') || $(element).find('span.prodl-lib').text().trim();
    const price = parseFloat(
      $(element).find('span.prodl-prix span').text().replace(/[^\d.,]/g, '').replace(',', '.')
    ) || 0;
    const discount = Math.abs(parseInt($(element).find('span.prodl-reduc').text())) || 0;
    const idMatch = title.match(/\b(\d{4,6})\b/);
    const id = idMatch ? idMatch[1] : '';
    if (!link) continue;

    // Fetch real photo from product page
    console.log(`  📸 Fetching photo for: ${title.slice(0, 40)}...`);
    const photo = await fetchPhoto(link);
    await new Promise(r => setTimeout(r, 300));

    deals.push({
      id,
      discount,
      comments: 0,
      temperature: 0,
      link,
      photo,
      price,
      published: new Date().toISOString(),
      title,
      uuid: uuidv5(link, uuidv5.URL),
    });
  }

  return deals;
};

/**
 * Scrape a given url page
 */
const scrape = async url => {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept-Language': 'fr-FR,fr;q=0.9,en;q=0.8',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    },
  });
  if (response.ok) {
    const body = await response.text();
    return parse(body);
  }
  console.error('Error fetching avenuedelabrique:', response.status, response.statusText);
  return null;
};

/**
 * Scrape and save to JSON
 */
const scrapeAndSave = async (pages = 1, outputPath = './deals.json') => {
  const allDeals = [];
  for (let page = 1; page <= pages; page++) {
    const url = page === 1
      ? `${BASE_URL}/promotions-et-bons-plans-lego`
      : `${BASE_URL}/promotions-et-bons-plans-lego/p${page}`;
    console.log(`Scraping page ${page}: ${url}`);
    const deals = await scrape(url);
    if (deals && deals.length > 0) {
      allDeals.push(...deals);
      console.log(`✅ Found ${deals.length} deals on page ${page}`);
    } else {
      console.log(`⚠️ No deals found on page ${page}, stopping.`);
      break;
    }
  }
  if (allDeals.length > 0) {
    fs.writeFileSync(outputPath, JSON.stringify(allDeals, null, 2));
    console.log(`✅ Saved ${allDeals.length} total deals to ${outputPath}`);
  }
  return allDeals;
};

export { scrape, scrapeAndSave };