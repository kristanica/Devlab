import { IoLogoHtml5, IoLogoCss3, IoLogoJavascript } from "react-icons/io5";
import { FaDatabase } from "react-icons/fa";

export const lessonConfig: Record<string, any> = {
  Html: {
    theme: {
      text: "text-orange-500",
      textLight: "text-orange-400",
      bg: "bg-orange-500",
      bgGradient: "from-orange-500/10",
      badge: "bg-orange-500/10 border-orange-500/20 text-orange-400",
      dropShadow: "drop-shadow-[0_0_30px_rgba(249,115,22,0.4)]",
      shadow: "shadow-[0_0_10px_rgba(249,115,22,0.8)]",
      hoverShadow: "hover:shadow-[0_4px_20px_rgba(249,115,22,0.1)]",
      hoverBorder: "hover:border-orange-500/50",
      hoverBorderSubtle: "hover:border-orange-500/30",
      selection: "selection:bg-orange-500/30",
    },
    icon: IoLogoHtml5,
    header: {
      badge: "Core Module",
      title: "< > HTML: The Gateway to Web Adventure",
      description: "Step into the world of Front-End Development with HTML and CSS as your weapons of creation. Your adventure begins with mastering the fundamentals—building structure and style to craft stunning, responsive websites. As you level up, you'll unlock the secrets of layout design, styling, and structure, gaining the skills to transform raw code into beautiful web pages. Conquer each challenge to earn badges of mastery!"
    },
    about: {
      title: "The Skeleton of the Web",
      description: "Step into the world of web development! As a novice adventurer, you’ll unlock the powerful language that forms the backbone of the internet—HTML. Build the structure of your web pages and lay the foundation for your journey into the digital realm.",
      checks: ["Structure Documents", "Semantic Markup", "SEO Fundamentals"]
    }
  },
  Css: {
    theme: {
      text: "text-cyan-500",
      textLight: "text-cyan-400",
      bg: "bg-cyan-500",
      bgGradient: "from-cyan-500/10",
      badge: "bg-cyan-500/10 border-cyan-500/20 text-cyan-400",
      dropShadow: "drop-shadow-[0_0_30px_rgba(6,182,212,0.4)]",
      shadow: "shadow-[0_0_10px_rgba(6,182,212,0.8)]",
      hoverShadow: "hover:shadow-[0_4px_20px_rgba(6,182,212,0.1)]",
      hoverBorder: "hover:border-cyan-500/50",
      hoverBorderSubtle: "hover:border-cyan-500/30",
      selection: "selection:bg-cyan-500/30",
    },
    icon: IoLogoCss3,
    header: {
      badge: "Styling Module",
      title: "{ } CSS: The Art of Web Design",
      description: "Transform raw HTML skeletons into beautiful, responsive masterpieces. In this module, you'll master the art of styling, layout algorithms like Flexbox and Grid, and stunning animations that bring your user interfaces to life. Master the cascade and paint the web!"
    },
    about: {
      title: "The Artist's Palette",
      description: "CSS brings your HTML to life. You will learn to control spacing, typography, colors, and responsive layouts that adapt to any screen size. Make your applications look professional and polished.",
      checks: ["Responsive Design", "Flexbox & Grid", "Transitions & Animations"]
    }
  },
  JavaScript: {
    theme: {
      text: "text-yellow-400",
      textLight: "text-yellow-300",
      bg: "bg-yellow-400",
      bgGradient: "from-yellow-400/10",
      badge: "bg-yellow-400/10 border-yellow-400/20 text-yellow-300",
      dropShadow: "drop-shadow-[0_0_30px_rgba(250,204,21,0.4)]",
      shadow: "shadow-[0_0_10px_rgba(250,204,21,0.8)]",
      hoverShadow: "hover:shadow-[0_4px_20px_rgba(250,204,21,0.1)]",
      hoverBorder: "hover:border-yellow-400/50",
      hoverBorderSubtle: "hover:border-yellow-400/30",
      selection: "selection:bg-yellow-400/30",
    },
    icon: IoLogoJavascript,
    header: {
      badge: "Logic Module",
      title: "JS JavaScript: The Engine of the Web",
      description: "Breathe life into your static pages. JavaScript is the programming language of the web, allowing you to create dynamic interactions, fetch data from APIs, and build complex single-page applications. Master variables, functions, DOM manipulation, and asynchronous programming."
    },
    about: {
      title: "The Brains of the Operation",
      description: "HTML is the skeleton, CSS is the skin, but JavaScript is the muscle. Learn how to make your websites interactive, handle user events, and perform complex calculations directly in the browser.",
      checks: ["DOM Manipulation", "Async/Await & APIs", "State Management"]
    }
  },
  Database: {
    theme: {
      text: "text-emerald-500",
      textLight: "text-emerald-400",
      bg: "bg-emerald-500",
      bgGradient: "from-emerald-500/10",
      badge: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
      dropShadow: "drop-shadow-[0_0_30px_rgba(16,185,129,0.4)]",
      shadow: "shadow-[0_0_10px_rgba(16,185,129,0.8)]",
      hoverShadow: "hover:shadow-[0_4px_20px_rgba(16,185,129,0.1)]",
      hoverBorder: "hover:border-emerald-500/50",
      hoverBorderSubtle: "hover:border-emerald-500/30",
      selection: "selection:bg-emerald-500/30",
    },
    icon: FaDatabase,
    header: {
      badge: "Data Module",
      title: "DB Database: The Vault of Knowledge",
      description: "Every great application needs a memory. Dive into the world of backend data persistence. You will learn how to design schemas, write SQL queries, and securely store and retrieve user data. Master the art of the CRUD operations and secure your application's vault."
    },
    about: {
      title: "The Persistent Memory",
      description: "Learn how modern applications store their data securely. You'll master SQL databases, table relationships, and data normalization. Power your web applications with a robust backend architecture.",
      checks: ["SQL Queries", "Schema Design", "Relational Data"]
    }
  }
};
