const { Router } = require("express");
const { search } = require("../controllers/searchController");

const router = Router();

router.get("/search", search);

module.exports = router;
