import dbPromise from './DB';
import Point from './Point';

class Street {
  static GET = `SELECT * FROM Street WHERE
    formattedAddress = ? AND locationType = ?
  `;

  static BY_ID = 'SELECT * FROM Street WHERE id = ?';

  static INSERT = `INSERT INTO Street (
    formattedAddress,
    locationType,
    locationPointId,
    lowerLeftPointId,
    upperRightPointId
  ) VALUES (?, ?, ?, ?, ?)`;

  static LOCATION = Symbol('location');

  static async get({ formattedAddress, locationType }) {
    const db = await dbPromise;
    const object = await db.get(Street.GET, [formattedAddress, locationType]);
    return new Street(object);
  }

  static async byId(id) {
    const db = await dbPromise;
    const object = await db.get(Street.BY_ID, [id]);
    return new Street(object);
  }

  constructor(object) {
    Object.assign(this, object);
  }

  async toJSON() {
    const location = await Point.byId(this.locationPointId);
    const lowerLeft = await Point.byId(this.lowerLeftPointId);
    const upperRight = await Point.byId(this.upperRightPointId);
    const { id, formattedAddress, locationType } = this;
    return { id, formattedAddress, locationType, location, lowerLeft, upperRight };
  }

  get location() {
    return { id: this[Street.LOCATION] };
  }
}

export default Street;
