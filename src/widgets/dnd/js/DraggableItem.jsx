import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { GetScale } from "../../../container/js/utilities/utilities";

const DraggableItem = ({
  id,
  type,
  value,
  dataIndex,
  cssClass,
  isDragging,
  isUsed
}) => {

  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id,
    data: { type, value, dataIndex }
  });

  const style = transform
    ? {
        transform: CSS.Transform.toString({
          x: transform.x / GetScale(),
          y: transform.y / GetScale(),
          scaleX: 1,
          scaleY: 1
        }),
        zIndex: 9999,
        position: "relative"
      }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      className={`${cssClass} ${isUsed ? "item_used" : ""}`} 
      style={style}
      {...listeners}
      {...attributes}
    >
      {type === "text" ? <span dangerouslySetInnerHTML={{ __html: value}}></span> : <img src={value} alt="" />}
    </div>
  );
};

export default DraggableItem;
