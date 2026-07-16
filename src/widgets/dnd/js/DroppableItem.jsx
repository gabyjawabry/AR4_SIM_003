import React, { forwardRef, useImperativeHandle, useState, useRef } from 'react';
import { useDroppable } from '@dnd-kit/core';
import DroppedItem from './DroppedItem';
// import { ReactComponent as ContentCopyIcon } from '../../../container/images/icons/contentcopy.svg';
import ContentCopyIcon from "../../../container/images/icons/contentcopy.svg?react";
import { useEventSender } from '../../../container/js/utilities/logging';

const DroppableItem = forwardRef(({
    id,
    type,
    value,
    cssClass,
    droppableIndex,
    onDropItem,
    onDroppedItemClick
}, ref) => {

    const [droppedItems, setDroppedItems] = useState([]);
    const elementRef = useRef(null);
    const sendEvent = useEventSender();
    const { isOver, setNodeRef } = useDroppable({
      id: String(id),
      data: { index: droppableIndex, id: id }
    });

    useImperativeHandle(ref, () => ({

      addDroppedItem(dropItem) {
        setDroppedItems([dropItem]); 
        onDropItem?.(dropItem.id);
        
        const logEvent = {
          item: {
            id: dropItem.id,
            content: {
              text: dropItem.value
            }
          },
          droppedId: dropItem.droppableItem.id
        };

        sendEvent('item-dropped', logEvent);
      },

      removeDroppedItem(index) {
        setDroppedItems(prev => {
          const removed = prev[index];
          if (!removed) return prev;

          onDroppedItemClick?.(droppableIndex); // notify parent

          return [];
        });
      },

      reset() {
        setDroppedItems([]);
      },

      getDroppedItems() {
        return droppedItems;
      }
    }));

    return (
      <div
        ref={(el) => {
          setNodeRef(el);         
          elementRef.current = el; 
        }}
        className={droppedItems.length === 0 ? `${cssClass} drop-border` : cssClass}
        style={{ backgroundColor: isOver ? "#f0f0f0" : "" }}
      >
        <div
          style={
            type === "image"
              ? { backgroundImage: `url(${value})`, backgroundSize: "contain" }
              : {}
          }
        >
          {
            droppedItems.length > 0 ?
              droppedItems.map((item, index) => (
                <DroppedItem
                  key={index}
                  index={index}
                  item={item}
                  className={cssClass}
                  remove={(i) => ref?.current?.removeDroppedItem(i)}
                  onDroppedItemClick={onDroppedItemClick}
                />
              ))
            :
              <ContentCopyIcon className={`me-3`} />
          }
        </div>
      </div>
    );
  }
);

export default DroppableItem;
