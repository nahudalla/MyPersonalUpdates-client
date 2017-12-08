window.StatisticsGenerator = class StatisticsGenerator {
    constructor() {
        CategoryHistory.suscribeToUpdates(this.__processUpdates.bind(this));
        RealTime.suscribeToUpdates(this.__processUpdates.bind(this));

        this.__listeners = [];
    }

    async __processUpdates(updates) {
        if(Array.isArray(updates)) {
            const promises = [];
            for(let update of updates) {
                promises.push(this.__processUpdate(update))
            }

            for(let promise of promises) {
                await promise;
            }
        } else {
            await this.__processUpdate(updates);
        }

        for(let listener of this.__listeners) {
            listener(this);
        }
    }

    __processUpdate(update) {
        throw new Exception('Virtual method not overriden!');
    }

    addListener(callback) {
        if(!this.__listeners.includes(callback))
            this.__listeners.push(callback);
    }
    removeListener(callback) {
        let i;
        if((i = this.__listeners.indexOf(callback)) !== -1) {
            this.__listeners.splice(i, 1);
        }
    }
};
