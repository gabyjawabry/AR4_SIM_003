import React, { useContext, useState, useEffect} from 'react';
import VolumeUpRounded from "../images/icons/audio.svg?react";
import VolumeDownRounded from "../images/icons/audio_down.svg?react";
import { PageContext } from './utilities/context';
import { Button, Col } from 'react-bootstrap';
import '../css/audioWidget.scss';

const AudioWidget = (props) => {
  const { setAudioURL, audioWidgetAudioData } = useContext(PageContext);
  const { data, audioType } = props;
  const autoplayAudio = data.autoplay;

  const audioPlaying = audioWidgetAudioData ? audioWidgetAudioData.id === data.id && audioWidgetAudioData.playing : false; 

  const handlePlay = () => {
    const audioData = {
      id: data.id,
      url: data.url,
      type: audioType
    };
    setAudioURL(audioData);
  };

  return (
    <Col
      className="audio-icon-container ps-0 align-items-start col-auto"
      data-type={audioType}
      data-audiourl={data.url}
      data-autoplay={autoplayAudio}
      data-id={data.id || 0}
    >
      <Button className="cursor-pointer btn p-0" onClick={handlePlay}>
        {audioPlaying ? <VolumeUpRounded style={{ width: "50px", height: "50px" }} /> : <VolumeDownRounded style={{ width: "50px", height: "50px" }} />}
      </Button>
    </Col>
  );
};

export default AudioWidget;
