const autocompleteService = require("../services/autocompleteService");

async function suggest(req, res, next) {
  try {
    const { q } = req.query;

    if (!q || q.trim().length < 3) {
      return res.json([]); // silent empty response — no error for short prefixes
    }

    const suggestions = await autocompleteService.autocomplete(q);
    return res.json(suggestions);
  } catch (err) {
    next(err);
  }
}

module.exports = { suggest };
