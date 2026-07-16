import React, {useContext, useRef, useEffect } from "react";
import { PageContext } from "./utilities/context";
import ScoreCircle from './scoreCircle.jsx'; 
const ShowScoring = () => {
  const { studentGrade } = useContext(PageContext);
  return (
  <div className="studentGradeHolder">
    <ScoreCircle score={studentGrade} />
  </div>
  );
};
export default ShowScoring;