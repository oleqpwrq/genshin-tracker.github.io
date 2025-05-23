import React, { useState } from 'react';

export const Teapot: React.FC = () => {
  const [energy, setEnergy] = useState<number>(0);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Чайник Бездны</h1>
      <p>Здесь будет функционал для отслеживания Чайника Бездны</p>
    </div>
  );
}; 