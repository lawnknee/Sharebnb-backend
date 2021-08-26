"use strict";

const db = require("../db");
const { NotFoundError } = require("../expressError");

const DEFAULT_PHOTO_URL = "https://sharebnb-listing-photos.s3.us-west-1.amazonaws.com/default-listing.jpg";

/** Related functions for listings. */

class Listing {
  /** Create a listing (from data), update db, return new listing data.
   *
   * Data should be { title, city, state, country, host_id, photo_url, price, details }
   *
   * Returns { id, title, city, state, country, host_id, photoUrl, price, details }
   *
   **/

  static async create({
    title,
    city,
    state,
    country,
    host_id,
    photo_url,
    price,
    details,
  }) {
    const result = await db.query(
      `INSERT INTO listings (title, 
                               city, 
                               state, 
                               country, 
                               host_id, 
                               photo_url, 
                               price, 
                               details)
           VALUES
             ($1, $2, $3, $4, $5, $6, $7, $8)
           RETURNING id, 
                     title, 
                     city, 
                     state, 
                     country, 
                     photo_url AS "photoUrl", 
                     price, 
                     details`,
      [title, city, state, country, host_id, photo_url, price, details]
    );
    const listing = result.rows[0];

    return listing;
  }

  /** Find all listings.
   *
   * Returns [{ id, title, city, price, photoUrl, details }, ...]
   * */

  static async findAll() {
    const listingRes = await db.query(`
      SELECT id,
             title,
             city,
             price,
             photo_url AS "photoUrl",
             details
        FROM listings
        ORDER BY city
    `);
    return listingRes.rows;
  }

  /** Given a listing id, return data about listing.
   *
   * Returns { id, title, city, state, country, host_id, photoUrl, price, details, host }
   *    where host is [{ id, firstName, lastName }]
   *
   * Throws NotFoundError if not found.
   **/

  static async get(id) {
    const listingRes = await db.query(
      `SELECT id,
                title,
                city,
                state,
                country,
                host_id AS "hostId",
                photo_url AS "photoUrl",
                price,
                details
           FROM listings
           WHERE id = $1`,
      [id]
    );

    const listing = listingRes.rows[0];
    console.log(listing);

    if (!listing) throw new NotFoundError(`No listing: ${id}`);

    const userRes = await db.query(
      `SELECT id, first_name, last_name
           FROM users
           WHERE id = $1`,
      [listing.hostId]
    );

    listing.host = userRes.rows[0];

    return listing;
  }

  /** Given a search term, return all relevant listings.
   *
   * Returns [ { id, title, city, photoUrl, price }, ...]
   *
   * Throws NotFoundError if not found.
   **/

  static async search(term) {
    const listingRes = await db.query(
      `SELECT id,
                  title,
                  city,
                  photo_url AS "photoUrl",
                  price
            FROM listings
            WHERE title ILIKE $1`,
      [`%${term}%`]
    );

    const listings = listingRes.rows;

    if (!listings) throw new NotFoundError(`No listings matching: ${term}`);

    return listings;
  }
}

module.exports = Listing;
