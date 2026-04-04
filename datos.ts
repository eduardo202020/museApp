export type PermissionStatus = 'pending' | 'granted' | 'denied' | 'blocked';

export interface MuseumInfo {
  id: string;
  name: string;
  routeName: string;
  description: string;
  supportContact: string;
  city: string;
  country: string;
  estimatedDurationMinutes: number;
}

export interface RoomZone {
  id: string;
  label: string;
  narrationHint: string;
}

export interface RoomMock {
  id: string;
  name: string;
  order: number;
  description: string;
  zoneLabelDefault: string;
  directionHint: string;
  sequenceLabel: string;
  statusLabel: string;
  zones: RoomZone[];
}

export interface ArtworkMock {
  id: string;
  roomId: string;
  order: number;
  title: string;
  author: string;
  year: string;
  period: string;
  technique: string;
  durationMinutes: number;
  image: string;
  summary: string;
  context: string;
  roomRelation: string;
  audioText: string;
  tags: string[];
  locationHint: string;
  suggestedQuestions: string[];
}

export interface RouteStepMock {
  artworkId: string;
  roomId: string;
  sequence: number;
  hint: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface MuseumMock {
  museum: MuseumInfo;
  rooms: RoomMock[];
  artworks: ArtworkMock[];
  route: RouteStepMock[];
  faq: FAQItem[];
  voicePrompts: string[];
}

export const museumMock: MuseumMock = {
  museum: {
    id: 'trujillo_museo',
    name: 'MuseIQ Trujillo',
    routeName: 'Recorrido Cultura Norteña',
    description: 'Explora las culturas precolombinas del norte del Perú, desde Cupisnique hasta Chimú.',
    supportContact: 'soporte@museiq.app',
    city: 'Trujillo',
    country: 'Perú',
    estimatedDurationMinutes: 60,
  },
  rooms: [
    {
      id: 'SALA_1',
      name: 'Sala 1',
      order: 1,
      description: 'Orígenes culturales: Cupisnique y primeros desarrollos',
      zoneLabelDefault: 'cerca de la entrada',
      directionHint: 'avanza hacia la derecha',
      sequenceLabel: 'Introducción',
      statusLabel: 'detección estable',
      zones: [
        { id: 'Z1', label: 'Entrada', narrationHint: 'Comienza con una vista general de la sala.' },
        { id: 'Z2', label: 'Centro', narrationHint: 'Aquí se destacan las obras fundacionales.' },
        { id: 'Z3', label: 'Salida', narrationHint: 'Prepárate para el salto hacia Mochica.' },
      ],
    },
    {
      id: 'SALA_2',
      name: 'Sala 2',
      order: 2,
      description: 'Cultura Mochica: poder, religión y retrato',
      zoneLabelDefault: 'lado derecho',
      directionHint: 'continúa al fondo',
      sequenceLabel: 'Mochica',
      statusLabel: 'listo',
      zones: [
        { id: 'Z1', label: 'Entrada', narrationHint: 'La sala abre con poder y representación.' },
        { id: 'Z2', label: 'Centro', narrationHint: 'Aquí conviven retrato, ritual y guerra.' },
        { id: 'Z3', label: 'Fondo', narrationHint: 'El cierre conecta religión y vida cotidiana.' },
      ],
    },
    {
      id: 'SALA_3',
      name: 'Sala 3',
      order: 3,
      description: 'Transición Wari e influencias andinas',
      zoneLabelDefault: 'zona central',
      directionHint: 'gira a la izquierda',
      sequenceLabel: 'Transición andina',
      statusLabel: 'listo',
      zones: [
        { id: 'Z1', label: 'Entrada', narrationHint: 'Aquí empieza el cambio visual respecto a Mochica.' },
        { id: 'Z2', label: 'Centro', narrationHint: 'Las piezas muestran redes culturales más amplias.' },
        { id: 'Z3', label: 'Salida', narrationHint: 'La sala prepara el paso hacia Chimú.' },
      ],
    },
    {
      id: 'SALA_4',
      name: 'Sala 4',
      order: 4,
      description: 'Cultura Chimú: urbanismo y metalurgia',
      zoneLabelDefault: 'lado izquierdo',
      directionHint: 'avanza al fondo',
      sequenceLabel: 'Chimú',
      statusLabel: 'listo',
      zones: [
        { id: 'Z1', label: 'Entrada', narrationHint: 'Empiezan los objetos de prestigio.' },
        { id: 'Z2', label: 'Centro', narrationHint: 'Aquí se concentra la narrativa de ciudad y poder.' },
        { id: 'Z3', label: 'Fondo', narrationHint: 'El tramo final destaca metalurgia y expansión.' },
      ],
    },
    {
      id: 'SALA_5',
      name: 'Sala 5',
      order: 5,
      description: 'Legado e influencia en la actualidad',
      zoneLabelDefault: 'zona final',
      directionHint: 'dirígete a la salida',
      sequenceLabel: 'Legado',
      statusLabel: 'recorrido final',
      zones: [
        { id: 'Z1', label: 'Entrada', narrationHint: 'Se introduce el diálogo con el presente.' },
        { id: 'Z2', label: 'Centro', narrationHint: 'Las reinterpretaciones contemporáneas toman protagonismo.' },
        { id: 'Z3', label: 'Salida', narrationHint: 'La visita termina conectando pasado y actualidad.' },
      ],
    },
  ],
  artworks: [
    // SALA 1
    {
      id: 'obra-1-1',
      roomId: 'SALA_1',
      order: 1,
      title: 'Vasija Cupisnique Zoomorfa',
      author: 'Cultura Cupisnique',
      year: '1200 a.C.',
      period: 'Formativo',
      technique: 'Cerámica modelada',
      durationMinutes: 2,
      image: 'https://example.com/obra1-1.jpg',
      summary: 'Representación animal estilizada.',
      context: 'Evidencia temprana de simbolismo religioso.',
      roomRelation: 'Introduce los orígenes culturales.',
      audioText: 'Observa esta vasija que representa una figura animal...',
      tags: ['cupisnique', 'cerámica', 'ritual'],
      locationHint: 'Probablemente estás frente a una vitrina de introducción.',
      suggestedQuestions: ['¿Qué representa?', '¿Por qué es importante?', '¿Cómo se usaba?'],
    },
    {
      id: 'obra-1-2',
      roomId: 'SALA_1',
      order: 2,
      title: 'Botella de Asa Estribo',
      author: 'Cultura Cupisnique',
      year: '1000 a.C.',
      period: 'Formativo',
      technique: 'Cerámica pulida',
      durationMinutes: 2,
      image: 'https://example.com/obra1-2.jpg',
      summary: 'Forma característica de la región.',
      context: 'Influencia en culturas posteriores.',
      roomRelation: 'Muestra continuidad técnica.',
      audioText: 'Esta botella de asa estribo es clave...',
      tags: ['forma', 'tradición'],
      locationHint: 'Suele aparecer en la zona media de la sala.',
      suggestedQuestions: ['¿Qué significa asa estribo?', '¿Qué culturas la usaron?', '¿Para qué servía?'],
    },
    {
      id: 'obra-1-3',
      roomId: 'SALA_1',
      order: 3,
      title: 'Máscara Ritual Temprana',
      author: 'Cultura Cupisnique',
      year: '900 a.C.',
      period: 'Formativo',
      technique: 'Piedra tallada',
      durationMinutes: 3,
      image: 'https://example.com/obra1-3.jpg',
      summary: 'Objeto ceremonial.',
      context: 'Usado en rituales religiosos.',
      roomRelation: 'Explica la espiritualidad temprana.',
      audioText: 'Esta máscara era utilizada en ceremonias...',
      tags: ['ritual', 'religión'],
      locationHint: 'Busca una pieza destacada cerca del centro.',
      suggestedQuestions: ['¿En qué ritual se usaba?', '¿Qué simboliza?', '¿Quién la llevaba?'],
    },
    {
      id: 'obra-1-4',
      roomId: 'SALA_1',
      order: 4,
      title: 'Escultura Antropomorfa',
      author: 'Cultura Cupisnique',
      year: '1100 a.C.',
      period: 'Formativo',
      technique: 'Cerámica escultórica',
      durationMinutes: 2,
      image: 'https://example.com/obra1-4.jpg',
      summary: 'Figura humana estilizada.',
      context: 'Primeras representaciones humanas.',
      roomRelation: 'Transición hacia culturas complejas.',
      audioText: 'Aquí vemos una de las primeras figuras humanas...',
      tags: ['antropomorfo'],
      locationHint: 'Está vinculada al tramo final de la sala.',
      suggestedQuestions: ['¿A quién representa?', '¿Qué la hace especial?', '¿Qué aprendemos de ella?'],
    },
    {
      id: 'obra-1-5',
      roomId: 'SALA_1',
      order: 5,
      title: 'Relieve Ceremonial',
      author: 'Cultura Cupisnique',
      year: '1000 a.C.',
      period: 'Formativo',
      technique: 'Relieve en piedra',
      durationMinutes: 2,
      image: 'https://example.com/obra1-5.jpg',
      summary: 'Escena ritual.',
      context: 'Muestra jerarquía social.',
      roomRelation: 'Apoya la narrativa social.',
      audioText: 'Este relieve muestra una escena ritual...',
      tags: ['jerarquía'],
      locationHint: 'Puede estar en un panel o soporte vertical.',
      suggestedQuestions: ['¿Qué escena muestra?', '¿Quiénes aparecen?', '¿Qué nos dice sobre la sociedad?'],
    },
    {
      id: 'obra-1-6',
      roomId: 'SALA_1',
      order: 6,
      title: 'Cerámica Decorada',
      author: 'Cultura Cupisnique',
      year: '950 a.C.',
      period: 'Formativo',
      technique: 'Cerámica incisa',
      durationMinutes: 2,
      image: 'https://example.com/obra1-6.jpg',
      summary: 'Decoración geométrica.',
      context: 'Diseños simbólicos.',
      roomRelation: 'Cierra la sala con lenguaje visual.',
      audioText: 'Los patrones que ves tienen significado...',
      tags: ['geometría'],
      locationHint: 'Última pieza del tramo introductorio.',
      suggestedQuestions: ['¿Qué significan los patrones?', '¿Cómo se decoraba?', '¿Qué cuenta esta pieza?'],
    },

    // SALA 2 (MOCHICA)
    {
      id: 'obra-2-1',
      roomId: 'SALA_2',
      order: 1,
      title: 'Huaco Retrato Mochica',
      author: 'Cultura Mochica',
      year: '100 - 700 d.C.',
      period: 'Intermedio Temprano',
      technique: 'Cerámica escultórica',
      durationMinutes: 3,
      image: 'https://example.com/obra2-1.jpg',
      summary: 'Retrato realista.',
      context: 'Representación de élites.',
      roomRelation: 'Eje principal de la sala.',
      audioText: 'Estás frente a un huaco retrato mochica...',
      tags: ['retrato'],
      locationHint: 'Obra central de la sala Mochica.',
      suggestedQuestions: ['¿Es un retrato real?', '¿A quién representa?', '¿Por qué destaca tanto?'],
    },
    {
      id: 'obra-2-2',
      roomId: 'SALA_2',
      order: 2,
      title: 'Escena de Sacrificio',
      author: 'Cultura Mochica',
      year: '300 d.C.',
      period: 'Intermedio Temprano',
      technique: 'Cerámica pintada',
      durationMinutes: 3,
      image: 'https://example.com/obra2-2.jpg',
      summary: 'Escena ritual compleja.',
      context: 'Relación con religión y poder.',
      roomRelation: 'Explica ideología mochica.',
      audioText: 'Esta escena representa un sacrificio...',
      tags: ['ritual'],
      locationHint: 'Suele estar cerca de otras escenas narrativas.',
      suggestedQuestions: ['¿Qué ocurre en la escena?', '¿Qué nos dice sobre los rituales?', '¿Por qué era importante?'],
    },
    {
      id: 'obra-2-3',
      roomId: 'SALA_2',
      order: 3,
      title: 'Guerrero Mochica',
      author: 'Cultura Mochica',
      year: '400 d.C.',
      period: 'Intermedio Temprano',
      technique: 'Cerámica escultórica',
      durationMinutes: 2,
      image: 'https://example.com/obra2-3.jpg',
      summary: 'Figura de guerrero.',
      context: 'Sociedad militarizada.',
      roomRelation: 'Refuerza estructura social.',
      audioText: 'Observa el atuendo del guerrero...',
      tags: ['guerra'],
      locationHint: 'Probablemente en la mitad del recorrido Mochica.',
      suggestedQuestions: ['¿Qué lleva puesto?', '¿Qué rol tenía?', '¿Cómo era la guerra mochica?'],
    },
    {
      id: 'obra-2-4',
      roomId: 'SALA_2',
      order: 4,
      title: 'Dios Degollador',
      author: 'Cultura Mochica',
      year: '500 d.C.',
      period: 'Intermedio Temprano',
      technique: 'Cerámica',
      durationMinutes: 3,
      image: 'https://example.com/obra2-4.jpg',
      summary: 'Deidad importante.',
      context: 'Religión mochica.',
      roomRelation: 'Explica cosmovisión.',
      audioText: 'Esta figura representa una deidad...',
      tags: ['religión'],
      locationHint: 'Pieza de fuerte carga simbólica hacia el fondo.',
      suggestedQuestions: ['¿Quién es esta deidad?', '¿Qué simboliza?', '¿Cómo se relaciona con los rituales?'],
    },
    {
      id: 'obra-2-5',
      roomId: 'SALA_2',
      order: 5,
      title: 'Cerámica Erótica',
      author: 'Cultura Mochica',
      year: '600 d.C.',
      period: 'Intermedio Temprano',
      technique: 'Cerámica modelada',
      durationMinutes: 2,
      image: 'https://example.com/obra2-5.jpg',
      summary: 'Representación simbólica.',
      context: 'Interpretaciones culturales.',
      roomRelation: 'Amplía visión cultural.',
      audioText: 'Esta pieza representa aspectos de la vida...',
      tags: ['sexualidad'],
      locationHint: 'Puede aparecer en una vitrina temática lateral.',
      suggestedQuestions: ['¿Por qué hacían estas piezas?', '¿Qué significan?', '¿Cómo debemos interpretarlas?'],
    },
    {
      id: 'obra-2-6',
      roomId: 'SALA_2',
      order: 6,
      title: 'Vasija Ritual Mochica',
      author: 'Cultura Mochica',
      year: '450 d.C.',
      period: 'Intermedio Temprano',
      technique: 'Cerámica',
      durationMinutes: 2,
      image: 'https://example.com/obra2-6.jpg',
      summary: 'Uso ceremonial.',
      context: 'Prácticas religiosas.',
      roomRelation: 'Cierre temático.',
      audioText: 'Esta vasija era usada en rituales...',
      tags: ['ritual'],
      locationHint: 'Tramo final de la sala Mochica.',
      suggestedQuestions: ['¿Cómo se usaba?', '¿Qué ritual acompañaba?', '¿Qué material tiene?'],
    },

    // SALA 3 (resumido pero completo)
    ...Array.from({ length: 6 }).map((_, i) => ({
      id: `obra-3-${i + 1}`,
      roomId: 'SALA_3',
      order: i + 1,
      title: `Obra Wari ${i + 1}`,
      author: 'Cultura Wari',
      year: '600 - 900 d.C.',
      period: 'Horizonte Medio',
      technique: 'Textil / cerámica',
      durationMinutes: 2,
      image: `https://example.com/obra3-${i + 1}.jpg`,
      summary: 'Pieza representativa Wari.',
      context: 'Influencia andina.',
      roomRelation: 'Transición cultural.',
      audioText: 'Esta obra muestra la influencia Wari...',
      tags: ['wari'],
      locationHint: 'Obra de transición en una vitrina central.',
      suggestedQuestions: ['¿Qué rasgo la hace Wari?', '¿Qué cambió respecto a Mochica?', '¿Qué influencias tiene?'],
    })),

    // SALA 4
    ...Array.from({ length: 6 }).map((_, i) => ({
      id: `obra-4-${i + 1}`,
      roomId: 'SALA_4',
      order: i + 1,
      title: `Obra Chimú ${i + 1}`,
      author: 'Cultura Chimú',
      year: '900 - 1470 d.C.',
      period: 'Intermedio Tardío',
      technique: 'Metalurgia / cerámica negra',
      durationMinutes: 2,
      image: `https://example.com/obra4-${i + 1}.jpg`,
      summary: 'Arte Chimú.',
      context: 'Imperio Chimú.',
      roomRelation: 'Desarrollo urbano.',
      audioText: 'La cultura Chimú destacó por...',
      tags: ['chimu'],
      locationHint: 'Busca acabados oscuros o metalizados.',
      suggestedQuestions: ['¿Qué caracteriza al arte Chimú?', '¿Cómo era Chan Chan?', '¿Qué técnica se ve aquí?'],
    })),

    // SALA 5
    ...Array.from({ length: 6 }).map((_, i) => ({
      id: `obra-5-${i + 1}`,
      roomId: 'SALA_5',
      order: i + 1,
      title: `Obra Contemporánea ${i + 1}`,
      author: 'Artista Peruano',
      year: 'Siglo XXI',
      period: 'Contemporáneo',
      technique: 'Mixta',
      durationMinutes: 2,
      image: `https://example.com/obra5-${i + 1}.jpg`,
      summary: 'Interpretación moderna.',
      context: 'Inspiración en culturas antiguas.',
      roomRelation: 'Cierre del recorrido.',
      audioText: 'Esta obra contemporánea se inspira en...',
      tags: ['contemporáneo'],
      locationHint: 'Zona final de reflexión y cierre.',
      suggestedQuestions: ['¿Qué retoma del pasado?', '¿Por qué está al final?', '¿Qué quiere transmitir?'],
    })),
  ],

  route: Array.from({ length: 30 }).map((_, i) => ({
    artworkId: `obra-${Math.floor(i / 6) + 1}-${(i % 6) + 1}`,
    roomId: `SALA_${Math.floor(i / 6) + 1}`,
    sequence: i + 1,
    hint: 'Sigue el recorrido sugerido.',
  })),

  faq: [
    {
      question: '¿Necesito internet?',
      answer: 'No necesariamente para el recorrido base.',
    },
    {
      question: '¿Cuánto dura el recorrido?',
      answer: 'Aproximadamente 60 minutos.',
    },
  ],

  voicePrompts: [
    '¿Quién hizo esta obra?',
    '¿Por qué es importante?',
    '¿De qué época es?',
    '¿Qué representa?',
  ],
};

export const permissionCopy = {
  bluetooth: {
    title: 'Bluetooth',
    description: 'Permite detectar en qué sala estás y sugerir la obra más probable.',
  },
  location: {
    title: 'Ubicación',
    description: 'En Android es necesaria para escanear dispositivos Bluetooth cercanos.',
  },
  microphone: {
    title: 'Micrófono',
    description: 'Se usa para preguntas por voz y respuestas guiadas dentro del recorrido.',
  },
} as const;

export const defaultPermissionStatuses: Record<'bluetooth' | 'location' | 'microphone', PermissionStatus> = {
  bluetooth: 'pending',
  location: 'pending',
  microphone: 'pending',
};

export const getRoomById = (roomId?: string) =>
  museumMock.rooms.find((room) => room.id === roomId);

export const getArtworkById = (artworkId?: string) =>
  museumMock.artworks.find((artwork) => artwork.id === artworkId);

export const getArtworksByRoom = (roomId: string) =>
  museumMock.artworks.filter((artwork) => artwork.roomId === roomId).sort((a, b) => a.order - b.order);
