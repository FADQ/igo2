import { ClientParcelProProduction, ClientParcelProCategory } from './client-parcel-pro.interfaces';

export const ClientParcelProCatColors: {[key: string]: [number, number, number]} = {
  'API': [255, 192, 0],
  'aut': [247, 150, 70],
  'AVO': [154, 205, 50],
  'bpa': [154, 192, 205],
  'cnl': [145, 44, 238],
  'feu': [0, 102, 0],
  'fru': [255, 0, 0],
  'div': [0, 204, 255],
  'cma': [200, 152, 0],
  'rac': [148, 139, 84],
  'viv': [74, 69, 42],
  'cem': [0, 204, 255],
  'FOI': [205, 106, 106],
  'INC': [235, 235, 235],
  'ldt': [205, 41, 144],
  'maf': [246, 213, 130],
  'mgr': [255, 255, 0],
  'org': [0, 205, 102],
  'ptf': [255, 99, 71],
  'pom': [242, 221, 220],
  'pdt': [151, 72, 7],
  'prt': [191, 149, 223],
  'sei': [252, 213, 180],
  'soy': [79, 148, 205],


  'APA': [154, 205, 50],
  'FSU': [205, 106, 106]
};

export const ClientParcelProCatDescs: {[key: string]: string} = {
  'API': 'Apiculture-abeille',
  'aut': 'Autres',
  'AVO': 'Avoine',
  'bpa': 'Blé, triticale, épeautre',
  'cnl': 'Canola',
  'feu': 'CMA-Feuillus',
  'fru': 'CMA-Fruits',
  'div': 'CMA-Légumes divers',
  'cma': 'CM-Multiples',
  'rac': 'CMA-Racines',
  'viv': 'CMA-Vivaces',
  'cem': 'Cultures émergentes',
  'FOI': 'Foin',
  'INC': 'Inconnu',
  'ldt': 'Légumes de transformation',
  'maf': 'Maïs fourrager',
  'mgr': 'Maïs-grain',
  'org': 'Orge',
  'ptf': 'Petits fruits',
  'pom': 'Pommes',
  'pdt': 'Pommes de terre',
  'prt': 'Protéagineuses',
  'sei': 'Seigle',
  'soy': 'Soya',

  'APA': 'Avoine',
  'FSU': 'Foin'
};

export const ClientParcelProCategories: {[key: string]: ClientParcelProCategory} = {
  // 'API': {
  //   code: 'API',
  //   desc: 'Apiculture-abeille',
  //   color: [255, 192, 0],
  //   productions: []
  // },

  'AUT': {
    code: 'AUT',
    desc: 'Autres',
    color: [247, 150, 70],
    productions: ['PNC']
  },
  'AVO': {
    code: 'AVO',
    desc: 'Avoine',
    color: [154, 205, 50],
    productions: ['APA']
  },
  'BBA': {
    code: 'BBA',
    desc: 'Blé, triticale, épeautre',
    color: [154, 192, 205],
    productions: ['ABA']
  },
  'FOI': {
    code: 'FOI',
    desc: 'Foin',
    color: [205, 106, 106],
    productions: ['FSU']
  },
  'INC': {
    code: 'INC',
    desc: 'Inconnu',
    color: [235, 235, 235],
    productions: [
      'LOC'
    ]
  },
  'ORG': {
    code: 'ORG',
    desc: 'Orge',
    color: [0, 205, 102],
    productions: [
      'OPA'
    ]
  },
};

export const ClientParcelProProductions: {[key: string]: ClientParcelProProduction} = {
  'ABA': {
    code: 'ABA',
    desc: 'Blé automne',
    cultivars: [
      '25R46',
      'Branson',
      'Enrg. à confirmer',
      'Redeemer (FTHP Redee',
      'Ron (AC Ron)'
    ]
  },
  'APA': {
    code: 'APA',
    desc: 'Avoine',
    cultivars: []
  },
  'FSU': {
    code: 'FSU',
    desc: 'Foin option superficie',
    cultivars: []
  },
  'LOC': {
    code: 'LOC',
    desc: 'Location',
    cultivars: []
  },
  'PNC': {
    code: 'PNC',
    desc: 'Partie non cultivée',
    cultivars: []
  },
  'OPA': {
    code: 'OPA',
    desc: 'Orge',
    cultivars: []
  },
};
