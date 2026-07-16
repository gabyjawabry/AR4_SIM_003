import { motion, useAnimation, useScroll } from "framer-motion";
import { useContext, useEffect,  useRef, useState  } from 'react';
import { FormattedMessage } from "react-intl";
import '../css/achievementScreen.scss';
import { getAnimation, useIsVisible} from "../../../container/js/utilities/utilities";
import { PageContext } from "../../../container/js/utilities/context";
import startSFX from '../sounds/start.mp3';
import achievementSFX from '../sounds/achievement.mp3';
import mainStarImg from "../images/mainStar.png";
import bigStarImg from "../images/bigStar.png";
import smallStarImg from "../images/smallStar.png";
import ShowAttemptGrade from '../../../container/js/showAttemptGrade.jsx';
import ShowScoring from '../../../container/js/showScoring.jsx';

const AchievementScreen = ({parameters}) => {
  const { content } = parameters;
  const controls = useAnimation();
  const { setAudioURL, stopAudio } = useContext(PageContext);
  const [startAnimation, setStartAnimation] = useState(false);
  const containerRef = useRef(null);
  const isVisible = useIsVisible(containerRef);
  const handleStartAnimations = async () => {
    stopAudio();
    const swiper = document.querySelector('#container-swiper')?.swiper;
    if (swiper) swiper.slideNext(1);
  };
  useEffect(() => {
    if (isVisible) {  
      setAudioURL({id: "achievement", url: content.mainQuestionAudio, type: "achievement-screen"});
      controls.start("animate");
    }else{
      controls.start("initial");
    }
  }, [isVisible]);
  // useEffect(() => {
  //   if(content.audio){
  //     setAudioURL({id: "achievementScreen", url: !content.achievement ? startSFX : achievementSFX, type: "achievementScreenSFX"}, () => {
  //       setAudioURL({id: "achievementScreen", url: content.audio, type: "achievementScreenSFX"});
  //       setStartAnimation(true);
  //     });
  //   }

  // }, [content.audio, content.achievement, setAudioURL, stopAudio]);

  return (
    <motion.div ref={containerRef}  className="achievementScreen-container p-0 m-0 h-100 w-100" {...getAnimation("fade", 0.4, 0)} initial="initial" animate={controls}>
      <div className="achievementScreen-content w-100">
        <motion.div {...getAnimation("bounceInTop", 0.4, 1)} className={`lessonTitleHolder ${content.last ? 'last' : ''}`}>
          <div className="achievementScreen-content-wrapper">
              <div className="UpperDiv">
                <motion.div {...getAnimation("rotateZoomIn", 0.8, 1)} className="smallStarRight">
                  <img src={smallStarImg} alt="small star" />
                </motion.div>
                <motion.div {...getAnimation("rotateZoomIn", 0.8, 1)}>
                  <img src={bigStarImg} alt="big star" />
                </motion.div>
                <motion.div {...getAnimation("rotateZoomIn", 0.8, 1)}>
                  <img src={mainStarImg} alt="main star" />
                </motion.div>
                <motion.div {...getAnimation("rotateZoomIn", 0.8, 1)}>
                  <img src={bigStarImg} alt="big star" />
                </motion.div>
                <motion.div {...getAnimation("rotateZoomIn", 0.8, 1)} className="smallStarLeft">
                  <img src={smallStarImg} alt="small star" />
                </motion.div>
              </div>

            <div className="achievementScreen-content-titles">
              <motion.div {...getAnimation("expandIn", 0.8, 1)} className="lessonTitle" dangerouslySetInnerHTML={{ __html: content.lessonTitle }} />
            </div>
            {content.withScore && (
              <motion.div {...getAnimation("rotateZoomIn", 0.8, 1)} className="teamImageMainDiv">             
                <div className="teamSelectedScore">
                  <ShowScoring />
                </div>
              </motion.div>
            )} 
            {!content.last  && (
              <motion.div className="startLessonBtnHolder" {...getAnimation("scaleIn", 0.4, 1)}>
                <button className="startLessonBtn" onClick={handleStartAnimations}>
                  <FormattedMessage id='feedback.continue' />
                </button>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default AchievementScreen;
