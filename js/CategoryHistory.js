(function () {
class CategoryHistoryResult {
    constructor(results, nextFrom) {
        this.__results = results;
        this.__nextFrom = nextFrom;
    }
    get results() {
        return this.__results || [];
    }
    get nextFrom() {
        return this.__nextFrom;
    }
}
window.CategoryHistory = new (class _CategoryHistory extends UpdatesObservable {
    constructor() {
        super();

        const params = (new URL(window.location)).searchParams;

        this.__category = params.get('category');
        this.__limit = parseInt(params.get('limit'));
        this.__start = parseInt(params.get('startTimestamp'));
        this.__end = parseInt(params.get('endTimestamp'));
        this.__order = params.get('order') === 'true';
    }

    async get(from) {
        if(!this.__filter) {
            const res = await Server.GET((new URL(`/category/${this.__category}`, window.location)).href);

            if(!Server.responseOK(res)) {
                throw new Exception('No se pudo obtener información sobre la categoría.');
            }

            this.__filter = res.filter;
        }

        const restrictions = {};

        if(this.__limit) restrictions.limit = this.__limit + 1;
        if(this.__start) restrictions.startTimestamp = this.__start;
        if(this.__end) restrictions.endTimestamp = this.__end;
        if(this.__order || this.__order === false) restrictions.order = this.__order;
        if(from) restrictions.fromID = parseInt(from);

        const res = await Server.POST(
            (new URL('/updates', window.location)).href,
            {
                filter: this.__filter,
                restrictions
            }
        );

        if(!Server.responseOK(res)) {
            throw new Exception('No se pudieron obtener las actualizaciones.');
        }

        let nextFrom;

        if(restrictions.limit && res.updates.length === restrictions.limit) {
            nextFrom = res.updates.pop().id;
        }

        const results = [];
        for(let result of res.updates) {
            results.push(Update.createUpdate(result));
        }

        if(results.length > 0)
            this.__emitUpdates(results);

        return new CategoryHistoryResult(results, nextFrom);
    }
});
})();
