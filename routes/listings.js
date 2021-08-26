"use strict";

/** Routes for listings. */

const jsonschema = require("jsonschema");
const { Buffer } = require("buffer");
const fs = require('fs');

const express = require("express");
const S3upload = require("../s3_upload")
const multer = require("multer");
const upload = multer();

const Listing = require("../models/listing");

const listingNewSchema = require("../schemas/listingNew.json");
const { ensureLoggedIn } = require("../middleware/auth")
const { BadRequestError} = require("../expressError");

const router = new express.Router();

/** POST / { listing } =>  { listing }
 *
 * listing should be { title, city, state, country, host_id, photo_url, price, details }
 *
 * Returns { id, title, city, state, country, host_id, photoUrl, price, details }
 *
 * Authorization required: logged in
 */
  // TODO: add ensureLoggedIn after

 router.post("/", upload.single('photoFile'), async function (req, res, next) {
  let body = req.body;
  body.price = +body.price;
  body.host_id = +body.host_id;

  console.log("This is req.file", req.file);

  body.photo_url = await S3upload(req.file);
  console.log("photo_url:", body.photo_url);

  // TODO: makes notes about what middleware if doing, what buffer is
  // we're never writing photo do disc, just storing in memory

  // const validator = jsonschema.validate(body, listingNewSchema);
  // if (!validator.valid) {
  //   const errs = validator.errors.map(e => e.stack);
  //   throw new BadRequestError(errs);
  // }
  
  const listing = await Listing.create(body);
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