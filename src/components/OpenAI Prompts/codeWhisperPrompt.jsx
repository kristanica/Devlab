import axios from "axios";
import { auth } from "../../Firebase/Firebase";
import { useGameStore } from "./useBugBustStore";

const codeWhisperPrompt = async ({
  description,
  instruction,
  receivedCode,
  submittedCode
}) => {
  if (!receivedCode) return null;
  const setLoadingHint = useGameStore.getState().setLoadingHint;
  setLoadingHint(true);

  try {
    const currentUser = auth.currentUser;
    const token = await currentUser?.getIdToken(true);

    const res = await axios.post(
      `
https://devlab-server-railway-master-production.up.railway.app/openAI/codeWhisper`,
      { description, instruction, receivedCode,submittedCode},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    let raw = res.data.parsedResponse || null;

    // Clean raw response if it's a string with triple backticks
    if (typeof raw === "string") {
      raw = raw.replace(/```json|```/g, "").trim();
    }
    let parsed = null;
    try {
      parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
    } catch (e) {
      console.error("Failed to parse JSON:", e, raw);
    }
    console.log(parsed);
    return parsed; // { whisper: "vague hint" }
    
  } catch (error) {
    console.error("codeWhisperPrompt API call failed:", error);
    return null;
  } finally {
    setLoadingHint(false);

  }
};

export default codeWhisperPrompt;
