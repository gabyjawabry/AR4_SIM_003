import React, { useState, useEffect, useRef, useContext  } from 'react';
import "../css/dnd.scss";
import AudioWidget from '../../../container/js/audioWidget.jsx';
import { Col, Row } from 'react-bootstrap';
import { motion, useAnimation } from "framer-motion";
import DraggableItem from './DraggableItem.jsx';
import DropTextInline from './DropTextInline.jsx';
import ShowAttemptGrade from '../../../container/js/showAttemptGrade.jsx';
import ShowScoring from '../../../container/js/showScoring.jsx';
import HintButton from '../../../container/js/hintButton.jsx';
import { getAnimation, shuffle, useIsVisible } from "../../../container/js/utilities/utilities.jsx";
import { PageContext } from "../../../container/js/utilities/context.jsx";
import { DndContext, useDndMonitor } from '@dnd-kit/core';
import Feedback from '../../../container/js/feedback.jsx';
import DropSFX from '../sounds/drop.mp3';
import CorrectSFX from '../sounds/gauge_correct.mp3';
import IncorrectSFX from '../sounds/gauge_incorrect.mp3';
import { FormattedMessage } from "react-intl";

const DndInner = ({ droppableRefs, selectedAnswers, setSelectedAnswers, setActiveId, setUsedItems, usedItems }) => {
	const { setAudioURL, attemptGrade, missionNumber } = useContext(PageContext);
	useDndMonitor({
		onDragStart(e) {
			setActiveId(e.active.id);
		},
		onDragEnd(e) {
			setActiveId(null);
			if (!e.over) return;
			if (usedItems.includes(e.active.id)) return;
			const droppableIndex = e.over.data.current?.index;
			if (typeof droppableIndex !== "number") return;

			const droppable = droppableRefs.current[droppableIndex];
			if (!droppable) return;

			const oldItems = droppable.getDroppedItems?.() || [];

			if (oldItems.length > 0) {
				droppable.reset();

				setUsedItems(prev =>
					prev.filter(id => !oldItems.some(item => item.id === id))
				);
			}
			const dragData = e.active.data.current || {};
			const droppedItem = {
				id: e.active.id,
				value: dragData.value,
				type: dragData.type,
				dataIndex: dragData.dataIndex,
				droppableItem: {
					id: e.over.data.current?.id,
					index: e.over.data.current?.index
				} 
			};

			droppable.addDroppedItem(droppedItem);

			setAudioURL({id: "drop", url: DropSFX, type: "sfx"});

			setSelectedAnswers(prev => {
				const copy = [...prev];
				copy[droppableIndex] = e.active.id;
				return copy;
			});

			setUsedItems(prev => [...new Set([...prev, e.active.id])]);
		}
	});

	return null;
};

