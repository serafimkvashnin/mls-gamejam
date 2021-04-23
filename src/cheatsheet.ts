// Переменные
const NAME_SIZE = 16;
let nickname = "Sima";
let age: number = 16;

// Декларация типов
type BuildMode = "Debug" | "Release";
type Sex = "Male" | "Female";

// Создание псевдонима для типа. то есть мы можем использовать age вместо number и не будет никакой разницы
type age = number;

// Объект объединяющий несколько типов (или)
let mode: BuildMode | Sex;
mode = "Release";
mode = "Male";

// Формальная система типов
type point = { x: number, y: number }
type named = { named: string }

let obj = {
    Name: "Serafim",
    LastName: "Kvashnin",
    Age: 19,
}

for (let key in obj) {
    // в чистом js могли бы сделать просто obj[key], но TS оберегает нас от всех этих ужасов

    let value = obj[key as keyof typeof obj];
}

//todo Доделать
