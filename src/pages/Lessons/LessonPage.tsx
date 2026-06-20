import React, { useState, useCallback, useMemo } from "react";
import { useParams } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import SplitPane from "react-split-pane";

// Components
import GameHeader from "../../gameMode/GameModes_Components/GameHeader";
import LessonInstructionPanel from "../../gameMode/GameModes_Components/LessonInstructionPanel";
import GameFooter from "../../gameMode/GameModes_Components/GameFooter";

import Html_TE from "../../gameMode/GameModes_Components/CodeEditor and Output Panel/Html_TE";
import Css_TE from "../../gameMode/GameModes_Components/CodeEditor and Output Panel/Css_TE";
import JavaScript_TE from "../../gameMode/GameModes_Components/CodeEditor and Output Panel/JavaScript_TE";
import Database_TE from "../../gameMode/GameModes_Components/CodeEditor and Output Panel/Database_TE";

const LessonPage: React.FC = () => {
  const { subject } = useParams<{ subject: string }>();
  const [isCorrect, setIsCorrect] = useState(true);

  const renderEditor = useMemo(() => {
    switch (subject) {
      case "Html":
        return <Html_TE />;
      case "Css":
        return <Css_TE />;
      case "JavaScript":
        return <JavaScript_TE />;
      case "Database":
        return <Database_TE />;
      default:
        return <div className="text-white flex items-center justify-center w-full h-full font-exo text-xl">Invalid subject</div>;
    }
  }, [subject]);

  return (
    <div className="h-screen bg-[#06060a] flex flex-col overflow-hidden">
      {/* Header */}
      <GameHeader />

      {/* Content — horizontal SplitPane */}
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
          {/* Instruction Panel — LEFT */}
          <div className="h-full w-full flex flex-col p-2 md:p-3 overflow-hidden">
            <LessonInstructionPanel />
          </div>

          {/* Code Editor — RIGHT */}
          <div className="h-full w-full flex flex-col p-2 md:p-3 overflow-hidden pl-0">
            {renderEditor}
          </div>
        </SplitPane>
      </div>

      {/* Footer */}
      <GameFooter isCorrect={isCorrect} />
    </div>
  );
};

export default React.memo(LessonPage);
