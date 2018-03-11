import dbPromise from './DB';

class Migrations {
  static async migrate() {
    const db = await dbPromise;
    await db.migrate({ force: 'last' });
  }

  static async list() {
    const db = await dbPromise;
    const migrations = await db.all('SELECT id, name FROM migrations');
    return migrations;
  }
}

export default Migrations;
