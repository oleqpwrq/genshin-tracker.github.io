import React, { useState } from 'react';

export const Expeditions: React.FC = () => {
  const [expeditions, setExpeditions] = useState<Array<{
    id: number;
    character: string;
    startTime: Date;
    duration: number;
  }>>([]);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Экспедиции</h1>
      <p>Здесь будет функционал для отслеживания экспедиций</p>
    </div>
  );
}; 