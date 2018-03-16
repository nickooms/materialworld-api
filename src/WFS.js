import querystring from 'querystring';

import HttpCache from './HttpCache';

const WFS = {
  URL: 'https://geoservices.informatievlaanderen.be/overdrachtdiensten/GRB/wfs',
  params: {
    service: 'WFS',
    version: '2.0.0',
    crs: 'EPSG:31370',
    outputFormat: 'application/json',
  },
  getFeature: async ({ bbox, layer }) => {
    const params = {
      ...WFS.params,
      request: 'GetFeature',
      typeNames: `GRB:${layer.toUpperCase()}`,
      bbox,
    };
    const url = `${WFS.URL}?${querystring.stringify(params)}`;
    const json = await HttpCache.fetch(url, true);
    return JSON.parse(json);
  },
};

export default WFS;
