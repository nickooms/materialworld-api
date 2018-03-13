import React from 'react';
import ReactDOMServer from 'react-dom/server';

import SVG from './components/SVG';
import Polygon from './components/Polygon';
import Polyline from './components/Polyline';
import Point from './components/Point';

const STROKE = {
  3: 'purple',
  1: 'brown',
  2: 'yellow',
};

const SVGGenerator = {
  fromWBN(features, viewBox) {
    const polygons = features.map(({ id, geometry, properties }) => {
      const { LBLTYPE } = properties;
      const fill = LBLTYPE === 'wegsegment' ? '#CCCCCC' : '#B7B7B7';
      const { coordinates } = geometry;
      const [points] = coordinates;
      points.pop();
      const pointList = points.map(([x, y]) => `${y},${x}`).join(' ');
      return (
        <Polygon key={id} points={pointList} fill={fill} />
      );
    });
    const svg = (
      <SVG viewBox={viewBox}>
        {polygons}
      </SVG>
    );
    return ReactDOMServer.renderToStaticMarkup(svg);
  },
  fromWVB(roadConnections, viewBox) {
    const lines = roadConnections.map((roadConnection) => {
      const { id } = roadConnection;
      const points = roadConnection.geometry;
      const pointList = points.map(([x, y]) => `${y},${x}`).join(' ');
      return (
        <Polyline key={id} points={pointList} stroke="black" />
      );
    });
    const svg = (
      <SVG viewBox={viewBox}>
        {lines}
      </SVG>
    );
    return ReactDOMServer.renderToStaticMarkup(svg);
  },
  fromWKN(features, viewBox) {
    console.dir(features, { colors: true, depth: null });
    const points = features.map((feature) => {
      const [x, y] = feature.geometry.coordinates;
      const { id } = feature;
      return (
        <Point key={id} x={y} y={x} />
      );
    });
    const svg = (
      <SVG viewBox={viewBox}>
        {points}
      </SVG>
    );
    return ReactDOMServer.renderToStaticMarkup(svg);
  },
  fromWGO(features, viewBox) {
    const lines = features.map((roadDivision) => {
      const { id } = roadDivision;
      const points = roadDivision.geometry.coordinates;
      const { TYPE } = roadDivision.properties;
      const pointList = points.map(([x, y]) => `${y},${x}`).join(' ');
      const stroke = STROKE[TYPE];
      return (
        <Polyline key={id} points={pointList} stroke={stroke} />
      );
    });
    const svg = (
      <SVG viewBox={viewBox}>
        {lines}
      </SVG>
    );
    return ReactDOMServer.renderToStaticMarkup(svg);
  },
};

export default SVGGenerator;
