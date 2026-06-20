
// FOR LESSON GAME MODE (ANY SUB)

import { motion} from "framer-motion";

function Evaluation_Popup({evaluationResult, setShowPopup}) {
return (
  <>
    <motion.div
      className="bg-gradient-to-b from-cyan-400 to-purple-500 rounded-2xl shadow-lg p-[1px] w-[90%] sm:w-[70%] md:w-[50%] lg:w-[35%] h-auto"
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.8, opacity: 0 }}
    >
      <div className="bg-[#111827] h-full w-full rounded-2xl p-4 sm:p-5 md:p-6">
        <h2 className="text-lg sm:text-xl md:text-2xl font-bold mb-2 text-amber-600">
          {evaluationResult.evaluation}
        </h2>

        <p className="text-gray-100 font-exo mb-2 text-sm sm:text-base text-justify leading-relaxed">
          {evaluationResult.feedback}
        </p>

        {evaluationResult.suggestion && (
          <p className="text-gray-400 text-xs sm:text-sm font-exo leading-relaxed whitespace-pre-line">
            💡 <strong>Suggestion:</strong> {evaluationResult.suggestion}
          </p>
        )}

        <div className="flex justify-end mt-4">
          <button
            onClick={() => setShowPopup(false)}
            className="bg-[#9333EA] text-white font-exo px-4 py-2 rounded-lg hover:bg-[#7e22ce] transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </motion.div>
  </>
);

}

export default Evaluation_Popup;
