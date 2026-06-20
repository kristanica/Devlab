import { IoLogoHtml5, IoLogoCss3, IoLogoJavascript, IoServerOutline } from "react-icons/io5";

export const ACHIEVEMENTS_THEME = {
  Html: {
    color: "orange",
    text: "text-orange-500",
    borderHover: "hover:border-orange-500/50",
    shadow: "hover:shadow-[0_4px_20px_rgba(249,115,22,0.15)]",
    glow: "shadow-[0_0_15px_rgba(249,115,22,0.5)]",
    icon: IoLogoHtml5,
    title: "HTML Milestones"
  },
  Css: {
    color: "cyan",
    text: "text-cyan-500",
    borderHover: "hover:border-cyan-500/50",
    shadow: "hover:shadow-[0_4px_20px_rgba(6,182,212,0.15)]",
    glow: "shadow-[0_0_15px_rgba(6,182,212,0.5)]",
    icon: IoLogoCss3,
    title: "CSS Milestones"
  },
  JavaScript: {
    color: "yellow",
    text: "text-yellow-500",
    borderHover: "hover:border-yellow-500/50",
    shadow: "hover:shadow-[0_4px_20px_rgba(234,179,8,0.15)]",
    glow: "shadow-[0_0_15px_rgba(234,179,8,0.5)]",
    icon: IoLogoJavascript,
    title: "JavaScript Milestones"
  },
  Database: {
    color: "emerald",
    text: "text-emerald-500",
    borderHover: "hover:border-emerald-500/50",
    shadow: "hover:shadow-[0_4px_20px_rgba(16,185,129,0.15)]",
    glow: "shadow-[0_0_15px_rgba(16,185,129,0.5)]",
    icon: IoServerOutline,
    title: "Database Milestones"
  }
};
