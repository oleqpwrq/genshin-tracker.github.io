export interface Material {
  name: string;
  green?: number;
  blue?: number;
  purple?: number;
  required?: number;
}

export interface CharacterMaterials {
  type: 'character';
  name: string;
  materials: {
    'Локальные диковинки': { name: string; required: number };
    'Гемы элемента': { name: string; required: number };
    'Босс-материал': { name: string; required: number };
    'Моб-дропы': Material[];
    'Книги талантов': Material[];
    'Особые материалы': Material[];
  };
}

export interface WeaponMaterials {
  type: 'weapon';
  name: string;
  materials: {
    'Материалы подземелий': Material[];
    'Моб-дропы': Material[];
    'Возвышение оружия': Material[];
  };
}

export type MaterialsData = CharacterMaterials | WeaponMaterials; 