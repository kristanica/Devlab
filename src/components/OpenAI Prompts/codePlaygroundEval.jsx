import axios from "axios";
import { auth } from "../../Firebase/Firebase";

import { useGameStore } from "./useBugBustStore";

const codePlaygroundEval = async ({ html, css, js }) => {
  if (!html && !css && !js) return null;
    const setLoading = useGameStore.getState().setLoading;
  setLoading(true);

  try {
    const currentUser = auth.currentUser;
    const token = await currentUser?.getIdToken(true);

    const res = await axios.post(
      `
https://devlab-server-railway-master-production.up.railway.app/openAI/codePlaygroundEval`,
      { html, css, js },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    let raw = res.data.response;

    // Clean response if wrapped in ```json ... ```
    if (typeof raw === "string") {
      raw = raw.replace(/```json|```/g, "").trim();
    }

    let parsed = null;
    try {
      parsed = JSON.parse(raw);
    } catch (e) {
      console.error("Failed to parse JSON:", e, raw);
    }

    return parsed;
  } catch (error) {
    console.error("codePlaygroundEval API call failed:", error);
    return null;
  }finally {
    setLoading(false); // HIDE loader
  }
};

export default codePlaygroundEval;
