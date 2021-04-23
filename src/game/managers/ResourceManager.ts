import {Resource} from "../resources/Resource";
import { ValuesOf } from "../../nerdEngine/utils/utilsObjects";
import { ResourceRegister } from "../registry/ResourceRegister";

export class ResourceManager {

    public readonly Scene: Phaser.Scene;
    public readonly Resources: Resource[];

    constructor(scene: Phaser.Scene) {
        this.Scene = scene;
        this.Resources = [];

        this.AddToResourceList(ValuesOf(ResourceRegister.Textures));
        this.AddToResourceList(ValuesOf(ResourceRegister.Sounds));
    }

    private AddToResourceList(resource: Resource | Resource[]) {
        resource = Array.isArray(resource) ? resource : [ resource ];
        this.Resources.push(...resource);
    }

    private GetAllLoadingResources() {
        return [
            ...this.Scene.load.list.getArray(),
            ...this.Scene.load.queue.getArray(),
            ...this.Scene.load.inflight.getArray()
        ];
    }

    /**
     * Use it check if some resource is already is loading or not by key
     * @param key
     */
    private GetByKey(key: string) {
        return this.GetAllLoadingResources().find(item => item.key == key)
    }

    /**
     * Use it check if some resource is already is loading or not by path
     * @param path
     */
    private GetByPath(path: string) {
        return this.GetAllLoadingResources().find(item => item.src == path)
    }

    Preload() {
        let loaded = 0;
        for (const resource of this.Resources) {

            if (!this.GetByKey(resource.Id) && !this.GetByPath(resource.Path)) {
                resource.Load(this.Scene.load);
                loaded++;
            }
            else {
                console.log(`[ResourceManager] Resource of type '${resource.Type}' is already loading: '${resource.Id}'!`)
            }
        }

        console.log(`[ResourceManager] Loaded ${loaded} / ${this.Resources.length} resources!`);
    }
}