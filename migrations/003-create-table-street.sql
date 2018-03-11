--------------------------------------------------------------------------------
-- Up
--------------------------------------------------------------------------------

CREATE TABLE Street (
  id INTEGER PRIMARY KEY,
  formattedAddress TEXT,
  locationType TEXT,
  locationPointId INTEGER,
  lowerLeftPointId INTEGER,
  upperRightPointId INTEGER
);

--------------------------------------------------------------------------------
-- Down
--------------------------------------------------------------------------------

DROP TABLE Street;
