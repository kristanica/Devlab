import React, { useEffect, useState, useRef, useCallback } from "react";
import { useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Lottie from "lottie-react";
import toast from "react-hot-toast";

// Code Mirror
import CodeMirror from "@uiw/react-codemirror";
import { sql } from "@codemirror/lang-sql";
import initSqlJs, { Database } from "sql.js";
import { tokyoNight } from "@uiw/codemirror-theme-tokyo-night";
import { EditorView } from "@codemirror/view";

// Icons
import { PiDatabaseDuotone } from "react-icons/pi";

// Components
import Animation from "../../../assets/Lottie/OutputLottie.json";
import Evaluation_Popup from "../../GameModes_Popups/Evaluation_Popup";

// Utils
import { extractSqlKeywords } from "../../../components/Achievements Utils/Db_KeyExtract";
import { unlockAchievement } from "@/services/UnlockAchievement";
import useFetchUserData from '@/services/api/useFetchUserData';
import useFetchGameModeData from '@/services/api/useFetchGameModeData';
import { useGameStore } from "@/store/useGameStore";
import useFetchUserProgress from '@/services/api/useFetchUserProgress';
import lessonPromptDb from '@/services/openai/lessonPromptDb';

const initialSQL = `
CREATE TABLE students (
  id INTEGER PRIMARY KEY,
  name TEXT,
  age INTEGER,
  course TEXT
);

CREATE TABLE enrollments (
  id INTEGER PRIMARY KEY,
  student_id INTEGER,
  subject TEXT,
  grade INTEGER
);

INSERT INTO students VALUES
  (1, 'Anna', 20, 'Computer Science'),
  (2, 'Ben', 22, 'Information Technology'),
  (3, 'Clara', 21, 'Software Engineering'),
  (4, 'David', 23, 'Information Systems'),
  (5, 'Ella', 20, 'Computer Science');

INSERT INTO enrollments VALUES
  (1, 1, 'Database Systems', 95),
  (2, 2, 'Web Development', 88),
  (3, 3, 'Operating Systems', 92),
  (4, 1, 'Web Development', 89),
  (5, 5, 'Database Systems', 85),
  (6, 4, 'Data Structures', 91),
  (7, 2, 'Networking', 90),
  (8, 3, 'Database Systems', 87),
  (9, 5, 'Programming 101', 93);
`;

const Database_TE: React.FC = () => {
  const { userData } = useFetchUserData();
  const { gamemodeId, lessonId, levelId, stageId } = useParams<{ gamemodeId: string; lessonId: string; levelId: string; stageId: string }>();
  
  const [outputHtml, setOutputHtml] = useState<string>("");
  const [hasRunQuery, setHasRunQuery] = useState(false);
  const [tablesHtml, setTablesHtml] = useState("");
  const [query, setQuery] = useState("");
  const dbRef = useRef<Database | null>(null);

  const setSubmittedCode = useGameStore((state) => state.setSubmittedCode);
  const isCorrect = useGameStore((state) => state.isCorrect);

  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState<any>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [description, setDescription] = useState("");
  const { gameModeData, subject } = useFetchGameModeData();

  const { userStageCompleted } = useFetchUserProgress(subject);
  const stageKey = `${lessonId}-${levelId}-${stageId}`;
  const isStageCompleted = userStageCompleted?.[stageKey] === true;

  const renderAllTables = useCallback(() => {
    if (!dbRef.current) return;

    try {
      const tables = dbRef.current.exec("SELECT name FROM sqlite_master WHERE type='table';");
      if (!tables.length) return;

      let html = "";

      for (const table of tables[0].values) {
        const tableName = table[0] as string;
        const result = dbRef.current.exec(`SELECT * FROM ${tableName}`);
        
        html += `<div class='mb-6'>
          <h3 class='text-lg font-exo font-bold text-slate-200 mb-3 tracking-widest uppercase'>${tableName}</h3>`;

        if (result.length) {
          const { columns, values } = result[0];
          html += `<div class="overflow-x-auto rounded-lg border border-[#2a2a3c]">
            <table class="table-auto w-full text-sm text-left text-slate-300">
              <thead class="text-xs text-slate-400 uppercase bg-[#161622]">
                <tr>
                  ${columns.map(col => `<th class="px-4 py-1.5 border-b border-[#2a2a3c]">${col}</th>`).join("")}
                </tr>
              </thead>
              <tbody>
                ${values.map((row, i) => `
                  <tr class="${i % 2 === 0 ? 'bg-[#0d0d12]' : 'bg-[#13131f]'} hover:bg-purple-900/20 transition-colors">
                    ${row.map(cell => `<td class="px-4 py-1.5 border-b border-[#2a2a3c]/50">${cell}</td>`).join("")}
                  </tr>
                `).join("")}
              </tbody>
            </table>
          </div>`;
        } else {
          html += `<div class="overflow-auto rounded-lg border border-[#2a2a3c]">
            <table class="table-auto w-full text-sm bg-[#0d0d12]">
              <thead>
                <tr><th class="px-4 py-1.5 text-slate-500 italic font-normal">Empty table</th></tr>
              </thead>
            </table>
          </div>`;
        }
        html += `</div>`;
      }

      setTablesHtml(html);
    } catch (err) {
      console.error("Error displaying tables:", err);
    }
  }, []);

  const runCode = useCallback(() => {
    if (!query.trim()) {
      toast.error("Please enter your query before running.", { position: "top-right" });
      return;
    }
    try {
      setHasRunQuery(true);
      const sanitizedQuery = query
        .replace(/\bAUTOINCREMENT\b/gi, "")
        .replace(/\bauto_increment\b/gi, "");

      if (!dbRef.current) return;
      
      const res = dbRef.current.exec(sanitizedQuery);

      if (gamemodeId !== "Lesson") {
        const usedTags = extractSqlKeywords(query); 
        if (usedTags.length > 0) {
          unlockAchievement(userData?.uid, "Database", "tagUsed", { usedTags, isCorrect });
        }
      }

      if (res.length === 0) {
        setOutputHtml(`
          <div class="p-2 bg-green-900/20 border border-green-500/50 text-green-400 rounded-xl text-center font-exo tracking-wider shadow-md">
            Query executed successfully <br/><span class="text-xs text-green-500/70 opacity-80 mt-1 block">(No results returned)</span>
          </div>
        `);
        renderAllTables();
        return;
      }

      const { columns, values } = res[0];
      const table = `
        <div class="overflow-x-auto rounded-lg border border-purple-500/30 shadow-[0_0_15px_rgba(147,51,234,0.1)]">
          <table class="table-auto w-full text-sm text-left text-slate-300">
            <thead class="text-xs text-purple-300 uppercase bg-[#161622]">
              <tr>
                ${columns.map(col => `<th class="px-4 py-1.5 border-b border-purple-500/30">${col}</th>`).join("")}
              </tr>
            </thead>
            <tbody>
              ${values.map((row, i) => `
                <tr class="${i % 2 === 0 ? 'bg-[#0d0d12]' : 'bg-[#13131f]'} hover:bg-purple-900/20 transition-colors">
                  ${row.map(cell => `<td class="px-4 py-1.5 border-b border-purple-500/10">${cell}</td>`).join("")}
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      `;
      setOutputHtml(table);
      renderAllTables();

    } catch (err: any) {
      setOutputHtml(`<div class="p-2 bg-red-900/20 border border-red-500/50 text-red-400 rounded-xl font-mono text-sm">${err.message}</div>`);
    }
  }, [query, gamemodeId, isCorrect, userData?.uid, renderAllTables]);

  useEffect(() => {
    initSqlJs({
      locateFile: (file) => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.13.0/${file}`,
    }).then((SQL) => {
      const db = new SQL.Database();
      db.run(initialSQL);
      dbRef.current = db;
      renderAllTables();
    });
  }, [renderAllTables]);

  const handleEvaluate = useCallback(async () => {
    if (!query.trim()) {
      toast.error("Please enter your code before evaluating.", { position: "top-right" });
      return;
    }
    
    let currentDesc = description;
    if (gameModeData?.blocks) {
      const paragraphs = gameModeData.blocks
        .filter((block: any) => block.type === "Paragraph")
        .map((block: any) => block.value)
        .join("\n") || "";
      setDescription(paragraphs);
      currentDesc = paragraphs;
    }
    
    setIsEvaluating(true);
    try {
      const result = await lessonPromptDb({
        receivedQuery: query,
        instruction: gameModeData?.instruction,
        description: currentDesc,
        subject,
      });
      setEvaluationResult(result);
      setShowPopup(true);
    } catch (error) {
      console.error("Error evaluating query:", error);
    } finally {
      setIsEvaluating(false);
    }
  }, [query, description, gameModeData, subject]);

  const resetTables = useCallback(() => {
    if (!dbRef.current) return;

    const tables = dbRef.current.exec("SELECT name FROM sqlite_master WHERE type='table';");
    if (tables.length) {
      tables[0].values.forEach(([tableName]) => {
        dbRef.current?.run(`DROP TABLE IF EXISTS ${tableName};`);
      });
    }

    initialSQL.trim().split(";").forEach((stmt) => {
      if (stmt.trim()) dbRef.current?.run(stmt + ";");
    });

    renderAllTables();
    toast.success("Tables have been reset!", { position: "top-right" });
  }, [renderAllTables]);

  const onCodeChange = useCallback((value: string) => {
    setQuery(value);
    setSubmittedCode({ SQL: value });
  }, [setSubmittedCode]);

  return (
    <>
      <div className="flex flex-col w-full h-full gap-2">
        
        {/* TOP: DATABASE & OUTPUT PANEL */}

        <div className="w-full flex-1 min-h-0 flex flex-col gap-2 min-h-0">
          
          {/* DATABASE SCHEMA VIEW */}
          <div className="flex-1 flex flex-col bg-[#0d0d12] border border-[#2a2a3c] rounded-xl overflow-hidden shadow-xl min-h-0">
            <div className="bg-[#161622] border-b border-[#2a2a3c] px-2 py-1 shrink-0 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-mono uppercase tracking-wider">
                DATABASE SCHEMA
              </span>
              <motion.button
                whileTap={{ scale: 0.95 }}
                whileHover={{ scale: 1.05 }}
                onClick={resetTables}
                className="bg-[#1a1b26] border border-[#2a2a3c] text-slate-300 hover:text-white hover:bg-purple-500/10 px-3 py-1 rounded-md text-[10px] font-bold transition-all uppercase tracking-wider"
              >
                Reset DB
              </motion.button>
            </div>
            <div className="flex-1 bg-[#06060a] p-2 overflow-auto scrollbar-custom" dangerouslySetInnerHTML={{ __html: tablesHtml }}></div>
          </div>

          {/* OUTPUT VIEW */}
          <div className="flex-1 flex flex-col bg-[#0d0d12] border border-[#2a2a3c] rounded-xl overflow-hidden shadow-xl min-h-0">
            <div className="bg-[#161622] border-b border-[#2a2a3c] px-2 py-1 shrink-0 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-mono uppercase tracking-wider">
                Query Result
              </span>
            </div>
            <div className="flex-1 bg-[#06060a] relative">
              {hasRunQuery ? (
                <div className="w-full h-full absolute inset-0 overflow-auto p-2 scrollbar-custom" dangerouslySetInnerHTML={{ __html: outputHtml }}></div>
              ) : (
                <div className="absolute inset-0 flex flex-col justify-center items-center bg-[#06060a]">
                  <Lottie animationData={Animation} className="w-48 h-48 opacity-50 mb-4" />
                  <p className="text-purple-500/50 font-exo font-bold tracking-widest uppercase text-sm border border-purple-500/20 px-6 py-2 rounded-lg bg-purple-500/5">
                    Awaiting Execution
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* EVALUATION POPUP */}
      

{/* BOTTOM: SQL EDITOR PANEL */}

        <div className="flex flex-col w-full flex-1 min-h-0 gap-2 min-h-0">
          <div className="flex-1 bg-[#0d0d12] border border-[#2a2a3c] rounded-xl overflow-hidden shadow-2xl flex flex-col min-h-0">
            {/* Editor Top Bar (Mac Style) */}
            <div className="bg-[#06060a] flex items-end pt-2 pl-2 pr-4 shrink-0 relative">
              <button
                className="relative z-10 flex items-center gap-2 px-3 py-1.5 rounded-t-lg font-exo font-bold text-xs sm:text-sm transition-all duration-200 border-t border-x bg-[#1a1b26] text-blue-400 border-[#2a2a3c] border-b-[#1a1b26] shadow-[0_-5px_15px_rgba(0,0,0,0.3)]"
                style={{ marginBottom: "-1px" }}
              >
                <PiDatabaseDuotone size={16} className="text-blue-400" />
                query.sql
              </button>
              <div className="flex-1 border-b border-[#2a2a3c] self-stretch flex items-center justify-end pb-3">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#ff5f56] shadow-[0_0_5px_#ff5f5680]" />
                  <div className="w-3 h-3 rounded-full bg-[#ffbd2e] shadow-[0_0_5px_#ffbd2e80]" />
                  <div className="w-3 h-3 rounded-full bg-[#27c93f] shadow-[0_0_5px_#27c93f80]" />
                </div>
              </div>
            </div>

            {/* CodeMirror */}
            <div className="flex-1 overflow-auto bg-[#1a1b26] relative z-0">
              <CodeMirror
                className="text-[0.9rem] sm:text-[0.8rem] sm:text-[0.9rem] h-full scrollbar-custom"
                height="100%"
                width="100%"
                extensions={[sql(), EditorView.lineWrapping]}
                theme={tokyoNight}
                onChange={onCodeChange}
                basicSetup={{
                  lineNumbers: true,
                  highlightActiveLineGutter: true,
                  foldGutter: true,
                  dropCursor: true,
                  allowMultipleSelections: true,
                  indentOnInput: true,
                }}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end items-center gap-3 w-full mt-2 shrink-0">
            <motion.button
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.05 }}
              onClick={runCode}
              className="px-6 py-1.5 bg-[#0d0d12] hover:bg-purple-500/10 border border-[#2a2a3c] hover:border-purple-500/50 text-slate-300 hover:text-purple-300 font-exo font-bold text-xs tracking-widest rounded-lg transition-all shadow-sm"
            >
              RUN QUERY
            </motion.button>

            {(gamemodeId === "Lesson" || isStageCompleted) && (
              <motion.button
                whileTap={{ scale: 0.95 }}
                whileHover={!isEvaluating ? { scale: 1.05 } : {}}
                onClick={handleEvaluate}
                disabled={isEvaluating}
                className={`px-6 py-1.5 font-exo font-bold text-xs tracking-widest rounded-lg transition-all shadow-sm ${
                  isEvaluating 
                    ? "bg-[#161622] border border-[#2a2a3c] text-slate-500 cursor-not-allowed" 
                    : "bg-purple-600 hover:bg-purple-500 text-white border border-purple-500/50 hover:shadow-[0_0_15px_rgba(168,85,247,0.4)]"
                }`}
              >
                {isEvaluating ? "EVALUATING..." : "EVALUATE"}
              </motion.button>
            )}
          </div>
        </div>

        <AnimatePresence>
        {showPopup && evaluationResult && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center bg-[#06060a]/80 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Evaluation_Popup evaluationResult={evaluationResult} setShowPopup={setShowPopup} />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default React.memo(Database_TE);