import querystring from 'querystring';

import HttpCache from './HttpCache';

const WMS = {
  URL: 'https://geoservices.informatievlaanderen.be/raadpleegdiensten/GRB/wms',
  params: {
    service: 'WMS',
    transparent: 'true',
    version: '1.3.0',
    crs: 'EPSG:31370',
  },
  getMap: async ({ bbox, layer }) => {
    const params = {
      ...WMS.params,
      request: 'GetMap',
      format: 'image/svg+xml', // application/vnd.google-earth.kml+xml
      styles: `GRB_${layer}`,
      layers: `GRB_${layer}`,
      width: 500,
      height: 450,
      bbox,
    };
    const url = `${WMS.URL}?${querystring.stringify(params)}`;
    const text = await HttpCache.fetch(url, true);
    return text;
  },
  getFeature: async ({ bbox, layer, i, j }) => {
    const params = {
      request: 'GetFeatureInfo',
      format: 'image/png',
      styles: `GRB_${layer}`,
      layers: `GRB_${layer}`,
      width: 500,
      height: 450,
      bbox,
      info_format: 'application/json',
      query_layers: `GRB_${layer}`,
      feature_count: 10,
      i,
      j,
    };
    const url = `${WMS.URL}?${querystring.stringify(params)}`;
    const json = await HttpCache.fetch(url, true);
    return JSON.parse(json);
  },
};

export default WMS;
