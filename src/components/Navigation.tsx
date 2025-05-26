import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Layout, Menu, Button, theme } from 'antd';
import { BulbOutlined, BulbFilled } from '@ant-design/icons';

const { Header } = Layout;

interface NavigationProps {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

export const Navigation = ({ isDarkMode, toggleDarkMode }: NavigationProps) => {
  const location = useLocation();
  const { token } = theme.useToken();

  const navItems = [
    { path: '/', label: 'Счетчик молитв' },
    { path: '/materials', label: 'Материалы' },
    { path: '/resin', label: 'Смола' },
    { path: '/expeditions', label: 'Экспедиции' },
    { path: '/teapot', label: 'Сокровища обители' },
    { path: '/profile', label: 'Профиль' },
  ];

  return (
    <Header 
      style={{ 
        background: isDarkMode ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.8)',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backdropFilter: 'blur(10px)',
        borderBottom: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`
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
      <Button
        type="text"
        icon={isDarkMode ? <BulbFilled /> : <BulbOutlined />}
        onClick={toggleDarkMode}
        style={{ 
          marginLeft: '16px',
          color: isDarkMode ? 'white' : 'black'
        }}
      />
    </Header>
  );
}; 