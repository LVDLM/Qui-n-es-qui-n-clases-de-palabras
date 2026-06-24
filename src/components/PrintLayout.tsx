/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { WordToken, WordClass } from "../types";

interface PrintLayoutProps {
  board: WordToken[];
  onClose: () => void;
}

export default function PrintLayout({ board, onClose }: PrintLayoutProps) {
  const triggerPrint = () => {
    window.print();
  };

  const getBadgesColor = (cls: WordClass) => {
    switch (cls) {
      case WordClass.Sustantivo: return "bg-sky-50 text-sky-800 border-sky-200";
      case WordClass.Adjetivo: return "bg-emerald-50 text-emerald-800 border-emerald-200";
      case WordClass.Verbo: return "bg-rose-50 text-rose-800 border-rose-200";
      case WordClass.Determinante: return "bg-amber-50 text-amber-800 border-amber-200";
      case WordClass.Pronombre: return "bg-purple-50 text-purple-800 border-purple-200";
      case WordClass.Adverbio: return "bg-indigo-50 text-indigo-800 border-indigo-200";
      case WordClass.Preposicion: return "bg-teal-50 text-teal-800 border-teal-200";
      case WordClass.Conjuncion: return "bg-pink-50 text-pink-800 border-pink-200";
      default: return "bg-slate-50 text-slate-800 border-slate-200";
    }
  };

  const formatAttributes = (token: WordToken) => {
    const attrs: string[] = [];
    if (token.wordClass === WordClass.Sustantivo && token.attributes.noun) {
      const n = token.attributes.noun;
      attrs.push(`Subclase: ${n.subclase}`, `Naturaleza: ${n.naturaleza}`, `Recuento: ${n.recuento}`, `Grupo: ${n.grupo}`, `Género: ${n.genero}`, `Número: ${n.numero}`);
    } else if (token.wordClass === WordClass.Adjetivo && token.attributes.adjective) {
      const a = token.attributes.adjective;
      attrs.push(`Tipo: ${a.tipo}`, `Grado: ${a.grado}`, `Género: ${a.genero}`, `Número: ${a.numero}`);
    } else if (token.wordClass === WordClass.Verbo && token.attributes.verb) {
      const v = token.attributes.verb;
      attrs.push(`Conjugación: ${v.conjugacion}`, `Persona: ${v.persona}`, `Número: ${v.numero}`, `Tiempo: ${v.tiempo}`);
    } else if (token.wordClass === WordClass.Determinante && token.attributes.det) {
      const d = token.attributes.det;
      attrs.push(`Clase: ${d.tipoDet}`, `Género: ${d.genero}`, `Número: ${d.numero}`);
    } else if (token.wordClass === WordClass.Pronombre && token.attributes.pronoun) {
      const p = token.attributes.pronoun;
      attrs.push(`Clase: ${p.tipoPron}`, `Persona: ${p.persona}`, `Género: ${p.genero}`, `Número: ${p.numero}`);
    } else if (token.wordClass === WordClass.Adverbio && token.attributes.adverb) {
      attrs.push(`Tipo: Adverbio de ${token.attributes.adverb.tipoAdv}`);
    } else if (token.wordClass === WordClass.Preposicion && token.attributes.preposition) {
      attrs.push(`Tipo: Preposición ${token.attributes.preposition.tipoPrep}`);
    } else if (token.wordClass === WordClass.Conjuncion && token.attributes.conjunction) {
      attrs.push(`Tipo: Conjunción ${token.attributes.conjunction.tipoConj}`);
    }
    return attrs;
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 z-50 overflow-y-auto px-4 py-8 flex items-start justify-center backdrop-blur-xs no-print">
      <div className="bg-white w-full max-w-5xl rounded-3xl shadow-2xl p-6 md:p-8 flex flex-col gap-6 relative">
        {/* Modal Header */}
        <div className="flex justify-between items-center border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-2xl font-display font-bold text-slate-950 flex items-center gap-2">
              🖨️ Exportar Configuración a PDF
            </h2>
            <p className="text-slate-600 text-sm">
              Genera una versión imprimible con tarjetas recortables para el aula y la solución del docente.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-2 rounded-xl hover:bg-slate-50 transition-all cursor-pointer"
            aria-label="Cerrar ventana"
          >
            ✕
          </button>
        </div>

        {/* Action Button Banner */}
        <div className="bg-sky-50 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 border border-sky-100">
          <div className="text-sm text-sky-800">
            💡 <strong>Sugerencia de impresión:</strong> En el menú de impresión que se abrirá, puedes seleccionar <strong>"Guardar como PDF"</strong> como destino. Asegúrate de habilitar los gráficos de fondo para conservar los colores.
          </div>
          <button
            onClick={triggerPrint}
            className="bg-sky-600 hover:bg-sky-700 text-white font-medium px-5 py-2.5 rounded-xl transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 cursor-pointer text-sm"
          >
            📊 Imprimir / Guardar PDF
          </button>
        </div>

        {/* Visual Preview on Screen (mimics what will be printed, but styled for screen inside modal) */}
        <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50 max-h-[50vh] overflow-y-auto">
          <div className="bg-white p-8 max-w-4xl mx-auto shadow-sm rounded-lg" id="printable-preview-area">
            
            {/* Header Page */}
            <div className="text-center border-b-2 border-slate-900 pb-4 mb-8">
              <h1 className="text-3xl font-display font-black text-slate-900 tracking-tight">
                QUIÉN ES QUIÉN DE CLASES DE PALABRAS
              </h1>
              <p className="text-slate-500 font-mono text-xs mt-1 uppercase tracking-widest">
                — Dosier de Juego Aula Físico —
              </p>
            </div>

            {/* Page 1: Explanation and Cutouts */}
            <div className="mb-10 text-slate-800">
              <h2 className="text-xl font-bold border-b border-slate-300 pb-1 mb-4 text-slate-900">
                1. Tarjetas de Juego Recortables
              </h2>
              <p className="text-xs text-slate-500 mb-6 font-serif">
                Instrucciones: Recorta estas tarjetas por la línea punteada. Se pueden doblar por la mitad para que por un lado se vea el término y por el otro la ayuda gramatical explicativa.
              </p>

              {/* Grid of Printable Cards */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {board.map((item) => (
                  <div key={item.id} className="border-2 border-dashed border-slate-400 p-4 rounded-xl flex flex-col gap-2 relative bg-white min-h-[160px]">
                    <div className="flex justify-between items-start">
                      <span className="font-mono text-[10px] text-slate-400 px-1 border border-slate-200 rounded">
                        ID: {item.id}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getBadgesColor(item.wordClass)}`}>
                        {item.wordClass}
                      </span>
                    </div>
                    
                    <div className="my-auto py-2">
                      <h3 className="text-2xl font-display font-medium text-center text-slate-900 capitalize">
                        {item.word}
                      </h3>
                    </div>

                    <div className="border-t border-slate-100 pt-2 text-[10px] text-slate-500">
                      <p className="font-semibold text-slate-700">Propiedades:</p>
                      <ul className="grid grid-cols-2 gap-x-1 gap-y-0.5 font-sans mt-0.5">
                        {formatAttributes(item).map((attr, idx) => (
                          <li key={idx}>• {attr}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Print Page Break Simulated */}
            <div className="border-t border-dashed border-sky-300 my-8 pt-4">
              <span className="text-[10px] font-mono text-sky-500 block text-center uppercase tracking-widest">
                [ Salto de página para impresión ]
              </span>
            </div>

            {/* Page 2: Teacher's cheat sheet */}
            <div className="text-slate-800">
              <h2 className="text-xl font-bold border-b border-slate-300 pb-1 mb-4 text-slate-900">
                2. Guía del Docente (Solucionario del Tablero)
              </h2>
              <p className="text-xs text-slate-500 mb-4 font-serif">
                Referencia rápida para resolver dudas gramaticales durante el desarrollo de la partida en el aula.
              </p>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-400 text-slate-700 bg-slate-50 font-bold">
                      <th className="py-2 px-3">Palabra</th>
                      <th className="py-2 px-3">Clase</th>
                      <th className="py-2 px-3">Análisis Detallado</th>
                      <th className="py-2 px-3">Descripción Didáctica</th>
                    </tr>
                  </thead>
                  <tbody>
                    {board.map((item) => (
                      <tr key={item.id} className="border-b border-slate-200 hover:bg-slate-50/50">
                        <td className="py-2 px-3 font-semibold text-slate-900 capitalize">{item.word}</td>
                        <td className="py-2 px-3">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${getBadgesColor(item.wordClass)}`}>
                            {item.wordClass}
                          </span>
                        </td>
                        <td className="py-2 px-3">
                          <div className="flex flex-wrap gap-x-1 text-[10px] text-slate-600 gap-y-0.5">
                            {formatAttributes(item).map((attr, idx) => (
                              <span key={idx} className="bg-slate-100 text-slate-700 px-1 rounded-sm">{attr}</span>
                            ))}
                          </div>
                        </td>
                        <td className="py-2 px-3 text-slate-500 text-[10px] italic">{item.definition}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex justify-end border-t border-slate-100 pt-4 gap-3">
          <button
            onClick={onClose}
            className="border border-slate-200 text-slate-600 hover:bg-slate-50 px-5 py-2.5 rounded-xl text-sm font-medium cursor-pointer"
          >
            Cerrar Preview
          </button>
          <button
            onClick={triggerPrint}
            className="bg-slate-950 text-white hover:bg-slate-900 px-6 py-2.5 rounded-xl text-sm font-medium cursor-pointer transition-all active:scale-95"
          >
            Imprimir / Descargar PDF
          </button>
        </div>
      </div>

      {/* --- REAL PRINT OUT VISUALS (INVISIBLE ON SCREEN, VISIBLE ON PRINTER) --- */}
      <div className="absolute top-0 left-0 w-full hidden print:block bg-white p-6" style={{ color: 'black' }}>
        <style dangerouslySetInnerHTML={{ __html: `
          @media print {
            body { font-family: 'Inter', sans-serif !important; }
            .no-print { display: none !important; }
            .print-card-grid { display: grid !important; grid-template-columns: repeat(2, minmax(0, 1fr)) !important; gap: 15px !important; }
            .print-card { border: 2px dashed #666 !important; padding: 15px !important; border-radius: 10px !important; page-break-inside: avoid !important; }
            .print-page-break { page-break-after: always !important; }
          }
        ` }} />
        
        {/* PRINT PAGE 1 */}
        <div className="print-page-break mb-12">
          <div className="text-center border-b-4 border-black pb-4 mb-8">
            <h1 className="text-3xl font-bold tracking-tight uppercase" style={{ fontFamily: 'Outfit' }}>
              QUIÉN ES QUIÉN DE CLASES DE PALABRAS
            </h1>
            <p className="text-xs uppercase tracking-widest font-mono mt-1">Fichas recortables para el aula</p>
          </div>
          
          <p className="text-sm text-slate-700 mb-6 italic">
            Instrucciones para estudiantes: Recorta las tarjetas por la línea discontinua. Úsalas para jugar cara a cara o repasar en tu pupitre.
          </p>

          <div className="print-card-grid">
            {board.map((item) => (
              <div key={item.id} className="print-card flex flex-col justify-between min-h-[180px] bg-white border border-slate-300">
                <div className="flex justify-between items-start">
                  <span className="font-mono text-xs font-semibold px-1 py-0.5 bg-slate-100 text-slate-700 rounded select-all">
                    ID: {item.id}
                  </span>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    {item.wordClass}
                  </span>
                </div>
                
                <div className="my-auto py-4">
                  <h3 className="text-2xl font-black text-center capitalize text-black tracking-tight" style={{ fontFamily: 'Outfit' }}>
                    {item.word}
                  </h3>
                </div>

                <div className="border-t border-dashed border-slate-300 pt-2">
                  <p className="font-semibold text-[11px] text-slate-800 uppercase tracking-widest mb-1">Propiedades de gramática:</p>
                  <div className="grid grid-cols-2 gap-y-0.5 text-[11px] text-slate-700">
                    {formatAttributes(item).map((attr, idx) => (
                      <div key={idx}>• {attr}</div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* PRINT PAGE 2 */}
        <div>
          <div className="text-center border-b-4 border-black pb-4 mb-8">
            <h1 className="text-3xl font-bold tracking-tight uppercase" style={{ fontFamily: 'Outfit' }}>
              GUÍA DE RESPUESTAS DEL DOCENTE
            </h1>
            <p className="text-xs uppercase tracking-widest font-mono mt-1">Solucionario del Tablero de Juego</p>
          </div>

          <p className="text-sm text-slate-700 mb-6 italic">
            Esta hoja sirve de referencia al docente (o dinamizador de mesa) en el aula para validar al instante las respuestas, dudas y preguntas planteadas por los estudiantes.
          </p>

          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b-2 border-black text-slate-800 font-bold bg-slate-100">
                <th className="py-2 px-3">Palabra</th>
                <th className="py-2 px-3">Clase</th>
                <th className="py-2 px-3">Atributos Gramaticales</th>
                <th className="py-2 px-3">Definición Educativa</th>
              </tr>
            </thead>
            <tbody>
              {board.map((item) => (
                <tr key={item.id} className="border-b border-slate-300">
                  <td className="py-2.5 px-3 font-bold text-black uppercase">{item.word}</td>
                  <td className="py-2.5 px-3 font-semibold text-slate-900">{item.wordClass}</td>
                  <td className="py-2.5 px-3">
                    <div className="flex flex-wrap gap-1">
                      {formatAttributes(item).map((attr, idx) => (
                        <span key={idx} className="bg-slate-100 px-1 py-0.5 rounded text-[10px] text-black font-mono">{attr}</span>
                      ))}
                    </div>
                  </td>
                  <td className="py-2.5 px-3 text-slate-700 italic">{item.definition}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
