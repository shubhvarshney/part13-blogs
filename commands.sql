CREATE TABLE blogs (
    id SERIAL PRIMARY KEY,
    author text,
    url text NOT NULL,
    title text NOT NULL,
    likes integer DEFAULT 0
);

INSERT INTO blogs (author, url, title) VALUES (
    'John Doe',
    'https://example.com/johndoe',
    'A Day in the Life of a Developer'
);

INSERT INTO blogs (author, url, title) VALUES (
    'Jane Smith',
    'https://example.com/janesmith',
    'A Day in the Life of a Designer'
);