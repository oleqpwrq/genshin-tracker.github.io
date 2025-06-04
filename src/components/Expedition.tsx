import React, { useState, useEffect } from 'react';

interface ExpeditionState {
  selectedDuration: number;   // выбрано пользователем, в миллисекундах
  reduced: boolean;           // флаг "сократить на 25%"
  effectiveDuration: number;  // итоговая длительность с учетом флага
  startTime: number;          // timestamp начала
  endTime: number;            // timestamp окончания
  isRunning: boolean;         // идет ли экспедиция
  isFinished: boolean;        // завершена ли
}

const DURATIONS = [
  { label: '4 ч', value: 4 * 60 * 60 * 1000 },
  { label: '8 ч', value: 8 * 60 * 60 * 1000 },
  { label: '16 ч', value: 16 * 60 * 60 * 1000 },
  { label: '20 ч', value: 20 * 60 * 60 * 1000 }
];

export const Expedition: React.FC = () => {
  const [state, setState] = useState<ExpeditionState>(() => {
    const saved = localStorage.getItem('expeditionState');
    return saved ? JSON.parse(saved) : {
      selectedDuration: 0,
      reduced: false,
      effectiveDuration: 0,
      startTime: 0,
      endTime: 0,
      isRunning: false,
      isFinished: false
    };
  });

  const [timeLeft, setTimeLeft] = useState<string>(() => {
    const saved = localStorage.getItem('expeditionTimeLeft');
    return saved || '00:00:00';
  });
  const [progress, setProgress] = useState<number>(() => {
    const saved = localStorage.getItem('expeditionProgress');
    return saved ? parseFloat(saved) : 0;
  });

  // Сохраняем прогресс в localStorage
  useEffect(() => {
    localStorage.setItem('expeditionState', JSON.stringify(state));
    localStorage.setItem('expeditionTimeLeft', timeLeft);
    localStorage.setItem('expeditionProgress', progress.toString());
  }, [state, timeLeft, progress]);

  useEffect(() => {
    let timer: number;

    if (state.isRunning && !state.isFinished) {
      timer = window.setInterval(() => {
        const now = Date.now();
        const remaining = Math.max(0, state.endTime - now);
        
        // Обновляем таймер
        const hours = Math.floor(remaining / (1000 * 60 * 60));
        const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((remaining % (1000 * 60)) / 1000);
        
        setTimeLeft(
          `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
        );

        // Обновляем прогресс
        const newProgress = (1 - (remaining / state.effectiveDuration)) * 100;
        setProgress(Math.min(100, Math.max(0, newProgress)));

        // Проверяем завершение
        if (remaining === 0) {
          setState(prev => ({ ...prev, isRunning: false, isFinished: true }));
        }
      }, 1000);
    }

    return () => {
      if (timer) window.clearInterval(timer);
    };
  }, [state.isRunning, state.isFinished, state.endTime, state.effectiveDuration]);

  const handleStart = () => {
    const effectiveDuration = state.reduced 
      ? state.selectedDuration * 0.75 
      : state.selectedDuration;
    
    const startTime = Date.now();
    const endTime = startTime + effectiveDuration;

    setState(prev => ({
      ...prev,
      effectiveDuration,
      startTime,
      endTime,
      isRunning: true,
      isFinished: false
    }));
  };

  const handleReset = () => {
    setState({
      selectedDuration: 0,
      reduced: false,
      effectiveDuration: 0,
      startTime: 0,
      endTime: 0,
      isRunning: false,
      isFinished: false
    });
    setTimeLeft('00:00:00');
    setProgress(0);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 max-w-md mx-auto">
      <h2 className="text-xl font-semibold mb-4">Экспедиция</h2>
      
      <div className="space-y-4">
        {/* Выбор длительности */}
        <div className="flex flex-wrap gap-2">
          {DURATIONS.map(({ label, value }) => (
            <button
              key={value}
              onClick={() => setState(prev => ({ ...prev, selectedDuration: value }))}
              disabled={state.isRunning}
              className={`px-4 py-2 rounded ${
                state.selectedDuration === value
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 dark:bg-gray-700'
              } ${state.isRunning ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Галочка сокращения времени */}
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="reduce"
            checked={state.reduced}
            onChange={e => setState(prev => ({ ...prev, reduced: e.target.checked }))}
            disabled={state.isRunning}
            className="rounded"
          />
          <label htmlFor="reduce" className={state.isRunning ? 'opacity-50' : ''}>
            Сократить на 25%
          </label>
        </div>

        {/* Таймер и прогресс */}
        <div className="space-y-2">
          <div
            className="text-2xl text-center"
            style={{ fontFamily: `'JetBrains Mono', 'Fira Mono', 'Consolas', 'monospace'` }}
          >
            {state.isFinished ? 'Готово!' : timeLeft}
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
            <div
              className="bg-blue-500 h-2.5 rounded-full transition-all duration-1000"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Кнопки управления */}
        <div className="flex justify-center space-x-4">
          <button
            onClick={handleStart}
            disabled={!state.selectedDuration || state.isRunning}
            className={`px-6 py-2 rounded ${
              !state.selectedDuration || state.isRunning
                ? 'bg-gray-300 dark:bg-gray-600 cursor-not-allowed'
                : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
          >
            Начать экспедицию
          </button>
          
          <button
            onClick={handleReset}
            className="px-6 py-2 rounded bg-red-500 text-white hover:bg-red-600"
          >
            Сбросить
          </button>
        </div>
      </div>
    </div>
  );
}; 