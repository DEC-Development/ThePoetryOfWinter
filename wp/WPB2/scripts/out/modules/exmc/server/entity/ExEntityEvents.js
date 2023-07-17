var _a;
import ExPlayer from '../entity/ExPlayer.js';
import EventHandle from "../events/EventHandle.js";
import { ExEventNames, ExOtherEventNames, ItemOnHandChangeEvent } from "../events/events.js";
export default class ExEntityEvents {
    constructor(ctrl) {
        this.exEvents = {
            [ExEventNames.beforeItemUse]: new Listener(this, ExEventNames.beforeItemUse),
            [ExEventNames.afterItemUse]: new Listener(this, ExEventNames.afterItemUse),
            [ExOtherEventNames.tick]: new Listener(this, ExOtherEventNames.tick),
            [ExEventNames.afterEntityHitBlock]: new Listener(this, ExEventNames.afterEntityHitBlock),
            [ExEventNames.afterEntityHitEntity]: new Listener(this, ExEventNames.afterEntityHitEntity),
            [ExOtherEventNames.afterOnHurt]: new Listener(this, ExOtherEventNames.afterOnHurt),
            [ExOtherEventNames.afterItemOnHandChange]: new Listener(this, ExOtherEventNames.afterItemOnHandChange),
            [ExOtherEventNames.onLongTick]: new Listener(this, ExOtherEventNames.onLongTick),
            [ExOtherEventNames.beforeTick]: new Listener(this, ExOtherEventNames.beforeTick),
            [ExEventNames.afterBlockBreak]: new Listener(this, ExEventNames.afterBlockBreak)
        };
        this._ctrl = ctrl;
    }
    _subscribe(arg0, callback) {
        ExEntityEvents.eventHandlers.subscribe(this._ctrl.entity, arg0, callback);
    }
    _unsubscribe(arg0, callback) {
        ExEntityEvents.eventHandlers.unsubscribe(this._ctrl.entity, arg0, callback);
    }
    cancelAll() {
        ExEntityEvents.eventHandlers.unsubscribeAll(this._ctrl.entity);
    }
    static init(s) {
        this.eventHandlers.setEventLiseners(this.exEventSetting);
        this.eventHandlers.init(s);
    }
    register(name, fun) {
        let func = fun;
        if (name in this.exEvents) {
            return this.exEvents[name].subscribe(func);
        }
        console.warn("No event registered for name " + name);
    }
    cancel(name, fun) {
        if (name in this.exEvents) {
            return this.exEvents[name].unsubscribe(fun);
        }
    }
}
_a = ExEntityEvents;
ExEntityEvents.eventHandlers = new EventHandle();
ExEntityEvents.exEventSetting = {
    [ExEventNames.beforeItemUse]: {
        pattern: ExEntityEvents.eventHandlers.registerToServerByEntity,
        filter: {
            "name": "source"
        }
    },
    [ExEventNames.afterItemUse]: {
        pattern: ExEntityEvents.eventHandlers.registerToServerByEntity,
        filter: {
            "name": "source"
        }
    },
    [ExOtherEventNames.tick]: {
        pattern: ExEntityEvents.eventHandlers.registerToServerByServerEvent
    },
    [ExOtherEventNames.beforeTick]: {
        pattern: ExEntityEvents.eventHandlers.registerToServerByServerEvent
    },
    [ExEventNames.afterEntityHitBlock]: {
        pattern: ExEntityEvents.eventHandlers.registerToServerByEntity,
        filter: {
            "name": "entity"
        }
    },
    [ExEventNames.afterEntityHitEntity]: {
        pattern: ExEntityEvents.eventHandlers.registerToServerByEntity,
        filter: {
            "name": "damageSource.damagingEntity"
        },
        name: ExEventNames.afterEntityHurt
    },
    [ExOtherEventNames.afterOnHurt]: {
        pattern: ExEntityEvents.eventHandlers.registerToServerByEntity,
        filter: {
            "name": "hurtEntity"
        },
        name: ExEventNames.afterEntityHurt
    },
    [ExOtherEventNames.afterItemOnHandChange]: {
        pattern: (registerName, k) => {
            _a.onHandItemMap = new Map();
            ExEntityEvents.eventHandlers.server.getEvents().register(registerName, (e) => {
                for (let i of ExEntityEvents.eventHandlers.monitorMap[k]) {
                    let lastItemCache = _a.onHandItemMap.get(i[0]);
                    let lastItem = lastItemCache === null || lastItemCache === void 0 ? void 0 : lastItemCache[0];
                    let nowItem = ExPlayer.getInstance(i[0]).getBag().itemOnMainHand;
                    if ((lastItem === null || lastItem === void 0 ? void 0 : lastItem.typeId) !== (nowItem === null || nowItem === void 0 ? void 0 : nowItem.typeId) || i[0].selectedSlot !== (lastItemCache === null || lastItemCache === void 0 ? void 0 : lastItemCache[1])) {
                        i[1].forEach((f) => {
                            var _b;
                            f(new ItemOnHandChangeEvent(lastItem, (_b = lastItemCache === null || lastItemCache === void 0 ? void 0 : lastItemCache[1]) !== null && _b !== void 0 ? _b : 0, nowItem, i[0].selectedSlot, i[0]));
                        });
                        _a.onHandItemMap.set(i[0], [nowItem, i[0].selectedSlot]);
                    }
                }
            });
        },
        name: ExOtherEventNames.onLongTick
    },
    [ExOtherEventNames.onLongTick]: {
        pattern: ExEntityEvents.eventHandlers.registerToServerByServerEvent
    },
    [ExEventNames.afterBlockBreak]: {
        pattern: ExEntityEvents.eventHandlers.registerToServerByEntity,
        filter: {
            "name": "player"
        }
    }
};
ExEntityEvents.onHandItemMap = new Map();
ExEntityEvents.onceItemUseOnMap = new Map();
class Listener {
    constructor(e, name) {
        this.subscribe = (callback) => {
            e._subscribe(name, callback);
        };
        this.unsubscribe = (callback) => {
            e._unsubscribe(name, callback);
        };
    }
}
//# sourceMappingURL=ExEntityEvents.js.map