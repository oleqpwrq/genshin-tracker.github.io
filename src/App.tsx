import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Layout, theme, ConfigProvider } from 'antd';
import { Navigation } from './components/Navigation';
import { PrayerCounter } from './components/PrayerCounter';
import { Materials } from './components/Materials';
import { Resin } from './components/Resin';
import { Expedition } from './components/Expedition';
import { Teapot } from './components/Teapot';
import { Profile } from './components/Profile';

const { Content } = Layout;

function App() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });

  const [background, setBackground] = useState(() => {
    const saved = localStorage.getItem('profileSettings');
    if (saved) {
      const settings = JSON.parse(saved);
      return settings.customBackground || settings.background;
    }
    return '/genshin-tracker/images/banner-1.png';
  });

  const [blurAmount, setBlurAmount] = useState(() => {
    const saved = localStorage.getItem('backgroundBlur');
    return saved ? JSON.parse(saved) : 0;
  });

  const { token } = theme.useToken();

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  useEffect(() => {
    localStorage.setItem('backgroundBlur', JSON.stringify(blurAmount));
  }, [blurAmount]);

  useEffect(() => {
    const saved = localStorage.getItem('profileSettings');
    if (saved) {
      const settings = JSON.parse(saved);
      setBackground(settings.customBackground || settings.background);
    }
  }, []);

  useEffect(() => {
    const img = new Image();
    img.src = background;
    img.onerror = () => {
      console.error('Ошибка загрузки фона:', background);
      setBackground('/genshin-tracker/images/banner-1.png');
    };
  }, [background]);

  return (
    <ConfigProvider
      theme={{
        algorithm: isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: {
          colorBgContainer: isDarkMode ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.8)',
          colorText: isDarkMode ? '#000000' : '#000000',
          colorTextHeading: isDarkMode ? '#000000' : '#000000',
        },
        components: {
          Typography: {
            colorTextHeading: isDarkMode ? '#000000' : '#000000',
          },
          Card: {
            colorTextHeading: isDarkMode ? '#000000' : '#000000',
          },
        },
      }}
    >
      <Router basename="/genshin-tracker.github.io">
        <div 
          style={{ 
            minHeight: '100vh',
            backgroundImage: `url(${background})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed',
            backgroundRepeat: 'no-repeat',
            filter: `blur(${blurAmount}px)`,
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: -1
          }}
        />
        <Layout style={{ minHeight: '100vh', background: 'transparent', position: 'relative', zIndex: 1 }}>
          <Navigation isDarkMode={isDarkMode} toggleDarkMode={() => setIsDarkMode(!isDarkMode)} />
          <Content style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
            <Routes>
              <Route path="/" element={<PrayerCounter />} />
              <Route path="/materials" element={<Materials />} />
              <Route path="/resin" element={<Resin />} />
              <Route path="/expeditions" element={<Expedition />} />
              <Route path="/teapot" element={<Teapot />} />
              <Route path="/profile" element={<Profile onBlurChange={setBlurAmount} currentBlur={blurAmount} />} />
            </Routes>
          </Content>
        </Layout>
      </Router>
    </ConfigProvider>
  );
}

export default App; 