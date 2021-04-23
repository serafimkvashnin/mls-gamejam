import {EventHandler} from "./EventHandler";

export class EventHandlerComponent extends EventHandler {

    /**
     * Use this class as property in your own type, to avoid inheritance from EventHandler (when you can't do it at least)
     * @param events Object with properties as event names
     */
    constructor(events?: { [index: string]: string }) {
        super();

        if (events) {
            for (const key in events) {
                this.registerEventName(events[key]);
            }
        }
    }
}