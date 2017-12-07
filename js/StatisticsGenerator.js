window.StatisticsGenerator = class StatisticsGenerator {
    constructor() {
        CategoryHistory.suscribeToUpdates(this.__processUpdates);
        RealTime.suscribeToUpdates(this.__processUpdates);
    }

    __processUpdates(updates) {
        if(Array.isArray(updates)) {
            for(let update of updates) {
                this.__updateProcessor(update);
            }
        } else {
            this.__updateProcessor(updates);
        }
    }

    __processUpdate(update) {
        throw new Exception('Virtual method not overriden!');
    }
};
