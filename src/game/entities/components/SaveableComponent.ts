import { Component } from "./Component";

//todo ну, моя система пока не особо поддерживает вот такое сохранение конкретных объектов по желанию
//todo но когда буду переписывать движок ещё раз, я это добавлю @Felix 19.03.2021
export abstract class SavebleComponent extends Component {
    public save(): void {}
    public load(): void {}
}