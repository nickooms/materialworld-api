import express from 'express';

import { a, ul, h1 } from './html';
import Point from './src/Point';
import Street from './src/Street';
import HttpCache from './src/HttpCache';
import Migrations from './src/Migrations';
import dbPromise, { Feature, RoadConnection } from './src/DB';
import WFS from './src/WFS';
import SVG from './src/SVG';

const PORT = 3333;

const ROUTE = {
  migrate: 'DB Migration',
  location: 'Location',
};

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
  const streetLayers = object => res.send(`
    ${h1(`${city} ${street}`)}
    ${a(`/street/${object.id}/wbn`, 'WBN')}
    ${a(`/street/${object.id}/wvb`, 'WVB')}
    ${a(`/street/${object.id}/wkn`, 'WKN')}
  `);
  let object = await Street.get(keys);
  if (object) {
    streetLayers(object);
    /* res.send(`
      ${h1(`${city} ${street}`)}
      ${a(`/street/${object.id}/wbn`, 'WBN')}
    `); */
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
  /* res.send(`
    ${h1(`${city} ${street}`)}
    ${a(`/street/${object.id}/wbn`, 'WBN')}
  `); */
});

app.get('/street/:id/wbn', async (req, res) => {
  const { id } = req.params;
  const street = await Street.byId(id);
  const json = await street.toJSON();
  const { lowerLeft, upperRight } = json;
  const bbox = [lowerLeft.x, lowerLeft.y, upperRight.x, upperRight.y].join(',');
  const layer = 'WBN';
  const wfs = await WFS.getFeature({ bbox, layer });
  wfs.features.forEach((feature) => {
    Feature.create(feature);
  });
  const width = upperRight.x - lowerLeft.x;
  const height = upperRight.y - lowerLeft.y;
  const viewBox = `${lowerLeft.y} ${lowerLeft.x} ${height} ${width}`;
  res.setHeader('Content-Type', 'image/svg+xml');
  res.send(SVG.fromWBN(wfs.features, viewBox));
});

app.get('/street/:id/wvb', async (req, res) => {
  const { id } = req.params;
  const street = await Street.byId(id);
  const json = await street.toJSON();
  const { lowerLeft, upperRight } = json;
  const bbox = [lowerLeft.x, lowerLeft.y, upperRight.x, upperRight.y].join(',');
  const layer = 'WVB';
  const wfs = await WFS.getFeature({ bbox, layer });
  // console.log(wfs);
  const roadConnections = await Promise.all(wfs.features.map((feature) => {
    // console.log(feature);
    const { geometry, properties } = feature;
    const roadConnection = {
      id: parseInt(feature.id.split('.')[1], 10),
      uidn: properties.UIDN,
      oidn: properties.OIDN,
      leftRoadId: properties.LSTRNMID,
      rightRoadId: properties.RSTRNMID,
      geometry: geometry.coordinates,
    };
    return RoadConnection.create(roadConnection);
    /* return RoadConnection.findOrCreate({
      where: { id: roadConnection.id },
      defaults: roadConnection
    })
      .spread((roadConn, created) => {
        console.log(roadConn.get({
          plain: true,
        }));
        console.log(created);
      }); */
  }));
  /* wfs.features.forEach((feature) => {
    Feature.create(feature);
  }); */
  const width = upperRight.x - lowerLeft.x;
  const height = upperRight.y - lowerLeft.y;
  const viewBox = `${lowerLeft.y} ${lowerLeft.x} ${height} ${width}`;
  res.setHeader('Content-Type', 'image/svg+xml');
  res.send(SVG.fromWVB(roadConnections, viewBox));
});

app.get('/street/:id/wkn', async (req, res) => {
  const { id } = req.params;
  const street = await Street.byId(id);
  const json = await street.toJSON();
  const { lowerLeft, upperRight } = json;
  const bbox = [lowerLeft.x, lowerLeft.y, upperRight.x, upperRight.y].join(',');
  const layer = 'WKN';
  const wfs = await WFS.getFeature({ bbox, layer });
  console.log(wfs);
  /* const roadConnections = await Promise.all(wfs.features.map((feature) => {
    // console.log(feature);
    const { geometry, properties } = feature;
    const roadConnection = {
      id: parseInt(feature.id.split('.')[1], 10),
      uidn: properties.UIDN,
      oidn: properties.OIDN,
      leftRoadId: properties.LSTRNMID,
      rightRoadId: properties.RSTRNMID,
      geometry: geometry.coordinates,
    };
    return RoadConnection.create(roadConnection);
  })); */
  const width = upperRight.x - lowerLeft.x;
  const height = upperRight.y - lowerLeft.y;
  const viewBox = `${lowerLeft.y} ${lowerLeft.x} ${height} ${width}`;
  res.setHeader('Content-Type', 'image/svg+xml');
  res.send(SVG.fromWKN(wfs.features, viewBox));
});

app.listen(PORT);

console.log(`Server running at http://localhost:${PORT}`);
