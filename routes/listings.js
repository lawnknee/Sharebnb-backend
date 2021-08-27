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


/** GET / - get all listings
 * 
 * Returns 
 *    { listings: [ { id, title, city, state, price, photoUrl }, ...] }
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
 *    [{ id, title, city, state, price, photoUrl }, ...]
 * 
 * Authorization required: none
 */

 router.get("/search", async function (req, res, next) {
  const { q } = req.query;
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
  const listing = await Listing.get(+req.params.id);
  return res.json({ listing });
});

/** POST / { listing } =>  { listing }
 *
 * Expects to receive listing object with a multipart/form-data content-type.
 * Uses Multer middleware to handle multipart/form-data content. 
 * 
 * Listing should be { title, city, state, country, host_id, photo_url, price, details }
 *
 * Returns { id, title, city, state, country, host_id, photoUrl, price, details }
 *
 * Authorization required: logged in
 */
 router.post("/", ensureLoggedIn, upload.single('photoFile'), async function (req, res, next) {
  /** Reassinging req.body to a variable so we don't manipulate it directly
  * Convert incoming price and host_id data from strings into integers
  */
  let body = req.body;
  body.price = +body.price;
  body.host_id = +body.host_id;

  /** Multer gives us access to the file in req.file. 
   * 
   * Multer uses MemoryStorage by default, which stores the file in memory as 
   * a Buffer. A file buffer is the entire file sotred in binary format in the 
   * app's memory. We're never writing the photo file to disk, just storying in
   * memory while we upload it to s3.
   * 
   * S3upload is a helper function that takes the file and uploads it to S3.
   * It returns a url to the file if successful, or throws an error. 
   * 
   * We assign the url to the key of photo_url, which is what our db is expecting.
   */

  if (body.photoFile === "null") {
    delete body.photoFile;
    body.photo_url = "";
  } else {
    body.photo_url = await S3upload(req.file);
  }

  const validator = jsonschema.validate(body, listingNewSchema);
  if (!validator.valid) {
    const errs = validator.errors.map(e => e.stack);
    throw new BadRequestError(errs);
  }
  
  const listing = await Listing.create(body);
  return res.status(201).json({ listing });
});


module.exports = router;