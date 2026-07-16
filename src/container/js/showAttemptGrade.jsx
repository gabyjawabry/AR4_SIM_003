import React, {useContext, useRef, useEffect } from "react";
import { PageContext } from "./utilities/context";

const ShowAttemptGrade = () => {
  const { attemptGrade } = useContext(PageContext);
  return (
          <div className="imageGradeHolder">
            <img src={`./images/attemptGradeHolder.png`} alt="attempt holder " className="attempt-grade-holder" />
            <div className="attemptGradeText" dangerouslySetInnerHTML={{ __html: `3 / ${attemptGrade} ` }} />
          </div>

  );
};

export default ShowAttemptGrade;