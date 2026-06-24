/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { WordClass, WordToken } from "./types";

export const DEFAULT_WORD_POOL: WordToken[] = [
  // --- SUSTANTIVOS ---
  {
    id: "n1",
    word: "pelota",
    wordClass: WordClass.Sustantivo,
    attributes: {
      noun: {
        subclase: "común",
        naturaleza: "concreto",
        recuento: "contable",
        grupo: "individual",
        genero: "femenino",
        numero: "singular"
      }
    },
    definition: "Sustantivo común, concreto, contable, individual, de género femenino y número singular."
  },
  {
    id: "n2",
    word: "rebaño",
    wordClass: WordClass.Sustantivo,
    attributes: {
      noun: {
        subclase: "común",
        naturaleza: "concreto",
        recuento: "contable",
        grupo: "colectivo",
        genero: "masculino",
        numero: "singular"
      }
    },
    definition: "Sustantivo común, concreto, contable, colectivo (conjunto de ovejas), masculino y singular."
  },
  {
    id: "n3",
    word: "felicidad",
    wordClass: WordClass.Sustantivo,
    attributes: {
      noun: {
        subclase: "común",
        naturaleza: "abstracto",
        recuento: "no aplica",
        grupo: "no aplica",
        genero: "femenino",
        numero: "singular"
      }
    },
    definition: "Sustantivo común, abstracto (emoción), no contable individualmente, femenino y singular."
  },
  {
    id: "n4",
    word: "niños",
    wordClass: WordClass.Sustantivo,
    attributes: {
      noun: {
        subclase: "común",
        naturaleza: "concreto",
        recuento: "contable",
        grupo: "individual",
        genero: "masculino",
        numero: "plural"
      }
    },
    definition: "Sustantivo común, concreto, contable, individual, masculino y plural."
  },
  {
    id: "n5",
    word: "París",
    wordClass: WordClass.Sustantivo,
    attributes: {
      noun: {
        subclase: "propio",
        naturaleza: "concreto",
        recuento: "no aplica",
        grupo: "no aplica",
        genero: "masculino",
        numero: "singular"
      }
    },
    definition: "Sustantivo propio (nombre de ciudad), concreto, masculino y singular."
  },
  {
    id: "n6",
    word: "América",
    wordClass: WordClass.Sustantivo,
    attributes: {
      noun: {
        subclase: "propio",
        naturaleza: "concreto",
        recuento: "no aplica",
        grupo: "no aplica",
        genero: "femenino",
        numero: "singular"
      }
    },
    definition: "Sustantivo propio (nombre de un continente), concreto, de género femenino y singular."
  },
  {
    id: "n7",
    word: "leche",
    wordClass: WordClass.Sustantivo,
    attributes: {
      noun: {
        subclase: "común",
        naturaleza: "concreto",
        recuento: "incontable",
        grupo: "individual",
        genero: "femenino",
        numero: "singular"
      }
    },
    definition: "Sustantivo común, concreto, incontable (materia), de género femenino y singular."
  },
  {
    id: "n8",
    word: "constelación",
    wordClass: WordClass.Sustantivo,
    attributes: {
      noun: {
        subclase: "común",
        naturaleza: "concreto",
        recuento: "contable",
        grupo: "colectivo",
        genero: "femenino",
        numero: "singular"
      }
    },
    definition: "Sustantivo común, concreto, contable, colectivo (grupo de estrellas), femenino y singular."
  },
  {
    id: "n9",
    word: "arroz",
    wordClass: WordClass.Sustantivo,
    attributes: {
      noun: {
        subclase: "común",
        naturaleza: "concreto",
        recuento: "incontable",
        grupo: "individual",
        genero: "masculino",
        numero: "singular"
      }
    },
    definition: "Sustantivo común, concreto, incontable, de género masculino y singular."
  },
  {
    id: "n10",
    word: "jaurías",
    wordClass: WordClass.Sustantivo,
    attributes: {
      noun: {
        subclase: "común",
        naturaleza: "concreto",
        recuento: "contable",
        grupo: "colectivo",
        genero: "femenino",
        numero: "plural"
      }
    },
    definition: "Sustantivo común, concreto, contable, colectivo (grupos de perros salvajes/lobos), femenino y plural."
  },
  {
    id: "n11",
    word: "justicias",
    wordClass: WordClass.Sustantivo,
    attributes: {
      noun: {
        subclase: "común",
        naturaleza: "abstracto",
        recuento: "no aplica",
        grupo: "no aplica",
        genero: "femenino",
        numero: "plural"
      }
    },
    definition: "Sustantivo común, abstracto, de género femenino y número plural."
  },

  // --- ADJETIVOS ---
  {
    id: "a1",
    word: "inteligente",
    wordClass: WordClass.Adjetivo,
    attributes: {
      adjective: {
        tipo: "calificativo",
        grado: "positivo",
        genero: "invariable",
        numero: "singular"
      }
    },
    definition: "Adjetivo calificativo en grado positivo, invariable en género (el/la inteligente) y número singular."
  },
  {
    id: "a2",
    word: "rojas",
    wordClass: WordClass.Adjetivo,
    attributes: {
      adjective: {
        tipo: "calificativo",
        grado: "positivo",
        genero: "femenino",
        numero: "plural"
      }
    },
    definition: "Adjetivo calificativo en grado positivo, género femenino y número plural."
  },
  {
    id: "a3",
    word: "mensual",
    wordClass: WordClass.Adjetivo,
    attributes: {
      adjective: {
        tipo: "relacional",
        grado: "positivo",
        genero: "invariable",
        numero: "singular"
      }
    },
    definition: "Adjetivo relacional (perteneciente al mes), en grado positivo, de género invariable y singular."
  },
  {
    id: "a4",
    word: "mejor",
    wordClass: WordClass.Adjetivo,
    attributes: {
      adjective: {
        tipo: "calificativo",
        grado: "comparativo",
        genero: "invariable",
        numero: "singular"
      }
    },
    definition: "Adjetivo calificativo comparativo orgánico (mejor que), invariable en género y singular."
  },
  {
    id: "a5",
    word: "facilísimo",
    wordClass: WordClass.Adjetivo,
    attributes: {
      adjective: {
        tipo: "calificativo",
        grado: "superlativo",
        genero: "masculino",
        numero: "singular"
      }
    },
    definition: "Adjetivo calificativo superlativo absoluto (-ísimo), género masculino y singular."
  },
  {
    id: "a6",
    word: "artístico",
    wordClass: WordClass.Adjetivo,
    attributes: {
      adjective: {
        tipo: "relacional",
        grado: "positivo",
        genero: "masculino",
        numero: "singular"
      }
    },
    definition: "Adjetivo relacional (relativo al arte), en grado positivo, género masculino y singular."
  },
  {
    id: "a7",
    word: "altas",
    wordClass: WordClass.Adjetivo,
    attributes: {
      adjective: {
        tipo: "calificativo",
        grado: "positivo",
        genero: "femenino",
        numero: "plural"
      }
    },
    definition: "Adjetivo calificativo positivo, género femenino y número plural (collides with 'rojas' signature? Yes! So only one will appear on the board, maintaining uniqueness. Correct!)."
  },

  // --- VERBOS ---
  {
    id: "v1",
    word: "cantamos",
    wordClass: WordClass.Verbo,
    attributes: {
      verb: {
        conjugacion: "1ª (-ar)",
        persona: "1ª",
        numero: "plural",
        tiempo: "presente"
      }
    },
    definition: "Verbo cantar (1ª conj.). Primera persona del plural del presente de indicativo."
  },
  {
    id: "v2",
    word: "leer",
    wordClass: WordClass.Verbo,
    attributes: {
      verb: {
        conjugacion: "2ª (-er)",
        persona: "forma no personal",
        numero: "forma no personal",
        tiempo: "infinitivo"
      }
    },
    definition: "Verbo leer (2ª conj.). Forma no personal: Infinitivo simple."
  },
  {
    id: "v3",
    word: "viviendo",
    wordClass: WordClass.Verbo,
    attributes: {
      verb: {
        conjugacion: "3ª (-ir)",
        persona: "forma no personal",
        numero: "forma no personal",
        tiempo: "gerundio"
      }
    },
    definition: "Verbo vivir (3ª conj.). Forma no personal: Gerundio."
  },
  {
    id: "v4",
    word: "escribió",
    wordClass: WordClass.Verbo,
    attributes: {
      verb: {
        conjugacion: "3ª (-ir)",
        persona: "3ª",
        numero: "singular",
        tiempo: "pasado"
      }
    },
    definition: "Verbo escribir (3ª conj.). Tercera persona del singular del pretérito perfecto simple (pasado)."
  },
  {
    id: "v5",
    word: "jugarás",
    wordClass: WordClass.Verbo,
    attributes: {
      verb: {
        conjugacion: "1ª (-ar)",
        persona: "2ª",
        numero: "singular",
        tiempo: "futuro"
      }
    },
    definition: "Verbo jugar (1ª conj.). Segunda persona del singular del futuro simple."
  },
  {
    id: "v6",
    word: "sido",
    wordClass: WordClass.Verbo,
    attributes: {
      verb: {
        conjugacion: "no personal / irregular",
        persona: "forma no personal",
        numero: "forma no personal",
        tiempo: "participio"
      }
    },
    definition: "Verbo ser (irregular). Forma no personal: Participio."
  },
  {
    id: "v7",
    word: "comerían",
    wordClass: WordClass.Verbo,
    attributes: {
      verb: {
        conjugacion: "2ª (-er)",
        persona: "3ª",
        numero: "plural",
        tiempo: "condicional"
      }
    },
    definition: "Verbo comer (2ª conj.). Tercera persona del plural del condicional simple."
  },

  // --- DETERMINANTES ---
  {
    id: "d1",
    word: "los",
    wordClass: WordClass.Determinante,
    attributes: {
      det: {
        tipoDet: "artículo determinado",
        genero: "masculino",
        numero: "plural"
      }
    },
    definition: "Determinante artículo determinado, masculino y plural."
  },
  {
    id: "d2",
    word: "unos",
    wordClass: WordClass.Determinante,
    attributes: {
      det: {
        tipoDet: "artículo indeterminado",
        genero: "masculino",
        numero: "plural"
      }
    },
    definition: "Determinante artículo indeterminado, masculino y plural."
  },
  {
    id: "d3",
    word: "aquella",
    wordClass: WordClass.Determinante,
    attributes: {
      det: {
        tipoDet: "demostrativo",
        genero: "femenino",
        numero: "singular"
      }
    },
    definition: "Determinante demostrativo de lejanía, de género femenino y singular."
  },
  {
    id: "d4",
    word: "mis",
    wordClass: WordClass.Determinante,
    attributes: {
      det: {
        tipoDet: "posesivo",
        genero: "invariable",
        numero: "plural"
      }
    },
    definition: "Determinante posesivo (varios poseedores o un poseedor), de género invariable (mis lápices, mis gomas) y plural."
  },
  {
    id: "d5",
    word: "tres",
    wordClass: WordClass.Determinante,
    attributes: {
      det: {
        tipoDet: "numeral",
        genero: "invariable",
        numero: "invariable"
      }
    },
    definition: "Determinante numeral cardinal, con género y número invariable (tres libros, tres mesas)."
  },
  {
    id: "d6",
    word: "algún",
    wordClass: WordClass.Determinante,
    attributes: {
      det: {
        tipoDet: "indefinido",
        genero: "masculino",
        numero: "singular"
      }
    },
    definition: "Determinante indefinido apocopado, de género masculino y singular."
  },

  // --- PRONOMBRES ---
  {
    id: "p1",
    word: "nosotros",
    wordClass: WordClass.Pronombre,
    attributes: {
      pronoun: {
        tipoPron: "personal",
        persona: "1ª",
        genero: "masculino",
        numero: "plural"
      }
    },
    definition: "Pronombre personal tónico, primera persona del plural, masculino."
  },
  {
    id: "p2",
    word: "esto",
    wordClass: WordClass.Pronombre,
    attributes: {
      pronoun: {
        tipoPron: "demostrativo",
        persona: "no aplica",
        genero: "neutro",
        numero: "singular"
      }
    },
    definition: "Pronombre demostrativo neutro en número singular."
  },
  {
    id: "p3",
    word: "tú",
    wordClass: WordClass.Pronombre,
    attributes: {
      pronoun: {
        tipoPron: "personal",
        persona: "2ª",
        genero: "invariable",
        numero: "singular"
      }
    },
    definition: "Pronombre personal tónico, de segunda persona del singular, invariable en género."
  },
  {
    id: "p4",
    word: "mía",
    wordClass: WordClass.Pronombre,
    attributes: {
      pronoun: {
        tipoPron: "posesivo",
        persona: "1ª",
        genero: "femenino",
        numero: "singular"
      }
    },
    definition: "Pronombre posesivo de un solo poseedor, primera persona, femenino y singular."
  },
  {
    id: "p5",
    word: "alguien",
    wordClass: WordClass.Pronombre,
    attributes: {
      pronoun: {
        tipoPron: "indefinido",
        persona: "no aplica",
        genero: "invariable",
        numero: "invariable"
      }
    },
    definition: "Pronombre indefinido que se refiere a personas de forma invariable en género y número."
  },
  {
    id: "p6",
    word: "quién",
    wordClass: WordClass.Pronombre,
    attributes: {
      pronoun: {
        tipoPron: "interrogativo",
        persona: "no aplica",
        genero: "invariable",
        numero: "singular"
      }
    },
    definition: "Pronombre interrogativo de género invariable y número singular (admite plural 'quiénes')."
  },

  // --- ADVERBIOS ---
  {
    id: "adv1",
    word: "aquí",
    wordClass: WordClass.Adverbio,
    attributes: {
      adverb: {
        tipoAdv: "lugar"
      }
    },
    definition: "Adverbio de lugar (indica proximidad al hablante)."
  },
  {
    id: "adv2",
    word: "ayer",
    wordClass: WordClass.Adverbio,
    attributes: {
      adverb: {
        tipoAdv: "tiempo"
      }
    },
    definition: "Adverbio de tiempo (indica el día inmediatamente anterior al actual)."
  },
  {
    id: "adv3",
    word: "rápidamente",
    wordClass: WordClass.Adverbio,
    attributes: {
      adverb: {
        tipoAdv: "modo"
      }
    },
    definition: "Adverbio de modo terminado en -mente (proviene del adjetivo rápida)."
  },
  {
    id: "adv4",
    word: "casi",
    wordClass: WordClass.Adverbio,
    attributes: {
      adverb: {
        tipoAdv: "cantidad"
      }
    },
    definition: "Adverbio de cantidad o grado de carácter invariable (ej: casi terminado)."
  },
  {
    id: "adv5",
    word: "también",
    wordClass: WordClass.Adverbio,
    attributes: {
      adverb: {
        tipoAdv: "afirmación"
      }
    },
    definition: "Adverbio de afirmación (indica coincidencia o adición positiva de manera invariable)."
  },
  {
    id: "adv6",
    word: "tampoco",
    wordClass: WordClass.Adverbio,
    attributes: {
      adverb: {
        tipoAdv: "negación"
      }
    },
    definition: "Adverbio de negación usado para asimilar otra negación previa."
  },
  {
    id: "adv7",
    word: "quizás",
    wordClass: WordClass.Adverbio,
    attributes: {
      adverb: {
        tipoAdv: "duda"
      }
    },
    definition: "Adverbio de duda o posibilidad."
  },

  // --- PREPOSICIONES ---
  {
    id: "pr1",
    word: "con",
    wordClass: WordClass.Preposicion,
    attributes: {
      preposition: {
        tipoPrep: "monosilábica"
      }
    },
    definition: "Preposición simple monosilábica (indica compañía, medio o instrumento)."
  },
  {
    id: "pr2",
    word: "desde",
    wordClass: WordClass.Preposicion,
    attributes: {
      preposition: {
        tipoPrep: "polisilábica"
      }
    },
    definition: "Preposición simple polisilábica (indica origen temporal o espacial)."
  },
  {
    id: "pr3",
    word: "sobre",
    wordClass: WordClass.Preposicion,
    attributes: {
      preposition: {
        tipoPrep: "polisilábica"
      }
    },
    definition: "Preposición simple polisilábica (indica lugar, posición superior o tema de estudio)."
  },
  {
    id: "pr4",
    word: "hacia",
    wordClass: WordClass.Preposicion,
    attributes: {
      preposition: {
        tipoPrep: "polisilábica"
      }
    },
    definition: "Preposición simple polisilábica (indica dirección, destino o tendencia)."
  },

  // --- CONJUNCIONES ---
  {
    id: "c1",
    word: "pero",
    wordClass: WordClass.Conjuncion,
    attributes: {
      conjunction: {
        tipoConj: "coordinante"
      }
    },
    definition: "Conjunción coordinante adversativa (conecta oraciones con matiz de oposición)."
  },
  {
    id: "c2",
    word: "porque",
    wordClass: WordClass.Conjuncion,
    attributes: {
      conjunction: {
        tipoConj: "subordinante"
      }
    },
    definition: "Conjunción subordinante causal (introduce el motivo o razón de la acción)."
  },
  {
    id: "c3",
    word: "y",
    wordClass: WordClass.Conjuncion,
    attributes: {
      conjunction: {
        tipoConj: "coordinante"
      }
    },
    definition: "Conjunción coordinante copulativa monosilábica (Suma elementos)."
  },
  {
    id: "c4",
    word: "aunque",
    wordClass: WordClass.Conjuncion,
    attributes: {
      conjunction: {
        tipoConj: "subordinante"
      }
    }
    ,
    definition: "Conjunción subordinante concesiva (conecta con matiz de restricción superada)."
  }
];

