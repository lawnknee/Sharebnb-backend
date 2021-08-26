"use strict";

const db = require("../db");
const bcrypt = require("bcrypt");
const {
  NotFoundError,
  BadRequestError,
  UnauthorizedError,
} = require("../expressError");

const { BCRYPT_WORK_FACTOR } = require("../config.js");

/** Related functions for users. */

class User {
  /** authenticate user with username, password.
   *
   * Returns { id, firstName, lastName, email, is_admin }
   *
   * Throws UnauthorizedError if user not found or wrong password.
   **/

  static async authenticate(email, password) {
    // try to find the user first
    const result = await db.query(
      `SELECT id,
                  first_name AS "firstName",
                  last_name AS "lastName",
                  email,
                  password,
                  is_admin AS "isAdmin"
           FROM users
           WHERE email = $1`,
      [email]
    );

    const user = result.rows[0];

    if (user) {
      // compare hashed password to a new hash from password
      const isValid = await bcrypt.compare(password, user.password);
      if (isValid === true) {
        delete user.password;
        return user;
      }
    }

    throw new UnauthorizedError("Invalid username/password");
  }

  /** Register user with data.
   *
   * Returns { id, firstName, lastName, email, isAdmin }
   *
   * Throws BadRequestError on duplicates.
   **/

  static async register({ firstName, lastName, email, password, isAdmin }) {
    const duplicateCheck = await db.query(
      `SELECT email
         FROM users
         WHERE email = $1`,
      [email]
    );

    if (duplicateCheck.rows[0]) {
      throw new BadRequestError(`Duplicate email: ${email}`);
    }

    const hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);

    const result = await db.query(
      `INSERT INTO users
         (first_name,
          last_name,
          email,
          password,
          is_admin)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, first_name AS "firstName", last_name AS "lastName", email, is_admin AS "isAdmin"`,
      [firstName, lastName, email, hashedPassword, isAdmin]
    );

    const user = result.rows[0];

    return user;
  }

  /** Given an id, return data about user.
   *
   * Returns { first_name, last_name, email, is_admin, listings }
   *    where listings is { id, title, city, state, country, photoUrl, price, details }
   *
   * Throws NotFoundError if user not found.
   **/

  static async get(id) {
    const userRes = await db.query(
          `SELECT id,
                  first_name AS "firstName",
                  last_name AS "lastName",
                  email,
                  is_admin AS "isAdmin"
           FROM users
           WHERE id = $1`,
        [id],
    );

    const user = userRes.rows[0];

    if (!user) throw new NotFoundError(`No user: ${id}`);
    
    const userListingsRes = await db.query(
      `SELECT l.id, 
              l.title, 
              l.city, 
              l.state, 
              l.country, 
              l.photo_url AS "photoUrl", 
              l.price, 
              l.details
      FROM listings AS l
      WHERE l.host_id = $1`,
      [id]
    );

    user.listings = userListingsRes.rows;

    return user;
  }
}

module.exports = User;
