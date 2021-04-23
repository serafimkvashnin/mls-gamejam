import { ContentManger } from "../content/ContentManger";
import { nerdEngine } from "../../nerdEngine";

/* idea: Ну вообще, можно создать свой подкласс nerdEngine и по сути объединить его с этим GameManager, не?  @Felix */
export class GameManager {

    private currentMenu: "Menu" | "Game";
    public readonly Content: ContentManger;

    constructor(public readonly Engine: nerdEngine) {
        this.currentMenu = "Game";
        this.Content = new ContentManger(this);
    }
}