#!/bin/bash

# Проверяем, запущен ли уже сервер
if pgrep -f "vite" > /dev/null; then
    echo "Сервер уже запущен"
else
    echo "Запускаем сервер разработки..."
    npm run dev:watch
fi 