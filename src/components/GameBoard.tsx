/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { WordToken, WordClass, CardState } from "../types";

const getWordFontSizeClass = (word: string) => {
  const len = word.length;
  if (len <= 4) {
    return "text-sm xs:text-base sm:text-lg md:text-xl font-black";
  }
  if (len <= 6) {
    return "text-xs xs:text-sm sm:text-base md:text-lg font-black";
  }
  if (len <= 8) {
    return "text-[11px] xs:text-xs sm:text-sm md:text-base font-black";
  }
  if (len <= 10) {
    return "text-[10px] xs:text-[11px] sm:text-xs md:text-sm font-black tracking-tight leading-none";
  }
  return "text-[9px] xs:text-[10px] sm:text-[11px] md:text-xs font-black tracking-tighter leading-none break-all";
};

interface GameBoardProps {
  board: WordToken[];
  cardStates: CardState[];
  onToggleFlip: (wordId: string) => void;
  secretId: string; // The secret word this user is supposed to guess
  userName: string;
  isViewOnly?: boolean; // If true (e.g. showing opponent's board in split screen), prevent clicks
  accentColor: "sky" | "rose";
  gameDifficulty?: "practice" | "competitive";
}

export default function GameBoard({
  board,
  cardStates,
  onToggleFlip,
  userName,
  isViewOnly = false,
  accentColor,
  gameDifficulty = "competitive"
}: GameBoardProps) {
  const [didacticAnalysis, setDidacticAnalysis] = useState<{ word: string; category: string; definition: string } | null>(null);
  
  // Find properties for rendering badges and details
  const getCardBg = (cls: WordClass, isFlipped: boolean) => {
    if (isFlipped) {
      return "bg-slate-100 border-2 border-slate-300 opacity-60 grayscale scale-95 duration-300";
    }
    if (gameDifficulty === "competitive") {
      return "bg-white border-2 border-slate-200 hover:border-slate-300 hover:shadow-md rounded-2xl transition-all shadow-xs";
    }
    switch (cls) {
      case WordClass.Sustantivo: return "bg-white border-2 border-blue-200 hover:border-blue-400 rounded-2xl shadow-xs transition-all";
      case WordClass.Adjetivo: return "bg-white border-2 border-emerald-200 hover:border-emerald-400 rounded-2xl shadow-xs transition-all";
      case WordClass.Verbo: return "bg-white border-2 border-rose-200 hover:border-rose-400 rounded-2xl shadow-xs transition-all";
      case WordClass.Determinante: return "bg-white border-2 border-sky-200 hover:border-sky-400 rounded-2xl shadow-xs transition-all";
      case WordClass.Pronombre: return "bg-white border-2 border-indigo-200 hover:border-indigo-400 rounded-2xl shadow-xs transition-all";
      case WordClass.Adverbio: return "bg-white border-2 border-slate-200 hover:border-slate-400 rounded-2xl shadow-xs transition-all";
      case WordClass.Preposicion: return "bg-white border-2 border-amber-200 hover:border-amber-400 rounded-2xl shadow-xs transition-all";
      case WordClass.Conjuncion: return "bg-white border-2 border-teal-200 hover:border-teal-400 rounded-2xl shadow-xs transition-all";
      default: return "bg-white border-2 border-slate-200 hover:border-slate-300 rounded-2xl shadow-xs transition-all";
    }
  };

  const getBadgeColor = (cls: WordClass) => {
    switch (cls) {
      case WordClass.Sustantivo: return "bg-blue-50 text-blue-600 border border-blue-100";
      case WordClass.Adjetivo: return "bg-emerald-50 text-emerald-600 border border-emerald-100";
      case WordClass.Verbo: return "bg-rose-50 text-rose-600 border border-rose-100";
      case WordClass.Determinante: return "bg-sky-50 text-sky-600 border border-sky-100";
      case WordClass.Pronombre: return "bg-indigo-50 text-indigo-600 border border-indigo-100";
      case WordClass.Adverbio: return "bg-slate-100 text-slate-700 border border-slate-200";
      case WordClass.Preposicion: return "bg-amber-50 text-amber-700 border border-amber-200";
      case WordClass.Conjuncion: return "bg-teal-50 text-teal-700 border border-teal-200";
      default: return "bg-slate-50 text-slate-500 border border-slate-100";
    }
  };

  const boardBorderColor = accentColor === "sky" 
    ? "border-blue-300 bg-blue-50/40" 
    : "border-rose-300 bg-rose-50/40";

  return (
    <div className={`rounded-3xl p-5 md:p-6 border-4 relative overflow-hidden transition-all duration-300 ${boardBorderColor}`}>
      
      {/* Board Header Slot */}
      <div className="flex justify-between items-center mb-5 pb-3 border-b border-dashed border-slate-200">
        <div>
          <span className="text-[10px] uppercase font-mono tracking-widest font-bold text-slate-400">
            JUGADOR
          </span>
          <h3 className="text-xl font-display font-black text-blue-900 flex items-center gap-2">
            <span className={`w-3.5 h-3.5 rounded-full ${accentColor === "sky" ? "bg-blue-500" : "bg-rose-500"}`}></span>
            {userName.toUpperCase()}
          </h3>
        </div>
        
        {/* Count Flipped Indicators */}
        <div className="bg-white border border-slate-200 px-4 py-2 rounded-xl text-xs font-mono font-bold text-slate-700 flex gap-4 shadow-xs">
          <div>
            Disponibles: <span className="text-blue-600 font-black">{cardStates.filter(c => !c.isFlipped).length}</span>
          </div>
          <div className="border-l border-slate-200 pl-4">
            Flips: <span className="text-rose-500 font-black">{cardStates.filter(c => c.isFlipped).length}</span>
          </div>
        </div>
      </div>

      {/* Grid of the 12/18/24 Cards */}
      <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-6 xl:grid-cols-8 gap-4 perspective-800">
        {board.map((item) => {
          const state = cardStates.find((cs) => cs.wordId === item.id) || { wordId: item.id, isFlipped: false, isSecret: false };
          const isFlipped = state.isFlipped;

          return (
            <div
              key={item.id}
              className={`relative cursor-pointer select-none transition-all duration-300 min-h-[140px] rounded-2xl ${getCardBg(item.wordClass, isFlipped)} ${
                isFlipped ? "" : "hover:-translate-y-1 hover:shadow-md"
              } ${isViewOnly ? "pointer-events-none" : ""}`}
              onClick={() => {
                if (!isViewOnly) {
                  onToggleFlip(item.id);
                }
              }}
              title={isFlipped ? "Toca para levantar" : "Toca para descartar"}
              id={`card-${item.id}`}
            >
              {/* Card Face: Active / Unflipped */}
              {!isFlipped ? (
                <div className="px-1.5 py-3 sm:px-2 h-full flex flex-col justify-between absolute inset-0">
                  
                  {/* Top info badge and category (practice only) */}
                  {gameDifficulty === "practice" ? (
                    <div className="flex justify-between items-center gap-1 px-0.5">
                      <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${getBadgeColor(item.wordClass)}`}>
                        {item.wordClass === WordClass.Preposicion ? "Prep" : item.wordClass === WordClass.Determinante ? "Det" : item.wordClass === WordClass.Conjuncion ? "Conj" : item.wordClass}
                      </span>
                      
                      {/* Educational quick helper tool - stops event propagation */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation(); // Don't flip the card!
                          setDidacticAnalysis({ word: item.word, category: item.wordClass, definition: item.definition });
                        }}
                        className="h-4.5 w-4.5 rounded-full bg-slate-100 hover:bg-sky-100 text-slate-500 hover:text-sky-700 text-[10px] font-mono font-black flex items-center justify-center cursor-help transition-all shadow-2xs border border-slate-200"
                        title="Análisis Didáctico"
                      >
                        ?
                      </button>
                    </div>
                  ) : (
                    <div className="h-2"></div>
                  )}

                  {/* Big Word Display */}
                  <div className="my-auto py-2.5 overflow-visible flex items-center justify-center w-full px-0.5">
                    <h4 className={`font-display text-center text-slate-800 uppercase transform -rotate-6 select-none leading-none tracking-tight max-w-full ${getWordFontSizeClass(item.word)}`}>
                      {item.word}
                    </h4>
                  </div>

                  {/* Tiny properties cheat line (practice only) */}
                  {gameDifficulty === "practice" ? (
                    <div className="border-t border-slate-100 pt-1.5 flex justify-center text-[9px] font-sans text-slate-400 italic text-center truncate uppercase px-0.5">
                      {item.wordClass === WordClass.Sustantivo && item.attributes.noun && (
                        <span>{item.attributes.noun.subclase} · {item.attributes.noun.genero === "invariable" ? "inv" : item.attributes.noun.genero.slice(0, 3)}</span>
                      )}
                      {item.wordClass === WordClass.Verbo && item.attributes.verb && (
                        <span>{item.attributes.verb.conjugacion.split(" ")[0]} · {item.attributes.verb.tiempo.slice(0, 4)}</span>
                      )}
                      {item.wordClass === WordClass.Adjetivo && item.attributes.adjective && (
                        <span>{item.attributes.adjective.tipo.slice(0, 5)} · {item.attributes.adjective.grado.slice(0, 4)}</span>
                      )}
                      {item.wordClass !== WordClass.Sustantivo && item.wordClass !== WordClass.Verbo && item.wordClass !== WordClass.Adjetivo && (
                        <span>Ficha</span>
                      )}
                    </div>
                  ) : (
                    <div className="h-2"></div>
                  )}

                </div>
              ) : (
                /* Card Face: Flipped Down */
                <div 
                  className="absolute inset-0 bg-cover bg-center rounded-2xl flex flex-col items-center justify-center p-1.5 border-2 border-red-500 select-none overflow-hidden"
                  style={{ backgroundImage: `url('https://i.ibb.co/vx9yhzWN/reverso.jpg')` }}
                >
                  {/* Dark blur filter overlay to keep text legible */}
                  <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-[0.5px]"></div>
                  
                  {/* Flipped down label & indicator */}
                  <div className="relative z-10 flex flex-col items-center justify-center text-center w-full px-1">
                    <span className={`font-display text-white uppercase tracking-tight drop-shadow-md max-w-full leading-none ${getWordFontSizeClass(item.word)}`}>
                      {item.word}
                    </span>
                    
                    <span className="text-[8px] font-mono font-black text-slate-300 bg-slate-905/90 bg-slate-950/80 px-1.5 py-0.5 rounded-md mt-1.5 uppercase tracking-widest border border-white/10 shadow-xs">
                      DESCARTADO
                    </span>
                  </div>
                </div>
              )}

            </div>
          );
        })}
      </div>

      {/* Custom Didactic Analysis Modal (Replaces iframe-blocked native alert) */}
      {didacticAnalysis && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs no-print">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-6 flex flex-col gap-5 border border-slate-100 text-slate-900">
            <div className="flex justify-between items-start gap-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 font-mono">
                  📖 ANÁLISIS GRAMATICAL
                </span>
                <h3 className="text-2xl font-display font-black text-slate-900 capitalize mt-0.5">
                  "{didacticAnalysis.word.toUpperCase()}"
                </h3>
              </div>
              <button
                onClick={() => setDidacticAnalysis(null)}
                className="text-slate-400 hover:text-slate-600 font-bold text-lg p-1"
              >
                ✕
              </button>
            </div>
            
            <div className="flex flex-col gap-4">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Categoría de Palabra</span>
                <div className="mt-1">
                  <span className={`text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full ${getBadgeColor(didacticAnalysis.category as WordClass)}`}>
                    {didacticAnalysis.category}
                  </span>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-150 p-4 rounded-2xl flex flex-col gap-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Definición y Atributos</span>
                <p className="text-sm text-slate-700 leading-relaxed font-medium">
                  {didacticAnalysis.definition}
                </p>
              </div>
            </div>

            <div className="flex justify-end mt-2">
              <button
                onClick={() => setDidacticAnalysis(null)}
                className="bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-sm px-6 py-2.5 rounded-xl transition-all cursor-pointer"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
