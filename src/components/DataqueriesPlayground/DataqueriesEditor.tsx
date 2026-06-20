import React from "react";
import CodeMirror from "@uiw/react-codemirror";
import { sql as sqlLang } from "@codemirror/lang-sql";
import { tokyoNight } from "@uiw/codemirror-theme-tokyo-night";
import { EditorView } from "@codemirror/view";
import { FaTable } from "react-icons/fa";

interface DataqueriesEditorProps {
  query: string;
  setQuery: (val: string) => void;
}

const DataqueriesEditor: React.FC<DataqueriesEditorProps> = ({ query, setQuery }) => {
  return (
    <div className="flex-[1.5] bg-[#0d0d12] border border-[#2a2a3c] rounded-xl overflow-hidden shadow-2xl flex flex-col min-h-0">
      <div className="bg-[#06060a] flex items-end pt-2 pl-2 pr-4 shrink-0 relative border-b border-[#2a2a3c]">
        <button
          className="relative z-10 flex items-center gap-2 px-5 py-2.5 rounded-t-lg font-exo font-bold text-xs sm:text-sm transition-all duration-200 border-x border-t bg-[#1a1b26] text-emerald-400 border-[#2a2a3c] border-b-[#1a1b26] shadow-[0_-5px_15px_rgba(0,0,0,0.3)]"
          style={{ marginBottom: "-1px" }}
        >
          <FaTable size={14} className="text-emerald-500" />
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

      <div className="flex-1 overflow-auto bg-[#1a1b26] CodeMirror-wrapper relative z-0">
        <CodeMirror
          className="h-full text-sm sm:text-base"
          height="100%"
          value={query}
          extensions={[sqlLang(), EditorView.lineWrapping]}
          onChange={(value) => setQuery(value)}
          theme={tokyoNight}
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
  );
};

export default DataqueriesEditor;
