import React from 'react';
import ReactDOMServer from 'react-dom/server';

import SVG from './components/SVG';
import Polygon from './components/Polygon';

const SVGGenerator = {
  fromFeatures(features, viewBox) {
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
};

export default SVGGenerator;
