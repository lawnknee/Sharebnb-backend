"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");

/** Related functions for messages. */

class Message {
  /** Create a message (from data), update db, return new message data.
   *
   * Returns { id, fromUserId, toUserId, body, sentAt }
   */
  static async create({ fromUserId, toUserId, body }) {
    const result = await db.query(
      `INSERT INTO messages (from_user_id, 
                             to_user_id, 
                             body, 
                             sent_at)
          VALUES ($1, $2, $3, current_timestamp)
          RETURNING id, 
                    from_user_id AS "fromUserId", 
                    to_user_id AS "toUserId", 
                    body, 
                    sent_at AS "sentAt"`,
      [fromUserId, toUserId, body]
    );

    return result.rows[0];
  }

  /** Update read_at for message. */

  static async markRead(id) {
    const result = await db.query(
      `UPDATE messages
           SET read_at = current_timestamp
             WHERE id = $1
             RETURNING id, read_at`,
      [id]
    );
    const message = result.rows[0];

    if (!message) throw new NotFoundError(`No such message: ${id}`);

    return message;
  }

  /** Get message by id
   *
   * returns {id, from_user, to_user, body, sent_at, read_at}
   *
   * both from_user and to_user = { id, firstName, lastName, email }
   *
   */

  static async get(id) {
    const result = await db.query(
      `SELECT m.id,
                  m.from_user_id,
                  f.first_name AS from_firstName,
                  f.last_name AS from_lastName,
                  f.email AS from_email,
                  m.to_user_id,
                  t.first_name AS to_firstName,
                  t.last_name AS to_lastName,
                  t.email AS to_email,
                  m.body,
                  m.sent_at,
                  m.read_at
             FROM messages AS m
                    JOIN users AS f ON m.from_user_id = f.id
                    JOIN users AS t ON m.to_user_id = t.id
             WHERE m.id = $1`,
      [id]
    );

    let m = result.rows[0];

    if (!m) throw new NotFoundError(`No such message: ${id}`);

    return {
      id: m.id,
      from_user: {
        id: m.from_id,
        firstName: m.from_firstName,
        last_name: m.from_lastName,
        email: m.from_email,
      },
      to_user: {
        id: m.to_id,
        first_name: m.to_firstName,
        last_name: m.to_lastName,
        email: m.to_email,
      },
      body: m.body,
      sent_at: m.sent_at,
      read_at: m.read_at,
    };
  }

  /** Get all messages sent to this user by the user's id
   *
   * Returns [{ id, from_user, body, sent_at, read_at}...]
   *    where from_user = { id, firstName, lastName, email }
   */
  static async getMessagesToUser(id) {
    console.log("userId:", id)

    const messagesRes = await db.query(
      `SELECT m.id,
              m.from_user_id,
              u.first_name,
              u.last_name,
              u.email,
              m.body,
              m.sent_at,
              m.read_at
          FROM messages AS m
              JOIN users AS u ON m.from_user_id = u.id
          WHERE m.to_user_id = $1
          ORDER BY m.sent_at`,
      [id]
    );

    return messagesRes.rows.map(m => ({
      id: m.id,
      from_user: {
        id: m.from_user_id,
        first_name: m.first_name,
        last_name: m.last_name,
        email: m.email,
      },
      body: m.body,
      sent_at: m.sent_at,
      read_at: m.read_at,
    }));
  }
}

module.exports = Message;
