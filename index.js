import express from 'express';

import { a, ul, h1 } from './html';
import Point from './src/Point';
import Street from './src/Street';
import HttpCache from './src/HttpCache';
import Migrations from './src/Migrations';
import dbPromise from './src/DB';
import WFS from './src/WFS';
import SVG from './src/SVG';
import Feature from './src/db/Feature';
// import RoadConnection from './src/db/RoadConnection';
// import RoadDivision from './src/db/RoadDivision';

const PORT = 3333;

const ROUTE = {
  migrate: 'DB Migration',
  location: 'Location',
};

const LAYERS = [
  'wbn',
  'wvb',
  'wkn',
  'wgo',
];

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
  const streetLayers = ({ id }) => res.send(`
    ${h1(`${city} ${street}`)}
    ${LAYERS.map(layer => a(`/street/${id}/${layer}`, layer.toUpperCase())).join('')}
  `);
  let object = await Street.get(keys);
  if (object) {
    streetLayers(object);
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
  streetLayers(object);
});

const dbFeature = async feature =>
  await Feature.findById(feature.id)
  || Feature.create(feature);

app.get('/street/:id/:layer', async ({ params: { id, layer } }, res) => {
  const street = await Street.byId(id);
  const { lowerLeft: min, upperRight: max } = await street.toJSON();
  const bbox = [min.x, min.y, max.x, max.y].join(',');
  const wfs = await WFS.getFeature({ bbox, layer });
  const features = (await Promise.all(wfs.features
    .map(dbFeature)))
    .map(feature => feature.dataValues);
  // console.log(features);
  const width = max.x - min.x;
  const height = max.y - min.y;
  const viewBox = `${min.y} ${min.x} ${height} ${width}`;
  res.setHeader('Content-Type', 'image/svg+xml');
  res.send(SVG.from(features, viewBox));
});

/* app.get('/street/:id/wvb', async (req, res) => {
  const street = await Street.byId(req.params.id);
  const { lowerLeft: min, upperRight: max } = await street.toJSON();
  const bbox = [min.x, min.y, max.x, max.y].join(',');
  const wfs = await WFS.getFeature({ bbox, layer: 'WVB' }); */
/* const roadConnections = await Promise.all(wfs.features.map((feature) => {
    const { id, geometry, properties } = feature;
    const roadConnection = {
      id: parseInt(id.split('.')[1], 10),
      uidn: properties.UIDN,
      oidn: properties.OIDN,
      leftRoadId: properties.LSTRNMID,
      rightRoadId: properties.RSTRNMID,
      geometry: geometry.coordinates,
    };
    return RoadConnection.create(roadConnection);
  })); */
/* const width = max.x - min.x;
  const height = max.y - min.y;
  const viewBox = `${min.y} ${min.x} ${height} ${width}`;
  res.setHeader('Content-Type', 'image/svg+xml');
  res.send(SVG.from(wfs.features, viewBox));
}); */

/* app.get('/street/:id/wkn', async (req, res) => {
  const street = await Street.byId(req.params.id);
  const { lowerLeft: min, upperRight: max } = await street.toJSON();
  const bbox = [min.x, min.y, max.x, max.y].join(',');
  const wfs = await WFS.getFeature({ bbox, layer: 'WKN' });
  const width = max.x - min.x;
  const height = max.y - min.y;
  const viewBox = `${min.y} ${min.x} ${height} ${width}`;
  res.setHeader('Content-Type', 'image/svg+xml');
  res.send(SVG.from(wfs.features, viewBox));
}); */

/* app.get('/street/:id/wgo', async (req, res) => {
  const street = await Street.byId(req.params.id);
  const { lowerLeft: min, upperRight: max } = await street.toJSON();
  const bbox = [min.x, min.y, max.x, max.y].join(',');
  const wfs = await WFS.getFeature({ bbox, layer: 'WGO' }); */
/* await Promise.all(wfs.features.map(async (feature) => {
    const { id, geometry, properties } = feature;
    const object = {
      id: parseInt(id.split('.')[1], 10),
      geometry: geometry.coordinates,
      uidn: properties.UIDN,
      oidn: properties.OIDN,
      typeId: properties.TYPE,
      typeLabel: properties.LBLTYPE,
      bbox: properties.bbox,
    };
    const roadDivision = await RoadDivision.create(object);
    return roadDivision;
  })); */
/* const width = max.x - min.x;
  const height = max.y - min.y;
  const viewBox = `${min.y} ${min.x} ${height} ${width}`;
  res.setHeader('Content-Type', 'image/svg+xml');
  res.send(SVG.from(wfs.features, viewBox));
}); */

app.listen(PORT);

console.log(`Server running at http://localhost:${PORT}`);
