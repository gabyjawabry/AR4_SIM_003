import { motion, useAnimation, useScroll } from "framer-motion";
import {  useContext, useEffect, useState, useRef } from 'react';
import { FormattedMessage } from "react-intl";
import '../css/splashScreen.scss';
import { getAnimation, useIsVisible } from "../../../container/js/utilities/utilities";
import { PageContext } from "../../../container/js/utilities/context";
import startSFX from '../sounds/start.mp3';
import VideoPlayer from "../../videoPlayer/js/videoPlayer.jsx";
import ShowAttemptGrade from '../../../container/js/showAttemptGrade.jsx';
import ShowScoring from '../../../container/js/showScoring.jsx';

const SplashScreen = ({parameters}) => {
  const { content } = parameters;
  const controls = useAnimation();
  const containerRef = useRef(null);
  const isVisible = useIsVisible(containerRef);
  const { setAudioURL, stopAudio, attemptGrade, studentGrade } = useContext(PageContext);
  const [startAnimation, setStartAnimation] = useState(false);
  const videoPlayerRef = useRef();
  const backgroundVideoRef = useRef();
  let timer = useRef(null);
  
  const handleStartAnimations = () => {
      stopAudio();
      clearTimeout(timer.current);
      const swiper = document.querySelector('#container-swiper')?.swiper;
      if (swiper) swiper.slideNext(1);
  };

  useEffect(() => {
    if (isVisible) { 
      timer.current = setTimeout(() => 
        setAudioURL({ id: "splash", url: content.mainQuestionAudio, type: "splash-screen" })
      , 3000);
      setStartAnimation(true);  
      controls.start("animate");
    }else{
      controls.start("initial");
    }
  }, [isVisible]);

  return (
    <div className="splashScreen-container p-0 m-0 h-100 w-100">
      <div className="splashScreen-content w-100">
        <motion.div ref={containerRef}  className="lessonTitleHolder"   variants={getAnimation("bounceInTop", 0.4, 1)} initial="initial" animate={controls}>
          <div className="splashScreen-content-wrapper">
            <div className="splashScreen-content-titles">
              <motion.div {...getAnimation("expandIn", 0.8, 1)} className="lessonTitle" dangerouslySetInnerHTML={{ __html: content.lessonTitle }}/>
              {content.lessonSubTitle && (
                <motion.div {...getAnimation("bounce", 0.8, 1)} className="lessonSubTitle"  dangerouslySetInnerHTML={{ __html: content.lessonSubTitle }} />
              )}
            </div>
            <motion.div  className="startLessonBtnHolder"  {...getAnimation("scaleIn", 0.4, 1)}>
              <button className="startLessonBtn" onClick={handleStartAnimations}>
                <FormattedMessage id='splashScreen.start' /> 
              </button>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SplashScreen;
