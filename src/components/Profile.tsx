import React, { useState, useEffect } from 'react';
import { Card, Avatar, Upload, Button, message, Select, Slider } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import type { UploadProps } from 'antd';

interface ProfileSettings {
  avatar: string;
  background: string;
  customBackground: string | null;
  nickname?: string;
  uid?: string;
  headerBg?: string;
}

interface ProfileProps {
  onBlurChange: (value: number) => void;
  currentBlur: number;
}

export const Profile: React.FC<ProfileProps> = ({ onBlurChange, currentBlur }) => {
  const [settings, setSettings] = useState<ProfileSettings>(() => {
    const saved = localStorage.getItem('profileSettings');
    return saved ? JSON.parse(saved) : {
      avatar: '/genshin-tracker.github.io/images/banner-1.png',
      background: '/genshin-tracker.github.io/images/backgrounds/anime-genshin-impact-genshin-impact-1572562.jpg',
      customBackground: null,
      nickname: '',
      uid: '',
      headerBg: '/genshin-tracker.github.io/images/backgrounds/anime-genshin-impact-genshin-impact-1572562.jpg'
    };
  });

  useEffect(() => {
    localStorage.setItem('profileSettings', JSON.stringify(settings));
  }, [settings]);

  const handleAvatarUpload: UploadProps['customRequest'] = ({ file, onSuccess }) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setSettings(prev => ({
        ...prev,
        avatar: reader.result as string
      }));
      onSuccess?.('ok');
      message.success('Аватар успешно загружен');
    };
    reader.readAsDataURL(file as Blob);
  };

  const handleBackgroundUpload: UploadProps['customRequest'] = ({ file, onSuccess }) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setSettings(prev => ({
        ...prev,
        customBackground: reader.result as string
      }));
      onSuccess?.('ok');
      message.success('Фон успешно загружен');
    };
    reader.readAsDataURL(file as Blob);
  };

  const handleBackgroundChange = (value: string) => {
    setSettings(prev => ({
      ...prev,
      background: value,
      customBackground: null
    }));
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '24px' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '24px', color: '#000000' }}>Профиль</h1>
      
      <Card title="Аватар" style={{ marginBottom: '24px', background: 'rgba(255, 255, 255, 0.9)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <Avatar size={128} src={settings.avatar} />
          <Upload
            accept="image/*"
            showUploadList={false}
            customRequest={handleAvatarUpload}
          >
            <Button icon={<UploadOutlined />}>Загрузить аватар</Button>
          </Upload>
        </div>
      </Card>

      <Card title="Профиль игрока" style={{ marginBottom: '24px', background: 'rgba(255, 255, 255, 0.9)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <input
            type="text"
            placeholder="Никнейм"
            value={settings.nickname || ''}
            onChange={e => setSettings(prev => ({ ...prev, nickname: e.target.value }))}
            style={{ padding: '8px', borderRadius: '8px', border: '1px solid #ccc', width: '100%' }}
          />
          <input
            type="text"
            placeholder="UID"
            value={settings.uid || ''}
            onChange={e => setSettings(prev => ({ ...prev, uid: e.target.value }))}
            style={{ padding: '8px', borderRadius: '8px', border: '1px solid #ccc', width: '100%' }}
          />
        </div>
      </Card>

      <Card title="Подложка для профиля в хедере" style={{ marginBottom: '24px', background: 'rgba(255, 255, 255, 0.9)' }}>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          {[
            '/genshin-tracker.github.io/images/headers/header1.jpg',
            '/genshin-tracker.github.io/images/headers/header2.jpg',
            '/genshin-tracker.github.io/images/headers/header3.jpg',
            '/genshin-tracker.github.io/images/headers/header4.jpg'
          ].map(bg => (
            <img
              key={bg}
              src={bg}
              alt="header-bg"
              style={{
                width: '120px', height: '60px', objectFit: 'cover', borderRadius: '8px', border: settings.headerBg === bg ? '3px solid #1890ff' : '2px solid #ccc', cursor: 'pointer'
              }}
              onClick={() => setSettings(prev => ({ ...prev, headerBg: bg }))}
            />
          ))}
        </div>
      </Card>

      <Card title="Фон приложения" style={{ marginBottom: '24px', background: 'rgba(255, 255, 255, 0.9)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <img
              src={settings.customBackground || settings.background}
              alt="Фон"
              style={{ width: '160px', height: '96px', objectFit: 'cover', borderRadius: '8px' }}
            />
            <Select
              value={settings.background}
              onChange={value => {
                setSettings(prev => ({
                  ...prev,
                  background: value,
                  customBackground: null
                }));
                window.dispatchEvent(new Event('storage'));
              }}
              style={{ width: '200px' }}
            >
              <Select.Option value="/genshin-tracker.github.io/images/backgrounds/background.jpeg">
                По умолчанию
              </Select.Option>
              <Select.Option value="/genshin-tracker.github.io/images/backgrounds/anime-genshin-impact-genshin-impact-1572562.jpg">
                Фон 1
              </Select.Option>
              <Select.Option value="/genshin-tracker.github.io/images/backgrounds/genshin_town_nature_beauty_genshin_impact_wallpaper_2400x1350_50.jpg">
                Фон 2
              </Select.Option>
              <Select.Option value="/genshin-tracker.github.io/images/backgrounds/1645057674_5-abrakadabra-fun-p-fon-v-stim-genshin-5.jpg">
                Фон 3
              </Select.Option>
            </Select>
          </div>

          <Upload
            accept="image/*"
            showUploadList={false}
            customRequest={handleBackgroundUpload}
          >
            <Button icon={<UploadOutlined />}>Загрузить свой фон</Button>
          </Upload>
        </div>
      </Card>

      <Card title="Настройки фона" style={{ background: 'rgba(255, 255, 255, 0.9)' }}>
        <div style={{ padding: '0 16px' }}>
          <div style={{ marginBottom: '16px' }}>
            <h3 style={{ marginBottom: '8px' }}>Размытие фона</h3>
            <Slider
              min={0}
              max={20}
              value={currentBlur}
              onChange={onBlurChange}
              marks={{
                0: 'Нет',
                5: '5px',
                10: '10px',
                15: '15px',
                20: '20px'
              }}
            />
          </div>
        </div>
      </Card>
    </div>
  );
}; 