import React from "react";
import parse from "html-react-parser";
import DroppableItem from "./DroppableItem";

const DropTextInline = ({
  dropText,
  droppableItems = [],
  droppableClasses = [],
  droppableRefs,
  setUsedItems,
  onDroppedItemClick
}) => {
  if (!dropText) return null;

  let dropIndex = 0;

  const options = {
    replace(domNode) {
      if (
        domNode.type === "text" &&
        domNode.data.includes("@_@")
      ) {
        const parts = domNode.data.split("@_@");

        return (
          <>
            {parts.map((part, i) => {
              const currentIndex = dropIndex;

              const element = (
                <React.Fragment key={`${currentIndex}-${i}`}>
                  {part}

                  {i < parts.length - 1 &&
                    droppableItems[currentIndex] && (
               <DroppableItem
                ref={(el) => {
                    droppableRefs.current[currentIndex] = el;
                }}
                id={droppableItems[currentIndex].id}
                type={droppableItems[currentIndex].type}
                value={droppableItems[currentIndex].value}
                cssClass={`droppable-inline ${
                    droppableClasses?.[currentIndex] || ""
                }`}
                droppableIndex={currentIndex}
                onDropItem={(dragId) => {
                    setUsedItems(prev =>
                        prev.includes(dragId)
                            ? prev
                            : [...prev, dragId]
                    );
                }}
                onDroppedItemClick={onDroppedItemClick}
/>
                    )}
                </React.Fragment>
              );

              if (i < parts.length - 1) dropIndex++;

              return element;
            })}
          </>
        );
      }
    }
  };

  return (
    <div className="drop-text-inline" dir="rtl">
      {parse(dropText, options)}
    </div>
  );
};

export default DropTextInline;