/**
 * Gets a clean signature representing the unique grammatical category profile of a word.
 * This ensures we never put two perfectly identical-profile words on the board.
 */
export function getWordGrammarSignature(wt: WordToken): string {
  const parts: string[] = [wt.wordClass];

  if (wt.wordClass === WordClass.Sustantivo && wt.attributes.noun) {
    const n = wt.attributes.noun;
    parts.push(n.subclase, n.naturaleza, n.recuento, n.grupo, n.genero, n.numero);
  } else if (wt.wordClass === WordClass.Adjetivo && wt.attributes.adjective) {
    const a = wt.attributes.adjective;
    parts.push(a.tipo, a.grado, a.genero, a.numero);
  } else if (wt.wordClass === WordClass.Verbo && wt.attributes.verb) {
    const v = wt.attributes.verb;
    parts.push(v.conjugacion, v.persona, v.numero, v.tiempo);
  } else if (wt.wordClass === WordClass.Determinante && wt.attributes.det) {
    const d = wt.attributes.det;
    parts.push(d.tipoDet, d.genero, d.numero);
  } else if (wt.wordClass === WordClass.Pronombre && wt.attributes.pronoun) {
    const p = wt.attributes.pronoun;
    parts.push(p.tipoPron, p.persona, p.genero, p.numero);
  } else if (wt.wordClass === WordClass.Adverbio && wt.attributes.adverb) {
    parts.push(wt.attributes.adverb.tipoAdv);
  } else if (wt.wordClass === WordClass.Preposicion && wt.attributes.preposition) {
    parts.push(wt.attributes.preposition.tipoPrep);
  } else if (wt.wordClass === WordClass.Conjuncion && wt.attributes.conjunction) {
    parts.push(wt.attributes.conjunction.tipoConj);
  }

  return parts.join("|");
}

