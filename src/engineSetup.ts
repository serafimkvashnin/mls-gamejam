import { LoadedContentFixer, LoadManager } from "./nerdEngine/managers/saveSystem";
import { nerdEngine } from "./nerdEngine";
import { StartGame } from "./app";

let loadManager: LoadManager;

export function InitEngine() {
    return new nerdEngine({
        gameName: "DualForce Idle",
        buildMode: "Preview",
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
        platform: "None",

        contentInitCallback: () => StartGame(false),
        contentResetCallback: () => StartGame(true),

        customTypes: () => ({

        }),
    });
}