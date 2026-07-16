import React, { forwardRef, useImperativeHandle, useState, useEffect, useContext } from 'react';
import { FormattedMessage, useIntl } from "react-intl";
import { Button } from 'react-bootstrap';
import { useSwiper } from 'swiper/react';
import correctSoundEffect from '../audio/correct.mp3';
import incorrectSoundEffect from '../audio/wrong.mp3';
import { PageContext } from "./utilities/context";
import '../css/Feedback.scss';
import { motion, useAnimation } from "framer-motion";
import { getAnimation } from "./utilities/utilities";
import AudioWidget from "./audioWidget";
import { useEventSender } from './utilities/logging';

const Feedback = forwardRef(({ feedback, submitLimit, handleSubmit, handleContinue }, ref) => {
  const intl = useIntl();
  const [submitText, setSubmitText] = useState(intl.formatMessage({id: 'feedback.submit'}));
  const [submitAction, setSubmitAction] = useState('Submit');
  const [submitButtonState, setSubmitButtonState] = useState(false);
  const [localSubmitCount, setLocalSubmitCount] = useState(0);
  const [showSplash, setShowSplash] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const { setAudioURL, studentGrade, stopAudio } = useContext(PageContext);
  const swiper = useSwiper();
  const sendEvent = useEventSender();

  useImperativeHandle(ref, () => ({
    disableSubmitButton(enable) {
      setSubmitButtonState(enable);
    },
    handleSubmitButton() {
      handleFeedbackClick('Submit');
    }
  }));

  useEffect(() => {
    if (feedback?.restored) {
      setSubmitText(intl.formatMessage({id: 'feedback.continue'}));
      setSubmitAction('continue');
    }
  }, [feedback?.restored, intl]);

  const handleFeedbackClick = async (action) => {
    let count = localSubmitCount;
    if (action === 'Submit') {
      count++;
      setLocalSubmitCount(count);

      const result = await handleSubmit('Submit');

      const isCorrect = result.feedbackData.isCorrect ?? false;

      setIsCorrect(isCorrect);

      const logEvent = {
        answers: result.feedbackData.answers,
        result: result.feedbackData.result,
        attempt: 1,
        timeSpent: {
          activeTime: result.feedbackData.startTime,
          idleTime: Date.now() - result.feedbackData.startTime,
          totalTime: Date.now()
        }
      };

      sendEvent('submit-answer', logEvent);

      if (isCorrect) {
        setAudioURL({ id: "correctSFX", url: correctSoundEffect, type: "sfx"}, () => {
          setAudioURL({ id: "correctFeedback", url: result.feedbackData.audio, type: "correctFeedback" });
        });

        setSubmitText(intl.formatMessage({ id: 'feedback.continue' }));
        setSubmitAction('continue');
      } else {
        setAudioURL({ id: "wrong", url: incorrectSoundEffect, type: "sfx" }, () => {
          setAudioURL({ id: "incorrectFeedback", url: result.feedbackData.audio, type: "incorrectFeedback" });
        });

        if (result.feedbackData.canRetry && submitLimit && count < submitLimit) {
          setSubmitText(intl.formatMessage({ id: 'feedback.tryagain' }));
          setSubmitAction('tryagain');
        } else {
          setSubmitText(intl.formatMessage({ id: 'feedback.continue' }));
          setSubmitAction('continue');
        }
      }
    }else if (action === 'continue' && handleContinue) {
      stopAudio();
      handleContinue();
    }else if (action === 'tryagain') {
      stopAudio();
      setLocalSubmitCount(0);
      setSubmitText(intl.formatMessage({id: 'feedback.submit'}));
      setSubmitAction('Submit');
      handleSubmit('tryagain');
     }
  };

  const handleClick = (e) => {
    const action = e.currentTarget.getAttribute('data-value');
    handleFeedbackClick(action);
  };

  return (<>
    <div className="feedback-container">
      {feedback.class && feedback.message && (
        <motion.div className={`${feedback.class} feedback-banner`} {...getAnimation("slideUp", 0.6, 0)}>
          <div className="feedback-text" dangerouslySetInnerHTML={{ __html: feedback.message }} />
        </motion.div>
      )}
      {!showSplash && (
        <motion.div className="btnContainer" {...getAnimation("expandIn", 0.6, 0)}>
          <Button disabled={submitButtonState} variant="primary" size="sm" data-value={submitAction} onClick={handleClick}>
            {submitText}
          </Button>
        </motion.div>
       )}
    </div>
    </>
  );
});

export default Feedback;
