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
  const [didacticAnalysis, setDidacticAnalysis] = useState<WordToken | null>(null);
  
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
                          setDidacticAnalysis(item);
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
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation(); // Don't flip the card!
                        setDidacticAnalysis(item);
                      }}
                      className="w-full border-t border-slate-100 pt-1.5 flex justify-center items-center gap-1 text-[9px] font-sans text-slate-500 font-semibold hover:text-sky-600 transition-all text-center uppercase px-0.5 mt-auto cursor-help"
                      title="Haz clic para ver el análisis morfológico detallado"
                    >
                      <span>🔍</span>
                      <span className="truncate max-w-[85%]">
                        {item.wordClass === WordClass.Sustantivo && item.attributes.noun ? (
                          `${item.attributes.noun.subclase} · ${item.attributes.noun.genero === "invariable" ? "inv" : item.attributes.noun.genero.slice(0, 3)}`
                        ) : item.wordClass === WordClass.Verbo && item.attributes.verb ? (
                          `${item.attributes.verb.conjugacion.split(" ")[0]} · ${item.attributes.verb.tiempo}`
                        ) : item.wordClass === WordClass.Adjetivo && item.attributes.adjective ? (
                          `${item.attributes.adjective.tipo.slice(0, 5)} · ${item.attributes.adjective.grado.slice(0, 4)}`
                        ) : (
                          `${item.wordClass}`
                        )}
                      </span>
                    </button>
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
        <div className="fixed inset-0 bg-slate-900/70 z-50 flex items-center justify-center p-4 backdrop-blur-xs no-print animate-fade-in">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl p-6 md:p-8 flex flex-col gap-6 border border-slate-100 text-slate-900 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex justify-between items-start gap-4 border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 font-mono">
                  📖 ANÁLISIS MORFOLÓGICO DETALLADO
                </span>
                <h3 className="text-3xl font-display font-black text-slate-950 capitalize mt-1 leading-none">
                  "{didacticAnalysis.word}"
                </h3>
              </div>
              <button
                onClick={() => setDidacticAnalysis(null)}
                className="text-slate-400 hover:text-slate-600 font-bold text-xl p-1.5 hover:bg-slate-50 rounded-xl transition-all cursor-pointer"
                title="Cerrar"
              >
                ✕
              </button>
            </div>
            
            {/* Modal Body */}
            <div className="flex flex-col gap-5">
              {/* Word Class Category Badge */}
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-slate-500 font-mono">Clase de palabra:</span>
                <span className={`text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full border shadow-2xs ${getBadgeColor(didacticAnalysis.wordClass)}`}>
                  {didacticAnalysis.wordClass}
                </span>
              </div>

              {/* Grid of structured attributes */}
              <div className="flex flex-col gap-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                  Propiedades de la Ficha
                </span>
                {(() => {
                  const list: { label: string; value: string; icon: string }[] = [];
                  const token = didacticAnalysis;
                  
                  if (token.wordClass === WordClass.Sustantivo && token.attributes.noun) {
                    const n = token.attributes.noun;
                    list.push(
                      { label: "Subclase", value: n.subclase, icon: "🏷️" },
                      { label: "Naturaleza", value: n.naturaleza, icon: "🌱" },
                      { label: "Recuento", value: n.recuento, icon: "🔢" },
                      { label: "Grupo", value: n.grupo, icon: "👥" },
                      { label: "Género", value: n.genero, icon: "🚻" },
                      { label: "Número", value: n.numero, icon: "📊" }
                    );
                  } else if (token.wordClass === WordClass.Adjetivo && token.attributes.adjective) {
                    const a = token.attributes.adjective;
                    list.push(
                      { label: "Tipo", value: a.tipo, icon: "🎨" },
                      { label: "Grado", value: a.grado, icon: "📈" },
                      { label: "Género", value: a.genero, icon: "🚻" },
                      { label: "Número", value: a.numero, icon: "📊" }
                    );
                  } else if (token.wordClass === WordClass.Verbo && token.attributes.verb) {
                    const v = token.attributes.verb;
                    list.push(
                      { label: "Conjugación", value: v.conjugacion, icon: "🔄" },
                      { label: "Persona", value: v.persona, icon: "👤" },
                      { label: "Número", value: v.numero, icon: "📊" },
                      { label: "Tiempo verbal", value: v.tiempo, icon: "⏳" }
                    );
                  } else if (token.wordClass === WordClass.Determinante && token.attributes.det) {
                    const d = token.attributes.det;
                    list.push(
                      { label: "Tipo Det.", value: d.tipoDet, icon: "🔍" },
                      { label: "Género", value: d.genero, icon: "🚻" },
                      { label: "Número", value: d.numero, icon: "📊" }
                    );
                  } else if (token.wordClass === WordClass.Pronombre && token.attributes.pronoun) {
                    const p = token.attributes.pronoun;
                    list.push(
                      { label: "Tipo Pron.", value: p.tipoPron, icon: "👤" },
                      { label: "Persona", value: p.persona, icon: "🆔" },
                      { label: "Género", value: p.genero, icon: "🚻" },
                      { label: "Número", value: p.numero, icon: "📊" }
                    );
                  } else if (token.wordClass === WordClass.Adverbio && token.attributes.adverb) {
                    list.push(
                      { label: "Tipo Adv.", value: `de ${token.attributes.adverb.tipoAdv}`, icon: "📍" }
                    );
                  } else if (token.wordClass === WordClass.Preposicion && token.attributes.preposition) {
                    list.push(
                      { label: "Tipo Prep.", value: token.attributes.preposition.tipoPrep, icon: "🔗" }
                    );
                  } else if (token.wordClass === WordClass.Conjuncion && token.attributes.conjunction) {
                    list.push(
                      { label: "Tipo Conj.", value: token.attributes.conjunction.tipoConj, icon: "🔀" }
                    );
                  }

                  if (list.length === 0) {
                    return <p className="text-xs text-slate-400 italic">No hay propiedades estructuradas adicionales.</p>;
                  }

                  return (
                    <div className="grid grid-cols-2 gap-2.5">
                      {list.map((attr, idx) => (
                        <div key={idx} className="bg-slate-50 border border-slate-100 p-2.5 rounded-xl flex items-center gap-2 px-3 shadow-3xs hover:bg-slate-100/50 transition-all">
                          <span className="text-base select-none">{attr.icon}</span>
                          <div className="flex flex-col min-w-0">
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider leading-none">{attr.label}</span>
                            <span className="text-xs font-extrabold text-slate-800 capitalize truncate mt-0.5" title={attr.value}>{attr.value}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>

              {/* Complete Didactic Description Card */}
              <div className="bg-blue-50 border border-blue-150 p-4 rounded-2xl flex flex-col gap-1.5 shadow-3xs">
                <span className="text-[10px] font-bold text-blue-500 uppercase tracking-wider font-mono flex items-center gap-1">
                  <span>📝</span> Explicación Pedagógica
                </span>
                <p className="text-xs sm:text-sm text-blue-900 leading-relaxed font-bold font-sans">
                  {didacticAnalysis.definition}
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={() => setDidacticAnalysis(null)}
                className="bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs py-3 px-6 rounded-xl transition-all cursor-pointer uppercase tracking-wider font-mono shadow-md active:translate-y-0.5 active:shadow-none"
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
