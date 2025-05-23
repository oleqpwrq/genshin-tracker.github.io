import { useState, useEffect } from 'react';
import { MaterialsData, CharacterMaterials, WeaponMaterials } from '../types/materials';

// Пример данных (в реальном приложении будут загружаться из API или файла)
const sampleData: MaterialsData[] = [
  {
    type: 'character',
    name: 'Xiao',
    materials: {
      'Локальные диковинки': { name: 'Цинсинь', required: 168 },
      'Гемы элемента': { name: 'Агат Агнидус', required: 6 },
      'Босс-материал': { name: 'Слеза Борея', required: 18 },
      'Моб-дропы': [
        { name: 'Сломанная маска', green: 18, blue: 30, purple: 36 }
      ],
      'Книги талантов': [
        { name: 'Учения «О Процветании»', green: 9, blue: 63, purple: 114 }
      ],
      'Особые материалы': [
        { name: 'Корона прозрения', required: 3 }
      ]
    }
  },
  {
    type: 'weapon',
    name: 'Посох Хомы',
    materials: {
      'Материалы подземелий': [
        { name: 'Осколок хаоса', green: 5, blue: 14, purple: 14 }
      ],
      'Моб-дропы': [
        { name: 'Знак удачи', green: 10, blue: 15, purple: 23 }
      ],
      'Возвышение оружия': [
        { name: 'Зубец архаического камня', required: 23 }
      ]
    }
  }
];

interface MaterialProgress {
  [key: string]: {
    green?: number;
    blue?: number;
    purple?: number;
    required?: number;
  };
}

export const Materials = () => {
  const [selectedType, setSelectedType] = useState<'character' | 'weapon'>('character');
  const [selectedItem, setSelectedItem] = useState<MaterialsData | null>(null);
  const [progress, setProgress] = useState<MaterialProgress>(() => {
    const saved = localStorage.getItem('materialProgress');
    return saved ? JSON.parse(saved) : {};
  });
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    localStorage.setItem('materialProgress', JSON.stringify(progress));
  }, [progress]);

  const filteredItems = sampleData.filter(
    item => item.type === selectedType && 
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const calculateRemaining = (material: any, current: any) => {
    if (material.required) {
      return Math.max(0, material.required - (current.required || 0));
    }

    let remaining = {
      green: material.green || 0,
      blue: material.blue || 0,
      purple: material.purple || 0
    };

    // Учитываем перекрафт
    if (current.green) {
      const greenToBlue = Math.floor(current.green / 3);
      remaining.blue = Math.max(0, remaining.blue - greenToBlue);
    }
    if (current.blue) {
      const blueToPurple = Math.floor(current.blue / 3);
      remaining.purple = Math.max(0, remaining.purple - blueToPurple);
    }

    return remaining;
  };

  const updateProgress = (materialName: string, field: string, value: number) => {
    setProgress(prev => ({
      ...prev,
      [materialName]: {
        ...prev[materialName],
        [field]: Math.max(0, value)
      }
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex space-x-4 mb-6">
        <button
          onClick={() => setSelectedType('character')}
          className={`px-4 py-2 rounded ${
            selectedType === 'character'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 dark:bg-gray-700'
          }`}
        >
          Персонажи
        </button>
        <button
          onClick={() => setSelectedType('weapon')}
          className={`px-4 py-2 rounded ${
            selectedType === 'weapon'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 dark:bg-gray-700'
          }`}
        >
          Оружие
        </button>
      </div>

      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Поиск..."
        className="w-full p-2 rounded bg-gray-100 dark:bg-gray-700"
      />

      <select
        value={selectedItem?.name || ''}
        onChange={(e) => {
          const item = sampleData.find(i => i.name === e.target.value);
          setSelectedItem(item || null);
        }}
        className="w-full p-2 rounded bg-gray-100 dark:bg-gray-700"
      >
        <option value="">Выберите {selectedType === 'character' ? 'персонажа' : 'оружие'}</option>
        {filteredItems.map(item => (
          <option key={item.name} value={item.name}>{item.name}</option>
        ))}
      </select>

      {selectedItem && (
        <div className="space-y-4">
          {Object.entries(selectedItem.materials).map(([category, materials]) => (
            <div key={category} className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
              <h3 className="text-lg font-semibold mb-4">{category}</h3>
              {Array.isArray(materials) ? (
                materials.map((material, index) => {
                  const current = progress[material.name] || {};
                  const remaining = calculateRemaining(material, current);
                  return (
                    <div key={index} className="mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <span>{material.name}</span>
                        <div className="flex space-x-2">
                          {material.green !== undefined && (
                            <input
                              type="number"
                              value={current.green || 0}
                              onChange={(e) => updateProgress(material.name, 'green', parseInt(e.target.value))}
                              className="w-20 p-1 rounded bg-gray-100 dark:bg-gray-700"
                              min="0"
                            />
                          )}
                          {material.blue !== undefined && (
                            <input
                              type="number"
                              value={current.blue || 0}
                              onChange={(e) => updateProgress(material.name, 'blue', parseInt(e.target.value))}
                              className="w-20 p-1 rounded bg-gray-100 dark:bg-gray-700"
                              min="0"
                            />
                          )}
                          {material.purple !== undefined && (
                            <input
                              type="number"
                              value={current.purple || 0}
                              onChange={(e) => updateProgress(material.name, 'purple', parseInt(e.target.value))}
                              className="w-20 p-1 rounded bg-gray-100 dark:bg-gray-700"
                              min="0"
                            />
                          )}
                          {material.required !== undefined && (
                            <input
                              type="number"
                              value={current.required || 0}
                              onChange={(e) => updateProgress(material.name, 'required', parseInt(e.target.value))}
                              className="w-20 p-1 rounded bg-gray-100 dark:bg-gray-700"
                              min="0"
                            />
                          )}
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">
                        Осталось собрать:
                        {material.green !== undefined && ` ${remaining.green} зеленых,`}
                        {material.blue !== undefined && ` ${remaining.blue} синих,`}
                        {material.purple !== undefined && ` ${remaining.purple} фиолетовых`}
                        {material.required !== undefined && ` ${remaining} шт.`}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span>{materials.name}</span>
                    <input
                      type="number"
                      value={progress[materials.name]?.required || 0}
                      onChange={(e) => updateProgress(materials.name, 'required', parseInt(e.target.value))}
                      className="w-20 p-1 rounded bg-gray-100 dark:bg-gray-700"
                      min="0"
                    />
                  </div>
                  <div className="text-sm text-gray-500">
                    Осталось собрать: {Math.max(0, materials.required - (progress[materials.name]?.required || 0))} шт.
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}; 