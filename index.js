import express from 'express';
import Sequelize from 'sequelize';
// import xpath from 'xpath';
// import { DOMParser } from 'xmldom';

import { a, ul, h1 } from './html';
import Point from './src/Point';
import Street from './src/Street';
import HttpCache from './src/HttpCache';
import Migrations from './src/Migrations';
import dbPromise from './src/DB';
import WFS from './src/WFS';
// import KML from './src/KML';

// const select = xpath.useNamespaces({ svg: 'http://www.w3.org/2000/svg' });

/* const getAttribute = (node, name) => {
  const values = Object.values(node.attributes);
  return values
    .find(attribute => attribute.name === name)
    .value;
}; */

const sequelize = new Sequelize('database', null, null, {
  dialect: 'sqlite',
  storage: './database.sqlite',
  operatorsAliases: false,
});
const OPTIONS = { timestamps: false };
const Feature = sequelize.define('feature', {
  id: {
    type: Sequelize.STRING,
    primaryKey: true,
  },
  geometry: Sequelize.JSON,
}, OPTIONS);

sequelize
  .authenticate()
  .then(() => {
    console.log('Connection has been established successfully.');
  }, (err) => {
    console.log('Unable to connect to the database:', err);
  });

const PORT = 3333;

const ROUTE = {
  migrate: 'DB Migration',
  location: 'Location',
};

/* const log = (data) => {
  console.dir(data, { colors: true, depth: null });
  return data;
}; */

const streetLink = ({ city, street }) =>
  a(`/location/${city}/${street}`, `${street} ${city}`);

const app = express();

app.get('/', (req, res) => {
  res.send(ul(Object.entries(ROUTE)
    .map(([key, name]) => a(`/${key}`, name))));
});

app.get('/location', async (req, res) => {
  const db = await dbPromise;
  const streets = (await db.all('SELECT formattedAddress FROM Street'))
    .map(street => street.formattedAddress.split(', '))
    .map(([street, city]) => ({ street, city }));
  res.send(ul(streets.map(streetLink)));
});

app.get('/migrate', async (req, res, next) => {
  try {
    await Migrations.migrate();
    const migrations = await Migrations.list();
    res.send(`
      ${h1('DB migration done')}
      ${ul(migrations.map(({ id, name }) => `${id}: ${name}`))}
    `);
  } catch (err) {
    next(err);
  }
});

app.get('/location/:city/:street', async (req, res) => {
  const { city, street } = req.params;
  const url = `http://loc.geopunt.be/v2/location?q=${street}, ${city}`;
  const body = await HttpCache.fetch(url);
  const { LocationResult } = body;
  const [result] = LocationResult;
  const { FormattedAddress, LocationType } = result;
  const db = await dbPromise;
  const keys = { formattedAddress: FormattedAddress, locationType: LocationType };
  let object = await Street.get(keys);
  if (object) {
    // const json = await object.toJSON();
    // log(json);
    res.send(a(`/street/${object.id}/wbn`, `${city} ${street} WBN`));
    return;
  }
  const { Location, BoundingBox: { LowerLeft, UpperRight } } = result;
  const location = await Point.from(Location);
  const lowerLeft = await Point.from(LowerLeft);
  const upperRight = await Point.from(UpperRight);
  const values = [
    FormattedAddress,
    LocationType,
    location.id,
    lowerLeft.id,
    upperRight.id,
  ];
  const { stmt: { lastID } } = await db.run(Street.INSERT, values);
  object = new Street({
    id: lastID,
    ...keys,
    [Street.Location]: location,
    lowerLeft,
    upperRight,
  });
  // const json = await object.toJSON();
  // log(json);
  res.send(a(`/street/${object.id}/wbn`, `${city} ${street} WBN`));
});

app.get('/street/:id/wbn', async (req, res) => {
  const { id } = req.params;
  const street = await Street.byId(id);
  const json = await street.toJSON();
  // console.log(json);
  const { lowerLeft, upperRight } = json;
  const bbox = [lowerLeft.x, lowerLeft.y, upperRight.x, upperRight.y].join(',');
  // console.log(bbox);
  const layer = 'WBN';
  const wfs = await WFS.getFeature({ bbox, layer });
  console.log(wfs);
  // const text = await WMS.getMap({ bbox, layer });
  // const doc = new DOMParser().parseFromString(text);
  // const paths = select('//svg:path', doc);
  /* const middles = paths.map((path) => {
    const d = getAttribute(path, 'd')
      .split(/M| L|Z/g)
      .filter(x => x !== '')
      .map((point) => {
        const [x, y] = point.split(' ').map(parseFloat);
        return { x, y };
      });
    const middle = d.reduce((sum, point) => ({
      x: sum.x + point.x,
      y: sum.y + point.y,
    }), {
      x: 0,
      y: 0,
    });
    return { x: middle.x / d.length, y: middle.y / d.length };
  }); */
  // console.log(middles);
  /* const features = await Promise.all(middles.map((middle) => {
    return WMS.getFeature({
      bbox,
      layer,
      i: parseInt(middle.x, 10),
      j: 450 - parseInt(middle.y, 10),
    });
  })); */
  // console.log(features);
  /* const URL = 'https://geoservices.informatievlaanderen.be/raadpleegdiensten/GRB/wms';
  const params = {
    SERVICE: 'WMS',
    REQUEST: 'GetMap',
    FORMAT: 'application/vnd.google-earth.kml+xml', // 'image/svg+xml',
    TRANSPARENT: 'TRUE',
    STYLES: `GRB_${layer}`,
    VERSION: '1.3.0',
    LAYERS: `GRB_${layer}`,
    WIDTH: 500,
    HEIGHT: 450,
    CRS: 'EPSG:31370',
    BBOX: bbox,
  };
  const url = `${URL}?${querystring.stringify(params)}`;
  // console.log(url);
  // const xml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>';
  const text = await HttpCache.fetch(url, true); */
  // const kml = text.substr(text.indexOf('<Document>'));
  // const LookAt = /Lookat.*LookAt/g;
  // kml;
  // const kml = KML.parse(text);
  // .replace(LookAt, '$1');
  // const text = await response.text();
  // console.log(text);
  // const map = await getMqp({ layer: 'WBN', bbox });
  sequelize
    .sync({ force: true })
    .then(() => {
      console.log('It worked!');
      wfs.features.forEach((feature) => {
        Feature.create(feature);
      });
    }, (err) => {
      console.log('An error occurred while creating the table:', err);
    });
  res.json(wfs);
});

app.listen(PORT);

console.log(`Server running at http://localhost:${PORT}`);
