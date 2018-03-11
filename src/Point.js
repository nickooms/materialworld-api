import dbPromise from './DB';

const LAT = 'Lat_WGS84';
const LON = 'Lon_WGS84';
const X = 'X_Lambert72';
const Y = 'Y_Lambert72';

class Point {
  static INSERT = `INSERT INTO Point (
    lat, lon, x, y
  ) VALUES (?, ?, ?, ?)`;

  static GET = 'SELECT * FROM Point WHERE id = ?';

  static async from({ [LAT]: lat, [LON]: lon, [X]: x, [Y]: y }) {
    const point = new Point({ lat, lon, x, y });
    const db = await dbPromise;
    const values = [lat, lon, x, y];
    const { stmt: { lastID } } = await db.run(Point.INSERT, values);
    point.id = lastID;
    return point;
  }

  static async byId(id) {
    const db = await dbPromise;
    const object = await db.get(Point.GET, [id]);
    return object;
  }

  constructor({ lat, lon, x, y }) {
    Object.assign(this, { lat, lon, x, y });
  }
}

export default Point;
