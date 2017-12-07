window.OriginalVSSharedStatisticsGenerator = class OriginalVSSharedStatisticsGenerator extends StatisticsGenerator {
    constructor() {
        super();

        this.__twitterGenerator = new TwitterOriginalVSSharedStatisticsGenerator();
    }

    __processUpdate(update) {
        this.__twitterGenerator.__processUpdate(update);
    }

    get totalProcessedUpdates() {
        return this.__twitterGenerator.totalProcessedUpdates();
    }

    get totalOriginalUpdates() {
        return this.__twitterGenerator.totalOriginalUpdates();
    }

    get totalSharedUpdates() {
        return this.__twitterGenerator.totalSharedUpdates();
    }

    get providersUsersWithSharedUpdatesInfo() {
        let users = [];

        users = users.concat(this.__twitterGenerator.providersUsersWithSharedUpdatesInfo());

        return users;
    }
};
