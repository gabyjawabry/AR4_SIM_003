import React, { useCallback } from 'react'
import { PageData } from './helper';

const progressEvent = {
  "name": "simulation-progress-event",
  "currentState": {},
  "status": "NOT_STARTED"
}

export const useEventSender = () => {
  const sendEvent = useCallback((eventName, eventData, originId = 'SIMULATION') => {
    let event = {};

    if(eventName === "simulation-progress-event" || eventName === "navigation-visibility-event"){
      event = eventData;
    }else{
      event = {
        originId,
        name: eventName,
        data: eventData,
        occurredOn: Date.now()
      }
    }

    const targetOrigin = '*' // e.g., 'https://player.example.com'
    window.postMessage(event, targetOrigin)
    if (window.parent && window.parent !== window) {
      window.parent.postMessage(event, targetOrigin)
    }

    // eslint-disable-next-line no-console
    console.log('Event sent:', event)
  }, [])

  return sendEvent
}

export const registerMessageListener = () => {
  return new Promise((resolve) => {
    if (PageData.page.data_sending === "server") {
      const listener = (event) => {
        window.removeEventListener("message", listener);

        if (event.data?.name === 'load-simulation-state' && event.data?.type === 'LOAD_SIMULATION_STATE') {
          const savedState = event.data.state;
          if (savedState && Object.keys(savedState).length > 0 && savedState.status !== "COMPLETED") {
            resolve(savedState);
          }else{
            resolve(progressEvent);
          }
        }else{
          resolve(progressEvent);
        }
      };

      window.addEventListener("message", listener);
    } else if (PageData.page.data_sending === "local") {
      const log = FetchLocalLog("appState");
      if(log && Object.keys(log).length > 0 && log.status !== "COMPLETED"){
        resolve(log);
      }else{
        resolve(progressEvent);
      }
    } else {
      resolve(progressEvent);
    }
  });
};

export const SendAppState = (name, log) => {
  if(log && Object.keys(log).length > 0){
    if (PageData.page.data_sending === "server") {
      const sendEvent = useEventSender();
      sendEvent('simulation-progress-event', log);
    }else if (PageData.page.data_sending === "local"){
      localStorage.setItem(name, JSON.stringify(log));
    }
  }
}

export const FetchLocalLog = (name) => {
  return JSON.parse(localStorage.getItem(name)) || progressEvent;
}
