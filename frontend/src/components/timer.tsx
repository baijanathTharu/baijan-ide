"use client";

import { useState, useEffect, useCallback } from "react";

export const useTimer = ({
  initialTimeInSec,
}: {
  initialTimeInSec: number;
}) => {
  const [time, setTime] = useState(initialTimeInSec);
  const [isActive, setIsActive] = useState(false);
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);

  const startTimer = useCallback(() => {
    if (!isActive) {
      setIsActive(true);
      const id = setInterval(() => {
        setTime((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(id);
            setIsActive(false);
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
      setIntervalId(id);
    }
  }, [isActive]);

  const resetTimer = useCallback(() => {
    if (intervalId) clearInterval(intervalId);
    setTime(initialTimeInSec);
    setIsActive(false);
  }, [initialTimeInSec, intervalId]);

  useEffect(() => {
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [intervalId]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  };

  const formattedTime = formatTime(time);

  return {
    time,
    formattedTime,
    isActive,
    startTimer,
    resetTimer,
  };
};
