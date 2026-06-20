import React from "react";
import useFetchLevelsData from "./BackEnd_Data/useFetchLevelsData";
import useFetchUserProgress from "./BackEnd_Data/useFetchUserProgress";

const Prefetcher: React.FC = () => {
  // Prefetch all subjects so they are instantly ready when the user clicks the Lessons tab
  useFetchLevelsData("Html");
  useFetchLevelsData("Css");
  useFetchLevelsData("JavaScript");
  useFetchLevelsData("Database");

  // Prefetch user progress to ensure locks and progress bars are instantly calculated
  useFetchUserProgress("Html");
  useFetchUserProgress("Css");
  useFetchUserProgress("JavaScript");
  useFetchUserProgress("Database");

  return null;
};

export default Prefetcher;
