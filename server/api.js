import bodyParser from 'body-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { readFileSync, existsSync } from 'fs';

// ─── Load data sources ───────────────────────────────────────────────────────
import SALES from './sources/vinted.json' with { type: 'json' };

// Load deals from deals.json if it exists, otherwise empty array
let DEALS = [];
try {
  if (existsSync('./deals.json')) {
    DEALS = JSON.parse(readFileSync('./deals.json', 'utf-8'));
  }
} catch (e) {
  console.warn('Could not load deals.json:', e.message);
}

const PORT = 8092;
const app = express();

app.use(bodyParser.json());
app.use(cors());
app.use(helmet());

// ─── GET / ────────────────────────────────────────────────────────────────────
app.get('/', (request, response) => {
  response.send({ ack: true });
});

// ─── GET /deals/search ───────────────────────────────────────────────────────
// Query params:
//   limit    - number of deals to return (default: 12)
//   price    - max price filter
//   date     - filter deals published after this date (YYYY-MM-DD)
//   filterBy - 'best-discount' | 'most-commented' | 'hot-deals'
app.get('/deals/search', (request, response) => {
  try {
    const {
      limit = 12,
      price,
      date,
      filterBy,
    } = request.query;

    let results = DEALS.slice();

    // Filter by price
    if (price) {
      const maxPrice = parseFloat(price);
      results = results.filter(d => d.price <= maxPrice);
    }

    // Filter by date (deals published after this date)
    if (date) {
      const since = new Date(date).getTime() / 1000; // convert to unix timestamp
      results = results.filter(d => {
        const published = typeof d.published === 'number'
          ? d.published
          : Date.parse(d.published) / 1000;
        return published >= since;
      });
    }

    // Filter by specific criteria
    if (filterBy === 'best-discount') {
      results = results.filter(d => d.discount > 50);
    } else if (filterBy === 'most-commented') {
      results = results.filter(d => d.comments > 15);
    } else if (filterBy === 'hot-deals') {
      results = results.filter(d => d.temperature > 100);
    }

    // Sort by price ascending
    results.sort((a, b) => a.price - b.price);

    // Apply limit
    const limitNum = parseInt(limit);
    const paginated = results.slice(0, limitNum);

    return response.status(200).json({
      success: true,
      data: {
        limit: limitNum,
        total: results.length,
        results: paginated,
      },
    });
  } catch (error) {
    console.error(error);
    return response.status(500).json({ success: false, data: { results: [] } });
  }
});

// ─── GET /deals/:id ──────────────────────────────────────────────────────────
// Fetch a specific deal by its uuid
app.get('/deals/:id', (request, response) => {
  try {
    const { id } = request.params;
    const deal = DEALS.find(d => d.uuid === id);

    if (!deal) {
      return response.status(404).json({
        success: false,
        message: `Deal ${id} not found`,
      });
    }

    return response.status(200).json({
      success: true,
      data: { ...deal, _id: deal.uuid },
    });
  } catch (error) {
    console.error(error);
    return response.status(500).json({ success: false });
  }
});

// ─── GET /sales/search ───────────────────────────────────────────────────────
// Query params:
//   legoSetId - filter by lego set id
//   limit     - number of sales to return (default: 12)
app.get('/sales/search', (request, response) => {
  response.setHeader('Access-Control-Allow-Credentials', true);
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  response.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  try {
    const { legoSetId, limit = 12 } = request.query;

    let results = legoSetId ? (SALES[legoSetId] || []) : [];

    // Sort by date descending (most recent first)
    results = results.slice().sort((a, b) => {
      const da = typeof a.published === 'number' ? a.published : Date.parse(a.published) / 1000;
      const db = typeof b.published === 'number' ? b.published : Date.parse(b.published) / 1000;
      return db - da;
    });

    const limitNum = parseInt(limit);
    const paginated = results.slice(0, limitNum);

    return response.status(200).json({
      success: true,
      data: {
        limit: limitNum,
        total: results.length,
        result: paginated,
      },
    });
  } catch (error) {
    console.error(error);
    return response.status(404).json({
      success: false,
      data: { result: [] },
    });
  }
});

// ─── Start ───────────────────────────────────────────────────────────────────
app.listen(PORT);
console.log(`📡 Running on port ${PORT}`);