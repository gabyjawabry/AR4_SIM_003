import { motion, useAnimation, useScroll } from "framer-motion";
import { useContext, useEffect, useState, useRef  } from 'react';
import { FormattedMessage } from "react-intl";
import '../css/resultsScreen.scss';
import { getAnimation, useIsVisible } from "../../../container/js/utilities/utilities";
import { PageContext } from "../../../container/js/utilities/context";
import VideoPlayer from "../../videoPlayer/js/videoPlayer.jsx";
import Replay from '../../../container/images/icons/replay.svg?react';

const ResultsScreen = ({parameters}) => {
  const { content } = parameters;
  const controls = useAnimation();
  const { tocState, setAudioURL, stopAudio } = useContext(PageContext);
  const containerRef = useRef(null);
  const isVisible = useIsVisible(containerRef); 
  const [showReplay, setShowReplay] = useState(false);
  const videoPlayerRef = useRef();

  const videoParams = {
    videoData: {
      url: content.videoUrl,
      poster: content.videoPoster,
      autoplay: true,
      preview: false,
      showEndOverlay: false,
      controls: {
        control_bar: false,
        cc: false,
        show_duration: false,
        show_time: false,
        volume_control: false,
        seekbar: false,
        fullscreen: false,
        video_speed: false,
      }
    }
  };

  const handleReplay = () => {
   window.location.reload(true);
  };

  const handleVideoEnd = () => {  
    setShowReplay(true);
  }

  useEffect(() => {
    if (isVisible) {
      controls.start("animate");
      videoPlayerRef.current?.playVideo();
    }
  }, [isVisible]);

  return (
    <div className="component-container w-100">
      <motion.div ref={containerRef} className="resultsScreen-container p-0 m-0 h-100 w-100" variants={getAnimation("blurIn", 0.8, 0)} initial="initial" animate={controls}>
        <div className="resultsScreen-content w-100">
          <VideoPlayer className="videoWithDND" parameters={videoParams} autoplay={isVisible} onEnded={handleVideoEnd} ref={videoPlayerRef}/>
        </div>
        {showReplay && (
          <motion.div className="replay-btn-holder" {...getAnimation("expandIn", 0.5, 0)}>
            <button className="replay-btn" onClick={handleReplay}> 
              <Replay />
            </button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default ResultsScreen;
