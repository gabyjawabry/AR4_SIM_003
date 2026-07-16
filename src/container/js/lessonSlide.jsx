import React, { useContext, useState } from 'react';
import { SlideData } from './utilities/helper';
import LessonQuestion from './lessonQuestion';
import { SearchJSON, getAnimation } from './utilities/utilities';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Keyboard } from 'swiper/modules';
import { PageContext } from './utilities/context';
import { motion } from 'framer-motion';

import 'swiper/css';
import 'swiper/css/effect-fade';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

const pagination = {
  clickable: false,
  renderBullet: function (index, className) {
    return '<span class="' + className + '"><span class="swiper-pagination-inner-bullet"></span></span>';
  },
};

const LessonSlide = (props) => {
  const slide = SearchJSON(SlideData.slide, props.id);
  const slideItems = slide ? slide.items : [];
  const showNavigation = slide?.show_navigation;
  const animation = slide?.animation;
  const showTitle = slide?.show_title;
  const tocIndex = props.tocIndex;
  const pageContext = useContext(PageContext);
  const [activeIndex, setActiveIndex] = useState(0);
  const tocState = props.tocState || {};

  const swiperSlideChange = (e) => {
    const newIndex = e.activeIndex;

    setActiveIndex(newIndex);

    pageContext?.setActiveSlide?.(newIndex);

    // Pause all videos
    const allVideos = document.querySelectorAll('video');
    allVideos.forEach((video) => {
      if (!video.paused && !video.ended && video.readyState > 2) {
        video.pause();
      }
    });
  }

  const swiperSlideChangeTransitionEnd = (e) => {
    const activeSlide = e.slides[e.activeIndex];

    const audioButton = document.querySelector(
      '#' + activeSlide.id + ' .audio-help-container button'
    );

    if (audioButton) audioButton.focus();
  };

  const handleFocus = (e) => {
    const swiper = document.querySelector('#container-swiper')?.swiper;
    if (!swiper) return;

    const slideEl = e.target.closest(`.${swiper.params.slideClass}, swiper-slide`);

    if (!slideEl || !swiper.slides.includes(slideEl)) return;
    if (e.sourceCapabilities && e.sourceCapabilities.firesTouchEvents) return;

    if (swiper.isHorizontal()) swiper.el.scrollLeft = 0;
    else swiper.el.scrollTop = 0;

    swiper.slideTo(swiper.activeIndex, 0);

    const activeSlideId = swiper.slides[swiper.activeIndex].getAttribute('id');

    const audioButton =
      document.querySelector('#' + activeSlideId + ' .audio-help-container button') ||
      document.querySelector('#' + activeSlideId);

    if (audioButton) audioButton.focus();
  };

  const swiperInit = (e) => {
    //e.el.addEventListener('focus', handleFocus, true);
  };

  return (
    <Row id={props.id} className="h-100 swiper-container p-0 m-0">
      {slideItems.length > 0 ? (
        <Swiper
          id="container-swiper"
          observer={true}
          observeParents={true}
          autoHeight={false}
          allowTouchMove={false}
          onSlideChange={swiperSlideChange}
          onSlideChangeTransitionEnd={swiperSlideChangeTransitionEnd}
          onSwiper={swiperInit}
          effect={animation}
          keyboard={{ enabled: false }}
          pagination={showNavigation ? pagination : false}
          navigation={false}
          modules={[Keyboard, Pagination, Navigation]}
          className="mySwiper h-100"
          data-showtitle={showTitle}
          watchSlidesProgress={true}>
          {slideItems.map((item, i) => (
            <SwiperSlide
              key={`slide-${i}`}
              tabIndex={0}
              id={`${props.id}-${item.slide_id}`}
              data-title={item.title}
              data-mainquestion={item.mainQuestion}
              data-right-title={item.rightTitle}
              className="pt-0"
            >
              <motion.div
                {...(activeIndex === i
                  ? getAnimation("screenOpener", 1, 0)
                  : getAnimation("screenOpener_initial", 1, 0))}
                className="swiper-slide-motion-wrapper"
              >
                <LessonQuestion
                  id={item.content[0].component_id}
                  slideIndex={tocIndex}
                  tocState={tocState}
                  className="swiper-slide-section px-3 pt-3 pb-sm-4 pb-3"
                />
              </motion.div>
            </SwiperSlide>
          ))}
        </Swiper>
      ) : (
        <Col></Col>
      )}
    </Row>
  );
};

export default LessonSlide;