import React, { useState, useEffect, useContext, useRef  } from "react";
import { FormattedMessage } from "react-intl";
import LightbulbRounded from '../images/icons/hint.svg?react';
import { motion } from "framer-motion";
import { Button } from 'react-bootstrap';
import { getAnimation } from "./utilities/utilities";
import { PageContext } from "./utilities/context";
import AudioWidget from "./audioWidget";
import HintOpenSFX from '../audio/open.mp3';
import HintCloseSFX from '../audio/close.mp3';
import VideoPlayer from "../../widgets/videoPlayer/js/videoPlayer.jsx";
import Replay from '../images/icons/replay_hint.svg?react';

const HintButton = () => {
  const [showHint, setShowHint] = useState(false);
  const [renderHint, setRenderHint] = useState(false);
  const [showReplay, setShowReplay] = useState(false);
  const videoPlayerRef = useRef();
  const { setAudioURL, stopAudio } = useContext(PageContext);

  const handleReplay = () => {
   window.location.reload(true);
  };

  const handleVideoEnd = () => {  
    setShowReplay(true);
  }

  useEffect(() => {
    //videoPlayerRef.current?.playVideo();
  }, []);

  const videoParams = {
    videoData: {
      url: "../videos/hintScreen/AR4_SIM_030_Hint.mp4",
      poster: "../videos/hintScreen/AR4_SIM_030_Hint_poster.png",
      autoplay: false,
      preview: false,
      showEndOverlay: false,
      controls: {
        control_bar: true,
        cc: false,
        show_duration: false,
        show_time: false,
        volume_control: true,
        seekbar: true,
        fullscreen: true,
        video_speed: true,
      }
    }
  };

  const openHint = () => {
    setAudioURL({ id: "hintOpen", url: HintOpenSFX, type: "sfx" });
    if (!showHint) {
      setShowReplay(false);
      setRenderHint(true);
      setShowHint(true);
    }
  };

  const closeHint = () => {
    stopAudio();
    setAudioURL({ id: "hintClose", url: HintCloseSFX, type: "sfx" });
    setRenderHint(false);
    setTimeout(() => setShowHint(false), 1500);
  };

  return (
    <>
      <Button aria-label="Open hint" className={`show-hint-button btn ${showHint ? 'hintBtnSelected' : ''}`} onClick={openHint}>
        <LightbulbRounded />
        <FormattedMessage id='hint.needhelp' />
        
      </Button>

      {showHint && (
        <motion.div className="hint-button hint-button-text" {...(renderHint ? getAnimation("fade", 0.4, 0) : getAnimation("fadeOut", 0.4, 0.7))}>
          <div className='hint-holder'>
            <motion.div {...(renderHint ? getAnimation("zoomIn", 0.6, 0.5) : getAnimation("zoomOut", 0.4, 0))} className="hint-content">
              <button className="hint-close-btn" aria-label="Close hint" onClick={closeHint}>×</button>

              <VideoPlayer className="videoWithDND"
                parameters={videoParams}
                onEnded={handleVideoEnd}
                ref={videoPlayerRef}
              />

              {showReplay && (
                <motion.div className="replay-btn-holder" {...getAnimation("expandIn", 0.5, 0)}>
                  <button className="replay-btn" onClick={handleReplay}> 
                    <Replay />
                  </button>
                </motion.div>
              )}

            </motion.div>
          </div>
        </motion.div>
      )}
    </>
  );
};

export default HintButton;
