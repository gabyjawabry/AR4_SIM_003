import { motion, useAnimation, useScroll } from "framer-motion";
import {  useContext, useEffect, useState, useRef } from 'react';
import { FormattedMessage } from "react-intl";
import '../css/failedScreen.scss';
import { getAnimation, useIsVisible } from "../../../container/js/utilities/utilities";
import { PageContext } from "../../../container/js/utilities/context";

const FailedScreen = ({parameters}) => {
  const { content } = parameters;
  const controls = useAnimation();
  const containerRef = useRef(null);
  const isVisible = useIsVisible(containerRef);
  const { setAudioURL, stopAudio, attemptGrade, studentGrade, missionNumber } = useContext(PageContext);
  const [startAnimation, setStartAnimation] = useState(false);
  let timer = useRef(null);


  const handleReplay = () => {
   window.location.reload(true);
  };
  useEffect(() => {
    if (isVisible) { 
      timer.current = setTimeout(() => 
        setAudioURL({ id: "failed", url: content.mainQuestionAudio, type: "failed-screen" })
      , 3000);
      setStartAnimation(true);  
      controls.start("animate");
    }else{
      controls.start("initial");
    }
  }, [isVisible]);

  return (
    <div className={`failedScreen-container failedScreen-container_${missionNumber} p-0 m-0 h-100 w-100`}>
      <div className="failedScreen-content w-100">
        <motion.div ref={containerRef}  className="lessonTitleHolder"   variants={getAnimation("bounceInTop", 0.4, 1)} initial="initial" animate={controls}>
          <div className="failedScreen-content-wrapper">
            <div className="failedScreen-content-titles">
              <motion.div {...getAnimation("expandIn", 0.8, 1)} className="lessonTitle" dangerouslySetInnerHTML={{ __html: content.lessonTitle }}/>
              {content.lessonSubTitle && (
                <motion.div {...getAnimation("bounce", 0.8, 1)} className="lessonSubTitle"  dangerouslySetInnerHTML={{ __html: content.lessonSubTitle }} />
              )}
            </div>
            <motion.div  className="startLessonBtnHolder"  {...getAnimation("scaleIn", 0.4, 1)}>
              <button className="failed-replay-btn" onClick={handleReplay}> 
                 <FormattedMessage id='failedScreen.end' /> 
              </button>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default FailedScreen;
