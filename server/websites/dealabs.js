import * as cheerio from 'cheerio';
import { v5 as uuidv5 } from 'uuid';
import fs from 'fs';

/**
 * Parse webpage data response
 * @param  {String} data - html response
 * @return {Array} deals
 */
const parse = data => {
  const $ = cheerio.load(data, {'xmlMode': false});
  const deals = [];

  // Each deal is an article element
  $('article.thread').each((i, element) => {
    try {
      const titleEl  = $(element).find('strong.thread-title');
      const title    = titleEl.text().trim();
      const link     = $(element).find('a.thread-title--extended').attr('href')
                    || $(element).find('strong.thread-title a').attr('href')
                    || '';

      const priceText = $(element).find('.thread-price').text().trim();
      const price     = parseFloat(priceText.replace(/[^0-9.,]/g, '').replace(',', '.')) || 0;

      const discountText = $(element).find('.chip--type-discount, .cept-discount-badge').text().trim();
      const discount     = Math.abs(parseInt(discountText)) || 0;

      const commentsText = $(element).find('.js-vue2, [data-vue2*="comments"]').attr('data-vue2') || '';
      const comments     = parseInt($(element).find('.count').first().text()) || 0;

      const temperature  = parseFloat(
        $(element).find('.vote-temp, .cept-vote-temp').text().trim()
      ) || 0;

      const photo = $(element).find('img.thread-image, img.js-lazy-img').attr('src')
                 || $(element).find('img').first().attr('src')
                 || '';

      const published = $(element).find('time').attr('datetime') || new Date().toISOString();

      // Extract lego set id from title (e.g. "75192", "42179")
      const idMatch = title.match(/\b(\d{4,6})\b/);
      const id      = idMatch ? idMatch[1] : '';

      if (!title || !link) return;

      deals.push({
        id,
        discount,
        comments,
        temperature,
        link,
        photo,
        price,
        published,
        title,
        'uuid': uuidv5(link, uuidv5.URL)
      });
    } catch (err) {
      // skip malformed deal
    }
  });

  return deals;
};

/**
 * Scrape a given url page
 * @param {String} url - url to parse and scrape
 * @returns {Array}
 */
const scrape = async url => {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept-Language': 'fr-FR,fr;q=0.9,en;q=0.8',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    }
  });

  if (response.ok) {
    const body = await response.text();
    return parse(body);
  }

  console.error('Error fetching dealabs:', response.status, response.statusText);
  return null;
};

/**
 * Scrape and save deals to a JSON file
 * @param {String} url
 * @param {String} outputPath
 */
const scrapeAndSave = async (url, outputPath = './deals.json') => {
  const deals = await scrape(url);

  if (deals) {
    fs.writeFileSync(outputPath, JSON.stringify(deals, null, 2));
    console.log(`✅ Saved ${deals.length} deals to ${outputPath}`);
  }

  return deals;
};

export { scrape, scrapeAndSave };