-- both test users have the password "password"

INSERT INTO users (first_name, last_name, email, password, is_admin)
VALUES ('TestUser1',
        'TestU1Last',
        'testfirst@testing.com',
        '$2b$12$AZH7virni5jlTTiGgEg4zu3lSvAw68qVEfSIOjJ3RqtbJbdW/Oi5q',
        FALSE),
       ('TestAdmin1',
        'TestAdminLast',
        'testadmin@testing.com',
        '$2b$12$AZH7virni5jlTTiGgEg4zu3lSvAw68qVEfSIOjJ3RqtbJbdW/Oi5q',
        TRUE);

CREATE TABLE listings (
  id SERIAL PRIMARY KEY,
  title VARCHAR(50) NOT NULL,
  city VARCHAR(20) NOT NULL,
  state VARCHAR(20) NOT NULL,
  country VARCHAR(20) NOT NULL,
  host_id INTEGER NOT NULL REFERENCES users,
  photo_url TEXT,
  price NUMERIC NOT NULL,
  details TEXT NOT NULL
);

INSERT INTO listings (title, 
                      city, 
                      state, 
                      country, 
                      host_id, 
                      photo_url, price, 
                      details)
VALUES ('testuser1 test listing', 'Los Angeles', 'California', 'United States', 
        1, 'https://sharebnb-listing-photos.s3.us-west-1.amazonaws.com/test_listing_1.jpeg', 150, 'Beautiful downtown Condo'),
       ('testadmin1 test listing', 'San Francisco', 'California', 'United States', 
        2, 'https://sharebnb-listing-photos.s3.us-west-1.amazonaws.com/test_listing_2.jpeg', 200, 'Modern downtown Condo');