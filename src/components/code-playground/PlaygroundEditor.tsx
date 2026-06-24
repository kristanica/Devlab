import React from "react";
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { html } from "@codemirror/lang-html";
import { css } from "@codemirror/lang-css";
import { tokyoNight } from "@uiw/codemirror-theme-tokyo-night";
import { EditorView } from "@codemirror/view";
import { IoLogoHtml5, IoLogoCss3, IoLogoJavascript } from "react-icons/io5";

export const TAB_THEMES = {
  HTML: { color: "orange", text: "text-orange-500", icon: IoLogoHtml5 },
  CSS: { color: "cyan", text: "text-cyan-500", icon: IoLogoCss3 },
  JavaScript: { color: "yellow", text: "text-yellow-400", icon: IoLogoJavascript },
};

interface PlaygroundEditorProps {
  tabs: readonly ["HTML", "CSS", "JavaScript"];
  activeTab: "HTML" | "CSS" | "JavaScript";
  setActiveTab: (tab: "HTML" | "CSS" | "JavaScript") => void;
  code: Record<string, string>;
  onChange: (val: string) => void;
}

const PlaygroundEditor: React.FC<PlaygroundEditorProps> = ({ tabs, activeTab, setActiveTab, code, onChange }) => {
  const getLanguageExtension = () => {
    switch (activeTab) {
      case "HTML": return html();
      case "CSS": return css();
      case "JavaScript": return javascript({ jsx: true });
      default: return javascript();
    }
  };

  return (
    <div className="flex flex-col w-full lg:w-[45%] h-full gap-4">
      <div className="flex-1 bg-[#0d0d12] border border-[#2a2a3c] rounded-xl overflow-hidden shadow-2xl flex flex-col min-h-0">
        <div className="bg-[#06060a] flex items-end pt-2 pl-2 pr-4 shrink-0 relative">
          {tabs.map((tab) => {
            const theme = TAB_THEMES[tab];
            const isActive = activeTab === tab;
            const Icon = theme.icon;

            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`relative z-10 flex items-center gap-2 px-5 py-2.5 rounded-t-lg font-exo font-bold text-xs sm:text-sm transition-all duration-200 border-t border-x ${
                  isActive
                    ? `bg-[#1a1b26] ${theme.text} border-[#2a2a3c] border-b-[#1a1b26] shadow-[0_-5px_15px_rgba(0,0,0,0.3)]`
                    : "bg-[#06060a] text-slate-500 border-transparent hover:bg-[#161622] hover:text-slate-300 border-b-[#2a2a3c]"
                }`}
                style={{ marginBottom: isActive ? "-1px" : "0" }}
              >
                <Icon size={16} className={isActive ? theme.text : "text-slate-500"} />
                {tab === "JavaScript" ? "script.js" : tab === "HTML" ? "index.html" : "styles.css"}
              </button>
            );
          })}
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
            value={code[activeTab]}
            extensions={[getLanguageExtension(), EditorView.lineWrapping]}
            onChange={onChange}
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
    </div>
  );
};

export default PlaygroundEditor;
