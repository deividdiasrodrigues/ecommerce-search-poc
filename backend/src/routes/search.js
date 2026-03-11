const { Router } = require("express");
const { search }  = require("../controllers/searchController");
const { suggest } = require("../controllers/autocompleteController");

const router = Router();

router.get("/search",      search);   // GET /search?q=term
router.get("/autocomplete", suggest); // GET /autocomplete?q=prefix

module.exports = router;
