import React, { useState, useCallback, useMemo } from "react";
import { useParams } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import SplitPane from "react-split-pane";

import GameHeader from "../../features/gamemodes/components/GameHeader";
import LessonInstructionPanel from "../../features/gamemodes/components/LessonInstructionPanel";
import GameFooter from "../../features/gamemodes/components/GameFooter";

import HtmlTE from "../../features/gamemodes/editors/HtmlTE";
import CssTE from "../../features/gamemodes/editors/CssTE";
import JavaScriptTE from "../../features/gamemodes/editors/JavaScriptTE";
import DatabaseTE from "../../features/gamemodes/editors/DatabaseTE";

const LessonPage: React.FC = () => {
  const { subject } = useParams<{ subject: string }>();
  const [isCorrect, setIsCorrect] = useState(true);

  const renderEditor = useMemo(() => {
    switch (subject) {
      case "Html":
        return <HtmlTE />;
      case "Css":
        return <CssTE />;
      case "JavaScript":
        return <JavaScriptTE />;
      case "Database":
        return <DatabaseTE />;
      default:
        return <div className="text-white flex items-center justify-center w-full h-full font-exo text-xl">Invalid subject</div>;
    }
  }, [subject]);

  return (
    <div className="h-screen bg-[#06060a] flex flex-col overflow-hidden">
      <GameHeader />

      <div className="relative flex-1 overflow-hidden flex">
        {/* @ts-ignore */}
        <SplitPane
          split="vertical"
          minSize={250}
          defaultSize="35%"
          paneStyle={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}
          resizerStyle={{
            cursor: "col-resize",
            width: "6px",
            background: "rgba(255,255,255,0.07)",
            zIndex: 10,
          }}
        >
          <div className="h-full w-full flex flex-col p-2 md:p-3 overflow-hidden">
            <LessonInstructionPanel />
          </div>

          <div className="h-full w-full flex flex-col p-2 md:p-3 overflow-hidden pl-0">
            {renderEditor}
          </div>
        </SplitPane>
      </div>

      <GameFooter isCorrect={isCorrect} setLevelComplete={() => {}} setShowCodeWhisper={() => {}} setAlreadyComplete={() => {}} />
    </div>
  );
};

export default React.memo(LessonPage);
