import bodyParser from 'body-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';

// ─── Load data sources ───────────────────────────────────────────────────────
import SALES from './sources/vinted.json' with { type: 'json' };
import DEALS_DATA from './sources/deals.json' with { type: 'json' };

let DEALS = DEALS_DATA;

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
app.get('/deals/search', (request, response) => {
  try {
    const { limit = 12, price, date, filterBy } = request.query;
    let results = DEALS.slice();
    if (price) results = results.filter(d => d.price <= parseFloat(price));
    if (date) {
      const since = new Date(date).getTime() / 1000;
      results = results.filter(d => {
        const pub = typeof d.published === 'number' ? d.published : Date.parse(d.published) / 1000;
        return pub >= since;
      });
    }
    if (filterBy === 'best-discount') results = results.filter(d => d.discount > 50);
    else if (filterBy === 'most-commented') results = results.filter(d => d.comments > 15);
    else if (filterBy === 'hot-deals') results = results.filter(d => d.temperature > 100);
    results.sort((a, b) => a.price - b.price);
    const limitNum = parseInt(limit);
    return response.status(200).json({
      success: true,
      data: { limit: limitNum, total: results.length, results: results.slice(0, limitNum) },
    });
  } catch (error) {
    return response.status(500).json({ success: false, data: { results: [] } });
  }
});

// ─── GET /deals ───────────────────────────────────────────────────────────────
app.get('/deals', (request, response) => {
  try {
    const { page = 1, size = 6, filterBy, price, date } = request.query;
    let results = DEALS.slice();
    if (price) results = results.filter(d => d.price <= parseFloat(price));
    if (date) {
      const since = new Date(date).getTime() / 1000;
      results = results.filter(d => {
        const pub = typeof d.published === 'number' ? d.published : Date.parse(d.published) / 1000;
        return pub >= since;
      });
    }
    if (filterBy === 'best-discount') results = results.filter(d => d.discount > 50);
    else if (filterBy === 'most-commented') results = results.filter(d => d.comments > 15);
    else if (filterBy === 'hot-deals') results = results.filter(d => d.temperature > 100);
    results.sort((a, b) => a.price - b.price);
    const pageNum = parseInt(page);
    const sizeNum = parseInt(size);
    const total = results.length;
    const pageCount = Math.ceil(total / sizeNum);
    const paginated = results.slice((pageNum - 1) * sizeNum, pageNum * sizeNum);
    return response.status(200).json({
      success: true,
      data: {
        result: paginated,
        meta: {
          currentPage: pageNum,
          pageCount,
          pageSize: sizeNum,
          count: total,
        },
      },
    });
  } catch (error) {
    return response.status(500).json({ success: false, data: { result: [], meta: {} } });
  }
});

// ─── GET /deals/:id ──────────────────────────────────────────────────────────
app.get('/deals/:id', (request, response) => {
  try {
    const { id } = request.params;
    const deal = DEALS.find(d => d.uuid === id);
    if (!deal) return response.status(404).json({ success: false, message: `Deal ${id} not found` });
    return response.status(200).json({ success: true, data: { ...deal, _id: deal.uuid } });
  } catch (error) {
    return response.status(500).json({ success: false });
  }
});

// ─── GET /sales/search ───────────────────────────────────────────────────────
app.get('/sales/search', (request, response) => {
  try {
    const { legoSetId, limit = 12 } = request.query;
    let results = legoSetId ? (SALES[legoSetId] || []) : [];
    results = results.slice().sort((a, b) => b.published - a.published);
    const limitNum = parseInt(limit);
    return response.status(200).json({
      success: true,
      data: { limit: limitNum, total: results.length, result: results.slice(0, limitNum) },
    });
  } catch (error) {
    return response.status(500).json({ success: false, data: { result: [] } });
  }
});

// ─── GET /sales ───────────────────────────────────────────────────────────────
app.get('/sales', (request, response) => {
  try {
    const { id, limit = 12 } = request.query;
    let results = id ? (SALES[id] || []) : [];
    results = results.slice().sort((a, b) => b.published - a.published);
    const limitNum = parseInt(limit);
    return response.status(200).json({
      success: true,
      data: { limit: limitNum, total: results.length, result: results.slice(0, limitNum) },
    });
  } catch (error) {
    return response.status(500).json({ success: false, data: { result: [] } });
  }
});

// ─── Start ───────────────────────────────────────────────────────────────────
app.listen(PORT);
console.log(`📡 Running on port ${PORT}`);