import sax from 'sax';
// import parseXml from '@rgrove/parse-xml';
import xpath from 'xpath';
import { DOMParser } from 'xmldom';

const select = xpath.useNamespaces({ kml: 'http://www.opengis.net/kml/2.2' });

const getAttribute = (node, name) => {
  const values = Object.values(node.attributes);
  return values
    .find(attribute => attribute.name === name)
    .value;
};

class KML {
  static INDENT = '  ';
  static OBJECT = [
    'LookAt',
    'Style',
    'IconStyle',
    'Icon',
    'LabelStyle',
    'PolyStyle',
    'MultiGeometry',
    'Point',
    'Polygon',
    'outerBoundaryIs',
    'LinearRing',
    'Placemark',
    'Folder',
    'Document',
    'kml',
  ];
  static NUMBER = [
    'longitude',
    'latitude',
    'altitude',
    'heading',
    'tilt',
    'range',
    'color',
    'scale',
    'refreshInterval',
    'viewRefreshTime',
    'viewBoundScale',
    'outline',
    'tessellate',
  ];
  static STRING = [
    'altitudeMode',
    'href',
  ];
  static POINTS = [
    'coordinates',
  ]

  static type(name) {
    if (KML.OBJECT.includes(name)) return 'object';
    if (KML.STRING.includes(name)) return 'string';
    if (KML.NUMBER.includes(name)) return 'number';
    if (KML.POINTS.includes(name)) return 'points';
    return null;
  }

  depth = 0;
  json = '';
  output = '';
  handler = null;

  get indentation() {
    return KML.INDENT.repeat(this.depth);
  }

  constructor() {
    this.parser = sax.parser(true);
    Object.assign(this.parser, {
      onerror: (e) => {
        this.out(e);
      },
      ontext: (text) => {
        const trimmed = text.trim();
        switch (this.handler) {
          case 'number':
            this.out(trimmed);
            break;
          case 'string':
            this.out(`'${trimmed}'`);
            break;
          case 'points':
            this.out(trimmed.split(' ').map(x => `${this.indentation}[${x.replace(',', ', ')}],\n`).join(''));
            break;
          default:
            if (trimmed !== '') {
              this.out(`${this.indentation}${trimmed}`);
            }
        }
        this.handler = null;
      },
      onopentag: ({ name, attributes }) => {
        const keys = Object.keys(attributes);
        const attrs = keys.length > 0
          ? `${keys.map(key => ` ${key}="${attributes[key]}"`).join('')}`
          : '';
        switch (KML.type(name)) {
          case 'object':
            this.out(`${this.indentation}{ ${name}: [\n`);
            this.handler = 'object';
            break;
          case 'number':
            this.out(`${this.indentation}${name}: `);
            this.handler = 'number';
            break;
          case 'string':
            this.out(`${this.indentation}${name}: `);
            this.handler = 'string';
            break;
          case 'points':
            this.out(`${this.indentation}${name}: [\n`);
            this.handler = 'points';
            break;
          default:
            this.out(`${this.indentation}<${name}${attrs}>`);
            this.handler = null;
        }
        this.indent();
      },
      onclosetag: (name) => {
        this.outdent();
        switch (KML.type(name)) {
          case 'object':
            this.out(`${this.indentation}}],\n`);
            break;
          case 'number':
          case 'string':
            this.out(',\n');
            break;
          case 'points':
            this.out(`${this.indentation}],\n`);
            break;
          default:
            this.out(`${this.indentation}</${name}>`);
        }
        this.hamdler = null;
      },
    });
  }

  out(text) {
    this.output += text;
  }

  indent() {
    this.depth++;
  }

  outdent() {
    this.depth--;
  }

  parse(kml) {
    this.parser.write(kml).close();
    return this.output;
  }

  static parse(kml) {
    const doc = new DOMParser().parseFromString(kml);
    const placemarks = select('//kml:Placemark', doc);
    const result = placemarks.map((placemark) => {
      const id = getAttribute(placemark, 'id');
      const point = select('descendant::kml:Point/kml:coordinates/text()', placemark, true)
        .nodeValue
        .split(',')
        .map(parseFloat);
      const polygon = select('descendant::kml:LinearRing/kml:coordinates/text()', placemark, true)
        .nodeValue
        .split(' ')
        .map(pos => pos.split(',').map(parseFloat));
      polygon.pop();
      return { id, point, polygon };
    });
    console.log(JSON.stringify(result, null, 2));
    return kml;
  }
}

export default KML;
