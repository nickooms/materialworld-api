import fetch from 'node-fetch';
import dbPromise from './DB';

class HttpCache {
  static SELECT = 'SELECT data FROM HttpCache WHERE url = ?';

  static INSERT = 'INSERT INTO HttpCache (url, data) VALUES (?, ?)';

  static fetch = async (url, text = false) => {
    const db = await dbPromise;
    const row = await db.get(HttpCache.SELECT, [url]);
    if (row) return text ? row.data : JSON.parse(row.data);
    const response = await fetch(url);
    const data = await response.text();
    await db.run(HttpCache.INSERT, [url, data]);
    return text ? data : JSON.parse(data);
  }
}

export default HttpCache;
