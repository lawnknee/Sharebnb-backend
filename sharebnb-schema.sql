CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE
    CHECK (position('@' IN email) > 1),
  password TEXT NOT NULL,
  is_admin BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE listings (
  id SERIAL PRIMARY KEY,
  title VARCHAR(50) NOT NULL,
  city VARCHAR(20) NOT NULL,
  state VARCHAR(20) NOT NULL,
  country VARCHAR(20) NOT NULL,
  host_id INTEGER NOT NULL REFERENCES users,
  photo_url TEXT,
  price NUMERIC (10, 2) NOT NULL,
  details TEXT NOT NULL
);

CREATE TABLE messages (
  id SERIAL PRIMARY KEY,
  from_user_id INTEGER NOT NULL REFERENCES users,
  to_user_id INTEGER NOT NULL REFERENCES users,
  body TEXT NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL,
  read_at TIMESTAMP WITH TIME ZONE
);

-- get all messages for a user 

-- user for specific listing should be able to receive messages from other users about that listing

-- many to many table connect listing to host_user and guest_user through listing_id
