export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface ExpeditionStation {
  id: 1 | 2 | 3;
  numberLabel: string;
  regionName: string;
  shortNavLabel: string;
  explorer: string;
  year: string;
  milestoneTitle: string;
  summary: string;
  markerCoords: [number, number]; // [longitude, latitude]
  routeWaypoints: [number, number][]; // [longitude, latitude] from Europe to destination
  departurePort: string;
  arrivalPort: string;
  questions: [QuizQuestion, QuizQuestion, QuizQuestion];
}

export const EXPEDITION_STATIONS: ExpeditionStation[] = [
  {
    id: 1,
    numberLabel: '1',
    regionName: 'Afrika déli része',
    shortNavLabel: '1. Afrika',
    explorer: 'Bartolomeu Dias',
    year: '1488',
    milestoneTitle: 'A Jóreménység fokának elérése',
    summary:
      'A portugál hajósok fokozatosan haladtak dél felé Afrika partjai mentén, hogy megtalálják az India felé vezető tengeri utat.',
    markerCoords: [19.0, -33.5],
    departurePort: 'Lisszabon',
    arrivalPort: 'Jóreménység foka',
    routeWaypoints: [
      [-9.14, 38.72],
      [-17.2, 26.0],
      [-18.0, 14.5],
      [-11.0, 4.0],
      [4.5, -4.0],
      [11.5, -18.5],
      [18.47, -34.35],
    ],
    questions: [
      {
        id: 'afrika-1',
        question:
          'Melyik portugál tengerész jutott el először 1488-ban Afrika legdélibb csücskéhez?',
        options: [
          'Kolumbusz Kristóf',
          'Bartolomeu Dias',
          'Ferdinánd Magellán',
          'Amerigo Vespucci',
        ],
        correctIndex: 1,
        explanation:
          'Bartolomeu Dias portugál felfedező 1488-ban érte el Afrika déli csücskét, bizonyítva, hogy a kontinens délről megkerülhető.',
      },
      {
        id: 'afrika-2',
        question:
          'Milyen nevet adott a portugál király Afrika déli csücskének, amelyet Dias eredetileg a Viharok fokának nevezett?',
        options: [
          'Zöld-fok',
          'Szelek foka',
          'Jóreménység foka',
          'Aranypart',
        ],
        correctIndex: 2,
        explanation:
          'A portugál király Jóreménység fokának nevezte el a helyet, mert jó reményt adott arra, hogy tovább lehet hajózni Indiába.',
      },
      {
        id: 'afrika-3',
        question:
          'Milyen új, háromárbócos vitorlás hajótípust használtak a felfedezők, amely széllel szemben is tudott haladni?',
        options: [
          'Gálya',
          'Karavella',
          'Gőzhajó',
          'Viking hosszúhajó',
        ],
        correctIndex: 1,
        explanation:
          'A karavella könnyű, fordulékony óceánjáró vitorlás volt, amely a háromszögletű és négyszögletű vitorlákkal ellenszélben is haladt.',
      },
    ],
  },
  {
    id: 2,
    numberLabel: '2',
    regionName: 'Amerika középső része',
    shortNavLabel: '2. Közép-Amerika',
    explorer: 'Kolumbusz Kristóf',
    year: '1492',
    milestoneTitle: 'Az Újvilág felfedezése',
    summary:
      'Kolumbusz spanyol támogatással nyugat felé indult az Atlanti-óceánon át, és 1492-ben elérte Közép-Amerika szigeteit.',
    markerCoords: [-77.5, 20.5],
    departurePort: 'Palos (Spanyolország)',
    arrivalPort: 'Közép-Amerika szigetei',
    routeWaypoints: [
      [-6.89, 37.23],
      [-16.5, 28.2],
      [-32.0, 25.5],
      [-52.0, 23.0],
      [-74.5, 21.8],
    ],
    questions: [
      {
        id: 'amerika-1',
        question:
          'Melyik irányba indult el Kolumbusz Kristóf 1492-ben spanyol támogatással, hogy eljusson Indiába?',
        options: [
          'Kelet felé, a Földközi-tengeren át',
          'Dél felé, Afrika megkerülésével',
          'Nyugat felé, az Atlanti-óceánon át',
          'Észak felé, a Jeges-tengeren keresztül',
        ],
        correctIndex: 2,
        explanation:
          'Mivel a tudósok már sejtették, hogy a Föld gömb alakú, Kolumbusz nyugat felé vágott neki az Atlanti-óceánnak, hogy így érje el Ázsiát.',
      },
      {
        id: 'amerika-2',
        question:
          'Miért nevezte el Kolumbusz az újonnan felfedezett földrész őslakóit „indiánoknak”?',
        options: [
          'Mert az őslakosok kérték így magukat',
          'Mert élete végéig azt hitte, hogy Indiába ért el',
          'Mert ez spanyolul új szigetet jelent',
          'Mert Indiából hajóztak át Amerikába',
        ],
        correctIndex: 1,
        explanation:
          'Kolumbusz nem tudta, hogy új kontinenst talált. Később Amerigo Vespucci ismerte fel, hogy ez egy addig ismeretlen földrész – róla nevezték el Amerikát.',
      },
      {
        id: 'amerika-3',
        question:
          'Melyik haszonnövények kerültek át Amerikából Európába a felfedezések nyomán?',
        options: [
          'Búza, rozs és zab',
          'Bors, fahéj és szegfűszeg',
          'Burgonya, kukorica, paradicsom és kakaó',
          'Rizs, tea és selyem',
        ],
        correctIndex: 2,
        explanation:
          'Amerikából származik a burgonya, a kukorica, a paradicsom, a paprika, a dohány és a kakaó, amelyek alapjaiban átalakították az európai étrendet.',
      },
    ],
  },
  {
    id: 3,
    numberLabel: '3',
    regionName: 'India',
    shortNavLabel: '3. India',
    explorer: 'Vasco da Gama',
    year: '1497–1498',
    milestoneTitle: 'A tengeri út megnyitása Indiába',
    summary:
      'Vasco da Gama megkerülte Afrikát, átkelt az Indiai-óceánon, és 1498-ban kikötött az indiai Calicut városában.',
    markerCoords: [77.5, 17.5],
    departurePort: 'Lisszabon',
    arrivalPort: 'Calicut (India)',
    routeWaypoints: [
      [-9.14, 38.72],
      [-17.8, 25.0],
      [-23.5, 6.0],
      [-18.0, -19.0],
      [18.47, -34.35],
      [34.5, -26.0],
      [41.0, -12.0],
      [56.0, 2.0],
      [75.78, 11.25],
    ],
    questions: [
      {
        id: 'india-1',
        question:
          'Melyik portugál felfedező jutott el először közvetlen tengeri úton, Afrika megkerülésével Indiába 1498-ban?',
        options: [
          'Bartolomeu Dias',
          'Vasco da Gama',
          'Kolumbusz Kristóf',
          'Ferdinánd Magellán',
        ],
        correctIndex: 1,
        explanation:
          'Vasco da Gama expedíciója megkerülte a Jóreménység fokát, átkelt az Indiai-óceánon, és 1498-ban elérte az indiai Calicut kikötőjét.',
      },
      {
        id: 'india-2',
        question:
          'Miért kellett az európaiaknak új tengeri utat keresniük India felé a 15. század végén?',
        options: [
          'Az Oszmán Birodalom elzárta és megdrágította a keleti szárazföldi utakat',
          'A Földközi-tengeren betiltották a vitorlás hajók használatát',
          'Az arab kereskedők elköltöztek Dél-Amerikába',
          'Indiában ingyen aranyat osztottak az európai hajósoknak',
        ],
        correctIndex: 0,
        explanation:
          'A török hódítások miatt a Közel-Keleten átvezető szárazföldi útvonalak veszélyessé váltak, és nagyon magas vámokat kellett fizetni.',
      },
      {
        id: 'india-3',
        question:
          'Milyen értékes árucikkekért indultak elsősorban az európai hajósok Indiába?',
        options: [
          'Kőszénért és vasércért',
          'Fűszerekért (bors, fahéj, gyömbér) és selyemért',
          'Burgonyáért és kukoricáért',
          'Juhgyapjúért és borostyánért',
        ],
        correctIndex: 1,
        explanation:
          'A keleti fűszerek (bors, fahéj, szegfűszeg, gyömbér) rendkívül drágák voltak Európában, mivel az ételek ízesítéséhez és tartósításához használták őket.',
      },
    ],
  },
];

export const TEXTBOOK_RECAP_ITEMS = [
  {
    year: '1488',
    explorer: 'Bartolomeu Dias',
    fact: 'Elérte Afrika déli csücskét (Jóreménység foka).',
  },
  {
    year: '1492',
    explorer: 'Kolumbusz Kristóf',
    fact: 'Nyugat felé hajózva elérte Amerikát – ezzel kezdődött az újkor.',
  },
  {
    year: '1498',
    explorer: 'Vasco da Gama',
    fact: 'Afrika megkerülésével megnyitotta a tengeri utat Indiába.',
  },
  {
    year: '1519–1522',
    explorer: 'Ferdinánd Magellán',
    fact: 'Expedíciója elsőként hajózta körül a Földet, bizonyítva gömb alakját.',
  },
];
