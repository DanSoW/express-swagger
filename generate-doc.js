import express from "express";                                      // Подключение Express.js (формальность)
import ExpressSwaggerGenerator from 'express-swagger-generator';    // Подключение пакета для автоматического генерирования документации
import swiggerOptions from './config/swigger.options.js';           // Подключение опций для Swagger
import { fileURLToPath } from 'url';                                
import { dirname } from 'path';
const __dirname = dirname(fileURLToPath(import.meta.url));
import jsonToYaml from 'json2yaml';                                 // Подключение конвертера из JSON в YAML
import fs from 'fs';
import swaggerConverter from 'swagger2openapi';                     // Подключение конвертера документации Swagger2 в OpenAPI 3

// Привязка генератора к конкретному экземпляру приложения Express
const expressSwaggerGenerator = ExpressSwaggerGenerator(express());

// Генерирование документации по определённым настройкам
const swaggerDoc = expressSwaggerGenerator(swiggerOptions(__dirname));

// Синхронная запись данных в файл документации
fs.writeFileSync('./docs/docs_swagger2.yaml', jsonToYaml.stringify(swaggerDoc));

// Процесс конвертации документации в формате Swagger 2 в документацию формата OpenAPI 3
swaggerConverter.convertObj(swaggerDoc, {}, (err, options) => {
    if (err) {
        console.error(err);
    } else {
        // Конвертация JSON в YAML
        const output = jsonToYaml.stringify(options.openapi);

        // Запись результата конвертации документации в файл (он в дальнейшем и используется по умолчанию для вывода документации)
        fs.writeFileSync('./docs/docs.yaml', output);
        process.exit(0);
    }
});