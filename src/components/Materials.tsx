import React, { useState, useEffect } from 'react';
import materialsData from '../data/materials.json';

interface MaterialProgress {
  [key: string]: {
    [material: string]: number;
  };
}

interface MaterialsData {
  type: 'character' | 'weapon';
  name: string;
  materials: {
    'Материалы для возвышения': {
      elemental_gems?: {
        [key: string]: number;
      };
      boss_material?: {
        name: string;
        count: number;
      };
      local_specialty?: {
        name: string;
        count: number;
      };
      mob_drops?: {
        [key: string]: number;
      };
      mora_ascension: number;
    };
    'Материалы для талантов': {
      talent_books?: {
        [key: string]: number;
      };
      mob_drops_talents?: {
        [key: string]: number;
      };
      weekly_boss?: {
        name: string;
        count: number;
      };
      crown_of_insight?: number;
      mora_talents: number;
    };
    'Опыт и мора': {
      books?: {
        [key: string]: number;
      };
      mora_experience: number;
    };
  };
}

interface MoraData {
  ascension: number;
  talents: number;
  experience: number;
}

interface CraftedMaterials {
  [key: string]: {
    actual: number;
    crafted: number;
    required: number;
    remaining: number;
    tooltip: string;
    distribution?: {
      ascension: number;
      talents: number;
    };
  };
}

interface MaterialDistribution {
  [key: string]: {
    total: number;
    ascension: number;
    talents: number;
    tooltip: string;
  };
}

interface MaterialsJsonData {
  characters: {
    [key: string]: {
      ascension: {
        total: {
          mora_ascension: number;
          materials: {
            elemental_gems: {
              [key: string]: number;
            };
            boss_material: {
              name: string;
              count: number;
            };
            local_specialty: {
              name: string;
              count: number;
            };
            mob_drops: {
              [key: string]: number;
            };
          };
        };
      };
      talents: {
        total: {
          mora_talents: number;
          materials: {
            talent_books: {
              [key: string]: number;
            };
            mob_drops_talents: {
              [key: string]: number;
            };
            weekly_boss: {
              name: string;
              count: number;
            };
            crown_of_insight: number;
          };
        };
      };
      experience: {
        total: {
          mora_experience: number;
          books: {
            [key: string]: number;
          };
        };
      };
    };
  };
  weapons: {
    [key: string]: {
      ascension: {
        total: {
          mora: number;
          materials: {
            dungeon_materials: {
              [key: string]: number;
            };
            mob_drops_weapon: {
              [key: string]: number;
            };
            weapon_ascension: {
              name: string;
              count: number;
            };
          };
        };
      };
    };
  };
}

