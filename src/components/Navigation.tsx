import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Layout, Menu, Button, theme, Avatar, Drawer } from 'antd';
import { BulbOutlined, BulbFilled, MenuOutlined } from '@ant-design/icons';

const { Header } = Layout;

interface NavigationProps {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

export const Navigation = ({ isDarkMode, toggleDarkMode }: NavigationProps) => {
  const location = useLocation();
  const { token } = theme.useToken();
  const [drawerOpen, setDrawerOpen] = React.useState(false);

  // Получаем данные профиля из localStorage
  const profileSettings = (() => {
    try {
      return JSON.parse(localStorage.getItem('profileSettings') || '{}');
    } catch {
      return {};
    }
  })();

  const navItems = [
    { path: '/', label: 'Счетчик молитв' },
    { path: '/materials', label: 'Материалы' },
    { path: '/resin', label: 'Смола' },
    { path: '/expeditions', label: 'Экспедиции' },
    { path: '/teapot', label: 'Сокровища обители' },
    { path: '/profile', label: 'Профиль' },
  ];

  // Мобильная версия: показываем гамбургер и Drawer
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;

  React.useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768 && drawerOpen) setDrawerOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [drawerOpen]);

  return (
    <>
      {/* Desktop header */}
      <Header
        style={{
          background: isDarkMode ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.8)',
          padding: '0 24px',
          display: isMobile ? 'none' : 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backdropFilter: 'blur(10px)',
          borderBottom: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
          minHeight: 100,
          height: 100,
          maxHeight: 100
        }}
      >
        <div className="flex items-center">
          <Link to="/" className="mr-8 hover:opacity-80 transition-opacity">
            <img 
              src="/genshin-tracker.github.io/images/logo.png" 
              alt="Genshin Tracker" 
              style={{ height: '70px', width: 'auto' }}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/genshin-tracker.github.io/images/banner-1.png';
              }}
            />
          </Link>
          <Menu
            mode="horizontal"
            selectedKeys={[location.pathname]}
            style={{ 
              flex: 1, 
              border: 'none', 
              background: 'transparent',
              color: isDarkMode ? 'white' : 'black'
            }}
            theme={isDarkMode ? 'dark' : 'light'}
          >
            {navItems.map((item) => (
              <Menu.Item key={item.path}>
                <Link to={item.path}>{item.label}</Link>
              </Menu.Item>
            ))}
          </Menu>
        </div>
        {/* Блок профиля справа */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              background: `url(${profileSettings.headerBg || '/genshin-tracker.github.io/images/headers/header1.jpg'}) center/cover`,
              borderRadius: '16px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              padding: '10px 18px',
              width: 200,
              height: 80,
              minWidth: 200,
              minHeight: 80,
              maxWidth: 200,
              maxHeight: 80,
              overflow: 'hidden'
            }}
          >
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background: 'rgba(0,0,0,0.35)',
              backdropFilter: 'blur(5px)',
              WebkitBackdropFilter: 'blur(5px)',
              zIndex: 1
            }} />
            <Avatar
              size={48}
              src={profileSettings.avatar || '/genshin-tracker.github.io/images/banner-1.png'}
              style={{ border: '2px solid #fff', marginRight: 14, objectFit: 'cover', zIndex: 2 }}
            />
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', height: '100%', overflow: 'hidden', width: '120px', zIndex: 2 }}>
              <span style={{ color: '#fff', textShadow: '0 1px 4px #000', fontWeight: 600, fontSize: 16, lineHeight: 1.1, overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 120, whiteSpace: 'nowrap' }}>
                {profileSettings.nickname || 'Никнейм'}
              </span>
              <span style={{ color: '#eee', textShadow: '0 1px 4px #000', fontWeight: 400, fontSize: 14, lineHeight: 1.1, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 120, whiteSpace: 'nowrap' }}>
                UID: {profileSettings.uid || '000000000'}
              </span>
            </div>
          </div>
          <Button
            type="text"
            icon={isDarkMode ? <BulbFilled /> : <BulbOutlined />}
            onClick={toggleDarkMode}
            style={{ 
              marginLeft: '16px',
              color: isDarkMode ? 'white' : 'black'
            }}
          />
        </div>
      </Header>
      {/* Mobile header */}
      {isMobile && (
        <div style={{
          width: '100%',
          height: 64,
          background: isDarkMode ? 'rgba(0,0,0,0.85)' : 'rgba(255,255,255,0.95)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 16px',
          position: 'fixed',
          top: 0,
          left: 0,
          zIndex: 1000,
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
        }}>
          <Link to="/">
            <img src="/genshin-tracker.github.io/images/logo.png" alt="Genshin Tracker" style={{ height: 40 }} />
          </Link>
          <MenuOutlined style={{ fontSize: 28, cursor: 'pointer' }} onClick={() => setDrawerOpen(true)} />
        </div>
      )}
      <Drawer
        title={null}
        placement="right"
        closable={true}
        onClose={() => setDrawerOpen(false)}
        open={drawerOpen}
        width={260}
        bodyStyle={{ padding: 0, background: isDarkMode ? '#222' : '#fff' }}
        headerStyle={{ display: 'none' }}
      >
        <div style={{ padding: 16 }}>
          {/* Блок профиля */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              background: `url(${profileSettings.headerBg || '/genshin-tracker.github.io/images/headers/header1.jpg'}) center/cover`,
              borderRadius: '16px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              padding: '10px 18px',
              width: 200,
              height: 80,
              minWidth: 200,
              minHeight: 80,
              maxWidth: 200,
              maxHeight: 80,
              overflow: 'hidden',
              margin: '0 auto 24px auto',
              position: 'relative'
            }}
          >
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background: 'rgba(0,0,0,0.35)',
              backdropFilter: 'blur(5px)',
              WebkitBackdropFilter: 'blur(5px)',
              zIndex: 1
            }} />
            <Avatar
              size={48}
              src={profileSettings.avatar || '/genshin-tracker.github.io/images/banner-1.png'}
              style={{ border: '2px solid #fff', marginRight: 14, objectFit: 'cover', zIndex: 2 }}
            />
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', height: '100%', overflow: 'hidden', width: '120px', zIndex: 2 }}>
              <span style={{ color: '#fff', textShadow: '0 1px 4px #000', fontWeight: 600, fontSize: 16, lineHeight: 1.1, overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 120, whiteSpace: 'nowrap' }}>
                {profileSettings.nickname || 'Никнейм'}
              </span>
              <span style={{ color: '#eee', textShadow: '0 1px 4px #000', fontWeight: 400, fontSize: 14, lineHeight: 1.1, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 120, whiteSpace: 'nowrap' }}>
                UID: {profileSettings.uid || '000000000'}
              </span>
            </div>
          </div>
          {/* Навигация */}
          <Menu
            mode="vertical"
            selectedKeys={[location.pathname]}
            style={{ border: 'none', background: 'transparent', color: isDarkMode ? 'white' : 'black' }}
            theme={isDarkMode ? 'dark' : 'light'}
            onClick={() => setDrawerOpen(false)}
          >
            {navItems.map((item) => (
              <Menu.Item key={item.path}>
                <Link to={item.path}>{item.label}</Link>
              </Menu.Item>
            ))}
          </Menu>
          <Button
            type="text"
            icon={isDarkMode ? <BulbFilled /> : <BulbOutlined />}
            onClick={toggleDarkMode}
            style={{ marginTop: 24, color: isDarkMode ? 'white' : 'black', width: '100%' }}
          >
            {isDarkMode ? 'Светлая тема' : 'Темная тема'}
          </Button>
        </div>
      </Drawer>
    </>
  );
}; 