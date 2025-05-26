import React, { useState, useEffect } from 'react';

const RESIN_MAX = 200;
const RESIN_RECHARGE_TIME = 8 * 60; // 8 минут в секундах
const CONDENSED_RESIN_MAX = 5;

export const Resin = () => {
  const [currentResin, setCurrentResin] = useState(() => {
    const saved = localStorage.getItem('currentResin');
    return saved ? parseInt(saved) : RESIN_MAX;
  });

  const [condensedResin, setCondensedResin] = useState(() => {
    const saved = localStorage.getItem('condensedResin');
    return saved ? parseInt(saved) : 0;
  });

  const [fragileResin, setFragileResin] = useState(() => {
    const saved = localStorage.getItem('fragileResin');
    return saved ? parseInt(saved) : 0;
  });

  const [lastUpdate, setLastUpdate] = useState(() => {
    const saved = localStorage.getItem('lastResinUpdate');
    return saved ? parseInt(saved) : Date.now();
  });

  const [weeklyBossCount, setWeeklyBossCount] = useState(() => {
    const saved = localStorage.getItem('weeklyBossCount');
    return saved ? parseInt(saved) : 0;
  });

  const [timeToFull, setTimeToFull] = useState('');

  useEffect(() => {
    localStorage.setItem('currentResin', currentResin.toString());
    localStorage.setItem('condensedResin', condensedResin.toString());
    localStorage.setItem('fragileResin', fragileResin.toString());
    localStorage.setItem('lastResinUpdate', lastUpdate.toString());
    localStorage.setItem('weeklyBossCount', weeklyBossCount.toString());
  }, [currentResin, condensedResin, fragileResin, lastUpdate, weeklyBossCount]);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      const elapsedMinutes = Math.floor((now - lastUpdate) / (1000 * 60));
      const resinGained = Math.floor(elapsedMinutes / 8);
      
      if (resinGained > 0) {
        setCurrentResin(prev => Math.min(RESIN_MAX, prev + resinGained));
        setLastUpdate(now);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [lastUpdate]);

  useEffect(() => {
    const calculateTimeToFull = () => {
      const minutesPerResin = 8;
      const maxResin = 200;
      const remainingResin = maxResin - currentResin;
      const totalMinutes = remainingResin * minutesPerResin;

      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;

      if (hours > 0) {
        setTimeToFull(`${hours}ч ${minutes}м`);
      } else {
        setTimeToFull(`${minutes}м`);
      }
    };

    calculateTimeToFull();
    const interval = setInterval(calculateTimeToFull, 60000); // Обновляем каждую минуту

    return () => clearInterval(interval);
  }, [currentResin]);

  const handleResinChange = (amount: number) => {
    setCurrentResin(prev => Math.max(0, Math.min(RESIN_MAX, prev + amount)));
    setLastUpdate(Date.now());
  };

  const handleCondensedResinChange = (amount: number) => {
    setCondensedResin(prev => Math.max(0, Math.min(CONDENSED_RESIN_MAX, prev + amount)));
  };

  const handleWeeklyBoss = () => {
    const cost = weeklyBossCount < 3 ? 30 : 60;
    if (currentResin >= cost) {
      handleResinChange(-cost);
      setWeeklyBossCount(prev => prev + 1);
    }
  };

  const handleFragileResin = () => {
    if (fragileResin > 0) {
      handleResinChange(60);
      setFragileResin(prev => prev - 1);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Обычная смола</h2>
        <div className="flex items-center justify-between mb-4">
          <div className="flex-1">
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
              <div
                className="bg-blue-500 h-4 rounded-full"
                style={{ width: `${(currentResin / RESIN_MAX) * 100}%` }}
              />
            </div>
          </div>
          <span className="ml-4 text-lg font-bold">{currentResin}/{RESIN_MAX}</span>
        </div>
        <div className="flex space-x-4">
          <button
            onClick={() => handleResinChange(-20)}
            disabled={currentResin < 20}
            className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
          >
            Поход в данж (-20)
          </button>
          <button
            onClick={() => handleResinChange(-40)}
            disabled={currentResin < 40}
            className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
          >
            Крафт густой смолы (-40)
          </button>
          <button
            onClick={handleWeeklyBoss}
            disabled={currentResin < (weeklyBossCount < 3 ? 30 : 60)}
            className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
          >
            Босс недели ({weeklyBossCount < 3 ? '-30' : '-60'})
          </button>
        </div>
        {currentResin < RESIN_MAX && (
          <div className="text-sm text-gray-500 mt-2">
            До полного восстановления: {timeToFull}
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Густая смола</h2>
        <div className="flex items-center justify-between">
          <div className="flex space-x-4">
            <button
              onClick={() => handleCondensedResinChange(-1)}
              disabled={condensedResin <= 0}
              className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
            >
              -1
            </button>
            <span className="text-lg font-bold">{condensedResin}/{CONDENSED_RESIN_MAX}</span>
            <button
              onClick={() => handleCondensedResinChange(1)}
              disabled={condensedResin >= CONDENSED_RESIN_MAX}
              className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
            >
              +1
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Слабая смола</h2>
        <div className="flex items-center space-x-4">
          <input
            type="number"
            value={fragileResin}
            onChange={(e) => setFragileResin(Math.max(0, parseInt(e.target.value) || 0))}
            className="w-20 p-2 rounded bg-gray-100 dark:bg-gray-700"
            min="0"
          />
          <button
            onClick={handleFragileResin}
            disabled={fragileResin <= 0}
            className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
          >
            Использовать (+60)
          </button>
        </div>
      </div>
    </div>
  );
}; 