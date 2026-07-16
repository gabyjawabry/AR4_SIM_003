import React, { useState, useEffect } from 'react';
import { QuestionData } from './utilities/helper';
import { SearchJSON, GetWidget } from './utilities/utilities';

export default function LessonQuestion(props) {
    const [Widget, setWidget] = useState(null);
    const question = SearchJSON(QuestionData.question, props.id);
    question.id = question.id || props.id;
    const questionType = question.type;

    useEffect(() => {
        let isMounted = true;
        GetWidget(questionType).then((component) => {
            if (isMounted) setWidget(() => component);
        });
        return () => { isMounted = false; }
    }, [questionType]);

    if (!Widget) return null;

    return <Widget parameters={question} tocState={props.tocState} />;
}
