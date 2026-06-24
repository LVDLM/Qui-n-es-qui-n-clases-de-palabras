/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { WordClass, WordToken } from "../types";

interface QuestionBoxProps {
  currentTurn: "p1" | "p2";
  gameMode: "single" | "multi_local" | "pizarra";
  secretWord: WordToken; // The actual word P1 is trying to guess (P2's secret)
  onQuestionAsked: (logEntry: string, answer: "SÍ" | "NO", explanation?: string) => void;
  isLoading: boolean;
  setIsLoading: (val: boolean) => void;
  hasAskedThisTurn: boolean;
  onAskQuestion?: (text: string, checkFn?: (wt: WordToken) => { matches: boolean; reason: string }, isCustomAI?: boolean, customAnswer?: "SÍ" | "NO", customExplanation?: string) => void;
}

export default function QuestionBox({
  currentTurn,
  gameMode,
  secretWord,
  onQuestionAsked,
  isLoading,
  setIsLoading,
  hasAskedThisTurn,
  onAskQuestion
}: QuestionBoxProps) {
  const [activeCategory, setActiveCategory] = useState<"clase" | "sust" | "verb" | "gen_num" | "custom">("clase");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [customQuestion, setCustomQuestion] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleTabChange = (cat: "clase" | "sust" | "verb" | "gen_num" | "custom") => {
    setActiveCategory(cat);
    setCurrentIndex(0);
  };

  const handleAskPreset = (questionLabel: string, checkFn: (wt: WordToken) => { matches: boolean; reason: string }) => {
    if (isLoading || hasAskedThisTurn) return;
    
    setIsLoading(true);
    // Mimic short response delay for tactile board games
    setTimeout(() => {
      if (onAskQuestion) {
        onAskQuestion(`Pregunta: ${questionLabel}`, checkFn);
      } else {
        const result = checkFn(secretWord);
        const answer: "SÍ" | "NO" = result.matches ? "SÍ" : "NO";
        onQuestionAsked(`Pregunta: ${questionLabel}`, answer, result.reason);
      }
      setIsLoading(false);
    }, 400);
  };

  const handleAskAI = async (e: React.FormEvent) => {
    e.preventDefault();
    if (hasAskedThisTurn) return;
    setErrorMsg("");

    const query = customQuestion.trim();
    if (!query) return;

    setIsLoading(true);
    try {
      const response = await fetch("/api/gemini/analyze-question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          word: secretWord.word,
          wordClass: secretWord.wordClass,
          attributes: secretWord.attributes,
          definition: secretWord.definition,
          question: query
        })
      });

      if (!response.ok) {
        throw new Error("La consulta de inteligencia artificial ha devuelto un error.");
      }

      const data = await response.json();
      const logEntry = `Pregunta AI: ${query}`;
      if (onAskQuestion) {
        onAskQuestion(logEntry, undefined, true, data.answer, data.explanation);
      } else {
        onQuestionAsked(logEntry, data.answer, data.explanation);
      }
      setCustomQuestion("");
    } catch (err: any) {
      console.error(err);
      setErrorMsg("Ocurrió un error al contactar al profesor de IA. Se ha resuelto en un Sí/No aleatorio para no parar la partida.");
      
      // Safe fallback
      const randomAns: "SÍ" | "NO" = Math.random() > 0.5 ? "SÍ" : "NO";
      if (onAskQuestion) {
        onAskQuestion(`Pregunta AI (local): ${query}`, undefined, true, randomAns, "Respuesta rápida de contingencia.");
      } else {
        onQuestionAsked(`Pregunta AI (local): ${query}`, randomAns, "Respuesta rápida de contingencia.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Preset Checks database
  const presetCategories = {
    clase: [
      {
        q: "¿Es un Sustantivo?",
        check: (w: WordToken) => ({
          matches: w.wordClass === WordClass.Sustantivo,
          reason: w.wordClass === WordClass.Sustantivo ? "Sí, pertenece a los sustantivos." : "No, no pertenece a esta clase."
        })
      },
      {
        q: "¿Es un Adjetivo?",
        check: (w: WordToken) => ({
          matches: w.wordClass === WordClass.Adjetivo,
          reason: w.wordClass === WordClass.Adjetivo ? "Sí, pertenece a los adjetivos." : "No, no pertenece a esta clase."
        })
      },
      {
        q: "¿Es un Verbo?",
        check: (w: WordToken) => ({
          matches: w.wordClass === WordClass.Verbo,
          reason: w.wordClass === WordClass.Verbo ? "Sí, pertenece a los verbos." : "No, no pertenece a esta clase."
        })
      },
      {
        q: "¿Es un Determinante?",
        check: (w: WordToken) => ({
          matches: w.wordClass === WordClass.Determinante,
          reason: w.wordClass === WordClass.Determinante ? "Sí, pertenece a los determinantes." : "No, no pertenece a esta clase."
        })
      },
      {
        q: "¿Es un Pronombre?",
        check: (w: WordToken) => ({
          matches: w.wordClass === WordClass.Pronombre,
          reason: w.wordClass === WordClass.Pronombre ? "Sí, pertenece a los pronombres." : "No, no pertenece a esta clase."
        })
      },
      {
        q: "¿Es un Adverbio?",
        check: (w: WordToken) => ({
          matches: w.wordClass === WordClass.Adverbio,
          reason: w.wordClass === WordClass.Adverbio ? "Sí, pertenece a los adverbios." : "No, no pertenece a esta clase."
        })
      },
      {
        q: "¿Es una Preposición?",
        check: (w: WordToken) => ({
          matches: w.wordClass === WordClass.Preposicion,
          reason: w.wordClass === WordClass.Preposicion ? "Sí, pertenece a las preposiciones." : "No, no pertenece a esta clase."
        })
      },
      {
        q: "¿Es una Conjunción?",
        check: (w: WordToken) => ({
          matches: w.wordClass === WordClass.Conjuncion,
          reason: w.wordClass === WordClass.Conjuncion ? "Sí, pertenece a las conjunciones." : "No, no pertenece a esta clase."
        })
      }
    ],
    sust: [
      {
        q: "¿Es un sustantivo común?",
        check: (w: WordToken) => ({
          matches: w.wordClass === WordClass.Sustantivo && w.attributes.noun?.subclase === "común",
          reason: w.wordClass === WordClass.Sustantivo && w.attributes.noun?.subclase === "común" ? `Sí, es común.` : `No lo es.`
        })
      },
      {
        q: "¿Es un sustantivo propio?",
        check: (w: WordToken) => ({
          matches: w.wordClass === WordClass.Sustantivo && w.attributes.noun?.subclase === "propio",
          reason: w.wordClass === WordClass.Sustantivo && w.attributes.noun?.subclase === "propio" ? `Sí, '${w.word}' se escribe con mayúscula porque es propio.` : `No, no es propio.`
        })
      },
      {
        q: "¿Es un sustantivo concreto?",
        check: (w: WordToken) => ({
          matches: w.wordClass === WordClass.Sustantivo && w.attributes.noun?.naturaleza === "concreto",
          reason: w.wordClass === WordClass.Sustantivo && w.attributes.noun?.naturaleza === "concreto" ? `Sí, nombra a algo tangible.` : `No, no es concreto.`
        })
      },
      {
        q: "¿Es un sustantivo abstracto?",
        check: (w: WordToken) => ({
          matches: w.wordClass === WordClass.Sustantivo && w.attributes.noun?.naturaleza === "abstracto",
          reason: w.wordClass === WordClass.Sustantivo && w.attributes.noun?.naturaleza === "abstracto" ? `Sí, es una emoción, valor o idea abstracta.` : `No es abstracto.`
        })
      },
      {
        q: "¿Es un sustantivo contable?",
        check: (w: WordToken) => ({
          matches: w.wordClass === WordClass.Sustantivo && w.attributes.noun?.recuento === "contable",
          reason: w.wordClass === WordClass.Sustantivo && w.attributes.noun?.recuento === "contable" ? `Sí, se puede contar.` : `No es un sustantivo contable.`
        })
      },
      {
        q: "¿Es un sustantivo incontable?",
        check: (w: WordToken) => ({
          matches: w.wordClass === WordClass.Sustantivo && w.attributes.noun?.recuento === "incontable",
          reason: w.wordClass === WordClass.Sustantivo && w.attributes.noun?.recuento === "incontable" ? `Sí, no se puede contar individualmente (ej: materias/fluidos).` : `No es incontable.`
        })
      },
      {
        q: "¿Es un sustantivo individual?",
        check: (w: WordToken) => ({
          matches: w.wordClass === WordClass.Sustantivo && w.attributes.noun?.grupo === "individual",
          reason: w.wordClass === WordClass.Sustantivo && w.attributes.noun?.grupo === "individual" ? `Sí, es individual.` : `No.`
        })
      },
      {
        q: "¿Es un sustantivo colectivo?",
        check: (w: WordToken) => ({
          matches: w.wordClass === WordClass.Sustantivo && w.attributes.noun?.grupo === "colectivo",
          reason: w.wordClass === WordClass.Sustantivo && w.attributes.noun?.grupo === "colectivo" ? `Sí, en singular representa un grupo de elementos.` : `No es colectivo.`
        })
      }
    ],
    verb: [
      {
        q: "¿Pertenece a la 1ª conjugación (-ar)?",
        check: (w: WordToken) => ({
          matches: w.wordClass === WordClass.Verbo && w.attributes.verb?.conjugacion === "1ª (-ar)",
          reason: w.wordClass === WordClass.Verbo && w.attributes.verb?.conjugacion === "1ª (-ar)" ? `Sí, proviene de un verbo terminado en -ar.` : `No es infinitivo en -ar.`
        })
      },
      {
        q: "¿Pertenece a la 2ª conjugación (-er)?",
        check: (w: WordToken) => ({
          matches: w.wordClass === WordClass.Verbo && w.attributes.verb?.conjugacion === "2ª (-er)",
          reason: w.wordClass === WordClass.Verbo && w.attributes.verb?.conjugacion === "2ª (-er)" ? `Sí, proviene de un verbo terminado en -er.` : `No es de la 2ª conjugación.`
        })
      },
      {
        q: "La palabra, ¿es una forma no personal (Infinitivo/Gerundio/Participio)?",
        check: (w: WordToken) => ({
          matches: w.wordClass === WordClass.Verbo && ["infinitivo", "gerundio", "participio"].includes(w.attributes.verb?.tiempo || ""),
          reason: w.wordClass === WordClass.Verbo && ["infinitivo", "gerundio", "participio"].includes(w.attributes.verb?.tiempo || "") ? `Sí, es un ${w.attributes.verb?.tiempo}.` : `No, es una forma conjugada con persona.`
        })
      },
      {
        q: "¿El verbo está en tiempo Presente?",
        check: (w: WordToken) => ({
          matches: w.wordClass === WordClass.Verbo && w.attributes.verb?.tiempo === "presente",
          reason: w.wordClass === WordClass.Verbo && w.attributes.verb?.tiempo === "presente" ? `Sí, indica el momento de hablar.` : `No está en presente.`
        })
      },
      {
        q: "¿El verbo está en tiempo Pasado?",
        check: (w: WordToken) => ({
          matches: w.wordClass === WordClass.Verbo && w.attributes.verb?.tiempo === "pasado",
          reason: w.wordClass === WordClass.Verbo && w.attributes.verb?.tiempo === "pasado" ? `Sí, la acción ya ocurrió.` : `No está en pasado.`
        })
      }
    ],
    gen_num: [
      {
        q: "¿Es de género femenino?",
        check: (w: WordToken) => {
          const inNoun = w.wordClass === WordClass.Sustantivo && w.attributes.noun?.genero === "femenino";
          const inAdj = w.wordClass === WordClass.Adjetivo && w.attributes.adjective?.genero === "femenino";
          const inDet = w.wordClass === WordClass.Determinante && w.attributes.det?.genero === "femenino";
          const inPron = w.wordClass === WordClass.Pronombre && w.attributes.pronoun?.genero === "femenino";
          return {
            matches: inNoun || inAdj || inDet || inPron,
            reason: (inNoun || inAdj || inDet || inPron) ? `Sí, tiene género femenino.` : `No es de género femenino.`
          };
        }
      },
      {
        q: "¿Es de género masculino?",
        check: (w: WordToken) => {
          const inNoun = w.wordClass === WordClass.Sustantivo && w.attributes.noun?.genero === "masculino";
          const inAdj = w.wordClass === WordClass.Adjetivo && w.attributes.adjective?.genero === "masculino";
          const inDet = w.wordClass === WordClass.Determinante && w.attributes.det?.genero === "masculino";
          const inPron = w.wordClass === WordClass.Pronombre && w.attributes.pronoun?.genero === "masculino";
          return {
            matches: inNoun || inAdj || inDet || inPron,
            reason: (inNoun || inAdj || inDet || inPron) ? `Sí, tiene género masculino.` : `No es de género masculino.`
          };
        }
      },
      {
        q: "¿Es invariable en género (común para ambos)?",
        check: (w: WordToken) => {
          const invNoun = w.wordClass === WordClass.Sustantivo && w.attributes.noun?.genero === "invariable";
          const invAdj = w.wordClass === WordClass.Adjetivo && w.attributes.adjective?.genero === "invariable";
          const invDet = w.wordClass === WordClass.Determinante && w.attributes.det?.genero === "invariable";
          const invPron = w.wordClass === WordClass.Pronombre && w.attributes.pronoun?.genero === "invariable";
          return {
            matches: invNoun || invAdj || invDet || invPron,
            reason: (invNoun || invAdj || invDet || invPron) ? `Sí, es invariable en género (por ejemplo, 'el/la inteligente' o preposiciones/adverbios).` : `No, varía o no aplica de este modo.`
          };
        }
      },
      {
        q: "¿Tiene número Singular?",
        check: (w: WordToken) => {
          const inNoun = w.wordClass === WordClass.Sustantivo && w.attributes.noun?.numero === "singular";
          const inAdj = w.wordClass === WordClass.Adjetivo && w.attributes.adjective?.numero === "singular";
          const inVerb = w.wordClass === WordClass.Verbo && w.attributes.verb?.numero === "singular";
          const inDet = w.wordClass === WordClass.Determinante && w.attributes.det?.numero === "singular";
          const inPron = w.wordClass === WordClass.Pronombre && w.attributes.pronoun?.numero === "singular";
          return {
            matches: inNoun || inAdj || inVerb || inDet || inPron,
            reason: (inNoun || inAdj || inVerb || inDet || inPron) ? `Sí, se refiere a una sola unidad (singular).` : `No, no es singular.`
          };
        }
      },
      {
        q: "¿Tiene número Plural?",
        check: (w: WordToken) => {
          const inNoun = w.wordClass === WordClass.Sustantivo && w.attributes.noun?.numero === "plural";
          const inAdj = w.wordClass === WordClass.Adjetivo && w.attributes.adjective?.numero === "plural";
          const inVerb = w.wordClass === WordClass.Verbo && w.attributes.verb?.numero === "plural";
          const inDet = w.wordClass === WordClass.Determinante && w.attributes.det?.numero === "plural";
          const inPron = w.wordClass === WordClass.Pronombre && w.attributes.pronoun?.numero === "plural";
          return {
            matches: inNoun || inAdj || inVerb || inDet || inPron,
            reason: (inNoun || inAdj || inVerb || inDet || inPron) ? `Sí, se refiere a más de una unidad (plural).` : `No es plural.`
          };
        }
      }
    ]
  };

  const currentPresets = activeCategory !== "custom" ? (presetCategories[activeCategory as keyof typeof presetCategories] || []) : [];
  const currentPreset = currentPresets[currentIndex] || null;

  return (
    <div className="bg-white rounded-3xl p-5 md:p-6 border border-slate-200 shadow-xs flex flex-col gap-5">
      
      {/* Title */}
      <div>
        <h4 className="font-display font-black text-blue-900 text-base leading-tight">
          🙋‍♀️ REALIZA UNA PREGUNTA ESTRATÉGICA
        </h4>
        <p className="text-xs text-slate-500 mt-1 font-medium">
          Elige o pregunta sobre el término secreto de tu rival para eliminar opciones de tu tablero.
        </p>
      </div>

      {hasAskedThisTurn ? (
        <div className="bg-blue-50 border-2 border-dashed border-blue-200 rounded-2xl p-5 text-center flex flex-col items-center gap-3 select-none">
          <span className="text-4xl animate-bounce">📝</span>
          <h5 className="font-display font-black text-blue-950 text-sm">
            ¡PREGUNTA FORMULADA EN ESTE TURNO!
          </h5>
          <p className="text-xs text-slate-600 leading-relaxed max-w-sm">
            Ya has hecho tu consulta. Ahora es el momento de <strong className="font-bold text-slate-800">descartar o levantar fichas</strong> en tu tablero basándote en la respuesta. Cuando termines, pulsa el botón <strong className="font-bold text-slate-800">"Siguiente Turno"</strong> para continuar.
          </p>
        </div>
      ) : (
        <>
          {/* Tabs */}
          <div className="flex flex-wrap gap-1.5 bg-slate-100 p-1.5 rounded-2xl border-2 border-slate-200">
            <button
              onClick={() => handleTabChange("clase")}
              className={`flex-1 min-w-[85px] py-1.5 text-center text-xs font-black rounded-xl cursor-pointer transition-all ${
                activeCategory === "clase" ? "bg-blue-500 text-white shadow-sm" : "text-slate-600 hover:bg-white/60"
              }`}
            >
              🏷️ Clase
            </button>
            <button
              onClick={() => handleTabChange("sust")}
              className={`flex-1 min-w-[85px] py-1.5 text-center text-xs font-black rounded-xl cursor-pointer transition-all ${
                activeCategory === "sust" ? "bg-green-600 text-white shadow-sm" : "text-slate-600 hover:bg-white/60"
              }`}
            >
              🎒 Sustantivo
            </button>
            <button
              onClick={() => handleTabChange("verb")}
              className={`flex-1 min-w-[85px] py-1.5 text-center text-xs font-black rounded-xl cursor-pointer transition-all ${
                activeCategory === "verb" ? "bg-red-500 text-white shadow-sm" : "text-slate-600 hover:bg-white/60"
              }`}
            >
              ⚙️ Verbo
            </button>
            <button
              onClick={() => handleTabChange("gen_num")}
              className={`flex-1 min-w-[85px] py-1.5 text-center text-xs font-black rounded-xl cursor-pointer transition-all ${
                activeCategory === "gen_num" ? "bg-purple-600 text-white shadow-sm" : "text-slate-600 hover:bg-white/60"
              }`}
            >
              🚻 Gral
            </button>
            {gameMode !== "multi_local" && (
              <button
                onClick={() => handleTabChange("custom")}
                className={`flex-1 min-w-[95px] py-1.5 text-center text-xs font-black rounded-xl cursor-pointer transition-all ${
                  activeCategory === "custom" ? "bg-orange-500 text-white shadow-sm" : "text-slate-600 hover:bg-white/60"
                }`}
              >
                ✨ AI Gemini
              </button>
            )}
          </div>

          {/* Preset List Rendering (Tactile Card Carousel Deck) */}
          {activeCategory !== "custom" ? (
            <div className="flex flex-col gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
              
              {/* Deck Header: Navigation and Counter */}
              <div className="flex justify-between items-center text-xs font-mono text-slate-500 font-bold px-1 select-none">
                <span className="uppercase text-[9px] tracking-wider text-blue-800 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full">
                  Tarjetas de Pistas
                </span>
                <span className="bg-slate-200 px-2.5 py-0.5 rounded-lg text-[10px]">
                  Pregunta {currentIndex + 1} de {currentPresets.length}
                </span>
              </div>

              {/* Interactive Wheel Carousel layout */}
              <div className="flex items-center gap-3 py-1">
                
                {/* Left selector */}
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={() => {
                    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : currentPresets.length - 1));
                  }}
                  className="h-9 w-9 flex items-center justify-center bg-white border-2 border-slate-200 hover:border-blue-400 hover:bg-blue-50 rounded-xl font-black text-slate-700 hover:text-blue-600 transition-all cursor-pointer shadow-xs active:scale-95 disabled:opacity-50"
                  title="Anterior pregunta"
                >
                  ←
                </button>

                {/* Active Piste Question - NO truncation, fully readable styling */}
                <div className="flex-1 bg-white border-2 border-slate-200 min-h-[96px] p-4 rounded-2xl flex items-center justify-center text-center shadow-xs">
                  <h5 className="text-slate-900 font-black text-xs md:text-sm leading-relaxed font-sans max-w-[280px]">
                    {currentPreset?.q}
                  </h5>
                </div>

                {/* Right selector */}
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={() => {
                    setCurrentIndex((prev) => (prev < currentPresets.length - 1 ? prev + 1 : 0));
                  }}
                  className="h-9 w-9 flex items-center justify-center bg-white border-2 border-slate-200 hover:border-blue-400 hover:bg-blue-50 rounded-xl font-black text-slate-700 hover:text-blue-600 transition-all cursor-pointer shadow-xs active:scale-95 disabled:opacity-50"
                  title="Siguiente pregunta"
                >
                  →
                </button>
                
              </div>

              {/* Helper pagination dots indicator */}
              <div className="flex justify-center gap-1.5 py-0.5 max-w-full overflow-x-auto">
                {currentPresets.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-2 rounded-full transition-all cursor-pointer ${
                      currentIndex === idx ? "w-5 bg-blue-600" : "w-2 bg-slate-300"
                    }`}
                    title={`Ir a la pista ${idx + 1}`}
                  />
                ))}
              </div>

              {/* Confirm and ask the question on active cards */}
              <button
                type="button"
                disabled={isLoading || !currentPreset}
                onClick={() => currentPreset && handleAskPreset(currentPreset.q, currentPreset.check)}
                className="w-full bg-blue-600 hover:bg-blue-700 uppercase tracking-wider text-xs font-black text-white py-3.5 px-4 rounded-xl shadow-[0_4px_0_rgb(29,78,216)] active:translate-y-0.5 active:shadow-[0_2px_0_rgb(29,78,216)] transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>🙋‍♀️ REALIZAR PREGUNTA ELEGIDA</span>
              </button>

            </div>
          ) : (
            /* CUSTOM AI FORM */
            <div className="flex flex-col gap-3">
              <div className="bg-orange-50 rounded-xl p-3 border border-orange-100">
                <p className="text-[10px] text-orange-950 leading-relaxed font-medium">
                  ⭐ <strong>Profesor Gramatical AI:</strong> ¡Escribe cualquier pregunta libre! Gemini estudiará semántica, ortografía y características físicas de manera didáctica (ej: <em>"¿es algo vivo?"</em>, <em>"¿empieza por consonante?"</em>, <em>"¿lleva tilde?"</em>).
                </p>
              </div>

              <form onSubmit={handleAskAI} className="flex gap-2">
                <input
                  required
                  disabled={isLoading}
                  type="text"
                  placeholder="Escribe tu pregunta para el rival (ej: ¿Es abstracto?)..."
                  value={customQuestion}
                  onChange={(e) => setCustomQuestion(e.target.value)}
                  className="bg-slate-50 border-2 border-slate-200 focus:border-orange-400 focus:bg-white rounded-xl px-4 py-3 text-xs focus:outline-none text-slate-900 flex-1 disabled:opacity-50 font-medium"
                />
                <button
                  type="submit"
                  disabled={isLoading || !customQuestion.trim()}
                  className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-black px-5 rounded-xl shadow-[0_4px_0_rgb(194,65,12)] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? "Consultando..." : "PREGUNTAR"}
                </button>
              </form>

              {errorMsg && (
                <p className="text-[10px] text-rose-600 font-medium font-mono">⚠️ {errorMsg}</p>
              )}
            </div>
          )}
        </>
      )}

      {/* Loading state visual indicator */}
      {isLoading && (
        <div className="flex items-center justify-center gap-3 py-3 bg-slate-50 rounded-xl border border-dashed border-slate-200">
          <div className="h-4.5 w-4.5 rounded-full border-2 border-slate-300 border-t-blue-500 animate-spin"></div>
          <span className="text-slate-600 text-[11px] font-mono tracking-wider">
            Consultando el solucionario didáctico...
          </span>
        </div>
      )}

    </div>
  );
}
