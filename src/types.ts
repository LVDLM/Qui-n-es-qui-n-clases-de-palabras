/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum WordClass {
  Sustantivo = "Sustantivo",
  Adjetivo = "Adjetivo",
  Verbo = "Verbo",
  Determinante = "Determinante",
  Pronombre = "Pronombre",
  Adverbio = "Adverbio",
  Preposicion = "Preposición",
  Conjuncion = "Conjunción"
}

export interface NounAttributes {
  subclase: "común" | "propio";
  naturaleza: "concreto" | "abstracto" | "no aplica";
  recuento: "contable" | "incontable" | "no aplica";
  grupo: "individual" | "colectivo" | "no aplica";
  genero: "masculino" | "femenino" | "invariable";
  numero: "singular" | "plural";
}

export interface AdjectiveAttributes {
  tipo: "calificativo" | "relacional" | "adverbial";
  grado: "positivo" | "comparativo" | "superlativo";
  genero: "masculino" | "femenino" | "invariable";
  numero: "singular" | "plural" | "invariable";
}

export interface VerbAttributes {
  conjugacion: "1ª (-ar)" | "2ª (-er)" | "3ª (-ir)" | "no personal / irregular";
  persona: "1ª" | "2ª" | "3ª" | "forma no personal";
  numero: "singular" | "plural" | "forma no personal";
  tiempo: "presente" | "pasado" | "futuro" | "infinitivo" | "gerundio" | "participio" | "condicional";
}

export interface DetAttributes {
  tipoDet: "artículo determinado" | "artículo indeterminado" | "demostrativo" | "posesivo" | "indefinido" | "numeral" | "interrogativo/exclamativo";
  genero: "masculino" | "femenino" | "neutro" | "invariable";
  numero: "singular" | "plural" | "invariable";
}

export interface PronounAttributes {
  tipoPron: "personal" | "demostrativo" | "posesivo" | "indefinido" | "numeral" | "relativo" | "interrogativo";
  persona: "1ª" | "2ª" | "3ª" | "no aplica";
  genero: "masculino" | "femenino" | "neutro" | "invariable";
  numero: "singular" | "plural" | "invariable";
}

export interface AdverbAttributes {
  tipoAdv: "lugar" | "tiempo" | "modo" | "cantidad" | "afirmación" | "negación" | "duda";
}

export interface PrepositionAttributes {
  tipoPrep: "monosilábica" | "polisilábica" | "locución";
}

export interface ConjunctionAttributes {
  tipoConj: "coordinante" | "subordinante";
}

export interface GrammarAttributes {
  // Common descriptors
  noun?: NounAttributes;
  adjective?: AdjectiveAttributes;
  verb?: VerbAttributes;
  det?: DetAttributes;
  pronoun?: PronounAttributes;
  adverb?: AdverbAttributes;
  preposition?: PrepositionAttributes;
  conjunction?: ConjunctionAttributes;
}

export interface WordToken {
  id: string;
  word: string;
  wordClass: WordClass;
  attributes: GrammarAttributes;
  definition: string; // Brief educational hint / explanation
  isCustom?: boolean;
}

export interface CardState {
  wordId: string;
  isFlipped: boolean; // true means the card has been turned down (eliminated)
  isSecret: boolean;  // whether this is the opponent's card to guess (or vice-versa)
}

export type GameMode = "single" | "multi_local" | "multi_online" | "pizarra";

export interface GameState {
  board: WordToken[];
  player1Cards: CardState[]; // Player's card state
  player2Cards: CardState[]; // Opponent or AI's card state
  player1SecretId: string;   // Word Player 1 must guess (P2's secret)
  player2SecretId: string;   // Word Player 2 (or AI) must guess (P1's secret)
  currentTurn: "p1" | "p2";
  winner: "p1" | "p2" | null;
  history: string[]; // Game event log
  p1Mistakes: string[]; // List of wordIds incorrectly flipped that were actually the correct secret option
  p2Mistakes: string[];
  gameStarted: boolean;
}