function formatMaterialName(name: string) {
  const replacements: { [key: string]: string } = {
    'осколок': 'Осколок (зелёный)',
    'фрагмент': 'Фрагмент (синий)',
    'кусок': 'Кусок (фиолетовый)',
    'драгоценный_камень': 'Драгоценный камень (золотой)',
    'опыт_героя': 'Опыт героя',
    'приключенческий_опыт': 'Опыт путешественника',
    'совет_странника': 'Совет странника',
    'mora': 'Мора'
  };

  return replacements[name] || name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

function getConvertedAmount(input: number, required: number, rate: number = 3): { converted: number; remaining: number } {
  const surplus = Math.max(0, input - required);
  return {
    converted: Math.floor(surplus / rate),
    remaining: surplus
  };
}

function calculateMaterialDistribution(
  progress: MaterialProgress,
  itemName: string,
  materials: any
): MaterialDistribution {
  const distribution: MaterialDistribution = {};

  // Расчет распределения материалов
  if (materials['Материалы для возвышения']?.mob_drops) {
    const ascensionDrops = materials['Материалы для возвышения'].mob_drops;
    const talentDrops = materials['Материалы для талантов']?.mob_drops_talents || {};

    Object.entries(ascensionDrops).forEach(([key, required]) => {
      const total = progress[itemName]?.[key] || 0;
      const ascensionRequired = required as number;
      const talentRequired = talentDrops[key] || 0;

      const ascensionUsed = Math.min(total, ascensionRequired);
      const remaining = total - ascensionUsed;
      const talentUsed = Math.min(remaining, talentRequired);

      distribution[key] = {
        total,
        ascension: ascensionUsed,
        talents: talentUsed,
        tooltip: `• ${ascensionUsed} → на возвышение\n• ${remaining} → доступно на таланты`
      };
    });
  }

  return distribution;
}

function calculateCraftedMaterials(
  progress: MaterialProgress,
  itemName: string,
  materials: any,
  distribution: MaterialDistribution
): CraftedMaterials {
  const result: CraftedMaterials = {};

  // Обработка элементальных камней
  if (materials.elemental_gems) {
    const gems = materials.elemental_gems;
    
    const green = progress[itemName]?.['осколок'] || 0;
    const blue = progress[itemName]?.['фрагмент'] || 0;
    const purple = progress[itemName]?.['кусок'] || 0;
    const gold = progress[itemName]?.['драгоценный_камень'] || 0;

    const greenRequired = gems['осколок'] || 0;
    const blueRequired = gems['фрагмент'] || 0;
    const purpleRequired = gems['кусок'] || 0;
    const goldRequired = gems['драгоценный_камень'] || 0;

    const greenCrafting = getConvertedAmount(green, greenRequired);
    const blueTotal = blue + greenCrafting.converted;
    const blueCrafting = getConvertedAmount(blueTotal, blueRequired);
    const purpleTotal = purple + blueCrafting.converted;
    const purpleCrafting = getConvertedAmount(purpleTotal, purpleRequired);

    result['осколок'] = {
      actual: green,
      crafted: 0,
      required: greenRequired,
      remaining: greenCrafting.remaining,
      tooltip: greenCrafting.converted > 0 
        ? `Остаток: ${greenCrafting.remaining} осколков → ${greenCrafting.converted} фрагментов`
        : green < greenRequired 
          ? 'Недостаточно, чтобы скрафтить следующий уровень'
          : ''
    };

    result['фрагмент'] = {
      actual: blue,
      crafted: greenCrafting.converted,
      required: blueRequired,
      remaining: blueCrafting.remaining,
      tooltip: blueCrafting.converted > 0
        ? `Остаток: ${blueCrafting.remaining} фрагментов → ${blueCrafting.converted} кусков`
        : blueTotal < blueRequired
          ? 'Недостаточно, чтобы скрафтить следующий уровень'
          : ''
    };

    result['кусок'] = {
      actual: purple,
      crafted: blueCrafting.converted,
      required: purpleRequired,
      remaining: purpleCrafting.remaining,
      tooltip: purpleCrafting.converted > 0
        ? `Остаток: ${purpleCrafting.remaining} кусков → ${purpleCrafting.converted} драгоценных камней`
        : purpleTotal < purpleRequired
          ? 'Недостаточно, чтобы скрафтить следующий уровень'
          : ''
    };

    result['драгоценный_камень'] = {
      actual: gold,
      crafted: purpleCrafting.converted,
      required: goldRequired,
      remaining: 0,
      tooltip: ''
    };
  }

  // Обработка книг талантов
  if (materials.talent_books) {
    const books = materials.talent_books;
    
    const green = progress[itemName]?.['учения'] || 0;
    const blue = progress[itemName]?.['указания'] || 0;
    const purple = progress[itemName]?.['философия'] || 0;

    const greenRequired = books['учения'] || 0;
    const blueRequired = books['указания'] || 0;
    const purpleRequired = books['философия'] || 0;

    const greenCrafting = getConvertedAmount(green, greenRequired);
    const blueTotal = blue + greenCrafting.converted;
    const blueCrafting = getConvertedAmount(blueTotal, blueRequired);
    const purpleTotal = purple + blueCrafting.converted;

    result['учения'] = {
      actual: green,
      crafted: 0,
      required: greenRequired,
      remaining: greenCrafting.remaining,
      tooltip: greenCrafting.converted > 0
        ? `Остаток: ${greenCrafting.remaining} учений → ${greenCrafting.converted} указаний`
        : green < greenRequired
          ? 'Недостаточно, чтобы скрафтить следующий уровень'
          : ''
    };

    result['указания'] = {
      actual: blue,
      crafted: greenCrafting.converted,
      required: blueRequired,
      remaining: blueCrafting.remaining,
      tooltip: blueCrafting.converted > 0
        ? `Остаток: ${blueCrafting.remaining} указаний → ${blueCrafting.converted} философий`
        : blueTotal < blueRequired
          ? 'Недостаточно, чтобы скрафтить следующий уровень'
          : ''
    };

    result['философия'] = {
      actual: purple,
      crafted: blueCrafting.converted,
      required: purpleRequired,
      remaining: 0,
      tooltip: ''
    };
  }

  // Обработка дропа с мобов
  if (materials.mob_drops) {
    const drops = materials.mob_drops;
    
    const green = progress[itemName]?.['старинный_гарда'] || 0;
    const blue = progress[itemName]?.['кагэути_гарда'] || 0;
    const purple = progress[itemName]?.['знаменитый_гарда'] || 0;

    const greenRequired = drops['старинный_гарда'] || 0;
    const blueRequired = drops['кагэути_гарда'] || 0;
    const purpleRequired = drops['знаменитый_гарда'] || 0;

    const greenCrafting = getConvertedAmount(green, greenRequired);
    const blueTotal = blue + greenCrafting.converted;
    const blueCrafting = getConvertedAmount(blueTotal, blueRequired);
    const purpleTotal = purple + blueCrafting.converted;

    result['старинный_гарда'] = {
      actual: green,
      crafted: 0,
      required: greenRequired,
      remaining: greenCrafting.remaining,
      tooltip: greenCrafting.converted > 0
        ? `Остаток: ${greenCrafting.remaining} старинных гарда → ${greenCrafting.converted} кагэути гарда`
        : green < greenRequired
          ? 'Недостаточно, чтобы скрафтить следующий уровень'
          : ''
    };

    result['кагэути_гарда'] = {
      actual: blue,
      crafted: greenCrafting.converted,
      required: blueRequired,
      remaining: blueCrafting.remaining,
      tooltip: blueCrafting.converted > 0
        ? `Остаток: ${blueCrafting.remaining} кагэути гарда → ${blueCrafting.converted} знаменитых гарда`
        : blueTotal < blueRequired
          ? 'Недостаточно, чтобы скрафтить следующий уровень'
          : ''
    };

    result['знаменитый_гарда'] = {
      actual: purple,
      crafted: blueCrafting.converted,
      required: purpleRequired,
      remaining: 0,
      tooltip: ''
    };
  }

  // Обработка опыта персонажа
  if (materials.experience) {
    const exp = materials.experience;
    const hero = progress[itemName]?.['опыт_героя'] || 0;
    const adventurer = progress[itemName]?.['приключенческий_опыт'] || 0;
    const wanderer = progress[itemName]?.['совет_странника'] || 0;

    const heroRequired = exp['опыт_героя'] || 0;
    const adventurerRequired = exp['приключенческий_опыт'] || 0;
    const wandererRequired = exp['совет_странника'] || 0;

    const totalExp = hero + Math.floor(adventurer * 5 / 20) + Math.floor(wanderer / 20);
    const totalRequired = heroRequired + Math.floor(adventurerRequired * 5 / 20) + Math.floor(wandererRequired / 20);

    result['опыт_персонажа'] = {
      actual: totalExp,
      crafted: 0,
      required: totalRequired,
      remaining: 0,
      tooltip: `Опыт героя: ${hero}\nПутешественника: ${adventurer}\nСовет странника: ${wanderer}\n→ Всего: ${totalExp} опыта героя`
    };
  }

  return result;
}

function renderMaterialBlock(
  title: string,
  materials: any,
  progress: MaterialProgress,
  itemName: string,
  updateProgress: (itemName: string, matKey: string, value: number) => void
) {
  const distribution = calculateMaterialDistribution(progress, itemName, materials);
  const craftedMaterials = calculateCraftedMaterials(progress, itemName, materials, distribution);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-4">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      
      {Object.entries(materials).map(([key, value]) => {
        if (typeof value === 'object' && value !== null) {
          if ('name' in value && 'count' in value) {
            return (
              <div key={key} className="mb-4">
                <div className="flex justify-between items-center">
                  <span>{key === 'boss_material' ? 'Босс-материал' : 'Локальный материал'}: {String(value.name)}</span>
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      value={progress[itemName]?.[key] || 0}
                      onChange={e => updateProgress(itemName, key, parseInt(e.target.value))}
                      className="w-16 p-1 rounded bg-gray-100 dark:bg-gray-700 text-right"
                      min="0"
                      style={{ 
                        minWidth: '4ch', 
                        maxWidth: '5ch', 
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}
                    />
                    <span className="text-sm text-gray-500">/ {String(value.count)}</span>
                  </div>
                </div>
              </div>
            );
          } else {
            return (
              <div key={key} className="mb-4">
                <h4 className="font-medium mb-2">
                  {key === 'elemental_gems' ? 'Элементальный драгоценный камень' :
                   key === 'mob_drops' ? 'Дроп с мобов' :
                   key === 'talent_books' ? 'Книги талантов' :
                   key === 'experience' ? 'Опыт персонажа' :
                   key === 'mora_ascension' || key === 'mora_talents' || key === 'mora_experience' ? 'Мора' : key}
                </h4>
                {key === 'mora_ascension' || key === 'mora_talents' || key === 'mora_experience' ? (
                  <div className="flex justify-between items-center">
                    <span>Мора</span>
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        value={progress[itemName]?.[key] || 0}
                        onChange={e => updateProgress(itemName, key, parseInt(e.target.value))}
                        className="w-16 p-1 rounded bg-gray-100 dark:bg-gray-700 text-right"
                        min="0"
                        style={{ 
                          minWidth: '4ch', 
                          maxWidth: '5ch', 
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}
                      />
                      <span className="text-sm text-gray-500">/ {String(value)}</span>
                    </div>
                  </div>
                ) : key === 'experience' ? (
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center space-x-1">
                      <span>Опыт персонажа</span>
                      <div className="tooltip">
                        <span className="text-gray-500 cursor-help">❔</span>
                        {craftedMaterials['опыт_персонажа']?.tooltip && (
                          <span className="tooltip-text whitespace-pre-line">{craftedMaterials['опыт_персонажа'].tooltip}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        value={progress[itemName]?.['опыт_героя'] || 0}
                        onChange={e => updateProgress(itemName, 'опыт_героя', parseInt(e.target.value))}
                        className="w-16 p-1 rounded bg-gray-100 dark:bg-gray-700 text-right"
                        min="0"
                        style={{ 
                          minWidth: '4ch', 
                          maxWidth: '5ch', 
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}
                      />
                      <span className="text-sm text-gray-500">
                        {craftedMaterials['опыт_персонажа'] ? 
                          `${craftedMaterials['опыт_персонажа'].actual} / ${craftedMaterials['опыт_персонажа'].required}` : 
                          '0 / 0'}
                      </span>
                    </div>
                  </div>
                ) : (
                  Object.entries(value).map(([subKey, subValue]) => {
                    const crafted = craftedMaterials[subKey];
                    const dist = distribution[subKey];
                    const currentValue = progress[itemName]?.[subKey] || 0;
                    const totalValue = crafted ? currentValue + crafted.crafted : currentValue;
                    
                    return (
                      <div key={subKey} className="flex justify-between items-center mb-2">
                        <div className="flex flex-col">
                          <div className="flex items-center space-x-1">
                            <span>{formatMaterialName(subKey)}</span>
                            <div className="tooltip">
                              <span className="text-gray-500 cursor-help">❔</span>
                              {dist?.tooltip && (
                                <span className="tooltip-text whitespace-pre-line">{dist.tooltip}</span>
                              )}
                              {!dist?.tooltip && crafted?.tooltip && (
                                <span className="tooltip-text">{crafted.tooltip}</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="number"
                            value={currentValue}
                            onChange={e => updateProgress(itemName, subKey, parseInt(e.target.value))}
                            className="w-16 p-1 rounded bg-gray-100 dark:bg-gray-700 text-right"
                            min="0"
                            style={{ 
                              minWidth: '4ch', 
                              maxWidth: '5ch', 
                              overflow: 'hidden',
                              textOverflow: 'ellipsis'
                            }}
                          />
                          <span className="text-sm text-gray-500">
                            {totalValue} / {String(subValue)}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            );
          }
        } else {
          return (
            <div key={key} className="flex justify-between items-center mb-2">
              <span>{formatMaterialName(key)}</span>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  value={progress[itemName]?.[key] || 0}
                  onChange={e => updateProgress(itemName, key, parseInt(e.target.value))}
                  className="w-16 p-1 rounded bg-gray-100 dark:bg-gray-700 text-right"
                  min="0"
                  style={{ 
                    minWidth: '4ch', 
                    maxWidth: '5ch', 
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}
                />
                <span className="text-sm text-gray-500">/ {String(value)}</span>
              </div>
            </div>
          );
        }
      })}

      <style>
        {`
          .tooltip {
            position: relative;
            display: inline-block;
          }

          .tooltip-text {
            visibility: hidden;
            width: max-content;
            background-color: #333;
            color: #fff;
            text-align: left;
            padding: 5px;
            border-radius: 5px;
            position: absolute;
            z-index: 10;
            top: -5px;
            left: 110%;
            white-space: nowrap;
          }

          .tooltip:hover .tooltip-text {
            visibility: visible;
          }
        `}
      </style>
    </div>
  );
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

  const charactersData: MaterialsData[] = Object.entries(materialsData.characters).map(([name, data]: [string, any]) => ({
    type: 'character',
    name,
    materials: {
      'Материалы для возвышения': {
        elemental_gems: data.ascension?.total?.materials?.elemental_gems,
        boss_material: data.ascension?.total?.materials?.boss_material,
        local_specialty: data.ascension?.total?.materials?.local_specialty,
        mob_drops: data.ascension?.total?.materials?.mob_drops,
        mora_ascension: data.ascension?.total?.mora_ascension || 0
      },
      'Материалы для талантов': {
        talent_books: data.talents?.total?.materials?.talent_books,
        mob_drops_talents: data.talents?.total?.materials?.mob_drops_talents,
        weekly_boss: data.talents?.total?.materials?.weekly_boss,
        crown_of_insight: data.talents?.total?.materials?.crown_of_insight || 0,
        mora_talents: data.talents?.total?.mora_talents || 0
      },
      'Опыт и мора': {
        books: data.experience?.total?.books,
        mora_experience: data.experience?.total?.mora_experience || 0
      }
    }
  }));

  const weaponsData: MaterialsData[] = Object.entries(materialsData.weapons).map(([name, data]: [string, any]) => ({
    type: 'weapon',
    name,
    materials: {
      'Материалы для возвышения': {
        elemental_gems: data.ascension?.total?.materials?.dungeon_materials,
        mob_drops: data.ascension?.total?.materials?.mob_drops_weapon,
        boss_material: data.ascension?.total?.materials?.weapon_ascension,
        mora_ascension: data.ascension?.total?.mora || 0
      },
      'Материалы для талантов': {
        mora_talents: 0,
        crown_of_insight: 0
      },
      'Опыт и мора': {
        mora_experience: 0
      }
    }
  }));

  const allData = [...charactersData, ...weaponsData];

  const filteredItems = allData.filter(
    item => item.type === selectedType && 
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const updateProgress = (itemName: string, matKey: string, value: number) => {
    setProgress(prev => ({
      ...prev,
      [itemName]: {
        ...prev[itemName],
        [matKey]: Math.max(0, value)
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
          const item = allData.find(i => i.name === e.target.value);
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
            renderMaterialBlock(category, materials, progress, selectedItem.name, updateProgress)
          ))}
        </div>
      )}
    </div>
  );
}; 