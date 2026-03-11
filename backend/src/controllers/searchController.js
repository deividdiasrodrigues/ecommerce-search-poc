const searchService = require("../services/searchService");

async function search(req, res, next) {
  try {
    const { q } = req.query;

    if (!q || q.trim() === "") {
      return res.status(400).json({ error: 'Query parameter "q" is required.' });
    }

    const results = await searchService.search(q);
    return res.json(results);
  } catch (err) {
    next(err);
  }
}

module.exports = { search };
