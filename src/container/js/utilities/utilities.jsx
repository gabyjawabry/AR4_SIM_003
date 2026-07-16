import React, { memo, useState, useEffect, useContext } from 'react';
import { LessonQuestion, LessonSlide } from './helper';
import { motion } from "framer-motion";
import { PageContext } from "./context";
import { SendAppState } from './logging';
import CorrectStars1 from "../../images/correct-stars-1.svg?react";
import CorrectStars2 from "../../images/correct-stars-2.svg?react";
import CorrectStars3 from "../../images/correct-stars-3.svg?react";
import CorrectStars4 from "../../images/correct-stars-4.svg?react";
import CorrectStars5 from "../../images/correct-stars-5.svg?react";
import CorrectStars6 from "../../images/correct-stars-6.svg?react";
import CorrectStars7 from "../../images/correct-stars-7.svg?react";
import CorrectStars8 from "../../images/correct-stars-8.svg?react";
import CorrectStars9 from "../../images/correct-stars-9.svg?react";

export const defaultScreenWidth = 1920;
export const defaultScreenHeight = 1080;

export function getAnimation(type = "fade", duration = 0.6, delay = 0, extra = {}) {
  const baseTransition = {
    duration,
    delay,
    ease: "easeInOut"
  };

  switch (type) {
    case "lightBeam":
      return {
          initial: {
            opacity: 0,
            y: 40,
            scale: 0.6,
            filter: "brightness(1.2) blur(2px)"
          },
          animate: {
            opacity: [0, 0.8, 1],
            y: [40, 0],
            scale: [0.6, 1.2, 1],
            filter: [
              "brightness(1.2) blur(20px)",
              "brightness(1.8) blur(50px)",
              "brightness(1.4) blur(0px)"
            ],
            transition: baseTransition
          },
      };    
    case "transformX": {
      const { startX, endX = 0 } = extra || {};

      const computedStartX = (startX !== undefined) ? startX : undefined;

      return {
        initial: { x: computedStartX, opacity:  1 },
        animate: { x: endX, opacity: 1, transition: baseTransition },
        exit: { x: computedStartX ?? 0, opacity: 1 },
        transition: baseTransition
      };
    }
    case "fade":
      return {
        initial: { opacity: 0 },
        animate: { opacity: 1, transition: baseTransition },
        exit: { opacity: 0 },
        transition: baseTransition
      };
    case "fadeOut":
      return {
        initial: { opacity: 1 },
        animate: { opacity: 0, transition: baseTransition },
        exit: { opacity: 0 },
        transition: baseTransition
      };
    case "fadeUp":
      return {
        initial: { y: 40, opacity: 0 },
        animate: { y: 0, opacity: 1,transition: baseTransition },
        transition: baseTransition
      };
    case "fadeDown":
      return {
        initial: { y: -40, opacity: 0 },
        animate: { y: 0, opacity: 1, transition: baseTransition },
        transition: baseTransition
      };
    case "slideUp":
      return {
        initial: { y: 80, opacity: 0 },
        animate: { y: 0, opacity: 1, transition: baseTransition },
        exit: { y: -80, opacity: 0 },
        transition: baseTransition
      };
    case "slideDown":
      return {
        initial: { y: -100, opacity: 0 },
        animate: { y: 0, opacity: 1, transition: baseTransition },
        exit: { y: 80, opacity: 0 },
        transition: baseTransition
      };
    case "slideLeft":
      return {
        initial: { x: 50, opacity: 0 },
        animate: { x: 0, opacity: 1, transition: baseTransition },
        exit: { x: -50, opacity: 0 },
        transition: baseTransition
      };
    case "slideRight":
      return {
        initial: { x: -100, opacity: 0 },
        animate: { x: 0, opacity: 1, transition: baseTransition },
        exit: { x: 100, opacity: 0 },
        transition: baseTransition
      };
    case "scaleIn":
      return {
        initial: { scale: 0.8, opacity: 0 },
        animate: { scale: 1, opacity: 1, transition: baseTransition },
        transition: baseTransition
      };
    case "scaleOut":
      return {
        initial: { scale: 1.2, opacity: 0 },
        animate: { scale: 1, opacity: 1, transition: baseTransition },
        transition: baseTransition
      };
    case "zoomIn":
      return {
        initial: { scale: 0, opacity: 0 },
        animate: { scale: 1, opacity: 1, transition: baseTransition },
        transition: baseTransition
      };
    case "zoomOut":
      return {
        initial: { scale: 1.5, opacity: 1 },
        animate: { scale: 0, opacity: 0, transition: baseTransition },
        transition: baseTransition
      };
    case "circleZoomIn":
      return {
        initial: { clipPath: "circle(0% at 50% 50%)", opacity: 0 },
        animate: { clipPath: "circle(150% at 50% 50%)", opacity: 1, transition: baseTransition },
        transition: baseTransition
      };
    case "circleZoomOut":
      return {
        initial: { clipPath: "circle(53% at 50% 50%)", opacity: 1 },
        animate: { clipPath: "circle(0% at 50% 50%)", opacity: 0, transition: baseTransition },
        transition: baseTransition
      };
    case "rotateIn":
      return {
        initial: { rotate: -180, opacity: 0 },
        animate: { rotate: 0, opacity: 1, transition: baseTransition },
        transition: baseTransition
      };
    case "rotateOut":
      return {
        initial: { rotate: 0, opacity: 1 },
        animate: { rotate: 180, opacity: 0, transition: baseTransition },
        transition: baseTransition
      };
    case "flipX":
      return {
        initial: { rotateX: -90, opacity: 0 },
        animate: { rotateX: 0, opacity: 1, transition: baseTransition },
        transition: baseTransition
      };
    case "flipY":
      return {
        initial: { rotateY: -90, opacity: 0 },
        animate: { rotateY: 0, opacity: 1, transition: baseTransition },
        transition: baseTransition
      };
    case "bounce":
      return {
        initial: { y: 0 },
        animate: {
          y: [0, -20, 0, -10, 0],
          opacity: [0, 1, 1, 1, 1],
          transition: { ...baseTransition, duration: duration + 0.5 }
        }
      };
    case "bounceInTop":
      return {
        initial: { y: -500, opacity: 0,},
        animate: {
          y: [ -500, 0, -65, 0, -28, 0, -8, 0 ],
          opacity: [ 0, 1, 1, 1, 1, 1, 1, 1 ],
          transition: {
            duration: 1.1,
            delay: delay || 0,
            times: [0, 0.38, 0.55, 0.72, 0.81, 0.9, 0.95, 1],
            ease: [
              "easeIn",   // 0% → 38%
              "easeOut",  // 38% → 55%
              "easeIn",   // 55% → 72%
              "easeOut",  // 72% → 81%
              "easeIn",   // 81% → 90%
              "easeOut",  // 90% → 95%
              "easeInOut" // 95% → 100%
            ],
          },
        },
      };
    case "animateStars":
      return {
        initial: { opacity: 1, y: 0 },
        animate: { opacity: 0, y: -100, transition: baseTransition },
        transition: baseTransition
      };
    case "rotateZoomIn":
      return {
        initial: { rotate: -180, scale: 0, opacity: 0 },
        animate: { rotate: 0, scale: 1, opacity: 1, transition: baseTransition },
        transition: baseTransition
      };
    case "expandIn":
      return {
        initial: { scale: 0, opacity: 0 },
        animate: {
          scale: [0, 1.3, 0.95, 1.1, 1],
          opacity: [0, 1, 1, 1, 1],
          //transition: { ...baseTransition, duration: duration || 0.8, ease: "easeOut" }
          transition: baseTransition
        }
      };
    case "blurIn":
      return {
        initial: { filter: "blur(10px)", opacity: 0 },
        animate: { filter: "blur(0px)", opacity: 1, transition: baseTransition },
        transition: baseTransition
      };
    case "screenOpener":
      return {
        initial: { clipPath: "circle(0% at 50% 50%)", opacity: 0 },
        animate: { clipPath: "circle(150% at 50% 50%)", opacity: 1, transition: baseTransition },
        exit: { clipPath: "circle(0% at 50% 50%)", opacity: 0 },
        transition: baseTransition
      };
    case "screenOpener_initial":
      return {
        initial: { clipPath: "circle(0% at 50% 50%)", opacity: 0 }
      };
    case "instructionsTitle":
      return {
        initial: { y: 300, opacity: 1 },
        animate: { y: 0, opacity: 1, transition: baseTransition },
      };
    default:
      return {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        transition: baseTransition
      };
  }
}
export function SearchJSON(jsondata, searchdata) { 
  let result = {};
  result = Object.fromEntries(Object.entries(jsondata).filter(([key]) => key === searchdata));
  return Object.values(result)[0];
}
export function GetLessonComponent(componentName) {
  switch (componentName) {
    case "question":
      return LessonQuestion;
    case "slide":
      return LessonSlide;
    default:
      return null;
  }
}
export function GetScale() {
  let scaleX = window.innerWidth / 1920;
  let scaleY = window.innerHeight / 1080;
  return Math.min(scaleX, scaleY);
}
export async function GetWidget(widgetName) {
  try {
    const templateModule = await import(`../../../widgets/${widgetName}/js/${widgetName}.jsx`);
    return templateModule.default;
  } catch (error) {
    console.error(`Error loading widget "${widgetName}":`, error);
    return null;
  }
}
export function FilterSection(section, type) {
  let obj = {};
  const filter = section.filter(element => element.type === type);
  if (filter.length > 0) {
    obj.id = filter[0].id;
    obj.result = type === "html"
      ? filter[0].result.data.content
      : filter[0].result.data;
  } else {
    obj.id = "";
    obj.result = "";
  }
  return obj;
}
export function mergeObjects(dst, src) {
  Object.keys(src).forEach((key) => {
    if (!dst[key]) {
      dst[key] = src[key];
    } else if (
      typeof src[key] === 'object' &&
      src[key] !== null &&
      typeof dst[key] === 'object' &&
      dst[key] !== null
    ) {
      mergeObjects(dst[key], src[key]);
    }
  });
  return dst;
};
export function debounce(fn, ms) {
  let timer;
  return (_) => {
    clearTimeout(timer);
    timer = setTimeout((_) => {
      timer = null;
      fn.apply(this, arguments);
    }, ms);
  };
}
export function shuffle(arr) {
    return arr.sort(() => Math.random() - 0.5);
}

