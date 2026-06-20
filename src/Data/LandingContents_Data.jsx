import  DevIcon from '../assets/Lottie/LandingPage(Icon).json'
import  TechIcon from '../assets/Lottie/LandingPage(Tech).json'
import TreasureIcon from '../assets/Lottie/LandingPage(Treasure).json'
import ComputerIcon from '../assets/Lottie/LandingPage(Laptop).json'
import Lottie from "lottie-react";

export const LandingPage_Data =[

    {header: "Welcome To DevLab",
        header2:"You are the chosen one",
        text:"Train as a Full-stack dev. Complete quest. Earn XP. Break the Code curse.",
        icon: <Lottie animationData={DevIcon} loop={true} className="w-[100%] h-[100%]" />
    },
    {header: "Master Your Arsenal",
        header2: "HTML, CSS, JavaScript, Databases",
        text: "Each skill is a weapon. Each  bug is a battle. Learn by fighting real dev Challenges",
        icon: <Lottie animationData={TechIcon} loop={true} className="w-[100%] h-[100%] " />
    },
    {header: "Quest, Levels and Loots",
        header2: "Defeat challenges. Gain XP. Unlock Achievements.",
        text: "Progress isn't a number. It's a badge of honor",
        icon: <Lottie animationData={TreasureIcon} loop={true} className="w-[100%] h-[100%]" />
        
    },
    {header: "Enter the Lab",
        header2: "Your first mission awaits.",
        text:"Code bravely, break things gloriously, and become the full-stack here you were born to be",
        icon: <Lottie animationData={ComputerIcon} loop={true} className="w-[100%] h-[100%]" />
    }
]

