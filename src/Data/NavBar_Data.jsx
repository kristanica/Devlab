
import cssIcon from "../assets/navbarIcons/css.png"
import HtmlIcon from "../assets/navbarIcons/HTML.png"
import JsIcon from "../assets/navbarIcons/JavaScript.png"
import DbIcon from "../assets/navbarIcons/database.png"

import DasboardIcon from "../assets/navbarIcons/Dashboard.png"
import AchievementIcon from "../assets/navbarIcons/Achievement.png"
import Shop from "../assets/navbarIcons/Shop.png"
import CodePlayIcon from "../assets/navbarIcons/codePlayground.png"
import DbPlaygroundIcon from "../assets/navbarIcons/DbPlayground.png"
import LessonIcon from "../assets/navbarIcons/Lesson.png"


export const Navbar_Data=[
    {
        key:'dashboard',
        label:'Dashboard',
        path:'/Main',
        icon:<img src={DasboardIcon} alt="Home Icon" className="w-6 h-6" />
    },{
        key:'lessons',
        label:'Lessons',
        path:'/Main/Lessons/Html',
        icon:<img src={LessonIcon} alt="Lessons Icon" className="w-6 h-6" />,
        children: [
    { key: 'html', label: 'Html', path: '/Main/Lessons/Html', icon: <img src={HtmlIcon} alt="HTML Icon" className="w-6 h-6" /> },
    { key: 'css', label: 'Css', path: '/Main/Lessons/Css' , icon:<img src={cssIcon} alt="Css Icon" className="w-6 h-6" />},
    { key: 'js', label: 'JavaScript', path: '/Main/Lessons/JavaScript', icon:<img src={JsIcon} alt="JavaScript Icon" className="w-6 h-6" /> },
    { key: 'db', label: 'Database', path: '/Main/Lessons/Database', icon:<img src={DbIcon} alt="Database Icon" className="w-6 h-6" /> }
    ]
    },{
        key:'achievements',
        label:'Achievements',
        path:'/Main/Achievements',
        icon:<img src={AchievementIcon} alt="Achievement Icon" className="w-6 h-6" />
    },{
        key:'shop',
        label:'Shop',
        path:'/Main/Shop',
        icon:<img src={Shop} alt="Shop Icon" className="w-6 h-6" />
    },{
        key:'coding',
        label:'Coding Playground',
        path:'/codingPlay',
        icon:<img src={CodePlayIcon} alt="Code Playground" className="w-6 h-6" />
    },{
        key:'data',
        label:'Database Playground',
        path:'/dataPlayground',
        icon:<img src={DbPlaygroundIcon} alt="Database Playground Icon" className="w-6 h-6" />
    }
]
