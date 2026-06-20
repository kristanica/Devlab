export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0a0f1f] flex items-center justify-center text-center px-6">
    <div>
        <h1 className="text-7xl font-exo font-extrabold text-white">
        404
        </h1>

        <p className="text-xl text-gray-300 mt-4">
        Oops! The page you're looking for doesn't exist.
        </p>

        <p className="text-gray-500 mt-2">
        It might have been moved, deleted, or never existed.
        </p>

        <button
        onClick={() => (window.location.href = "/Main")}
        className="
            mt-8 px-6 py-3 
            bg-indigo-600 hover:bg-indigo-700 
            text-white rounded-xl 
            font-semibold shadow-lg 
            transition cursor-pointer">Back to DevLab
        </button>
      </div>
    </div>
  );
}
