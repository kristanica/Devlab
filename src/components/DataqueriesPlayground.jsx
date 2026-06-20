// Utils
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
// CodeMirror
import CodeMirror from "@uiw/react-codemirror";
import initSqlJs from "sql.js";
import { sql } from "@codemirror/lang-sql";
import { tokyoNight } from "@uiw/codemirror-theme-tokyo-night";
// Ui
import Lottie from "lottie-react";
import { motion,AnimatePresence } from "framer-motion";
import { MdArrowBackIos } from "react-icons/md";
// assets
import Animation from "../assets/Lottie/OutputLottie.json";
// Components
import DBPlaygroundEval_Popup from "../gameMode/GameModes_Popups/DbPlaygroundEval_PopUp"
import dbPlaygroundEval from "./OpenAI Prompts/dbPlaygroundEval";

function DataqueriesPlayground() {
  const navigate = useNavigate();
  const dbRef = useRef(null);
  const [query, setQuery] = useState(
    "SELECT * FROM books;"
  );
  const [outputHtml, setOutputHtml] = useState();
  const [tablesHtml, setTablesHtml] = useState("");
  const [hasRunQuery, setHasRunQuery] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState(null);
  const [showEvalPopup, setShowEvalPopup] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);


  const initialSQL = `
CREATE TABLE books (
  book_id INT PRIMARY KEY,
  title VARCHAR(100),
  author VARCHAR(100),
  genre VARCHAR(50),
  published_year INT,
  available_copies INT
);

INSERT INTO books (book_id, title, author, genre, published_year, available_copies)
VALUES
  (1, 'To Kill a Mockingbird', 'Harper Lee', 'Fiction', 1960, 5),
  (2, '1984', 'George Orwell', 'Dystopian', 1949, 3),
  (3, 'The Great Gatsby', 'F. Scott Fitzgerald', 'Classic', 1925, 4),
  (4, 'Pride and Prejudice', 'Jane Austen', 'Romance', 1813, 2),
  (5, 'The Hobbit', 'J.R.R. Tolkien', 'Fantasy', 1937, 6);

CREATE TABLE borrowers (
  borrower_id INT PRIMARY KEY,
  full_name VARCHAR(100),
  email VARCHAR(100),
  phone_number VARCHAR(20),
  address VARCHAR(200)
);

INSERT INTO borrowers (borrower_id, full_name, email, phone_number, address)
VALUES
  (1, 'Alice Johnson', 'alice.johnson@email.com', '09171234567', 'Tarlac City'),
  (2, 'Brian Cruz', 'brian.cruz@email.com', '09181234567', 'Capas, Tarlac'),
  (3, 'Carla Dela Cruz', 'carla.dc@email.com', '09221234567', 'Victoria, Tarlac');

CREATE TABLE borrow_records (
  record_id INT PRIMARY KEY,
  borrower_id INT,
  book_id INT,
  borrow_date DATE,
  return_date DATE,
  status VARCHAR(20),
  FOREIGN KEY (borrower_id) REFERENCES borrowers(borrower_id),
  FOREIGN KEY (book_id) REFERENCES books(book_id)
);

INSERT INTO borrow_records (record_id, borrower_id, book_id, borrow_date, return_date, status)
VALUES
  (1, 1, 2, '2025-10-10', '2025-10-17', 'Returned'),
  (2, 2, 5, '2025-10-12', NULL, 'Borrowed'),
  (3, 3, 1, '2025-10-15', NULL, 'Borrowed');
`;


  // Initial DataTable
  useEffect(() => {
    initSqlJs({
      locateFile: (file) =>
        `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.13.0/${file}`,
    }).then((SQL) => {
      const db = new SQL.Database();
      db.run(`

CREATE TABLE books (
  book_id INT PRIMARY KEY,
  title VARCHAR(100),
  author VARCHAR(100),
  genre VARCHAR(50),
  published_year INT,
  available_copies INT
);

INSERT INTO books (book_id, title, author, genre, published_year, available_copies)
VALUES
  (1, 'To Kill a Mockingbird', 'Harper Lee', 'Fiction', 1960, 5),
  (2, '1984', 'George Orwell', 'Dystopian', 1949, 3),
  (3, 'The Great Gatsby', 'F. Scott Fitzgerald', 'Classic', 1925, 4),
  (4, 'Pride and Prejudice', 'Jane Austen', 'Romance', 1813, 2),
  (5, 'The Hobbit', 'J.R.R. Tolkien', 'Fantasy', 1937, 6);


CREATE TABLE borrowers (
  borrower_id INT PRIMARY KEY,
  full_name VARCHAR(100),
  email VARCHAR(100),
  phone_number VARCHAR(20),
  address VARCHAR(200)
);


INSERT INTO borrowers (borrower_id, full_name, email, phone_number, address)
VALUES
  (1, 'Alice Johnson', 'alice.johnson@email.com', '09171234567', 'Tarlac City'),
  (2, 'Brian Cruz', 'brian.cruz@email.com', '09181234567', 'Capas, Tarlac'),
  (3, 'Carla Dela Cruz', 'carla.dc@email.com', '09221234567', 'Victoria, Tarlac');


CREATE TABLE borrow_records (
  record_id INT PRIMARY KEY,
  borrower_id INT,
  book_id INT,
  borrow_date DATE,
  return_date DATE,
  status VARCHAR(20),
  FOREIGN KEY (borrower_id) REFERENCES borrowers(borrower_id),
  FOREIGN KEY (book_id) REFERENCES books(book_id)
);


INSERT INTO borrow_records (record_id, borrower_id, book_id, borrow_date, return_date, status)
VALUES
  (1, 1, 2, '2025-10-10', '2025-10-17', 'Returned'),
  (2, 2, 5, '2025-10-12', NULL, 'Borrowed'),
  (3, 3, 1, '2025-10-15', NULL, 'Borrowed');
`);
      dbRef.current = db;
      renderAllTables();
    });
  }, []);
  // Display the Table
  const renderAllTables = () => {
    if (!dbRef.current) return;
    try {
      const tables = dbRef.current.exec(
        "SELECT name FROM sqlite_master WHERE type='table';"
      );
      if (!tables.length) return;
      let html = "";
      for (const table of tables[0].values) {
        const tableName = table[0];
        const result = dbRef.current.exec(`SELECT * FROM ${tableName}`);
        if (result.length) {
          const { columns, values } = result[0];
          html += `<div class='mb-6 '><h3 class='text-lg font-semibold mb-2 '>${tableName}</h3>`;
          html += `<div class="overflow-auto ">
            <table class="table-auto border-collapse border border-gray-400 bg-[#1A1B26] w-full text-sm">
            <thead>
                <tr class="bg-[#1A1B26]">
                ${columns
                  .map((col) => `<th class="border px-4 py-2">${col}</th>`)
                  .join("")}
                </tr>
            </thead>
            <tbody>
                ${values
                  .map(
                    (row) => `
                <tr>${row
                  .map((cell) => `<td class="border px-4 py-1">${cell}</td>`)
                  .join("")}</tr>`)
                  .join("")}
            </tbody>
            </table>
        </div></div>`;
        }
      }
      setTablesHtml(html);
    } catch (err) {
      console.error("Error displaying tables:", err);
    }
  };
  // Run Button
  const runQuery = () => {
    try {
      setHasRunQuery(true);
      const res = dbRef.current.exec(query);
      if (res.length === 0) {
        setOutputHtml("Query executed successfully. No results.");
        renderAllTables();
        return;
      }
      const { columns, values } = res[0];
      const table = `
        <div class="overflow-auto ">
        <table class="table-auto border-collapse border border-gray-400 w-full text-sm ">
            <thead>
            <tr class="bg-[#F8F3FF] p-3">
                ${columns
                  .map((col) => `<th class="border px-4 py-2">${col}</th>`)
                  .join("")}
            </tr>
            </thead>
            <tbody>
            ${values
              .map(
                (row) => `
                <tr>${row
                  .map((cell) => `<td class="border px-4 py-1">${cell}</td>`)
                  .join("")}</tr>
            `
              )
              .join("")}
            </tbody>
        </table>
        </div>`;
      setOutputHtml(table);
      renderAllTables();
    } catch (err) {
      setOutputHtml(
        `<span class="text-red-500 font-medium">${err.message}</span>`
      );
    }
  };
  // EVALButton
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

  // Drop all existing tables
  const tables = dbRef.current.exec(
    "SELECT name FROM sqlite_master WHERE type='table';"
  );
  if (tables.length) {
    tables[0].values.forEach(([tableName]) => {
      dbRef.current.run(`DROP TABLE IF EXISTS ${tableName};`);
    });
  }

  // Recreate initial tables
  initialSQL
    .trim()
    .split(";")
    .forEach((stmt) => {
      if (stmt.trim()) dbRef.current.run(stmt + ";");
    });

  // Refresh table view
  renderAllTables();
  toast.success("Tables have been reset!", { position: "top-right" });
};


  return (
<div className="flex flex-col bg-[#16161A] text-white font-exo h-atuo p-4 gap-3 xl:overflow-hidden xl:h-screen lg:overflow-hidden lg:h-screen">
  <div className="text-4xl sm:text-5xl font-bold p-4 sm:p-10 flex items-center ">
    <span className="cursor-pointer" onClick={() => navigate("/main")}>
      <MdArrowBackIos/> 
    </span>
    <span className="text-4xl sm:text-5xl font-bold">DevLab</span>
  </div>

  <div className="flex flex-col lg:flex-row w-full h-full gap-6 lg:gap-10">
    {/* Left Panel */}
    <div className="flex flex-col lg:w-3/5 w-full h-[70vh] lg:h-[80%] gap-4">
      {/* Tables */}
      <div className="h-[30%] sm:h-[35%] overflow-scroll overflow-x-hidden p-4 bg-[#1A1B26] shadow-[0_5px_10px_rgba(147,_51,_234,_0.7)] rounded-2xl scrollbar-custom">
        <div className="flex justify-end mb-2">
  <motion.button
    whileTap={{ scale: 0.95 }}
    whileHover={{ scale: 1.05 }}
    onClick={resetTables}
    className="bg-[#9333EA] text-white font-bold rounded-xl px-3 py-1 text-sm hover:drop-shadow-[0_0_6px_rgba(126,34,206,0.4)]"
  >
    Refresh Tables
  </motion.button>
</div>

        <h2 className="text-[1.25rem] sm:text-[1.5rem] font-semibold mb-2 text-white font-exo">
          Database Tables
        </h2>
        <div
          dangerouslySetInnerHTML={{ __html: tablesHtml }}
          className="text-white"
        />
      </div>

      {/* SQL Editor */}
      <div className="px-3 sm:px-4 w-full flex flex-col flex-1 min-h-0 gap-3 rounded-3xl bg-[#1A1B26] shadow-[0_5px_10px_rgba(147,_51,_234,_0.7)]">
        <div className="flex-1 min-h-0 overflow-auto">
          <CodeMirror
            value={query}
            height="100%"
            theme={tokyoNight}
            extensions={[sql()]}
            onChange={(value) => setQuery(value)}
          />
        </div>

        <motion.div className="flex flex-col sm:flex-row justify-end gap-3 p-4">
          <motion.button
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.05, background: "#7e22ce" }}
            transition={{ bounceDamping: 100 }}
            onClick={handleEvaluateSQL}
            disabled={isEvaluating}
            className="px-4 py-2 bg-[#7e22ce] rounded-xl text-white cursor-pointer w-full sm:w-[15%] hover:drop-shadow-[0_0_6px_rgba(126,34,206,0.4)]"
          >
            {isEvaluating ? "Evaluating..." : "EVALUATE"}
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.05, background: "#9333EA" }}
            transition={{ bounceDamping: 100 }}
            onClick={runQuery}
            className="px-4 py-2 bg-[#9333EA] rounded-xl text-white cursor-pointer w-full sm:w-[15%] hover:drop-shadow-[0_0_6px_rgba(126,34,206,0.4)]"
          >
            Run Query
          </motion.button>
        </motion.div>
      </div>
    </div>

    {/* Output Panel */}
    <div className="bg-[#F8F3FF] text-black h-[60vh] sm:h-[80%] w-full lg:w-[37%] text-lg sm:text-2xl p-4 sm:p-6 font-exo rounded-3xl shadow-[0_5px_10px_rgba(147,_51,_234,_0.7)] overflow-auto">
      {!hasRunQuery ? (
        <div className="flex flex-col items-center justify-center w-full h-full">
          <Lottie
            animationData={Animation}
            loop={true}
            className="w-[60%] h-[60%] sm:w-[50%] sm:h-[50%]"
          />
          <p className="text-gray-700 font-bold w-[75%] text-[0.9rem] sm:text-[0.95rem] text-center mt-4">
            YOUR CODE RESULTS WILL APPEAR HERE WHEN YOU RUN YOUR PROJECT
          </p>
        </div>
      ) : (
        <div
          className="w-full h-full overflow-auto"
          dangerouslySetInnerHTML={{ __html: outputHtml }}
        />
      )}
    </div>
  </div>

  <AnimatePresence>
    {showEvalPopup && evaluationResult && (
      <motion.div
        className="fixed inset-0 flex items-center justify-center bg-black/50 z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <DBPlaygroundEval_Popup
          evaluationResult={evaluationResult}
          setShowEvalPopup={setShowEvalPopup}
        />
      </motion.div>
    )}
  </AnimatePresence>
</div>

  );
}

export default DataqueriesPlayground;