export function chooseUniqueItems(array, n) {
  // Prevent requesting more items than available
  if (n > array.length) {
    throw new Error("n cannot be greater than array length");
  }

  const shuffled = [...array];

  // Fisher-Yates shuffle
  for (let i = shuffled.length - 1; i > 0; i--) {
    const randomIndex = Math.floor(Math.random() * (i + 1));

    [shuffled[i], shuffled[randomIndex]] = [
      shuffled[randomIndex],
      shuffled[i],
    ];
  }

  return shuffled.slice(0, n);
}




export const ShowCorrectStars = memo(() => {
  return (
    <motion.div className="stars-animation-container" {...getAnimation("circleZoomOut", 0.5, 1.3)}>
      <motion.div className="stars-animation" {...getAnimation("slideUp", 0.3, 0)}>
        <CorrectStars7 />
      </motion.div>
      <motion.div className="stars-animation" {...getAnimation("slideUp", 0.3, 0.1)}>
        <CorrectStars9 />
      </motion.div>
      <motion.div className="stars-animation" {...getAnimation("slideUp", 0.3, 0.2)}>
        <CorrectStars8 />
      </motion.div>
      <motion.div className="stars-animation" {...getAnimation("slideUp", 0.3, 0.4)}>
        <CorrectStars6 />
      </motion.div>
      <motion.div className="stars-animation" {...getAnimation("rotateZoomIn", 0.3, 0.3)}>
        <CorrectStars2 />
      </motion.div>
      <motion.div className="stars-animation" {...getAnimation("rotateZoomIn", 0.3, 0.4)}>
        <CorrectStars3 />
      </motion.div>
      <motion.div className="stars-animation" {...getAnimation("rotateZoomIn", 0.3, 0.5)}>
        <CorrectStars5 />
      </motion.div>
      <motion.div className="stars-animation" {...getAnimation("rotateZoomIn", 0.3, 0.6)}>
        <CorrectStars4 />
      </motion.div>
      <motion.div className="stars-animation" {...getAnimation("rotateZoomIn", 0.3, 0.7)}>
        <CorrectStars1 />
      </motion.div>
    </motion.div>
  );
});
export function triggerAnimations(container = document) {
  const animElems = container.querySelectorAll('[data-animation]');
  
  animElems.forEach(el => {
    const animation = el.dataset.animation;
    const duration = el.dataset.duration || 1;
    const delay = el.dataset.delay || 0;
    
    // Reset state before restarting animation
    el.style.animation = 'none';
    void el.offsetWidth; // force reflow to restart animation

    el.style.animation = `${animation} ${duration}s ease ${delay}s forwards`;
  });
}
export const useIsVisible = (ref) => {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setVisible(entry.isIntersecting);
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return visible;
};
export const getWidgetState = (pageContext, widgetId) => {
  const appState = pageContext?.appCurrentState;
  if (!appState) return null;
  const rootState = appState.current ?? appState;
  return rootState?.currentState[widgetId] ?? null;
};
export const saveWidgetState = (pageContext, widgetId, state, sendAppState = false) => {
  const appState = pageContext?.appCurrentState;
  if (!appState) return;
  const rootState = appState.current ?? appState;
  if (!rootState) return;
  rootState.currentState[widgetId] = { ...(rootState.currentState[widgetId] || {}), ...state };
  if (sendAppState) {
    SendAppState('appState', rootState);
  }
};
export const getAppState = (pageContext) => {
  const appState = pageContext?.appCurrentState;
  if (!appState) return null;
  const rootState = appState.current ?? appState;
  return rootState ?? null;
};
export const saveAppState = (pageContext, state, sendAppState = false) => {
  const appState = pageContext?.appCurrentState;
  if (!appState) return;
  const rootState = appState.current ?? appState;
  if (!rootState) return;
  Object.assign(rootState, state);
  if (sendAppState) {
    SendAppState('appState', rootState);
  }
};