// Конфигурирование пакета dotenv, для обращения к переменным окружения
import dotenv from 'dotenv';
dotenv.config({ path: `.${process.env.NODE_ENV}.env` });

import express from "express";                                              // Подключение Express.js
import config from "config";                                                // Подключение config, для конфигурирования приложения
import logger from "./logger/logger.js";                                    // Подключение логгера
import cors from "cors";                                                    // Подключение cors'ов
import cookieParser from "cookie-parser";                                   // Подключение cookie-parses
import webApiConfig from "./config/web.api.json" assert { type: "json" };   // Подключение JSON-объекта
import { AuthRouteBase } from './constants/routes/auth.js';                 // Подключение базового маршрута авторизации (корневой route)
import AuthRouter from './routers/auth-routers.js';                         // Подключение роутеров авторизации
import errorMiddleware from './middlewares/error-middleware.js';            // Подключение промежуточного ПО для обработки ошибок
import db from "./db/index.js";                                             // Подключение к базе данных
import { fileURLToPath } from 'url';                                        // Подключение функции для конвертации URL в путь
import path, { dirname } from 'path';                                       // Подключение объекта для работы с путями и функции dirname
import YAML from 'yamljs';                                                  // Подключение объекта, для работы с YAML
import swaggerUi from 'swagger-ui-express';                                 // Подключение пакета swagger-ui-express
import ExpressSwaggerGenerator from 'express-swagger-generator';            // Подключение пакета express-swagger-generator
import swiggerOptions from './config/swigger.options.js';                   // Подключение настроек Swagger'a

// Получаем __dirname
const __dirname = dirname(fileURLToPath(import.meta.url));

// Загрузка файла документации
const swaggerDocument = YAML.load(path.join(__dirname, 'docs', 'docs.yaml'));

// Определение Express-приложения
const app = express();

// Опционально отображаем документацию Swagger версии 2
if (config.get("doc.swagger2") === true) {
    const expressSwaggerGenerator = ExpressSwaggerGenerator(app);
    expressSwaggerGenerator(swiggerOptions(__dirname));
}

app.use(express.json({ extended: true }));
app.use(cookieParser());

// Добавляем по маршруту /docs определённый контроллер (по /docs будет отображаться документация)
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Настройка cors-политик
app.use(cors({
    credentials: true,
    origin: webApiConfig['web_api'].map((value) => {
        return value;
    })
}));

// Установка маршрутов авторизации
app.use(AuthRouteBase, AuthRouter);

// Установка промежуточного ПО для обработки ошибок
app.use(errorMiddleware);

const PORT = config.get('port') || 5000;

/**
 * Запуск серверного приложения
 * @returns Экземпляр серверного приложения
 */
const start = () => {
    try {
        // Начало прослушивания входящих подключений
        const server = app.listen(PORT, () => console.log(`Сервер запущен с портом ${PORT}`));

        // Запись в логи
        logger.info({
            port: PORT,
            message: "Запуск сервера"
        });

        return server;
    } catch (e) {
        logger.error({
            message: e.message
        });

        process.exit(1);
    }
}

// Запуск сервера
const server = start();