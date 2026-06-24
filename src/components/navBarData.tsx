import React from 'react';
import { 
  IoGridOutline, 
  IoBookOutline, 
  IoTrophyOutline, 
  IoCartOutline, 
  IoCodeSlashOutline, 
  IoServerOutline,
  IoLogoHtml5,
  IoLogoCss3,
  IoLogoJavascript
} from 'react-icons/io5';

export const navBarData = [
    {
        key:'dashboard',
        label:'Dashboard',
        path:'/Main',
        icon:<IoGridOutline size={24} />
    },{
        key:'lessons',
        label:'Lessons',
        path:'/Main/Lessons/Html',
        icon:<IoBookOutline size={24} />,
        children: [
    { key: 'html', label: 'Html', path: '/Main/Lessons/Html', icon: <IoLogoHtml5 size={24} /> },
    { key: 'css', label: 'Css', path: '/Main/Lessons/Css' , icon:<IoLogoCss3 size={24} />},
    { key: 'js', label: 'JavaScript', path: '/Main/Lessons/JavaScript', icon:<IoLogoJavascript size={24} /> },
    { key: 'db', label: 'Database', path: '/Main/Lessons/Database', icon:<IoServerOutline size={24} /> }
    ]
    },{
        key:'achievements',
        label:'Achievements',
        path:'/Main/Achievements',
        icon:<IoTrophyOutline size={24} />
    },{
        key:'shop',
        label:'Shop',
        path:'/Main/Shop',
        icon:<IoCartOutline size={24} />
    },{
        key:'coding',
        label:'Coding Playground',
        path:'/codingPlay',
        icon:<IoCodeSlashOutline size={24} />
    },{
        key:'data',
        label:'Database Playground',
        path:'/dataPlayground',
        icon:<IoServerOutline size={24} />
    }
];
