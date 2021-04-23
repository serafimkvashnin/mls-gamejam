import { LoadedContentFixer, LoadManager } from "./nerdEngine/managers/saveSystem";
import { DataManager, nerdEngine } from "./nerdEngine";
import { SaveMaker } from "./nerdEngine/managers/saveSystem";

export let NerdEngine: nerdEngine;
let loadManager: LoadManager;

export function InitEngine() {
    NerdEngine = new nerdEngine({
        gameName: "DualForce Idle",
        buildMode: "Preview",
        saveMaker: (engine: nerdEngine) => new SaveMaker(engine), //todo хуйня какая-то если честно,
        loadManager: (engine: nerdEngine, contentFixer?: LoadedContentFixer) => {
            if (!loadManager) {
                loadManager = new LoadManager(engine, contentFixer)
            }
            loadManager.Engine = engine;

            if (contentFixer) {
                loadManager.ContentFixer = contentFixer;
            }

            loadManager.Reset();
            return loadManager;
        },

        fileSystem: new DataManager(),
        platform: "None",

        contentInitCallback: () => {

        },
        contentResetCallback: () => {

        },

        customTypes: () => ({

        }),
    });

    (<any>window).Nerd = NerdEngine;
    console.log(`[DevInfo] Use 'Nerd' to access nerdEngine`);

    console.log(`Engine initiated`);
}