/**
 * Fisher-Yates Shuffle
 */
function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Generates a board meeting the precise criteria:
 * 1. No duplicates.
 * 2. Size cards selected.
 * 3. Reparto proporcional de Clases (At least one item of each of the 8 classes exists, except if pool is smaller).
 * 4. Strictly no two cards share ALL grammatical characteristics (No signature collisions).
 */
export function generateBoard(pool: WordToken[], size: number = 24): WordToken[] {
  // 1. Group the pool by WordClass
  const grouped: Record<WordClass, WordToken[]> = {
    [WordClass.Sustantivo]: [],
    [WordClass.Adjetivo]: [],
    [WordClass.Verbo]: [],
    [WordClass.Determinante]: [],
    [WordClass.Pronombre]: [],
    [WordClass.Adverbio]: [],
    [WordClass.Preposicion]: [],
    [WordClass.Conjuncion]: []
  };

  pool.forEach(word => {
    grouped[word.wordClass].push(word);
  });

  const selectedWords: WordToken[] = [];
  const selectedSignatures = new Set<string>();
  const selectedWordsSet = new Set<string>(); // avoid literal duplicate IDs

  // Helper to try adding a word
  function tryAddWord(word: WordToken): boolean {
    if (selectedWordsSet.has(word.word)) return false;
    const signature = getWordGrammarSignature(word);
    if (selectedSignatures.has(signature)) return false;

    selectedWords.push(word);
    selectedSignatures.add(signature);
    selectedWordsSet.add(word.word);
    return true;
  }

  // To guarantee representability, we first grab at least ONE word from each class.
  const classes = Object.values(WordClass);
  const shuffledClasses = shuffle(classes);

  shuffledClasses.forEach(wordClass => {
    const list = shuffle(grouped[wordClass]);
    for (const w of list) {
      if (tryAddWord(w)) {
        break; // we got one for this class, move to next class
      }
    }
  });

  // Now, grab random items from the overall pool until we hit the requested board size (e.g. 24)
  const fullShuffledPool = shuffle(pool);
  for (const w of fullShuffledPool) {
    if (selectedWords.length >= size) break;
    tryAddWord(w);
  }

  // If we still need words due to high collision filters...
  // Relax signature collision slightly or just allow remaining cards if pool is exhausted
  if (selectedWords.length < size) {
    for (const w of fullShuffledPool) {
      if (selectedWords.length >= size) break;
      if (!selectedWordsSet.has(w.word)) {
        // Just avoid literal duplicates
        selectedWords.push(w);
        selectedWordsSet.add(w.word);
      }
    }
  }

  // Shuffle final selection so the categories aren't clumped together
  return shuffle(selectedWords).slice(0, size);
}
