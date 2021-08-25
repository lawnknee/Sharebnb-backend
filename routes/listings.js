"use strict";

/** Routes for listings. */

const jsonschema = require("jsonschema");

const express = require("express");
const Listing = require("../models/listing");
const listingNewSchema = require("../schemas/listingNew.json");
const { BadRequestError} = require("../expressError");

const router = new express.Router();

/** POST / { listing } =>  { listing }
 *
 * listing should be { title, city, state, country, host_id, photoUrl, price, details }
 *
 * Returns { id, title, city, state, country, host_id, photoUrl, price, details }
 *
 * Authorization required: logged in
 */

 router.post("/", async function (req, res, next) {
  req.body.price = +req.body.price;

  const validator = jsonschema.validate(req.body, listingNewSchema);
  if (!validator.valid) {
    const errs = validator.errors.map(e => e.stack);
    throw new BadRequestError(errs);
  }

  const listing = await Listing.create(req.body);
  return res.status(201).json({ listing });
});

/** GET /  =>
 *   { listings: [ { id, title, city, price, photoUrl, details }, ...] }
 *
 * Authorization required: none
 */

 router.get("/", async function (req, res, next) {
  const listings = await Listing.findAll();
  return res.json({ listings });
});

/** GET /listings/search  =>  { listings }
 * 
 *  Gets listing title filtered by search term
 * 
 *  listings is
 *    [{ id, name, price, zipcode, capacity, amenities, photoUrl }, ...]
 * 
 * Authorization required: none
 */

 router.get("/search", async function (req, res, next) {
  const { q } = req.query;
  console.log(q)
  const listings = await Listing.search(q);
  return res.json({ listings });
});

/** GET /[id]  =>  { listing }
 *
 *  Listing is { id, title, city, state, country, host_id, photoUrl, price, details, host }
 *    where host is [{ id, firstName, lastName }]
 *
 * Authorization required: none
 */

 router.get("/:id", async function (req, res, next) {
  const listing = await Listing.get(req.params.id);
  return res.json({ listing });
});

module.exports = router;