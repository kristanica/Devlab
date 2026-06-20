import { useState, useCallback, useRef, useEffect } from "react";
import codePlaygroundEval from "../OpenAI Prompts/codePlaygroundEval";

export const usePlaygroundLogic = () => {
  const tabs = ["HTML", "CSS", "JavaScript"] as const;
  type TabType = (typeof tabs)[number];
  
  const [activeTab, setActiveTab] = useState<TabType>("HTML");
  const [run, setRun] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState<any>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);

  const iFrame = useRef<HTMLIFrameElement>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const consoleRef = useRef<string[]>([]);

  const [code, setCode] = useState({
    HTML: '<!-- Write your HTML code here -->\n<div class="hacker-box">\n  <h1>Hello DevLab</h1>\n</div>',
    CSS: "/* Write your CSS code here */\n.hacker-box {\n  background: #0d0d12;\n  color: #a855f7;\n  padding: 2rem;\n  border: 1px solid #2a2a3c;\n  border-radius: 8px;\n  text-align: center;\n  font-family: sans-serif;\n}",
    JavaScript: "// Write your JavaScript code here\nconsole.log('System initialized...');",
  });

  const onChange = useCallback((val: string) => {
    setCode((prev) => ({ ...prev, [activeTab]: val }));
  }, [activeTab]);

  const runCode = () => {
    setRun(true);
    consoleRef.current = [];
    setLogs([]);

    setTimeout(() => {
      const fullCode = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <script>
          const sendLog = (...args) => {
            window.parent.postMessage({ type: 'console-log', args }, '*');
          };
          console.log = (...args) => sendLog(...args);
          console.error = (...args) => sendLog("Error:", ...args);
          console.warn = (...args) => sendLog("Warning:", ...args);
        </script>
        <style>${code.CSS}</style>
      </head>
      <body>
        ${code.HTML}
        <script>
          try {
            ${code.JavaScript}
          } catch (err) {
            sendLog("Error:", err.message);
          }
        </script>
      </body>
      </html>
      `;

      if (iFrame.current) {
        iFrame.current.srcdoc = fullCode;
      }
    }, 50);
  };

  const handleEvaluate = async () => {
    setIsEvaluating(true);
    try {
      const result = await codePlaygroundEval({
        html: code.HTML,
        css: code.CSS,
        js: code.JavaScript,
      });
      setEvaluationResult(result);
      setShowPopup(true);
    } catch (error) {
      console.error("Error evaluating code:", error);
    } finally {
      setIsEvaluating(false);
    }
  };

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === "console-log") {
        consoleRef.current.push(event.data.args.join(" "));
        setLogs([...consoleRef.current]);
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  return {
    tabs,
    activeTab,
    setActiveTab,
    run,
    evaluationResult,
    showPopup,
    setShowPopup,
    isEvaluating,
    iFrame,
    logs,
    code,
    onChange,
    runCode,
    handleEvaluate
  };
};
