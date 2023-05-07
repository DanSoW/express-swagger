/**
 * В данном файле находится функциональность, с помощью которой
 * возможно обновление пакетов в файла package.json.
 * Пакетные менеджеры npm и yarn отслеживают изменения в данном файле,
 * по этой причине возможно использование данного скрипта для обновления
 * пакетов при использовании yarn или npm
 */

// Импорт библиотеки для работы с файлами 
import fs from 'fs';

/**
 * Функция обновления зависимостей в package.json
 */
const wipeDependencies = () => {
    // Чтение всех данных из файла package.json
    const file = fs.readFileSync('package.json')

    // Парсинг данных
    const content = JSON.parse(file)

    // Пометка данных в структуре devDependencies как * (при npm i устанавливается самая последняя версия пакета
    // если его версия была указана как *)
    for (const devDep in content.devDependencies) {
        if (content.devDependencies[devDep].match(/\W+\d+.\d+.\d+-?((alpha|beta|rc)?.\d+)?/g)) {
            content.devDependencies[devDep] = '*';
        }
    }

    // Пометка данных в структуре dependencies как *
    for (const dep in content.dependencies) {
        if (content.dependencies[dep].match(/\W+\d+.\d+.\d+-?((alpha|beta|rc)?.\d+)?/g)) {
            content.dependencies[dep] = '*';
        }
    }

    // Перезапись файла package.json
    fs.writeFileSync('package.json', JSON.stringify(content))

    // После работы функции необходимо отформатировать с помощью форматера файл package.json,
    // и прописать команду npm i (или аналогичную с yarn)
}

wipeDependencies()
/*if (require.main === module) {
    
} else {
    module.exports = wipeDependencies
}*/