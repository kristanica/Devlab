import React from "react";
import { FaDatabase } from "react-icons/fa";

interface DataqueriesSchemaProps {
  tablesHtml: string;
}

const DataqueriesSchema: React.FC<DataqueriesSchemaProps> = ({ tablesHtml }) => {
  return (
    <div className="flex-[1] flex flex-col bg-[#0d0d12] border border-[#2a2a3c] rounded-xl overflow-hidden shadow-xl min-h-0">
      <div className="bg-[#161622] border-b border-[#2a2a3c] px-4 py-2 shrink-0 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FaDatabase className="text-emerald-500 text-sm" />
          <span className="text-xs text-slate-300 font-bold uppercase tracking-widest font-exo">
            Database Schema
          </span>
        </div>
      </div>
      <div className="flex-1 p-4 overflow-auto scrollbar-custom bg-[#06060a]">
        <div dangerouslySetInnerHTML={{ __html: tablesHtml }} />
      </div>
    </div>
  );
};

export default DataqueriesSchema;
