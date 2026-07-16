import React, { useRef, useEffect, useState, useContext } from 'react';
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { Button } from 'react-bootstrap';
import { FormattedMessage } from "react-intl";
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import { PageContext } from "../../../container/js/utilities/context";
import { getAnimation } from "../../../container/js/utilities/utilities";
import '../css/videoPlayer.scss';
import { preloadAnimationsDuringIdle } from '../../../container/js/utilities/helper';
import { useEventSender } from '../../../container/js/utilities/logging';

const videos = import.meta.glob('../videos/*.mp4', { eager: true });

function getVideoUrl(nameOrPath) {
  const path = nameOrPath.endsWith('.mp4')
    ? `../videos/${nameOrPath}`
    : `../videos/${nameOrPath}.mp4`;

  return videos[path]?.default || nameOrPath; 
}

function useIsVisible(ref) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.5 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => {
      if (ref.current) observer.unobserve(ref.current);
    };
  }, [ref]);

  return isVisible;
}

const VideoPlayer = ({ parameters: propsParams, onEnded, onLoad, onPlay,onTimeUpdate }) => {

  const defaults = {
    id: '',
    videoData: {
      url: '',
      mainQuestion: "",
      adurl: '',
      poster: '',
      autoplay: false,
      controls: {
        control_bar: true,
        cc: false,
        show_duration: false,
        show_time: true,
        volume_control: true,
        seekbar: true,
        download: false,
        audio_description: false,
        fullscreen: true,
        transcript: false,
        video_speed: false,
      },
    },
  };

  const parameters = { ...defaults, ...propsParams };
  const resolvedVideoUrl = getVideoUrl(parameters.videoData.url);
  const [showOverlayOnVideoEnd, setshowOverlayOnVideoEnd] = useState(false);
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const currentTimeRef = useRef(null);
  const durationRef = useRef(null);
  const playerRef = useRef(null);
  const isVisible = useIsVisible(containerRef);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const { setAudioURL, stopAudio, setSimulationStartTime } = useContext(PageContext);
  const [playerElement, setPlayerElement] = useState(null);
  const [videoStarted, setVideoStarted] = useState(false);
  const overlayShownRef = useRef(false);
  const introVideoFirstPlayRef = useRef(false);
  const introAnimationsPreloaded = useRef(false);
  const showEndOverlay = parameters.videoData.showEndOverlay;
  const overlayAudio = parameters.videoData.overlayAudio;
  const overlayData = parameters.videoData.overlayData;
  const sendEvent = useEventSender();
  const [clipPath, setClipPath] = useState("");
  const [showTransparentOverlay, setShowTransparentOverlay] = useState(false);
  let previewMode = parameters.videoData.preview;
  const videoJsOptions = {
    autoplay: parameters.videoData.autoplay,
    controls: true,
    responsive: true,
    poster: parameters.videoData.poster,
    sources: [
      {
        src: resolvedVideoUrl,
        type: 'video/mp4',
      },
    ],
  };

  useEffect(() => {
    
    if (!overlayData?.pathCoordinates) {
      setClipPath("");
      return;
    }
    const polygon = overlayData.pathCoordinates
      .split(",")
      .reduce((points, value, index, arr) => {
        if (index % 2 === 0) {
          points.push(`${arr[index]}px ${arr[index + 1]}px`);
        }
        return points;
      }, [])
      .join(",");

    setClipPath(polygon);

  }, [overlayData]);


  useEffect(() => {
    if (!isVisible) return;

    const videoElement = videoRef.current;

    if (!videoElement || !document.body.contains(videoElement)) return;

    const player = videojs(videoElement, videoJsOptions);

    setPlayerElement(player.el());

    playerRef.current = player;

    player.ready(() => {
      player.off('click');
      player.tech(true).off('click');
      const tech = player.tech(true);
      if (tech?.el()) {
        tech.el().addEventListener('dblclick', (e) => {
          e.preventDefault();
          e.stopPropagation();
        });
      }
      if (player.boundHandleTechDoubleClick_) {
        player.off(tech, 'dblclick', player.boundHandleTechDoubleClick_);
      }
      if(!videoStarted) player.load();
    });

    player.on('loadedmetadata', () => {
      player.on('timeupdate', () => {
        const currentTime = player.currentTime();
          onTimeUpdate?.(currentTime);

          const showTime = overlayData?.timeToShow;
          const audioToPlay = overlayData?.audioToPlay;

          if(showTime && currentTime >= showTime && !overlayShownRef.current){
            setShowTransparentOverlay(true);
            player.pause();
            overlayShownRef.current = true;
            setAudioURL({ id: "overlayAudio1", url: audioToPlay, type: "overlayAudio" });
          }


        const duration = player.duration();
        if (currentTimeRef.current) {
          currentTimeRef.current.textContent = formatTime(currentTime);
        }
        if (durationRef.current) {
          durationRef.current.textContent = formatTime(duration);
        }
      });

      player.on('play', () => {
        if(videoStarted) stopAudio();
        setshowOverlayOnVideoEnd(false);
        setIsPlaying(true);
        if (typeof onPlay === 'function') onPlay();

        if(parameters.videoData.id === "introVideo" && !introVideoFirstPlayRef.current){
          introVideoFirstPlayRef.current = true;
          setSimulationStartTime();
          sendEvent('simulation-started', {});
        }
          
        if(!previewMode)
          sendEvent('play', { 
            mediaId: parameters.videoData.id, 
            mediaType: 'video', 
            playing: true, 
            url: parameters.videoData.url
          });
      });

      player.on('pause', () => {
        setIsPlaying(false);

        if(!previewMode)
          sendEvent('pause', { 
            mediaId: parameters.videoData.id, 
            mediaType: 'video', 
            playing: false, 
            url: parameters.videoData.url
          });
      });

      //let previewMode = false;
      if (!previewMode) return;
      player.muted(true);
      player.controls(false);
      player.play();

      const el = player.el();
      const bigPlayButton = el.querySelector(".vjs-big-play-button");

      if (bigPlayButton) {
        bigPlayButton.style.display = "block";
      }

      const interval = setInterval(() => {
          if (!previewMode) return;

          if (player.currentTime() >= 5) {
            player.currentTime(0);
          }
      }, 100);

      const handleBigPlay = () => {
        previewMode = false;

        clearInterval(interval);

        player.currentTime(0);

        player.muted(false);
        player.controls(true);

        player.play();

        sendEvent('play', { 
          mediaId: parameters.videoData.id, 
          mediaType: 'video', 
          playing: true, 
          url: parameters.videoData.url
        });

        setVideoStarted(true);
        bigPlayButton.style.display = "none";
      };

      bigPlayButton.removeEventListener("click", handleBigPlay);
      bigPlayButton.addEventListener("click", handleBigPlay);
      
    });
    player.on('volumechange', () => setIsMuted(player.muted()));
    player.on('ended', () => {
      setIsPlaying(false);
      setshowOverlayOnVideoEnd(true); 
      if (typeof onEnded === 'function') onEnded();
      if(showEndOverlay && overlayAudio){
        setAudioURL({ id: "overlayAudio2", url: overlayAudio, type: "overlayAudio" });
      }
    });
    player.on('loadeddata', () => {
      if (typeof onLoad === 'function') onLoad();
    });

    // Control bar customizations
    const controlBar = player.controlBar;
    const controls = parameters.videoData.controls;
    if (!controls.control_bar) controlBar.hide();
    if (!controls.seekbar) controlBar.removeChild('ProgressControl');
    if (!controls.show_time) {
      controlBar.removeChild('CurrentTimeDisplay');
      controlBar.removeChild('TimeDivider');
    }
    if (!controls.show_duration) {
      controlBar.removeChild('DurationDisplay');
      controlBar.removeChild('TimeDivider');
    }
    if (!controls.volume_control) controlBar.removeChild('VolumePanel');

    const rhsControls = document.createElement('div');
    rhsControls.className = 'rhsControls';
    const audioTrackBtn = controlBar.getChild('AudioTrackButton');
    controlBar.el().insertBefore(rhsControls, audioTrackBtn?.el()?.nextSibling);

    if (controls.fullscreen) {
      const fsBtn = controlBar.getChild('FullscreenToggle');
      if (fsBtn) rhsControls.appendChild(fsBtn.el());
    } else {
      controlBar.removeChild('FullscreenToggle');
    }

    // return () => {
    //   player.dispose();
    //   playerRef.current = null;

    // };
    
    if (parameters.videoData.id === "introVideo" && !introAnimationsPreloaded.current) {
      introAnimationsPreloaded.current = true;
      preloadAnimationsDuringIdle();
    }
  }, [isVisible]);

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${padTime(minutes)}:${padTime(seconds)}`;
  };

  const padTime = (num) => String(num).padStart(2, '0');

  const playPauseBtn = () => {
    const player = playerRef.current;
    if (!player) return;  
      setshowOverlayOnVideoEnd(false);
    if (player.paused()) {
      player.play();
    } else {
      player.pause();
    }
  }; 
  const muteUnmuteAudioBtn = () => {
    const player = playerRef.current;
    if (!player) return;
    player.muted(!player.muted());
  };
  const skipVideoBtn = () => {
    stopAudio();
    const player = playerRef.current;
    if (!player) return;
    if (player.isFullscreen()) {
      player.exitFullscreen();
    }
    // if (player.paused()) player.play();
    // player.currentTime(player.duration());
    const swiper = document.querySelector('#container-swiper')?.swiper;
    if (swiper) swiper.slideNext(1);

  };

  return (
    <div ref={containerRef} className="video-player wrapper" id={parameters.id} tabIndex={0}>
      {parameters.videoData.mainQuestion && (
        <div className="mainQuestion">{parameters.videoData.mainQuestion}</div>
      )}
      <div className="video-component-content">
        <div className="video-wrapper">
          <div data-vjs-player className="video-main-container">
            <div className="video-container vjs-big-play-centered">
              <video ref={videoRef} className="video-js vjs-default-skin" controls />
            </div>
            <div className="vjs-time-container">
              <div className="vjs-current-time vjs-hidden" ref={currentTimeRef}>00:00</div>
              <div className="vjs-duration vjs-hidden" ref={durationRef}>00:00</div>
            </div>
            {playerElement && createPortal(
              showEndOverlay && showOverlayOnVideoEnd && (
                <div className='video-end-overlay-wrapper'>
                  <motion.div {...getAnimation("expandIn", 0.4, 1)} className="video-end-overlay">
                    <div className='video-end-overlay-text' dangerouslySetInnerHTML={{ __html: parameters.videoData.overlayText }} >
                      {/* <FormattedMessage id='splashScreen.text' /> */}
                    </div>
                    <Button className="skip-btn" onClick={skipVideoBtn}>
                      <FormattedMessage id='splashScreen.start' />
                    </Button>
                  </motion.div>
                </div>
              ),
              playerElement
            )}
            {parameters.videoData.transparentOverlay && showTransparentOverlay && clipPath && (
              <div
                className="overlayShape"
                style={{
                  clipPath: `polygon(${clipPath})`,
                  fill: 'rgba(255, 0, 0, 0.5)'
                }}
                onClick={() => {
                  setShowTransparentOverlay(false);
                  const player = playerRef.current;
                  if (!player) return;
                  if (player.paused()) {
                    player.play();
                  }
                }}

              />
            )}
            {parameters.videoData.showVideoControls && (
              <div className='controlBtnsWrapper'>
                {/* Play / Pause */}
                <Button className='playPauseBtn' onClick={playPauseBtn}>
                  {isPlaying ? (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 30" fill="currentColor">
                      <rect x="6.24" y="4.87" width="5.26" height="20.27" rx="1.98" ry="1.98"/>
                      <rect x="18.5" y="4.87" width="5.26" height="20.27" rx="1.98" ry="1.98"/>
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 30" fill="currentColor">
                      <path className="cls-1" d="m22.63,13.17c.65.39,1.04,1.08,1.04,1.83s-.39,1.44-1.04,1.79l-13,7.86c-.67.44-1.51.46-2.19.08-.68-.38-1.11-1.09-1.11-1.87V7.14c0-.78.42-1.49,1.11-1.87.68-.38,1.52-.36,2.19.04l13,7.86Z"/>
                    </svg>
                  )}
                </Button>

                {/* Mute / Unmute */}
                <Button className='muteUnmuteAudio' onClick={muteUnmuteAudioBtn}>
                  {isMuted ? (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 30" fill="currentColor">
                      <path d="m11.23,10.33l4.53-4.53c.76-.76,2.09-.23,2.09.86v17.11c0,1.09-1.32,1.63-2.09.86l-4.53-4.53h-5.2c-.68,0-1.22-.55-1.22-1.22v-7.33c0-.68.55-1.22,1.22-1.22h5.2Z"/>
                      <rect x="13.02" y="-3.68" width="3.96" height="37.35" rx="1.98" ry="1.98" transform="translate(15 -6.21) rotate(45)"/>
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 30" fill="currentColor">
                      <path d="m21.46,3.33c.37-.57,1.14-.73,1.71-.35,4.07,2.67,6.5,7.17,6.5,12.02s-2.43,9.35-6.5,12.02c-.59.39-1.35.19-1.71-.35-.37-.57-.21-1.33.35-1.71,3.38-2.21,5.39-5.94,5.39-9.96s-2.01-7.75-5.39-9.96c-.57-.37-.73-1.14-.35-1.71Zm-14.71,6.78l4.53-4.53c.76-.76,2.09-.23,2.09.86v17.11c0,1.09-1.32,1.63-2.09.86l-4.53-4.53H1.56c-.68,0-1.22-.55-1.22-1.22v-7.33c0-.68.55-1.22,1.22-1.22h5.2Zm18.02,4.89c0-3.24-1.63-6.21-4.37-7.96-.57-.36-1.33-.19-1.69.38s-.19,1.33.38,1.7c2.02,1.29,3.23,3.49,3.23,5.88s-1.21,4.58-3.23,5.88c-.57.36-.74,1.12-.38,1.7.33.53,1.08.77,1.69.38,2.73-1.75,4.37-4.72,4.37-7.96Zm-8.88-3.43c.33-.59,1.07-.8,1.66-.48,1.44.79,2.33,2.29,2.33,3.91s-.89,3.12-2.33,3.92c-.59.32-1.33.11-1.66-.48-.33-.59-.11-1.33.48-1.66.66-.36,1.07-1.04,1.07-1.77s-.41-1.41-1.07-1.77c-.59-.33-.81-1.07-.48-1.66Z"/>
                    </svg>
                  )}
                </Button>

                {/* Skip */}
                {/* <Button className='skipVideo' onClick={skipVideoBtn}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 30" fill="currentColor">
                    <path className="cls-1" d="m25.86,6.84v16.31c0,1.09-.88,1.98-1.98,1.98h-1.3c-1.09,0-1.98-.89-1.98-1.98v-6.34s-.11.08-.17.11l-13,7.86c-.67.44-1.5.46-2.19.08-.68-.38-1.1-1.09-1.1-1.87V7.28c0-.77.42-1.49,1.1-1.87.69-.38,1.52-.36,2.19.04l13,7.86c.06.04.12.07.17.12v-6.58c0-1.09.89-1.98,1.98-1.98h1.3c1.1,0,1.98.89,1.98,1.98Z"/>
                  </svg>
                </Button> */}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
