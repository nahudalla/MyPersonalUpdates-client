window.RedditOriginalVSSharedStatisticsGenerator =
class RedditOriginalVSSharedStatisticsGenerator {
    constructor() {
        this.__updates = 0;
    }

    async __processUpdate(update) {
        this.__updates++;
    }

    get totalProcessedUpdates() {
        return this.__updates;
    }

    get totalOriginalUpdates() {
        return this.__updates;
    }

    get totalSharedUpdates() {
        return 0;
    }

    get providersUsersWithSharedUpdatesInfo() {
        return [];
    }
};
