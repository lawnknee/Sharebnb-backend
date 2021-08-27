"use strict";

const { Router } = require("express");
const router = new Router();

const Message = require("../models/message");
const { ensureLoggedIn } = require("../middleware/auth");
const { UnauthorizedError } = require("../expressError");

/** GET /:id - get detail of message.
 *
 * => {message: {id,
 *               body,
 *               sent_at,
 *               read_at,
 *               from_user: { id, first_name, last_name, phone },
 *               to_user: { id, first_name, last_name, phone }
 *
 * Authorization required: current user is either the to or from user.
 *
 **/

router.get("/:id", async function (req, res, next) {
  let msg = await Message.get(req.params.id);
  // let id = res.locals.user.id;

  // if (msg.to_user.id !== id && msg.from_user.id !== id) {
  //   throw new UnauthorizedError("Cannot read this message");
  // }

  return res.json({ message: msg });
});

/** GET /to/:id - get all messages sent to a user
 * 
 * => {message: {id,
 *               body,
 *               sent_at,
 *               read_at,
 *               from_user: { id, first_name, last_name, phone },
 *               to_user: { id, first_name, last_name, phone }
 */
 router.get("/to/:userId", async function (req, res, next) {
  let messages = await Message.getMessagesToUser(req.params.userId);
  // let id = res.locals.user.id;

  // if (msg.to_user.id !== id && msg.from_user.id !== id) {
  //   throw new UnauthorizedError("Cannot read this message");
  // }

  return res.json({ message: messages });
});


/** POST / { message } =>  { message }
 *
 * Message should be { fromUserId, toUserId, body }
 *
 * Returns { id, fromUserId, toUserId, body, sentAt }
 *
 * Authorization required: logged in
 **/

router.post("/", async function (req, res, next) {
  const { fromUserId, toUserId, body } = req.body;

  const msg = await Message.create({ fromUserId, toUserId, body });

  return res.json({ message: msg });
});

module.exports = router;
