/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

interface HistoryLogProps {
  historyList: Array<{
    id: string;
    player: "p1" | "p2";
    text: string;
    answer?: "SÍ" | "NO";
    explanation?: string;
    timestamp: string;
  }>;
  onMakeFinalGuess: () => void;
  gameMode: "single" | "multi_local" | "pizarra";
}

export default function HistoryLog({ historyList, onMakeFinalGuess, gameMode }: HistoryLogProps) {
  return (
    <div className="bg-white rounded-3xl p-5 md:p-6 border border-slate-200 shadow-xs flex flex-col gap-4 h-full min-h-[300px]">
      
      {/* Title */}
      <div className="flex justify-between items-center pb-2.5 border-b border-dashed border-slate-200">
        <div>
          <h4 className="font-display font-black text-blue-900 text-base uppercase leading-none">
            📝 Cuaderno de Notas
          </h4>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Historial de pistas dadas y deducciones en el aula.
          </p>
        </div>
        
        {/* Action button to make a final formal guess and win the game */}
        <button
          onClick={onMakeFinalGuess}
          className="bg-purple-600 hover:bg-purple-700 text-white font-black text-xs px-4.5 py-2.5 rounded-xl shadow-[0_4px_0_rgb(109,40,217)] active:translate-y-1 active:shadow-none transition-all cursor-pointer"
        >
          🏆 ¡RESOLVER TÉRMINO!
        </button>
      </div>

      {/* History List */}
      <div className="flex-1 overflow-y-auto no-scrollbar max-h-[350px] flex flex-col gap-2.5">
        {historyList.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-slate-100 rounded-2xl h-full">
            <span className="text-3xl mb-1 opacity-60">✍️</span>
            <span className="text-slate-400 font-medium text-xs">Aún no se han hecho preguntas.</span>
            <p className="text-[10px] text-slate-400 max-w-[200px] mt-1">
              Las preguntas y respuestas se guardarán aquí para repasar la gramática.
            </p>
          </div>
        ) : (
          [...historyList].reverse().map((item, idx) => (
            <div
              key={item.id || idx}
              className={`p-3.5 rounded-xl border flex flex-col gap-1.5 transition-all bg-slate-50 ${
                item.answer === "SÍ"
                  ? "border-emerald-100 bg-emerald-50/10"
                  : item.answer === "NO"
                  ? "border-rose-100 bg-rose-50/10"
                  : "border-slate-150"
              }`}
            >
              <div className="flex justify-between items-start gap-4">
                <span className={`text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded ${
                  item.player === "p1" ? "bg-sky-50 text-sky-700" : "bg-rose-50 text-rose-700"
                }`}>
                  {item.player === "p1" ? "A / Estudiante" : "B / Oponente"}
                </span>
                <span className="text-[8.5px] font-serif text-slate-400">{item.timestamp}</span>
              </div>

              {/* Log Event Text */}
              <p className="text-slate-800 font-medium text-xs leading-relaxed">{item.text}</p>

              {/* Log Answer bubble with explanation */}
              {item.answer && (
                <div className="mt-1 flex flex-col gap-1 border-t border-slate-200/50 pt-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-sm shadow-2xs ${
                      item.answer === "SÍ" ? "bg-emerald-500 text-white" : "bg-rose-500 text-white"
                    }`}>
                      {item.answer}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">Respuesta oficial</span>
                  </div>
                  {item.explanation && (
                    <p className="text-[10.5px] text-slate-500 italic leading-snug">
                      “ {item.explanation} ”
                    </p>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>

    </div>
  );
}