const dnd = ({ parameters, index, handleCheckAnswer }) => {
	const content = parameters?.content || {};
	const containerRef = useRef(null);
	const mainContainerRef = useRef(null);
	const controls = useAnimation();
	const isVisible = useIsVisible(containerRef);
	const [currentRound, setCurrentRound] = useState(0);
	const audioData = { url: content.mainQuestionAudio, autoplay: true, id: parameters.id || 0 };
	const pageContext = useContext(PageContext);
	const { attemptGrade, missionNumber, stopAudio } = useContext(PageContext);
	const [roundData, setRoundData] = useState(null);
	const [usedItems, setUsedItems] = useState([]);
	const [activeId, setActiveId] = useState(null);
	const [selectedAnswers, setSelectedAnswers] = useState([]);
	const [backgroundVideoData, setbackgroundVideoData] = useState(null);
	const [feedbackParams, setFeedbackParams] = useState({});
	const [droppableClasses, setDroppableClasses] = useState([]);
	const [showDraggables, setShowDraggables] = useState(false);
	const [hintData, setHintData] = useState('');
	const droppableRefs = useRef([]);
	const feedbackSubmitButtonRef = useRef();
	const startTime = useRef(null);
	const dndData = content.rounds[currentRound];
	const groupedItems = roundData?.draggableItems?.reduce((acc, item) => {
		if (!acc[item.sentenceId]) {
			acc[item.sentenceId] = [];
		}

		acc[item.sentenceId].push(item);

		return acc;
	}, {});
	const [isLocked, setIsLocked] = useState(false);
	const [withExplanationScreen, setWithExplanationScreen] = useState(content.withExplanationScreen || false);
	const backgroundVideoRef = useRef();
 	const hiddenText=[ "لِقَاؤُنَا","شُرُوقُ","يَوْمٌ","الاِثْنَيْن"]
	useEffect(() => {
		if (isVisible) {
			pageContext.setMissionNumber(content.gameId);
			startTime.current = Date.now();
			controls.start("animate");
		} else {
			controls.start("initial");
		}
	}, [isVisible, currentRound, content]);


	useEffect(() => {
		if(dndData){
			// const finalDraggables = shuffle(dndData.draggableItems);
			// setRoundData({
			// 	...dndData,
			// 	draggableItems: finalDraggables
			// });
			setRoundData({
				...dndData,
				draggableItems: dndData.draggableItems
			});
			setSelectedAnswers([]);
			setUsedItems([]);
			setDroppableClasses([]);
			setFeedbackParams({});
			droppableRefs.current = [];
			setShowDraggables(false);
			setTimeout(() => setShowDraggables(true), 300);
		}
	}, [dndData]);

	const filledAnswers = selectedAnswers.filter(ans => ans);
	const allItemsDropped = roundData?.droppableItems?.length === filledAnswers.length;

	const handleRemoveDroppedItem = (droppableIndex) => {
		const droppable = droppableRefs.current[droppableIndex];
		if (!droppable) return;

		const droppedItems = droppable.getDroppedItems?.() || [];
		if (droppedItems.length === 0) return;

		const removedId = droppedItems[0].id;
		droppable.reset();

		setSelectedAnswers(prev => {
			const copy = [...prev];
			copy[droppableIndex] = null;
			return copy;
		});

		setUsedItems(prev => prev.filter(id => id !== removedId));
		setDroppableClasses(prev => {
			const copy = [...prev];
			copy[droppableIndex] = "";
			return copy;
		});
	};

	const checkAnswers = (type) => {
		let feedbackData = {};
		let answers = [];
		setIsLocked(true);
		if (type === "tryagain") {
			setIsLocked(false);
			if (pageContext.attemptGrade <= 0) {
				droppableRefs.current.forEach(d => d?.reset?.());
				setSelectedAnswers([]);
				setUsedItems([]);
				setDroppableClasses([]);
				setFeedbackParams({});
				return;
			}
			const newSelectedAnswers = [...selectedAnswers];
			const correctUsedItems = [];
			const newClasses = [];
			selectedAnswers.forEach((ans, i) => {
				const drag = roundData.draggableItems?.find(d => d.id === ans);
				const drop = roundData.droppableItems?.[i];
				const isCorrectAnswer = drag?.dataIndex === drop?.dataIndex;
				if (isCorrectAnswer) {
					correctUsedItems.push(ans);
					newClasses[i] = "correct";
				} else {
					droppableRefs.current[i]?.reset?.();
					newSelectedAnswers[i] = null;
					newClasses[i] = "";
				}
			});

			setSelectedAnswers(newSelectedAnswers);
			setUsedItems(correctUsedItems);
			setDroppableClasses(newClasses);
			setFeedbackParams({});
			return;
		}

		if (type === "reset") {
			droppableRefs.current.forEach(d => d?.reset?.());
			setSelectedAnswers([]);
			setUsedItems([]);
			setDroppableClasses([]);
			setFeedbackParams({});
			return;
		}
		let correct = 0;
		let classes = [];

		selectedAnswers.forEach((ans, i) => {
			const drag = roundData.draggableItems?.find(d => d.id === ans);
			const drop = roundData.droppableItems?.[i];
			if (!drag || !drop) return;
			if (drag.dataIndex === drop.dataIndex) {
				correct++;
				classes[i] = "correct";
			} else {
				classes[i] = "incorrect";
			}

			answers.push({
				item: {
					id: drag.id,
					content: {
						text: drag.value
					}
				},
				droppedId: drop.id
			});
		});

		setDroppableClasses(classes);
		const isCorrect = correct === roundData.droppableItems.length;
		if (isCorrect) {
			setIsLocked(true);
		}

		const tocIndex = index; 
		const newTocState = pageContext.tocState;
		newTocState.push({
			index: tocIndex,
			status: isCorrect ? "correct" : "incorrect"
		});
		pageContext.setTocState(newTocState);

		const newGrade = !isCorrect ? pageContext.attemptGrade - 1:pageContext.attemptGrade;
		pageContext.setAttemptGrade(newGrade);
		if(newGrade === 0 ){
			const swiper = document.querySelector("#container-swiper")?.swiper;
			if (swiper) {
				swiper.slideTo(swiper.slides.length - 1, 1);
			}
		}
		feedbackData = {
			class: isCorrect ? "correct" : "incorrect",
			message: isCorrect ? roundData.feedback?.correct?.text : roundData.feedback?.incorrect?.text,
			canRetry: !isCorrect && pageContext.attemptGrade > 0,
			answers: answers,
			result: isCorrect ? "correct" : "incorrect",
			startTime: startTime.current,
			isCorrect: isCorrect,
			audio: isCorrect? roundData.feedback?.correct?.audio : newGrade === 0 ? content.hintAudio : roundData.feedback?.incorrect?.audio,
			sfx: isCorrect ? CorrectSFX : IncorrectSFX
		};

		setFeedbackParams(feedbackData);
		return { feedbackData };
	};

	const goToNextRound = () => {
		
		const isLastRound = currentRound === content.rounds.length - 1;	

		if (!isLastRound) {
			droppableRefs.current.forEach(d => d?.reset?.());
			setCurrentRound(prev => prev + 1);
			setSelectedAnswers([]);
			setUsedItems([]);
			setDroppableClasses([]);
			setFeedbackParams({});
			setIsLocked(false);	

			// droppableRefs.current = [];
		} else {
			setWithExplanationScreen(true);
			requestAnimationFrame(() => {controls.start("animate");});
			const newSelectedAnswers = [...selectedAnswers];
			const correctUsedItems = [];
			const newClasses = [];
			const hiddenIndexes = [];
			selectedAnswers.forEach((ans, i) => {
				const drag = roundData.draggableItems?.find(d => d.id === ans);

				if (!drag) return;

				if (hiddenText.includes(drag.value)) {
					hiddenIndexes.push(i);
				}
			});

			hiddenIndexes.forEach((index, order) => {
				setTimeout(() => {
					handleRemoveDroppedItem(index);
				}, 1000 + order * 1500);
			});
			// const swiper = document.querySelector('#container-swiper')?.swiper;	
			// if (swiper) swiper.slideNext(1);
		}
	};

	return ( 
		<div className="dnd-container component-container w-100" style={{ backgroundImage: `url(images/toc_bg.png)`,}}>
			<motion.div ref={containerRef} className="dnd-wrapper w-100 component-content" variants={getAnimation("blurIn", 0.8, 0)} initial="initial" animate={controls}>
         <		motion.div className="birdAndScore" variants={getAnimation("flipX", 0.6, 0.4)} initial="initial" animate={controls}>
					<ShowAttemptGrade />
				</motion.div> 
				<div className="dnd-game-container">
					<motion.div className="mainQuestionHolderDiv">
						<motion.div className="mainQuestionHolder" variants={getAnimation("slideDown", 0.6, 0.4)} initial="initial" animate={controls}>
							<Row className="audio-help-container mb-0 mx-0">
								<Col className="d-flex align-items-center justify-content-start col-1 p-0">
									<AudioWidget data={audioData} audioType="main-question" />
								</Col>
							</Row>
							<motion.div className="mainQuestion" dangerouslySetInnerHTML={{ __html: content.mainQuestion }}/>
						</motion.div>
					</motion.div>
						<motion.div className="gameMainWrapper" variants={getAnimation("blurIn", 0.8, 0)} initial="initial" animate={controls}>
							<motion.div className="text-row" variants={getAnimation("scaleIn", 0.6, 0.7)} initial="initial" animate={controls}>
								<motion.div className="text-col w-10" variants={getAnimation("slideRight", 0.6, 1.1)} initial="initial" animate={controls}>
									<div className="dnd-content">
										<motion.div className="dnd-wrapper" {...getAnimation("blurIn", 0.6, 1)}>
											<DndContext>
												<div className="dropTextHolder">
													<DropTextInline
														dropText={roundData?.dropText}
														droppableItems={roundData?.droppableItems}
														droppableClasses={droppableClasses}
														droppableRefs={droppableRefs}
														setUsedItems={setUsedItems}
														onDroppedItemClick={handleRemoveDroppedItem}
													/>
												</div>
												{withExplanationScreen && (												
													<motion.div className="explanation-screen w-10" variants={getAnimation("slideRight", 0.6, 0.4)} initial="initial" animate={controls}>
														<div  className="hidden-text-content">
															<div className="hidden-text-title">
																الموعد:
															</div>												
															<div className="hidden-text">
																{hiddenText.map((slide, slideIndex) => (
																	<motion.div key={slideIndex} variants={getAnimation( "slideLeft", 0.4, 1 + ((slideIndex * 3) / 2))} initial="initial" animate={controls} className="hiddenText-slide">
																		<div className="slide-content">
																			{slide}
																		</div>
																	</motion.div>
																))}	
															</div>
														</div>												
														<motion.div className="startLessonBtnHolder" variants={getAnimation("scaleIn",0.6,1.7)} initial="initial" animate={controls}>
															<button className="startLessonBtn"
																onClick={() => {
																	stopAudio();
																	const swiper = document.querySelector('#container-swiper')?.swiper;	
																	if (swiper) swiper.slideNext(1);
																}}
															>
																<FormattedMessage id="feedback.continue" />
															</button>
														</motion.div>
													</motion.div>
												)}
												{showDraggables && !withExplanationScreen && (
												<div className="draggable-container">
													{Object.keys(groupedItems || {}).map(sentenceId => {
													const items = [...groupedItems[sentenceId]].sort(
														(a, b) => a.sentenceIndex - b.sentenceIndex
													);

													return (
														<div key={sentenceId} className="sentence-row">
														{items.map(item => (
															<motion.div key={item.id} {...getAnimation("zoomIn", 0.4, 0)}>
															<DraggableItem
																id={item.id}
																type={item.type}
																value={item.value}
																dataIndex={item.dataIndex}
																cssClass={`draggable-item ${isLocked ? "disabled" : ""}`}
																isDragging={activeId === item.id}
																isUsed={usedItems.includes(item.id)}
															/>
															</motion.div>
														))}

														<span className="sentence-period">.</span>
														</div>
													);
													})}
												</div>
												)}
												<DndInner
													droppableRefs={droppableRefs}
													selectedAnswers={selectedAnswers}
													setSelectedAnswers={setSelectedAnswers}
													setActiveId={setActiveId}
													setUsedItems={setUsedItems}
													usedItems={usedItems}
												/>
											</DndContext>
										</motion.div>
									</div>
								</motion.div>
							</motion.div>
							{allItemsDropped && pageContext.attemptGrade !=0  &&  !withExplanationScreen && (
								<div className="feedback-container-holder">
									<Feedback
										feedback={feedbackParams}
										submitLimit={roundData?.submitLimit}
										handleSubmit={checkAnswers}
										handleContinue={goToNextRound}
										ref={feedbackSubmitButtonRef}
									/>
								</div>
							)}
							{content.rounds?.length > 1 && (
								<motion.div className="round-progress"  variants={getAnimation("scaleIn", 0.6, 1.7)} initial="initial" animate={controls}>
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
						</motion.div>
				</div>
			</motion.div>
		</div>
	);
};

export default dnd;
