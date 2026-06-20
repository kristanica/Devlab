// For Code PlayGround PopUp EVAL
import { motion } from "framer-motion";

function CodePlaygroundEval_PopUp({ evaluationResult, setShowPopup }) {
return (
  <>
    <motion.div
      className="bg-gradient-to-b from-cyan-400 to-purple-500 rounded-2xl shadow-lg p-[1px] w-[90%] sm:w-[80%] md:w-[60%] lg:w-[50%]"
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.8, opacity: 0 }}
    >
      <div className="bg-[#111827] rounded-2xl p-4 sm:p-5 md:p-6 space-y-4">
        <h2 className="text-xl sm:text-2xl font-bold text-purple-400">Evaluation Results</h2>

        {/* HTML Feedback */}
        {evaluationResult.htmlFeedback && (
          <div className="bg-gray-800 p-3 sm:p-4 rounded-lg">
            <h3 className="font-bold text-base sm:text-lg text-amber-500">HTML Feedback</h3>
            <p className="text-gray-100 text-xs sm:text-sm font-exo leading-relaxed">
              {evaluationResult.htmlFeedback}
            </p>
          </div>
        )}

        {/* CSS Feedback */}
        {evaluationResult.cssFeedback && (
          <div className="bg-gray-800 p-3 sm:p-4 rounded-lg">
            <h3 className="font-bold text-base sm:text-lg text-cyan-400">CSS Feedback</h3>
            <p className="text-gray-100 text-xs sm:text-sm font-exo leading-relaxed">
              {evaluationResult.cssFeedback}
            </p>
          </div>
        )}

        {/* JS Feedback */}
        {evaluationResult.jsFeedback && (
          <div className="bg-gray-800 p-3 sm:p-4 rounded-lg">
            <h3 className="font-bold text-base sm:text-lg text-yellow-400">JavaScript Feedback</h3>
            <p className="text-gray-100 text-xs sm:text-sm font-exo leading-relaxed">
              {evaluationResult.jsFeedback}
            </p>
          </div>
        )}

        {/* Overall Improvement */}
        {evaluationResult.overallImprovement && (
          <div className="bg-gray-800 p-3 sm:p-4 rounded-lg">
            <h3 className="font-bold text-base sm:text-lg text-green-400">Overall Improvements</h3>
            <p className="text-gray-100 text-xs sm:text-sm font-exo leading-relaxed whitespace-pre-line">
              💡 {evaluationResult.overallImprovement}
            </p>
          </div>
        )}

        {/* Close Button */}
        <div className="flex justify-end">
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

export default CodePlaygroundEval_PopUp;
