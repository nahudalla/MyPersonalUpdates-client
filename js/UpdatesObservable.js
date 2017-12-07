window.UpdatesObservable = class UpdatesObservable {
    constructor() {
        this.__resultsSuscribers = [];
    }

    suscribeToUpdates(callback) {
        if(!this.__resultsSuscribers.contains(callback))
            this.__resultsSuscribers.push(callback);
    }

    unsuscribeToUpdates(callback) {
        let index;
        if((index = this.__resultsSuscribers.indexOf(callback)) !== -1) {
            this.__resultsSuscribers.splice(index, 1);
        }
    }

    __emitUpdates(updates) {
        for(let suscriber of this.__resultsSuscribers) {
            suscriber(updates);
        }
    }
};