import React from "react";
import Lottie from "lottie-react";
import Animation from "../../assets/Lottie/OutputLottie.json";

interface PlaygroundPreviewProps {
  run: boolean;
  iFrameRef: React.RefObject<HTMLIFrameElement>;
}

const PlaygroundPreview: React.FC<PlaygroundPreviewProps> = ({ run, iFrameRef }) => {
  return (
    <div className="flex-[3] flex flex-col bg-[#0d0d12] border border-[#2a2a3c] rounded-xl overflow-hidden shadow-xl min-h-0">
      <div className="bg-[#161622] border-b border-[#2a2a3c] px-4 py-2 shrink-0 flex items-center justify-between">
        <span className="text-xs text-slate-500 font-mono uppercase tracking-wider">
          Live Preview
        </span>
      </div>
      <div className="flex-1 bg-white relative">
        {run ? (
          <iframe
            title="output"
            ref={iFrameRef}
            className="w-full h-full absolute inset-0 border-none"
            sandbox="allow-scripts allow-same-origin allow-modals allow-popups allow-top-navigation-by-user-activation"
          />
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
  );
};

export default PlaygroundPreview;
