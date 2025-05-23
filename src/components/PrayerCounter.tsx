import React, { useState, useEffect } from 'react';
import { PlusIcon, MinusIcon } from '@heroicons/react/24/outline';

interface Banner {
  id: string;
  name: string;
  images: string[];
  count: number;
  characters?: {
    name: string;
    image: string;
  }[];
  currentCharacterIndex?: number;
}

interface PrayerHistory {
  date: string;
  bannerName: string;
  character: string;
  pullNumber: number;
  characterName?: string;
}

export const PrayerCounter: React.FC = () => {
  const [activeBanner, setActiveBanner] = useState<'event' | 'standard'>('event');
  const [banners, setBanners] = useState<Banner[]>([
    {
      id: 'event',
      name: 'Ивентовый баннер',
      images: ['/genshin-tracker.github.io/images/banner-1.png'],
      count: 0,
      characters: [
        { name: 'Эскофье', image: '/genshin-tracker.github.io/images/banner-1.png' },
        { name: 'Навия', image: '/genshin-tracker.github.io/images/banner-2.png' }
      ],
      currentCharacterIndex: 0
    },
    {
      id: 'standard',
      name: 'Стандартный баннер',
      images: ['/genshin-tracker.github.io/images/standard-banner.png'],
      count: 0
    }
  ]);

  const [history, setHistory] = useState<PrayerHistory[]>(() => {
    const saved = localStorage.getItem('prayerHistory');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('prayerHistory', JSON.stringify(history));
  }, [history]);

  const handleCountChange = (id: string, value: string) => {
    const cleanValue = value.replace(/\D/g, '');
    const numValue = cleanValue === '' ? 0 : parseInt(cleanValue);
    setBanners(prevBanners =>
      prevBanners.map(banner =>
        banner.id === id ? { ...banner, count: numValue } : banner
      )
    );
  };

  const handleIncrement = (id: string) => {
    setBanners(prevBanners =>
      prevBanners.map(banner =>
        banner.id === id ? { ...banner, count: banner.count + 1 } : banner
      )
    );
  };

  const handleDecrement = (id: string) => {
    setBanners(prevBanners =>
      prevBanners.map(banner =>
        banner.id === id ? { ...banner, count: Math.max(0, banner.count - 1) } : banner
      )
    );
  };

  const handleCharacterChange = (bannerId: string, characterIndex: number) => {
    setBanners(prevBanners =>
      prevBanners.map(banner =>
        banner.id === bannerId ? {
          ...banner,
          currentCharacterIndex: characterIndex
        } : banner
      )
    );
  };

  const handleCharacterPull = (id: string, isEvent: boolean) => {
    const banner = banners.find(b => b.id === id);
    if (!banner) return;
    const characterName = banner.characters?.[banner.currentCharacterIndex ?? 0]?.name;
    setHistory(prev => [...prev, {
      date: new Date().toLocaleString(),
      bannerName: banner.name,
      character: isEvent ? `${characterName} 5★` : 'Стандартный 5★',
      pullNumber: banner.count,
      characterName: characterName
    }]);
    setBanners(prevBanners =>
      prevBanners.map(banner =>
        banner.id === id ? { ...banner, count: 0 } : banner
      )
    );
  };

  const currentBanner = banners.find(b => b.id === activeBanner);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8 dark:text-white">Счетчик молитв</h1>
      <div className="flex justify-center mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-1 shadow-lg">
          <button
            onClick={() => setActiveBanner('event')}
            className={`px-4 py-2 rounded-md ${
              activeBanner === 'event'
                ? 'bg-blue-500 text-white'
                : 'text-gray-700 dark:text-gray-300'
            }`}
          >
            Ивентовый баннер
          </button>
          <button
            onClick={() => setActiveBanner('standard')}
            className={`px-4 py-2 rounded-md ${
              activeBanner === 'standard'
                ? 'bg-blue-500 text-white'
                : 'text-gray-700 dark:text-gray-300'
            }`}
          >
            Стандартный баннер
          </button>
        </div>
      </div>
      {currentBanner && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          {currentBanner.id === 'event' && (
            <div className="flex justify-center mb-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-1 shadow-lg">
                <button
                  onClick={() => handleCharacterChange(currentBanner.id, 0)}
                  className={`px-4 py-2 rounded-md ${
                    currentBanner.currentCharacterIndex === 0
                      ? 'bg-blue-500 text-white'
                      : 'text-gray-700 dark:text-gray-300'
                  }`}
                >
                  Баннер Эскофье
                </button>
                <button
                  onClick={() => handleCharacterChange(currentBanner.id, 1)}
                  className={`px-4 py-2 rounded-md ${
                    currentBanner.currentCharacterIndex === 1
                      ? 'bg-blue-500 text-white'
                      : 'text-gray-700 dark:text-gray-300'
                  }`}
                >
                  Баннер Навии
                </button>
              </div>
            </div>
          )}
          <div className="flex justify-center mb-4">
            <div className="w-full max-w-2xl">
              <img
                src={
                  currentBanner.id === 'event'
                    ? currentBanner.characters?.[currentBanner.currentCharacterIndex ?? 0]?.image
                    : currentBanner.images[0]
                }
                alt={currentBanner.name}
                className="w-full h-auto object-contain rounded-lg"
              />
            </div>
          </div>
          <h2 className="text-xl font-semibold mb-4 text-center dark:text-white">
            {currentBanner.name}
            {currentBanner.characters && currentBanner.currentCharacterIndex !== undefined && (
              <span className="ml-2 text-blue-500">
                ({currentBanner.characters[currentBanner.currentCharacterIndex].name})
              </span>
            )}
          </h2>
          <div className="flex flex-col items-center space-y-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => handleDecrement(currentBanner.id)}
                className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                <MinusIcon className="h-6 w-6" />
              </button>
              <input
                type="text"
                id={`count-${currentBanner.id}`}
                value={currentBanner.count}
                onChange={(e) => handleCountChange(currentBanner.id, e.target.value)}
                className="w-24 px-3 py-2 border rounded-lg dark:bg-gray-700 dark:text-white dark:border-gray-600"
                inputMode="numeric"
                pattern="[0-9]*"
              />
              <button
                onClick={() => handleIncrement(currentBanner.id)}
                className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                <PlusIcon className="h-6 w-6" />
              </button>
            </div>
            <div className="flex space-x-4">
              {currentBanner.id === 'event' ? (
                <>
                  <button
                    onClick={() => handleCharacterPull(currentBanner.id, true)}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Выпал {currentBanner.characters?.[currentBanner.currentCharacterIndex ?? 0]?.name} 5★
                  </button>
                  <button
                    onClick={() => handleCharacterPull(currentBanner.id, false)}
                    className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                  >
                    Выпал стандартный персонаж
                  </button>
                </>
              ) : (
                <button
                  onClick={() => handleCharacterPull(currentBanner.id, false)}
                  className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
                >
                  Выпал 5★
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mt-8">
        <h3 className="text-lg font-semibold mb-4 dark:text-white">История выпадений</h3>
        <div className="space-y-2">
          {history.map((entry, index) => (
            <div key={index} className="flex justify-between items-center p-2 bg-gray-100 dark:bg-gray-700 rounded">
              <span className="text-gray-700 dark:text-gray-300">{entry.date}</span>
              <span className="text-gray-700 dark:text-gray-300">{entry.bannerName}</span>
              <span className="text-yellow-500">{entry.character}</span>
              <span className="text-blue-500 font-semibold">{entry.pullNumber} крутка</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};