import React from "react";
import Lottie from "lottie-react";
import Animation from "../../assets/Lottie/OutputLottie.json";

interface DataqueriesOutputProps {
  hasRunQuery: boolean;
  outputHtml: string;
}

const DataqueriesOutput: React.FC<DataqueriesOutputProps> = ({ hasRunQuery, outputHtml }) => {
  return (
    <div className="flex flex-col w-full lg:w-[55%] h-full">
      <div className="flex-1 flex flex-col bg-[#0d0d12] border border-[#2a2a3c] rounded-xl overflow-hidden shadow-xl min-h-0">
        <div className="bg-[#161622] border-b border-[#2a2a3c] px-4 py-2 shrink-0 flex items-center justify-between">
          <span className="text-xs text-slate-500 font-mono uppercase tracking-wider">
            Query Output
          </span>
        </div>

        <div className="flex-1 bg-[#06060a] relative overflow-auto p-4 scrollbar-custom">
          {!hasRunQuery ? (
            <div className="absolute inset-0 flex flex-col justify-center items-center">
              <Lottie
                animationData={Animation}
                className="w-48 h-48 opacity-50 mb-4"
              />
              <p className="text-emerald-500/50 font-exo font-bold tracking-widest uppercase text-sm border border-emerald-500/20 px-6 py-2 rounded-lg bg-emerald-500/5">
                Awaiting Query Execution
              </p>
            </div>
          ) : (
            <div
              dangerouslySetInnerHTML={{ __html: outputHtml }}
              className="w-full h-full"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default DataqueriesOutput;
