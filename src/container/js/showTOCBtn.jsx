import React, {useContext } from "react";
import { PageContext } from "./utilities/context";
import TOCBackButton from '../images/icons/back.svg?react'

const GoToTOCButton = ({ showResults }) => {
  const { tocState } = useContext(PageContext);
  const incorrectCount = Object.values(tocState).filter(
    (item) => item.status === "incorrect"
  ).length;

  const findStatusByIndex = (tocState, targetIndex) => {
    const item = Object.values(tocState).find(
      (el) => el.index === targetIndex
    );
    return item ? item.status : null;
  };

  const goToTOC = () => {
    const swiper = document.querySelector('#container-swiper')?.swiper;
    const status = findStatusByIndex(tocState, 3);
    if (!swiper) return;
    swiper.slideTo(1, 1);
  };

  return (
    <button aria-label="Go to TOC" className="show-TOC-button btn" onClick={goToTOC} >
      <TOCBackButton />
    </button>
  );
};

export default GoToTOCButton;