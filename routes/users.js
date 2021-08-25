"use strict";

/** Routes for users. */

const jsonschema = require("jsonschema");

const express = require("express");
const User = require("../models/user");

const router = express.Router();


/** GET /[id] => { user }
 *
 * Returns { firstName, lastName, email, isAdmin, listings }
 *   where listings is { id, title, city, state, country, photoUrl, price, details }
 *
 * Authorization required: logged in
 **/

 router.get("/:id", async function (req, res, next) {
  try {
    const user = await User.get(req.params.id);
    return res.json({ user });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;