import React from "react";
import { FaTerminal } from "react-icons/fa";

interface PlaygroundConsoleProps {
  run: boolean;
  logs: string[];
}

const PlaygroundConsole: React.FC<PlaygroundConsoleProps> = ({ run, logs }) => {
  return (
    <div className="flex-[1] flex flex-col bg-[#0d0d12] border border-[#2a2a3c] rounded-xl overflow-hidden shadow-xl min-h-0">
      <div className="bg-[#161622] border-b border-[#2a2a3c] px-4 py-2 shrink-0 flex items-center gap-2">
        <FaTerminal className="text-slate-500 text-xs" />
        <span className="text-xs text-slate-500 font-mono uppercase tracking-wider">
          System Console
        </span>
      </div>
      <div className="flex-1 p-4 bg-[#06060a] overflow-auto font-mono text-sm scrollbar-custom">
        {!run ? (
          <div className="text-slate-600">Waiting for code execution...</div>
        ) : logs.length > 0 ? (
          <div className="flex flex-col gap-1.5">
            {logs.map((log, i) => (
              <div key={i} className="text-fuchsia-400 border-b border-[#2a2a3c]/50 pb-1 break-words">
                <span className="text-slate-600 mr-2">{">"}</span>
                {log}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-slate-600">Execution complete. No output.</div>
        )}
      </div>
    </div>
  );
};

export default PlaygroundConsole;
