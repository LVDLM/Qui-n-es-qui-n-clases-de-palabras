/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { WordClass, WordToken, GameMode } from "../types";

interface GameSettingsProps {
  wordPool: WordToken[];
  onAddCustomWord: (newWord: WordToken) => void;
  onRemoveCustomWord: (id: string) => void;
  boardSize: number;
  setBoardSize: (size: number) => void;
  gameMode: GameMode;
  setGameMode: (mode: GameMode) => void;
  gameDifficulty: "practice" | "competitive";
  setGameDifficulty: (val: "practice" | "competitive") => void;
  onStartGame: () => void;
  p1Name: string;
  setP1Name: (val: string) => void;
  p2Name: string;
  setP2Name: (val: string) => void;
  onCreateOnlineRoom: (size: number, diff: "practice" | "competitive", series: number) => void;
  onJoinOnlineRoom: (code: string) => void;
  seriesLength: number;
  setSeriesLength: (val: number) => void;
}

export default function GameSettings({
  wordPool,
  onAddCustomWord,
  onRemoveCustomWord,
  boardSize,
  setBoardSize,
  gameMode,
  setGameMode,
  gameDifficulty,
  setGameDifficulty,
  onStartGame,
  p1Name,
  setP1Name,
  p2Name,
  setP2Name,
  onCreateOnlineRoom,
  onJoinOnlineRoom,
  seriesLength,
  setSeriesLength,
}: GameSettingsProps) {
  const [activeTab, setActiveTab] = useState<"game" | "pool">("game");
  const [showAddForm, setShowAddForm] = useState(false);

  // Progressive game settings states
  const [selectedMode, setSelectedMode] = useState<GameMode | null>(null);
  const [selectedSize, setSelectedSize] = useState<number | null>(null);

  // Form State
  const [newWord, setNewWord] = useState("");
  const [selectedClass, setSelectedClass] = useState<WordClass>(WordClass.Sustantivo);
  const [definition, setDefinition] = useState("");

  // Sub-properties
  // Noun
  const [nounSub, setNounSub] = useState<"común" | "propio">("común");
  const [nounNat, setNounNat] = useState<"concreto" | "abstracto">("concreto");
  const [nounRec, setNounRec] = useState<"contable" | "incontable" | "no aplica">("contable");
  const [nounGrp, setNounGrp] = useState<"individual" | "colectivo" | "no aplica">("individual");
  const [nounGen, setNounGen] = useState<"masculino" | "femenino" | "invariable">("masculino");
  const [nounNum, setNounNum] = useState<"singular" | "plural">("singular");

  // Adjective
  const [adjType, setAdjType] = useState<"calificativo" | "relacional" | "adverbial">("calificativo");
  const [adjGrad, setAdjGrad] = useState<"positivo" | "comparativo" | "superlativo">("positivo");
  const [adjGen, setAdjGen] = useState<"masculino" | "femenino" | "invariable">("invariable");
  const [adjNum, setAdjNum] = useState<"singular" | "plural" | "invariable">("singular");

  // Verb
  const [verbConj, setVerbConj] = useState<"1ª (-ar)" | "2ª (-er)" | "3ª (-ir)" | "no personal / irregular">("1ª (-ar)");
  const [verbPers, setVerbPers] = useState<"1ª" | "2ª" | "3ª" | "forma no personal">("3ª");
  const [verbNum, setVerbNum] = useState<"singular" | "plural" | "forma no personal">("singular");
  const [verbTiem, setVerbTiem] = useState<"presente" | "pasado" | "futuro" | "infinitivo" | "gerundio" | "participio" | "condicional">("presente");

  // Determinant
  const [detTipo, setDetTipo] = useState<"artículo determinado" | "artículo indeterminado" | "demostrativo" | "posesivo" | "indefinido" | "numeral" | "interrogativo/exclamativo">("artículo determinado");
  const [detGen, setDetGen] = useState<"masculino" | "femenino" | "neutro" | "invariable">("masculino");
  const [detNum, setDetNum] = useState<"singular" | "plural" | "invariable">("singular");

  // Pronoun
  const [pronTipo, setPronTipo] = useState<"personal" | "demostrativo" | "posesivo" | "indefinido" | "numeral" | "relativo" | "interrogativo">("personal");
  const [pronPers, setPronPers] = useState<"1ª" | "2ª" | "3ª" | "no aplica">("1ª");
  const [pronGen, setPronGen] = useState<"masculino" | "femenino" | "neutro" | "invariable">("masculino");
  const [pronNum, setPronNum] = useState<"singular" | "plural" | "invariable">("singular");

  // Adverb
  const [advTipo, setAdvTipo] = useState<"lugar" | "tiempo" | "modo" | "cantidad" | "afirmación" | "negación" | "duda">("lugar");

  // Preposition
  const [prepTipo, setPrepTipo] = useState<"monosilábica" | "polisilábica" | "locución">("monosilábica");

  // Conjunction
  const [conjTipo, setConjTipo] = useState<"coordinante" | "subordinante">("coordinante");

  const [formError, setFormError] = useState("");

  const handleSubmitCustomWord = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    const trimmedWord = newWord.trim().toLowerCase();
    if (!trimmedWord) {
      setFormError("Por favor escribe una palabra.");
      return;
    }

    // Check duplicate
    if (wordPool.some(w => w.word.toLowerCase() === trimmedWord)) {
      setFormError(`La palabra '${newWord}' ya existe en la lista de fichas.`);
      return;
    }

    // Build specific parameters based on wordClass
    const attributes: any = {};
    let fallbackDef = "";

    if (selectedClass === WordClass.Sustantivo) {
      attributes.noun = {
        subclase: nounSub,
        naturaleza: nounNat,
        recuento: nounRec,
        grupo: nounGrp,
        genero: nounGen,
        numero: nounNum
      };
      fallbackDef = `Sustantivo ${nounSub}, ${nounNat}, ${nounRec}, ${nounGrp}, ${nounGen} y ${nounNum}.`;
    } else if (selectedClass === WordClass.Adjetivo) {
      attributes.adjective = {
        tipo: adjType,
        grado: adjGrad,
        genero: adjGen,
        numero: adjNum
      };
      fallbackDef = `Adjetivo ${adjType} en grado ${adjGrad}, de género ${adjGen} y número ${adjNum}.`;
    } else if (selectedClass === WordClass.Verbo) {
      attributes.verb = {
        conjugacion: verbConj,
        persona: verbPers,
        numero: verbNum,
        tiempo: verbTiem
      };
      fallbackDef = `Verbo de la ${verbConj} conjugación, forma de ${verbPers} persona del ${verbNum} en tiempo ${verbTiem}.`;
    } else if (selectedClass === WordClass.Determinante) {
      attributes.det = {
        tipoDet: detTipo,
        genero: detGen,
        numero: detNum
      };
      fallbackDef = `Determinante de tipo ${detTipo}, de género ${detGen} y número ${detNum}.`;
    } else if (selectedClass === WordClass.Pronombre) {
      attributes.pronoun = {
        tipoPron: pronTipo,
        persona: pronPers,
        genero: pronGen,
        numero: pronNum
      };
      fallbackDef = `Pronombre ${pronTipo}, de ${pronPers === "no aplica" ? "sin" : pronPers} persona, de género ${pronGen} y número ${pronNum}.`;
    } else if (selectedClass === WordClass.Adverbio) {
      attributes.adverb = {
        tipoAdv: advTipo
      };
      fallbackDef = `Adverbio invariable de ${advTipo}.`;
    } else if (selectedClass === WordClass.Preposicion) {
      attributes.preposition = {
        tipoPrep: prepTipo
      };
      fallbackDef = `Preposición de forma ${prepTipo}.`;
    } else if (selectedClass === WordClass.Conjuncion) {
      attributes.conjunction = {
        tipoConj: conjTipo
      };
      fallbackDef = `Conjunción con estructura ${conjTipo}.`;
    }

    const createdToken: WordToken = {
      id: `custom_${Date.now()}`,
      word: trimmedWord,
      wordClass: selectedClass,
      attributes,
      definition: definition.trim() || fallbackDef,
      isCustom: true
    };

    onAddCustomWord(createdToken);

    // Reset Form
    setNewWord("");
    setDefinition("");
    setShowAddForm(false);
  };

  const customWords = wordPool.filter(w => w.isCustom);
  const coreWordsCount = wordPool.length - customWords.length;

  return (
    <div id="settings-panel" className="w-full max-w-4xl mx-auto bg-white rounded-3xl border border-slate-200 shadow-md overflow-hidden">
      {/* Panel Headers */}
      <div className="bg-slate-900 px-6 py-8 text-center text-white relative border-b border-slate-850">
        <h1 className="text-2xl md:text-3xl font-display font-black tracking-tight uppercase">
          QUIÉN ES QUIÉN GRAMATICAL
        </h1>
        <p className="text-blue-100 text-xs md:text-sm mt-2 max-w-xl mx-auto font-sans font-medium">
          Aprende y repasa las clases de palabras en español mediante preguntas estratégicas y eliminación progresiva. ¡Perfecto para pizarras digitales y juego cooperativo!
        </p>

        {/* Tab Navigation */}
        <div className="flex justify-center mt-6 gap-2 border-b border-slate-800">
          <button
            onClick={() => setActiveTab("game")}
            className={`px-6 py-3 font-black text-xs uppercase tracking-wider transition-all relative border-b-4 ${
              activeTab === "game"
                ? "border-sky-400 text-sky-400 font-extrabold"
                : "border-transparent text-slate-400 hover:text-white"
            } cursor-pointer`}
          >
            Configurar Partida
          </button>
          <button
            onClick={() => setActiveTab("pool")}
            className={`px-6 py-3 font-black text-xs uppercase tracking-wider transition-all relative border-b-4 ${
              activeTab === "pool"
                ? "border-sky-400 text-sky-400 font-extrabold"
                : "border-transparent text-slate-400 hover:text-white"
            } cursor-pointer`}
          >
            Tus Fichas ({wordPool.length})
          </button>
        </div>
      </div>

      {/* Tab Contents */}
      <div className="p-6 md:p-8">
        {/* TAB 1: GAME CONFIGURATION */}
        {activeTab === "game" && (
          <div className="flex flex-col gap-8">
            
            {/* Username Selection Section */}
            <div className="bg-slate-50 border border-slate-250 p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider font-mono">👤 Tu Perfil de Jugador</h3>
                <p className="text-[11px] text-slate-500 mt-0.5">Introduce tu nombre para que se muestre en los tableros de juego.</p>
              </div>
              <div className="flex items-center gap-2 max-w-sm w-full">
                <input
                  type="text"
                  value={p1Name}
                  onChange={(e) => {
                    const val = e.target.value;
                    setP1Name(val);
                    localStorage.setItem("gramatica_username", val);
                  }}
                  placeholder="Escribe tu nombre..."
                  maxLength={15}
                  className="bg-white border border-slate-300 rounded-xl px-4 py-2 text-sm font-semibold text-slate-900 w-full focus:outline-none focus:ring-2 focus:ring-sky-500/30"
                />
              </div>
            </div>

            {/* Mode Select */}
            <div>
              <h2 className="text-lg font-display font-semibold text-slate-950 flex items-center gap-2">
                Selecciona el Modo de Juego
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-3 font-sans">
                
                {/* 1P Bot */}
                <button
                  type="button"
                  onClick={() => {
                    setGameMode("single");
                    setSelectedMode("single");
                    setSelectedSize(null);
                  }}
                  className={`flex flex-col text-left p-4 rounded-2xl border-2 transition-all cursor-pointer relative ${
                    selectedMode === "single"
                      ? "border-sky-500 bg-sky-50/40 shadow-sm"
                      : "border-slate-100 hover:border-slate-200 hover:bg-slate-50/50"
                  }`}
                >
                  {selectedMode === "single" && (
                    <span className="absolute top-3 right-3 text-sky-600 text-[10px] font-bold uppercase tracking-wider bg-sky-100 px-2 py-0.5 rounded-full">
                      Activo
                    </span>
                  )}
                  <span className="text-xl mb-1">🤖</span>
                  <span className="font-bold text-sm text-slate-900 font-display">Modo Solitario</span>
                  <p className="text-slate-500 text-[11px] mt-1 leading-normal">
                    Deduce la palabra secreta del Bot Profesor. El bot te hará preguntas lógicas estructuradas y tú le responderás.
                  </p>
                </button>

                {/* Local Face to Face */}
                <button
                  type="button"
                  onClick={() => {
                    setGameMode("multi_local");
                    setSelectedMode("multi_local");
                    setSelectedSize(null);
                  }}
                  className={`flex flex-col text-left p-4 rounded-2xl border-2 transition-all cursor-pointer relative ${
                    selectedMode === "multi_local"
                      ? "border-emerald-500 bg-emerald-50/40 shadow-sm"
                      : "border-slate-100 hover:border-slate-200 hover:bg-slate-50/50"
                  }`}
                >
                  {selectedMode === "multi_local" && (
                    <span className="absolute top-3 right-3 text-emerald-600 text-[10px] font-bold uppercase tracking-wider bg-emerald-100 px-2 py-0.5 rounded-full">
                      Activo
                    </span>
                  )}
                  <span className="text-xl mb-1">📱</span>
                  <span className="font-bold text-sm text-slate-900 font-display">Cara a Cara</span>
                  <p className="text-slate-500 text-[11px] mt-1 leading-normal">
                    Modo "Paso de Dispositivo" para turnos privados. Juega en vivo con un compañero compartiendo pantalla.
                  </p>
                </button>

                {/* 1vs1 Online */}
                <button
                  type="button"
                  onClick={() => {
                    setGameMode("multi_online");
                    setSelectedMode("multi_online");
                    setSelectedSize(null);
                  }}
                  className={`flex flex-col text-left p-4 rounded-2xl border-2 transition-all cursor-pointer relative ${
                    selectedMode === "multi_online"
                      ? "border-blue-500 bg-blue-50/40 shadow-sm"
                      : "border-slate-100 hover:border-slate-200 hover:bg-slate-50/50"
                  }`}
                >
                  {selectedMode === "multi_online" && (
                    <span className="absolute top-3 right-3 text-blue-600 text-[10px] font-bold uppercase tracking-wider bg-blue-100 px-2 py-0.5 rounded-full">
                      Activo
                    </span>
                  )}
                  <span className="text-xl mb-1">🌐</span>
                  <span className="font-bold text-sm text-slate-900 font-display">Modo Online 1vs1</span>
                  <p className="text-slate-500 text-[11px] mt-1 leading-normal">
                    Juega en tiempo real con un amigo desde dispositivos diferentes mediante un código de acceso sencillo.
                  </p>
                </button>

                {/* Interactive whiteboard */}
                <button
                  type="button"
                  onClick={() => {
                    setGameMode("pizarra");
                    setSelectedMode("pizarra");
                    setSelectedSize(null);
                  }}
                  className={`flex flex-col text-left p-4 rounded-2xl border-2 transition-all cursor-pointer relative ${
                    selectedMode === "pizarra"
                      ? "border-purple-500 bg-purple-50/40 shadow-sm"
                      : "border-slate-100 hover:border-slate-200 hover:bg-slate-50/50"
                  }`}
                >
                  {selectedMode === "pizarra" && (
                    <span className="absolute top-3 right-3 text-purple-600 text-[10px] font-bold uppercase tracking-wider bg-purple-100 px-2 py-0.5 rounded-full">
                      Activo
                    </span>
                  )}
                  <span className="text-xl mb-1">🏫</span>
                  <span className="font-bold text-sm text-slate-900 font-display">Pizarra Digital</span>
                  <p className="text-slate-500 text-[11px] mt-1 leading-normal">
                    Ideal para proyectores. Dos equipos (A y B) juegan de viva voz en clase con tableros interactivos paralelos.
                  </p>
                </button>

              </div>
            </div>

            {/* If selectedMode is NOT online */}
            {selectedMode && selectedMode !== "multi_online" && (
              <>
                {/* Board Size Option */}
                <div className="animate-in fade-in duration-300">
                  <h2 className="text-lg font-display font-semibold text-slate-950 flex items-center gap-2">
                    Tamaño del Tablero de Palabras
                  </h2>
                  <div className="flex gap-4 mt-3">
                    {[12, 18, 24].map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => {
                          setBoardSize(size);
                          setSelectedSize(size);
                        }}
                        className={`flex-1 py-3.5 rounded-xl border-2 text-center transition-all cursor-pointer ${
                          selectedSize === size
                            ? "border-sky-500 text-sky-600 bg-sky-50 font-bold"
                            : "border-slate-100 hover:border-slate-200 hover:bg-slate-50 text-slate-600 font-medium"
                        }`}
                      >
                        <span className="block text-lg">{size}</span>
                        <span className="text-[10px] uppercase font-mono tracking-wider font-semibold text-slate-400">
                          {size === 12 ? "Corto (Rápido)" : size === 18 ? "Medio (Táctico)" : "Estándar (Físico)"}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Difficulty Option */}
                {selectedSize && (
                  <div className="flex flex-col gap-8 animate-in fade-in duration-300">
                    <div>
                      <h2 className="text-lg font-display font-semibold text-slate-950 flex items-center gap-2">
                        Tipo de visualización
                      </h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                        <button
                          type="button"
                          onClick={() => setGameDifficulty("practice")}
                          className={`flex flex-col text-left p-4 rounded-xl border-2 transition-all cursor-pointer relative ${
                            gameDifficulty === "practice"
                              ? "border-blue-500 bg-blue-50/20 font-black"
                              : "border-slate-150 hover:border-slate-200 hover:bg-slate-50 text-slate-600 font-medium"
                          }`}
                        >
                          {gameDifficulty === "practice" && (
                            <span className="absolute top-3 right-3 text-blue-600 text-[9px] font-black uppercase tracking-wider bg-blue-100 px-2 py-0.5 rounded-full">
                              Seleccionado
                            </span>
                          )}
                          <span className="font-bold text-slate-900 text-sm">📖 Modo Aula / Práctica</span>
                          <span className="text-[10px] text-slate-500 mt-1 font-medium leading-relaxed">
                            Las fichas muestran códigos de color de categoría, etiquetas de clase y el botón "?" para ver el análisis didáctico. Recomendado para aprender.
                          </span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setGameDifficulty("competitive")}
                          className={`flex flex-col text-left p-4 rounded-xl border-2 transition-all cursor-pointer relative ${
                            gameDifficulty === "competitive"
                              ? "border-orange-500 bg-orange-50/20 font-black"
                              : "border-slate-150 hover:border-slate-200 hover:bg-slate-50 text-slate-600 font-medium"
                          }`}
                        >
                          {gameDifficulty === "competitive" && (
                            <span className="absolute top-3 right-3 text-orange-600 text-[9px] font-black uppercase tracking-wider bg-orange-100 px-2 py-0.5 rounded-full">
                              Seleccionado
                            </span>
                          )}
                          <span className="font-bold text-slate-900 text-sm">🎯 Modo Partida Normal (Competitivo)</span>
                          <span className="text-[10px] text-slate-500 mt-1 font-medium leading-relaxed">
                            Fichas totalmente neutras, sin colores ni etiquetas de clase de entrada. Solo se ve la palabra; debes deducir todo preguntando. ¡Pura deducción!
                          </span>
                        </button>
                      </div>
                    </div>

                    {/* Wins Series option (best of 3, de 5...) */}
                    <div>
                      <h2 className="text-lg font-display font-semibold text-slate-950 flex items-center gap-2">
                        🏆 Configuración del Enfrentamiento (Serie de Partidas)
                      </h2>
                      <p className="text-xs text-slate-500 mt-0.5">Elige si quieres jugar una partida rápida o una serie para ver quién es el campeón definitivo.</p>
                      <div className="flex gap-4 mt-3">
                        {[1, 3, 5].map((len) => (
                          <button
                            key={len}
                            type="button"
                            onClick={() => setSeriesLength(len)}
                            className={`flex-1 py-3 px-4 rounded-xl border-2 text-center transition-all cursor-pointer ${
                              seriesLength === len
                                ? "border-sky-500 text-sky-600 bg-sky-50 font-bold"
                                : "border-slate-100 hover:border-slate-200 hover:bg-slate-50 text-slate-600 font-medium"
                            }`}
                          >
                            <span className="block text-sm font-bold">
                              {len === 1 ? "Única Partida" : `Al mejor de ${len}`}
                            </span>
                            <span className="text-[10px] text-slate-450 text-slate-500 font-mono tracking-wider block">
                              {len === 1 ? "1 victoria necesaria" : `${Math.ceil(len / 2)} victorias`}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Action Start Game */}
                    <div className="border-t border-slate-100 pt-6 flex flex-col items-center gap-2 bg-slate-50 p-6 rounded-2xl border border-dashed border-slate-200">
                      <span className="text-xs text-slate-650 font-mono text-center font-bold">
                        El tablero se generará garantizando al menos una palabra por cada una de las 8 clases principales del español y evitando colisión total de propiedades.
                      </span>
                      <button
                        type="button"
                        onClick={onStartGame}
                        className="bg-green-500 hover:bg-green-650 text-white font-display font-black text-lg px-12 py-4 rounded-2xl shadow-[0_5px_0_rgb(21,128,61)] active:translate-y-1 active:shadow-none transition-all text-center cursor-pointer min-w-[280px] uppercase tracking-wide"
                      >
                        ¡Generar Tableros e Iniciar!
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* If selectedMode IS online */}
            {selectedMode === "multi_online" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-slate-100 pt-8 animate-in fade-in duration-300 font-sans">
                {/* Option 1: Create Room */}
                <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 flex flex-col justify-between gap-6 shadow-sm">
                  <div>
                    <span className="text-3xl">🔑</span>
                    <h3 className="text-lg font-black font-display text-slate-900 mt-2">Crear Sala (Anfitrión)</h3>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">Configura las reglas del tablero, crea un código único y compártelo con tu rival para jugar en tiempo real.</p>
                    
                    {/* Size and Diff */}
                    <div className="mt-6 flex flex-col gap-4">
                      <div>
                        <label className="text-xs font-bold text-slate-600 block mb-1">Tamaño del tablero:</label>
                        <div className="flex gap-2">
                          {[12, 18, 24].map((size) => (
                            <button
                              key={size}
                              type="button"
                              onClick={() => setBoardSize(size)}
                              className={`flex-1 py-2 rounded-xl border text-xs text-center transition-all cursor-pointer ${
                                boardSize === size
                                  ? "border-sky-500 text-sky-600 bg-sky-50 font-bold"
                                  : "border-slate-200 hover:bg-slate-50 text-slate-650"
                              }`}
                            >
                              {size} fichas
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-600 block mb-1">Dificultad:</label>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setGameDifficulty("practice")}
                            className={`flex-1 py-2 rounded-xl border text-xs text-center transition-all cursor-pointer ${
                              gameDifficulty === "practice"
                                ? "border-sky-500 text-sky-600 bg-sky-50 font-bold"
                                : "border-slate-200 hover:bg-slate-50 text-slate-650"
                            }`}
                          >
                            Aula / Práctica
                          </button>
                          <button
                            type="button"
                            onClick={() => setGameDifficulty("competitive")}
                            className={`flex-1 py-2 rounded-xl border text-xs text-center transition-all cursor-pointer ${
                              gameDifficulty === "competitive"
                                ? "border-sky-500 text-sky-600 bg-sky-50 font-bold"
                                : "border-slate-200 hover:bg-slate-50 text-slate-650"
                            }`}
                          >
                            Partida normal
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-600 block mb-1">Serie (Ganar al mejor de):</label>
                        <div className="flex gap-2">
                          {[1, 3, 5].map((len) => (
                            <button
                              key={len}
                              type="button"
                              onClick={() => setSeriesLength(len)}
                              className={`flex-1 py-2 rounded-xl border text-xs text-center transition-all cursor-pointer ${
                                seriesLength === len
                                  ? "border-sky-500 text-sky-600 bg-sky-50 font-bold"
                                  : "border-slate-200 hover:bg-slate-50 text-slate-650"
                              }`}
                            >
                              {len === 1 ? "Única" : `Mejor de ${len}`}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (!p1Name.trim()) {
                        alert("Por favor, escribe tu nombre primero.");
                        return;
                      }
                      onCreateOnlineRoom(boardSize, gameDifficulty, seriesLength);
                    }}
                    className="bg-green-500 hover:bg-green-600 text-white font-bold text-sm py-3 px-6 rounded-2xl shadow-[0_4px_0_rgb(21,128,61)] active:translate-y-1 active:shadow-none transition-all cursor-pointer text-center"
                  >
                    CREAR SALA Y OBTENER CÓDIGO
                  </button>
                </div>

                {/* Option 2: Join Room */}
                <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 flex flex-col justify-between gap-6 shadow-sm">
                  <div>
                    <span className="text-3xl">🚪</span>
                    <h3 className="text-lg font-black font-display text-slate-900 mt-2">Unirse a una Sala (Invitado)</h3>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">Si tienes un código de sala que te ha dado un amigo, introdúcelo aquí para conectaros en tiempo real en la misma partida.</p>
                    
                    <div className="mt-8">
                      <label className="text-xs font-bold text-slate-650 block mb-1 uppercase font-mono">Código de la sala (4 caracteres):</label>
                      <input
                        type="text"
                        placeholder="Ej. B3Y9"
                        maxLength={4}
                        className="w-full bg-white border border-slate-300 rounded-2xl px-5 py-3 text-center font-display font-black text-2xl tracking-widest text-slate-900 placeholder:text-slate-300 placeholder:font-sans focus:outline-none focus:ring-2 focus:ring-sky-500/30 uppercase"
                        id="online-room-code-input"
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const input = document.getElementById("online-room-code-input") as HTMLInputElement;
                      const val = (input?.value || "").toUpperCase().trim();
                      if (!p1Name.trim()) {
                        alert("Por favor, escribe tu nombre primero.");
                        return;
                      }
                      if (!val || val.length !== 4) {
                        alert("Introduce un código de sala válido de 4 caracteres.");
                        return;
                      }
                      onJoinOnlineRoom(val);
                    }}
                    className="bg-sky-500 hover:bg-sky-600 text-white font-bold text-sm py-3 px-6 rounded-2xl shadow-[0_4px_0_rgb(3,105,161)] active:translate-y-1 active:shadow-none transition-all cursor-pointer text-center"
                  >
                    CONECTAR Y EMPEZAR PARTIDA
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: WORDS POOL MANAGER */}
        {activeTab === "pool" && (
          <div className="flex flex-col gap-6">
            
            {/* Header statistics & control */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Fichas del Sistema</h3>
                <p className="text-xs text-slate-500">
                  {coreWordsCount} por defecto y +{customWords.length} personalizadas creadas por ti.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddForm(!showAddForm)}
                className="bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
              >
                {showAddForm ? "✕ Cancelar" : "➕ Crear Ficha Personalizada"}
              </button>
            </div>

            {/* ERROR TEXT IN CUSTOM FORM */}
            {formError && (
              <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-xl text-xs font-medium">
                ⚠️ {formError}
              </div>
            )}

            {/* FORM TO ADD CUSTOM WORD */}
            {showAddForm && (
              <form onSubmit={handleSubmitCustomWord} className="bg-slate-50 rounded-2xl p-5 border border-slate-200/60 flex flex-col gap-4">
                <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider font-mono">
                  ✨ Nueva Ficha de Palabra
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* WORD FIELD */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-slate-700">Palabra:</label>
                    <input
                      required
                      type="text"
                      placeholder="Ej: rebaño, cantamos, solar..."
                      value={newWord}
                      onChange={(e) => setNewWord(e.target.value)}
                      className="bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-900"
                    />
                  </div>

                  {/* WORD CLASS */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-slate-700">Clase de Palabra:</label>
                    <select
                      value={selectedClass}
                      onChange={(e) => setSelectedClass(e.target.value as WordClass)}
                      className="bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-900"
                    >
                      {Object.values(WordClass).map(cls => (
                        <option key={cls} value={cls}>{cls}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* FIELDSET SPECIFIC TO THE SELECTED GRAMMAR CLASS */}
                <div className="bg-white rounded-xl p-4 border border-slate-200">
                  <span className="text-[10px] font-mono text-slate-400 block uppercase tracking-wider font-semibold mb-3">
                    Propiedades de {selectedClass}
                  </span>

                  {/* SUSTANTIVO RULES */}
                  {selectedClass === WordClass.Sustantivo && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                      <div className="flex flex-col gap-1">
                        <span className="font-medium text-slate-600">Subclase:</span>
                        <div className="flex gap-1">
                          {["común", "propio"].map((val) => (
                            <button
                              key={val}
                              type="button"
                              onClick={() => setNounSub(val as any)}
                              className={`flex-1 py-1 px-2 rounded-md font-medium text-[10px] border ${nounSub === val ? "bg-sky-50 text-sky-600 border-sky-300" : "bg-slate-50 text-slate-600"}`}
                            >
                              {val}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="font-medium text-slate-600">Naturaleza:</span>
                        <div className="flex gap-1">
                          {["concreto", "abstracto"].map((val) => (
                            <button
                              key={val}
                              type="button"
                              onClick={() => setNounNat(val as any)}
                              className={`flex-1 py-1 px-2 rounded-md font-medium text-[10px] border ${nounNat === val ? "bg-sky-50 text-sky-600 border-sky-300" : "bg-slate-50 text-slate-600"}`}
                            >
                              {val}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="font-medium text-slate-600">Recuento:</span>
                        <div className="flex gap-1">
                          {["contable", "incontable", "no aplica"].map((val) => (
                            <button
                              key={val}
                              type="button"
                              onClick={() => setNounRec(val as any)}
                              className={`flex-1 py-1 px-1 rounded-md font-medium text-[9px] border ${nounRec === val ? "bg-sky-50 text-sky-600 border-sky-300" : "bg-slate-50 text-slate-600"}`}
                            >
                              {val}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="flex flex-col gap-1 mt-2">
                        <span className="font-medium text-slate-600">Grupales:</span>
                        <div className="flex gap-1">
                          {["individual", "colectivo", "no aplica"].map((val) => (
                            <button
                              key={val}
                              type="button"
                              onClick={() => setNounGrp(val as any)}
                              className={`flex-1 py-1 px-1 rounded-md font-medium text-[9px] border ${nounGrp === val ? "bg-sky-50 text-sky-600 border-sky-300" : "bg-slate-50 text-slate-600"}`}
                            >
                              {val}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="flex flex-col gap-1 mt-2">
                        <span className="font-medium text-slate-600">Género:</span>
                        <div className="flex gap-1">
                          {["masculino", "femenino", "invariable"].map((val) => (
                            <button
                              key={val}
                              type="button"
                              onClick={() => setNounGen(val as any)}
                              className={`flex-1 py-1 px-1 rounded-md font-medium text-[9px] border ${nounGen === val ? "bg-sky-50 text-sky-600 border-sky-300" : "bg-slate-50 text-slate-600"}`}
                            >
                              {val}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="flex flex-col gap-1 mt-2">
                        <span className="font-medium text-slate-600">Número:</span>
                        <div className="flex gap-1">
                          {["singular", "plural"].map((val) => (
                            <button
                              key={val}
                              type="button"
                              onClick={() => setNounNum(val as any)}
                              className={`flex-1 py-1 px-1 rounded-md font-medium text-[10px] border ${nounNum === val ? "bg-sky-50 text-sky-600 border-sky-300" : "bg-slate-50 text-slate-600"}`}
                            >
                              {val}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ADJETIVO RULES */}
                  {selectedClass === WordClass.Adjetivo && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div className="flex flex-col gap-1">
                        <span className="font-medium text-slate-600">Tipo:</span>
                        <div className="flex flex-col gap-1">
                          {["calificativo", "relacional", "adverbial"].map((val) => (
                            <button
                              key={val}
                              type="button"
                              onClick={() => setAdjType(val as any)}
                              className={`py-1 px-2 rounded-md font-medium text-[10px] border ${adjType === val ? "bg-sky-50 text-sky-600 border-sky-300" : "bg-slate-50 text-slate-600"}`}
                            >
                              {val}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="font-medium text-slate-600">Grado:</span>
                        <div className="flex flex-col gap-1">
                          {["positivo", "comparativo", "superlativo"].map((val) => (
                            <button
                              key={val}
                              type="button"
                              onClick={() => setAdjGrad(val as any)}
                              className={`py-1 px-2 rounded-md font-medium text-[10px] border ${adjGrad === val ? "bg-sky-50 text-sky-600 border-sky-300" : "bg-slate-50 text-slate-600"}`}
                            >
                              {val}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="font-medium text-slate-600">Género:</span>
                        <div className="flex flex-col gap-1">
                          {["masculino", "femenino", "invariable"].map((val) => (
                            <button
                              key={val}
                              type="button"
                              onClick={() => setAdjGen(val as any)}
                              className={`py-1 px-2 rounded-md font-medium text-[10px] border ${adjGen === val ? "bg-sky-50 text-sky-600 border-sky-300" : "bg-slate-50 text-slate-600"}`}
                            >
                              {val}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="font-medium text-slate-600">Número:</span>
                        <div className="flex flex-col gap-1">
                          {["singular", "plural", "invariable"].map((val) => (
                            <button
                              key={val}
                              type="button"
                              onClick={() => setAdjNum(val as any)}
                              className={`py-1 px-2 rounded-md font-medium text-[10px] border ${adjNum === val ? "bg-sky-50 text-sky-600 border-sky-300" : "bg-slate-50 text-slate-600"}`}
                            >
                              {val}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* VERBO RULES */}
                  {selectedClass === WordClass.Verbo && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div className="flex flex-col gap-1">
                        <span className="font-medium text-slate-600">Conjugación:</span>
                        <div className="flex flex-col gap-1">
                          {["1ª (-ar)", "2ª (-er)", "3ª (-ir)", "no personal / irregular"].map((val) => (
                            <button
                              key={val}
                              type="button"
                              onClick={() => setVerbConj(val as any)}
                              className={`py-1 px-1 rounded-md font-medium text-[9px] border ${verbConj === val ? "bg-sky-50 text-sky-600 border-sky-300" : "bg-slate-50 text-slate-600"}`}
                            >
                              {val}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="font-medium text-slate-600">Persona:</span>
                        <div className="flex flex-col gap-1">
                          {["1ª", "2ª", "3ª", "forma no personal"].map((val) => (
                            <button
                              key={val}
                              type="button"
                              onClick={() => setVerbPers(val as any)}
                              className={`py-1 px-1 rounded-md font-medium text-[9px] border ${verbPers === val ? "bg-sky-50 text-sky-600 border-sky-300" : "bg-slate-50 text-slate-600"}`}
                            >
                              {val}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="font-medium text-slate-600">Número:</span>
                        <div className="flex flex-col gap-1">
                          {["singular", "plural", "forma no personal"].map((val) => (
                            <button
                              key={val}
                              type="button"
                              onClick={() => setVerbNum(val as any)}
                              className={`py-1 px-1 rounded-md font-medium text-[9px] border ${verbNum === val ? "bg-sky-50 text-sky-600 border-sky-300" : "bg-slate-50 text-slate-600"}`}
                            >
                              {val}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="font-medium text-slate-600">Tiempo:</span>
                        <div className="flex flex-col gap-1">
                          {["presente", "pasado", "futuro", "condicional", "infinitivo", "gerundio", "participio"].map((val) => (
                            <button
                              key={val}
                              type="button"
                              onClick={() => setVerbTiem(val as any)}
                              className={`py-0.5 px-0.5 rounded-md font-medium text-[9px] border ${verbTiem === val ? "bg-sky-50 text-sky-600 border-sky-300" : "bg-slate-50 text-slate-600"}`}
                            >
                              {val}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* DETERMINANTE */}
                  {selectedClass === WordClass.Determinante && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                      <div className="flex flex-col gap-1">
                        <span className="font-medium text-slate-600">Tipo Determinante:</span>
                        <select
                          value={detTipo}
                          onChange={(e) => setDetTipo(e.target.value as any)}
                          className="bg-slate-50 border border-slate-300 rounded px-2 py-1 text-xs"
                        >
                          {["artículo determinado", "artículo indeterminado", "demostrativo", "posesivo", "indefinido", "numeral", "interrogativo/exclamativo"].map(v => (
                            <option key={v} value={v}>{v}</option>
                          ))}
                        </select>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="font-medium text-slate-600">Género:</span>
                        <div className="flex gap-1 bg-slate-50 p-1 border rounded">
                          {["masculino", "femenino", "invariable"].map(v => (
                            <button
                              key={v}
                              type="button"
                              onClick={() => setDetGen(v as any)}
                              className={`flex-1 py-1 px-1 rounded text-[10px] font-semibold ${detGen === v ? "bg-white border text-sky-600" : "text-slate-500"}`}
                            >
                              {v === "invariable" ? "inv." : v === "femenino" ? "fem." : "masc."}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="font-medium text-slate-600">Número:</span>
                        <div className="flex gap-1 bg-slate-50 p-1 border rounded">
                          {["singular", "plural", "invariable"].map(v => (
                            <button
                              key={v}
                              type="button"
                              onClick={() => setDetNum(v as any)}
                              className={`flex-1 py-1 px-1 rounded text-[10px] font-semibold ${detNum === v ? "bg-white border text-sky-600" : "text-slate-500"}`}
                            >
                              {v === "invariable" ? "inv." : v === "singular" ? "sing." : "plur."}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* PRONOMBRE */}
                  {selectedClass === WordClass.Pronombre && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                      <div className="flex flex-col gap-1">
                        <span className="font-medium text-slate-600">Clase:</span>
                        <select
                          value={pronTipo}
                          onChange={(e) => setPronTipo(e.target.value as any)}
                          className="bg-slate-50 border border-slate-300 rounded px-2 py-1 text-xs"
                        >
                          {["personal", "demostrativo", "posesivo", "indefinido", "numeral", "relativo", "interrogativo"].map(v => (
                            <option key={v} value={v}>{v}</option>
                          ))}
                        </select>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="font-medium text-slate-600">Persona:</span>
                        <div className="flex gap-1 bg-slate-50 p-1 border rounded">
                          {["1ª", "2ª", "3ª", "no aplica"].map(v => (
                            <button
                              key={v}
                              type="button"
                              onClick={() => setPronPers(v as any)}
                              className={`flex-1 py-1 text-[9px] font-semibold ${pronPers === v ? "bg-white border text-sky-600" : "text-slate-500"}`}
                            >
                              {v}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="font-medium text-slate-600">Género:</span>
                        <div className="flex gap-1 bg-slate-50 p-1 border rounded">
                          {["masculino", "femenino", "invariable"].map(v => (
                            <button
                              key={v}
                              type="button"
                              onClick={() => setPronGen(v as any)}
                              className={`flex-1 py-1 text-[9px] font-semibold ${pronGen === v ? "bg-white border text-sky-600" : "text-slate-500"}`}
                            >
                              {v === "invariable" ? "inv" : v === "femenino" ? "fem" : "masc"}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="font-medium text-slate-600">Número:</span>
                        <div className="flex gap-1 bg-slate-50 p-1 border rounded">
                          {["singular", "plural", "invariable"].map(v => (
                            <button
                              key={v}
                              type="button"
                              onClick={() => setPronNum(v as any)}
                              className={`flex-1 py-1 text-[9px] font-semibold ${pronNum === v ? "bg-white border text-sky-600" : "text-slate-500"}`}
                            >
                              {v === "invariable" ? "inv" : v === "singular" ? "sing" : "plur"}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ADVERBIO */}
                  {selectedClass === WordClass.Adverbio && (
                    <div className="flex flex-col gap-1 text-xs">
                      <span className="font-medium text-slate-700">Tipo de Adverbio:</span>
                      <div className="flex flex-wrap gap-1 bg-slate-50 p-1 rounded border">
                        {["lugar", "tiempo", "modo", "cantidad", "afirmación", "negación", "duda"].map(v => (
                          <button
                            key={v}
                            type="button"
                            onClick={() => setAdvTipo(v as any)}
                            className={`py-1 px-3 rounded text-[10px] font-medium capitalize border ${advTipo === v ? "bg-white border text-sky-600" : "text-slate-600 border-transparent"}`}
                          >
                            {v}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* PREPOSICION */}
                  {selectedClass === WordClass.Preposicion && (
                    <div className="flex flex-col gap-2 text-xs">
                      <span className="font-medium text-slate-700">Forma y tipo:</span>
                      <div className="flex gap-1">
                        {["monosilábica", "polisilábica", "locución"].map(v => (
                          <button
                            key={v}
                            type="button"
                            onClick={() => setPrepTipo(v as any)}
                            className={`flex-1 py-2 rounded text-[11px] font-semibold border ${prepTipo === v ? "bg-sky-50 text-sky-600 border-sky-300" : "bg-slate-50 text-slate-600"}`}
                          >
                            {v}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* CONJUNCION */}
                  {selectedClass === WordClass.Conjuncion && (
                    <div className="flex flex-col gap-2 text-xs">
                      <span className="font-medium text-slate-700">Estructura sintáctica:</span>
                      <div className="flex gap-1">
                        {["coordinante", "subordinante"].map(v => (
                          <button
                            key={v}
                            type="button"
                            onClick={() => setConjTipo(v as any)}
                            className={`flex-1 py-2 rounded text-[11px] font-semibold border ${conjTipo === v ? "bg-sky-50 text-sky-600 border-sky-300" : "bg-slate-50 text-slate-600"}`}
                          >
                            Conjunción {v}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                </div>

                {/* DEF / TEACHER COMMENT */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-700">
                    Definición Didáctica / Pista Escolar (Opcional):
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Escribe una pequeña pista o definición para ayudar a los alumnos. Por ejemplo: 'Expresa amor, afecto o cariño profundo (sentimiento abstracto).'"
                    value={definition}
                    onChange={(e) => setDefinition(e.target.value)}
                    className="bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-900"
                  />
                </div>

                {/* ADD ACTION */}
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer"
                  >
                    Salir
                  </button>
                  <button
                    type="submit"
                    className="bg-sky-600 hover:bg-sky-700 text-white px-5 py-2 rounded-xl text-xs font-semibold cursor-pointer shadow"
                  >
                    Guardar Ficha
                  </button>
                </div>

              </form>
            )}

            {/* LIST OF ALL ACTIVE WORDS IN SYSTEM */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 bg-slate-50/50 p-4 rounded-2xl border">
              {wordPool.map((w) => (
                <div key={w.id} className="bg-white rounded-xl p-3 border border-slate-200 flex flex-col justify-between hover:shadow-2xs transition-all relative group">
                  
                  {/* Quick Tags info */}
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm bg-slate-100 text-slate-600`}>
                      {w.wordClass}
                    </span>
                    {w.isCustom ? (
                      <span className="text-[9px] bg-sky-100 text-sky-700 font-bold px-1.5 rounded-sm">
                        Creado
                      </span>
                    ) : (
                      <span className="text-[9px] text-slate-400 font-mono">
                        Base
                      </span>
                    )}
                  </div>

                  {/* Core Word */}
                  <div className="my-1">
                    <h5 className="font-display font-medium text-slate-900 capitalize text-sm">{w.word}</h5>
                  </div>

                  {/* Remove button if custom */}
                  {w.isCustom && (
                    <button
                      type="button"
                      onClick={() => onRemoveCustomWord(w.id)}
                      className="absolute -top-1 -right-1 hidden group-hover:flex bg-rose-100 text-rose-700 hover:bg-rose-200 h-5 w-5 rounded-full items-center justify-center text-[10px] cursor-pointer"
                      title="Eliminar palabra personalizada"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
