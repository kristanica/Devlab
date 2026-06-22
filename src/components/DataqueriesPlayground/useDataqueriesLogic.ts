import { useEffect, useRef, useState } from "react";
import initSqlJs, { Database } from "sql.js";
import { toast } from "react-hot-toast";
import dbPlaygroundEval from '@/services/openai/dbPlaygroundEval';
import { initialSQL } from "./initialSQL";

export const useDataqueriesLogic = () => {
  const dbRef = useRef<Database | null>(null);

  const [query, setQuery] = useState("SELECT * FROM books;");
  const [outputHtml, setOutputHtml] = useState<string>("");
  const [tablesHtml, setTablesHtml] = useState<string>("");
  const [hasRunQuery, setHasRunQuery] = useState(false);

  const [evaluationResult, setEvaluationResult] = useState<any>(null);
  const [showEvalPopup, setShowEvalPopup] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);

  useEffect(() => {
    initSqlJs({
      locateFile: (file) => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.13.0/${file}`,
    }).then((SQL) => {
      const db = new SQL.Database();
      db.run(initialSQL);
      dbRef.current = db;
      renderAllTables();
    });
  }, []);

  const renderAllTables = () => {
    if (!dbRef.current) return;
    try {
      const tables = dbRef.current.exec("SELECT name FROM sqlite_master WHERE type='table';");
      if (!tables.length) return;

      let html = "";
      for (const table of tables[0].values) {
        const tableName = table[0] as string;
        const result = dbRef.current.exec(`SELECT * FROM ${tableName}`);

        if (result.length) {
          const { columns, values } = result[0];
          html += `
            <div class='mb-6'>
              <div class="flex items-center gap-2 mb-2 px-1">
                <span class="text-emerald-500 text-sm">📁</span>
                <h3 class='text-sm font-bold text-white uppercase tracking-widest font-exo'>${tableName}</h3>
              </div>
              <div class="overflow-x-auto rounded-lg border border-[#2a2a3c] bg-[#161622] shadow-lg">
                <table class="w-full text-sm text-left whitespace-nowrap">
                  <thead class="text-xs text-slate-400 uppercase bg-[#0d0d12] border-b border-[#2a2a3c]">
                    <tr>${columns.map((col) => `<th class="px-4 py-2.5 font-mono tracking-wider">${col}</th>`).join("")}</tr>
                  </thead>
                  <tbody class="divide-y divide-[#2a2a3c]/50">
                    ${values
                      .map(
                        (row) => `
                      <tr class="hover:bg-emerald-500/10 transition-colors">
                        ${row.map((cell) => `<td class="px-4 py-2 text-slate-300 font-mono text-xs">${cell ?? "NULL"}</td>`).join("")}
                      </tr>
                    `
                      )
                      .join("")}
                  </tbody>
                </table>
              </div>
            </div>`;
        }
      }
      setTablesHtml(html);
    } catch (err) {
      console.error("Error displaying tables:", err);
    }
  };

  const runQuery = () => {
    if (!dbRef.current) return;
    try {
      setHasRunQuery(true);
      const res = dbRef.current.exec(query);

      if (res.length === 0) {
        setOutputHtml(`
          <div class="flex items-center justify-center h-full text-slate-400 font-mono">
            <span class="text-emerald-500 mr-2">✓</span> Query executed successfully. No results returned.
          </div>
        `);
        renderAllTables();
        return;
      }

      const { columns, values } = res[0];
      const tableHtml = `
        <div class="overflow-x-auto rounded-xl border border-[#2a2a3c] bg-[#161622] shadow-2xl">
          <table class="w-full text-sm text-left whitespace-nowrap">
            <thead class="text-xs text-emerald-400 uppercase bg-[#0d0d12] border-b border-[#2a2a3c]">
              <tr>${columns.map((col) => `<th class="px-5 py-3 font-mono tracking-wider">${col}</th>`).join("")}</tr>
            </thead>
            <tbody class="divide-y divide-[#2a2a3c]/50">
              ${values
                .map(
                  (row) => `
                <tr class="hover:bg-emerald-500/10 transition-colors">
                  ${row.map((cell) => `<td class="px-5 py-2.5 text-slate-200 font-mono">${cell ?? '<span class="text-slate-500">NULL</span>'}</td>`).join("")}
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>
        </div>`;

      setOutputHtml(tableHtml);
      renderAllTables();
    } catch (err: any) {
      setOutputHtml(`
        <div class="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl font-mono text-sm shadow-[0_0_15px_rgba(239,68,68,0.1)]">
          <span class="font-bold uppercase tracking-wider text-xs block mb-1">SQL Error</span>
          ${err.message}
        </div>
      `);
    }
  };

  const handleEvaluateSQL = async () => {
    setIsEvaluating(true);
    try {
      const result = await dbPlaygroundEval({ sql: query });
      setEvaluationResult(result);
      setShowEvalPopup(true);
    } catch (error) {
      console.error("Error evaluating SQL:", error);
    } finally {
      setIsEvaluating(false);
    }
  };

  const resetTables = () => {
    if (!dbRef.current) return;

    const tables = dbRef.current.exec("SELECT name FROM sqlite_master WHERE type='table';");
    if (tables.length) {
      tables[0].values.forEach(([tableName]) => {
        dbRef.current!.run(`DROP TABLE IF EXISTS ${tableName};`);
      });
    }

    initialSQL
      .trim()
      .split(";")
      .forEach((stmt) => {
        if (stmt.trim()) dbRef.current!.run(stmt + ";");
      });

    renderAllTables();
    toast.success("Database Reset Successfully", {
      style: { background: "#0d0d12", color: "#10b981", border: "1px solid #10b98150" },
    });
  };

  return {
    query,
    setQuery,
    outputHtml,
    tablesHtml,
    hasRunQuery,
    evaluationResult,
    showEvalPopup,
    setShowEvalPopup,
    isEvaluating,
    runQuery,
    resetTables,
    handleEvaluateSQL
  };
};
