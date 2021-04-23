//Question: is a SceneID, TextureID and so on actually a good practice? I'm beginning to have doubts
// maybe we should just TextureRegister.Player.key and so on, but we will have some typing problems then.. ugh

export enum SceneID {
    LoaderScene = "LoaderScene",
    JamScene = "JamScene",

    TestScene = "TestScene",
    TestSceneUI = "TestSceneUI",
}