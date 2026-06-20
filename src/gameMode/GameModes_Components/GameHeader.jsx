// Utils / Custom Hooks
import useLevelBar from "../../components/Custom Hooks/useLevelBar";
import useFetchUserData from "../../components/BackEnd_Data/useFetchUserData";
// Navigation
import { Link } from "react-router-dom";
import { useParams } from "react-router-dom";
// Icons
import { MdArrowBackIos } from "react-icons/md";
import { LuHeart } from "react-icons/lu";
import defaultAvatar from '../../assets/Images/profile_handler.png'
import { useAttemptStore } from "../GameModes_Utils/useAttemptStore";

function GameHeader({heart}) {

    const { animatedExp } = useLevelBar();
    const {gamemodeId} = useParams();
    const { userData } = useFetchUserData();
    const maxHearts = useAttemptStore((state) => state.maxHearts);


  return (
    // Full-width, flexible height (min-h-[10%]), dark purple background, improved padding.
    <div className="flex justify-between items-center w-full min-h-[10%] bg-[#11001f] text-white p-3 shadow-lg shadow-purple-950/50">
      
      {/* Back Button and Logo */}
      <div className="flex items-center gap-1 md:gap-3">
        <Link to="/Main" 
              // Responsive text size for Back Button
              className="text-2xl md:text-3xl text-purple-400 hover:text-white transition-colors">
          <MdArrowBackIos />
        </Link>
        {/* Responsive text size for DEVLAB title. Hide on extra-small screens. */}
        <h1 className="text-xl sm:text-2xl lg:text-[2.5rem] font-exo font-bold text-white hidden sm:block">
            DevLab
        </h1>
      </div>

      {/* CENTER SECTION: Heart Counter (Conditional) */}
      {gamemodeId !== "Lesson" && (
          // CHANGE 4: Centered hearts, reduced margin/gap for space efficiency on small screens.
          <div className="flex gap-1 sm:gap-2 w-auto justify-center">
            {[...Array(maxHearts)].map((_, i) => (
              <span 
                key={i} 
                // CHANGE 5: Responsive heart icon size
                className={i < heart ? 'text-red-500 text-2xl sm:text-3xl' : 'text-gray-500 text-2xl sm:text-3xl'}>
                <LuHeart />
              </span>
              ))}
          </div>
      )}
      <div className="flex items-center gap-2">
        {/* Profile Avatar */}
        <div 
            className="border rounded-full overflow-hidden w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12">
          <img
            src={userData?.profileImage || defaultAvatar}
            alt="Profile"
            className="w-full h-full object-cover"/>
        </div>

        {/* Level and Progress Bar */}
        <div className="flex flex-col justify-center">
          {/* Progress Bar Container */}
          <div 
            className="w-[100px] sm:w-[120px] lg:w-[150px] h-3 sm:h-4 mb-1 bg-gray-700 rounded-full">
            <div
              // The bar color is set to a purple-friendly green/cyan (from a previous file)
              className="h-full rounded-full bg-[#2CB67D]"
              style={{ width: `${(animatedExp / 100) * 100}%` }}>
            </div>
          </div>
          {/* Level and XP Text */}
          <div className="flex justify-between text-xs sm:text-sm">
            <p className="text-white font-inter font-bold">
              Lvl {userData?.userLevel}
            </p>
            <p className="text-white font-inter font-bold ml-2">
              {userData?.exp} / 100xp
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GameHeader;