import { useState, useEffect, useRef, useContext } from 'react';
import "../css/multipleChoice.scss";
import { motion, useAnimation } from "framer-motion";
import Feedback from "../../../container/js/feedback";
import { getAnimation, ShowCorrectStars, shuffle, chooseUniqueItems, useIsVisible } from "../../../container/js/utilities/utilities";
import { Col, Row } from 'react-bootstrap';
import AudioWidget from '../../../container/js/audioWidget';
import { PageContext } from "../../../container/js/utilities/context";
import CheckRounded from "../../../container/images/icons/check.svg?react";
import CorrectStars from "../../../container/images/correct-stars.svg?react";
import GoToTOCButton from '../../../container/js/showTOCBtn.jsx';
import HintButton from '../../../container/js/hintButton.jsx';
import VideoPlayer from "../../videoPlayer/js/videoPlayer.jsx";
import ButtonClickSFX from "../sounds/button_click.mp3";
import ShowAttemptGrade from '../../../container/js/showAttemptGrade.jsx';
import ShowScoring from '../../../container/js/showScoring.jsx';
import { getAnimationAsync } from '../../../container/js/utilities/helper.jsx';
import CorrectSFX from '../sounds/gauge_correct.mp3';
import IncorrectSFX from '../sounds/gauge_incorrect.mp3';
import { FormattedMessage } from "react-intl";
const MultipleChoice = (props) => {
  const pageContext = useContext(PageContext);
  // const setAudioURL = pageContext.setAudioURL;
  const parameters = props.parameters || {};
  const content = parameters?.content || {};
  const containerRef = useRef(null);
  const [hintData, setHintData] = useState('');
  const [selected, setSelected] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [checked, setChecked] = useState(false);
  const [feedbackParams, setFeedbackParams] = useState(null);
  const [submitCount, setSubmitCount] = useState(0);
  const feedbackSubmitButtonRef = useRef();
  const [mcOptions, setMcOptions] = useState([]);
  const correctOption = mcOptions.find(o => o.correct);
  const controls = useAnimation();
  const isVisible = useIsVisible(containerRef);
  const [currentRound, setCurrentRound] = useState(0);
  const roundData = content.rounds?.[currentRound] || {};
  const feedbackVideoRef = useRef();
  const [backgroundVideoData, setBackgroundVideoData] = useState(null);
  const backgroundVideoRef = useRef();
  const { setAudioURL, stopAudio, studentGrade, attemptGrade, missionNumber} = useContext(PageContext);
  const startTime = useRef(null);
  const audioData = {
    url: content.mainQuestionAudio,
    autoplay: true,
    id: parameters.id || 0
  };
  useEffect(() => {
    if (!content?.gameId) return;

    if (content.gameId === 3) {
      if (!roundData) return;

      const mcCorrectOptions = roundData.correctAnswersArray.map(item => ({
        ...item,
        correct: true,
      }));

      const mcWrongOptions = roundData.wrongAnswersArray.map(item => ({
        ...item,
        correct: false,
      }));

      const result = [...mcCorrectOptions, ...mcWrongOptions]
        .sort((a, b) => a.index - b.index)
        .map((item, idx) => ({
          id: idx + 1,
          text: item.text,
          index: item.index,
          correct: item.correct,
        }));

      setMcOptions(result);
    }

    if (content.gameId === 1) {
      const mcCorrectOptions = [content.correctAnswersArray[currentRound]];
      const mcWrongOptions = chooseUniqueItems(content.wrongAnswersArray, 2);

      const result = [...mcCorrectOptions, ...mcWrongOptions].map((text, index) => ({
        id: index + 1,
        text,
        correct: index < mcCorrectOptions.length,
      }));

      setMcOptions(shuffle(result));
    }

    setSelected(null);
    setSubmitted(false);
    setChecked(false);
    setFeedbackParams({});

  }, [ content?.gameId, roundData?.id, currentRound]);

  useEffect(() => {
      setSubmitCount(0);
      setFeedbackParams({});
  }, [0]);  


  async function loadBackgroundVideo(status) {
    let anim;   
    anim = await getAnimationAsync(`mission3_question${currentRound + 1}_${status}`);
    setBackgroundVideoData(anim);
  }

  const goToNextRound = () => {
    const rounds = roundData?.rounds ?? content?.correctAnswersArray;
    const isLastRound = currentRound === (rounds?.length ?? 0) - 1;
    const newGrade = Math.min(pageContext.studentGrade + 1, 6);
    pageContext.setStudentGrade(newGrade);
    stopAudio();
    if (!isLastRound) {
      setCurrentRound(prev => prev + 1);  
      setSelected(null);
      setSubmitted(false);
      setChecked(false);
      setFeedbackParams({});

    } else {
      const swiper = document.querySelector("#container-swiper") ?.swiper; 
      if (swiper) {
        swiper.slideNext(1);
      }
    }
  };

  const checkAnswers = (type) => {
    let feedbackData = {};
    if (type === "tryagain") {
      setSelected(null);
      setSubmitted(false);
      setChecked(false);
      setFeedbackParams({});
      return;
    } 
    if (type === "reset") {
      setSelected(null);
      setSubmitted(false);
      setChecked(false);
      setFeedbackParams({});
      return;
    }
    setChecked(true);
    if (selected === null) return;
    const isCorrect = selected === correctOption.id;
    if(content.gameId === 3){
      loadBackgroundVideo(isCorrect ? "true" : "false");
    }
 
    setSubmitted(true);
    const newGrade = !isCorrect ? pageContext.attemptGrade - 1: pageContext.attemptGrade;
		pageContext.setAttemptGrade(newGrade);

    if(newGrade === 0 ){
      const swiper = document.querySelector("#container-swiper")?.swiper;

      if (swiper) {
        swiper.slideTo(swiper.slides.length - 1, 1);
      }
    }

    const tocIndex = roundData?.index ?? content?.index;
    const newTocState = pageContext.tocState;
    newTocState.push({
      index: tocIndex,
      status: isCorrect ? "correct" : "incorrect"
    });

    feedbackData = {
      class: isCorrect ? "correct" : "incorrect",
      message: isCorrect ? (roundData?.feedback?.correct?.text ?? content?.feedback?.correct?.text): (roundData?.feedback?.incorrect?.text ?? content?.feedback?.incorrect?.text),      
      audio: isCorrect? roundData?.feedback?.correct?.audio : pageContext.attemptGrade === 0  ? content?.hintAudio : roundData?.feedback?.incorrect?.audio,    
      canRetry: !isCorrect && pageContext.attemptGrade > 0,
      result: isCorrect ? "correct" : "incorrect",
      isCorrect: isCorrect,
      sfx: isCorrect ? CorrectSFX : IncorrectSFX
    };

    setFeedbackParams(feedbackData);
    return { feedbackData };
  };

  useEffect(() => {
    pageContext.setMissionNumber(content.gameId);
    if(currentRound===0){
      pageContext.setAttemptGrade(3);
    }
    if (isVisible) { 
      if(content.gameId === 3){
        loadBackgroundVideo("cover");
      }
      startTime.current = Date.now();    
      controls.start("animate");
    }else{
      controls.start("initial");
    }
  }, [isVisible ,currentRound]); 

  return (
    <div className={`mc-container w-100 component-container mc-container-game-${content.gameId}`}>
      <motion.div ref={containerRef} className="mc-wrapper w-100 component-content" variants={getAnimation("blurIn", 0.8, 0)} initial="initial" animate={controls}>
        {content.gameId === 1 && ( 
        <motion.div className="roundsCounter" variants={getAnimation("flipX", 0.6, 0.4)} initial="initial" animate={controls}>
					<ShowScoring />
				</motion.div> 
        )}
         <motion.div className="birdAndScore" variants={getAnimation("flipX", 0.6, 0.4)} initial="initial" animate={controls}>
					<ShowAttemptGrade />
				</motion.div> 
        <div className={`mc-game-container  mc-game-${content.gameId}`}>
          <motion.div className="mainQuestionHolderDiv">
            <motion.div className="mainQuestionHolder" variants={getAnimation("slideDown", 0.6, 0.4)} initial="initial" animate={controls}>
              <Row className="audio-help-container mb-0 mx-0">
                <Col className="d-flex align-items-center justify-content-start col-1 p-0">
                  <AudioWidget data={audioData} audioType="main-question" />
                </Col>
              </Row>
              <motion.div className="mainQuestion" dangerouslySetInnerHTML={{ __html: content.mainQuestion }} />
            </motion.div>
          </motion.div>
          <div className="mc-game-holder">
            <motion.div ref={containerRef} className="mc-content w-100" variants={getAnimation("blurIn", 0.8, 0)} initial="initial" animate={controls}>
              <motion.div className="option-col  d-flex " variants={getAnimation("slideLeft", 0.6, 0.9)} initial="initial" animate={controls}>
                <div className="mc-options">
                  {mcOptions.map((opt) => {
                    const isSelected = selected === opt.id;
                    const isCorrect = submitted && isSelected && opt.correct;
                    const isWrong = submitted && isSelected && !opt.correct;
                    return (
                      <button key={opt.id} className={`mc-option ${checked ? "checked" : ""} ${isSelected ? "selected" : ""} ${isCorrect ? "correct" : ""} ${isWrong ? "incorrect" : ""}    ${submitted ? "disabled" : ""}`}
                        onClick={() => {
                          setSelected(opt.id);
                          setAudioURL({ id: "optionClick", url: ButtonClickSFX, type: "sfx" });
                        }}            
                      >
                        {opt.text}
                        {opt.correct && submitted && isSelected && (
                          <>
                            <div className='symbolHolder'>
                              <CheckRounded className={`me-3`} /> 
                            </div>
                              <ShowCorrectStars />
                          </>
                        )}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            </motion.div>
            {selected && pageContext.attemptGrade !=0  && (
              <div className="feedback-container-holder">
                <Feedback
                  feedback={feedbackParams}
                  submitLimit={roundData?.submitLimit ?? content?.submitLimit}
                  handleSubmit={checkAnswers}
                  handleContinue={goToNextRound}
                  ref={feedbackSubmitButtonRef}
                />
              </div>
            )}  
            {content.gameId === 3 && (
              <motion.div className="round-progress" variants={getAnimation("scaleIn", 0.6, 1.7)} initial="initial" animate={controls}>
                {content.rounds.map((roundMap, roundIndex) => (
                  <div  className="dotAndLine" key={roundIndex}>
                    <div className={`round-dot ${ roundIndex < currentRound ? "completed" : roundIndex === currentRound ? "active" : ""}`}>
                      {roundIndex + 1}
                    </div>
                    {roundIndex < content.rounds.length - 1 && (
                      <div className={`round-line ${ roundIndex < currentRound ? "completed" : "" }`}/>
                    )}
                  </div>
                ))}
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>  
      {backgroundVideoData && 
        (() => {
          return (
            <video
              ref={backgroundVideoRef}
              className="videoSplashScreen"
              src={backgroundVideoData}
              poster={new URL(`../../../container/videos/mission3_question${currentRound + 1}_poster.png`, import.meta.url).href}
              autoPlay  
              muted  
              playsInline
              loop
            />
          );
        })()
      }
    </div>
  );
};

export default MultipleChoice;
