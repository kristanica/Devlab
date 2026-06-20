// DbPlaygroundEval_Popup.jsx
import { motion } from "framer-motion";

function DbPlaygroundEval_Popup({ evaluationResult, setShowEvalPopup }) {
return (
  <>
    <motion.div
      className="bg-gradient-to-b from-cyan-400 to-purple-500 rounded-2xl shadow-lg p-[1px] w-[90%] sm:w-[80%] md:w-[60%] lg:w-[50%]"
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.8, opacity: 0 }}
    >
      <div className="bg-[#111827] rounded-2xl p-4 sm:p-5 md:p-6 space-y-4">
        <h2 className="text-xl sm:text-2xl font-bold text-amber-500">Database Evaluation</h2>

        {/* Query Feedback */}
        {evaluationResult.queryFeedback && (
          <div className="bg-gray-800 p-3 sm:p-4 rounded-lg">
            <h3 className="font-bold text-base sm:text-lg text-cyan-400">Query Feedback</h3>
            <p className="text-gray-100 text-xs sm:text-sm font-exo leading-relaxed">
              {evaluationResult.queryFeedback}
            </p>
          </div>
        )}

        {/* Query Improvement */}
        {evaluationResult.queryImprovement && (
          <div className="bg-gray-800 p-3 sm:p-4 rounded-lg">
            <h3 className="font-bold text-base sm:text-lg text-green-400">Query Improvement</h3>
            <p className="text-gray-100 text-xs sm:text-sm font-exo leading-relaxed whitespace-pre-line">
              💡 {evaluationResult.queryImprovement}
            </p>
          </div>
        )}

        {/* Close Button */}
        <div className="flex justify-end">
          <button
            onClick={() => setShowEvalPopup(false)}
            className="bg-[#9333EA] text-white font-exo px-4 py-2 rounded-lg hover:bg-[#7e22ce] transition"
          >
            Close
          </button>
        </div>
      </div>
    </motion.div>
  </>
);

}

export default DbPlaygroundEval_Popup;
