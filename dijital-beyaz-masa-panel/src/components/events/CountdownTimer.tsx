"use client";

import { useEffect, useState } from "react";

interface CountdownTimerProps {
  targetDate: string;
}

export default function CountdownTimer({ targetDate }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  } | null>(null);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = +new Date(targetDate) - +new Date();
      
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      } else {
        setTimeLeft(null); // Süre dolduysa
      }
    };

    const timer = setInterval(calculateTimeLeft, 1000);
    calculateTimeLeft(); // İlk yüklemede çalıştır

    return () => clearInterval(timer);
  }, [targetDate]);

  if (!timeLeft) {
    return <span className="text-[10px] text-red-500 font-bold">ETKİNLİK BAŞLADI</span>;
  }

  return (
    <div className="flex gap-1 items-center font-mono text-[10px]">
      <div className="flex flex-col items-center bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded border border-purple-200">
        <span>{timeLeft.days}g</span>
      </div>
      <div className="flex flex-col items-center bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded border border-slate-200">
        <span>{String(timeLeft.hours).padStart(2, '0')}s</span>
      </div>
      <div className="flex flex-col items-center bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded border border-slate-200">
        <span>{String(timeLeft.minutes).padStart(2, '0')}dk</span>
      </div>
      <div className="flex flex-col items-center bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded border border-slate-200">
        <span>{String(timeLeft.seconds).padStart(2, '0')}sn</span>
      </div>
    </div>
  );
}