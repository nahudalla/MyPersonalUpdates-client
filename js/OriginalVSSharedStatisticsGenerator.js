window.OriginalVSSharedStatisticsGenerator = class OriginalVSSharedStatisticsGenerator extends StatisticsGenerator {
    constructor() {
        super();

        this.__twitterGenerator = new TwitterOriginalVSSharedStatisticsGenerator();
        this.__redditGenerator = new RedditOriginalVSSharedStatisticsGenerator();
    }

    async __processUpdate(update) {
        if(update.provider.id === Twitter.id)
            await this.__twitterGenerator.__processUpdate(update);
        else if(update.provider.id === Reddit.id)
            await this.__redditGenerator.__processUpdate(update);
    }

    get totalProcessedUpdates() {
        return this.__twitterGenerator.totalProcessedUpdates +
            this.__redditGenerator.totalProcessedUpdates;
    }

    get totalOriginalUpdates() {
        return this.__twitterGenerator.totalOriginalUpdates +
            this.__redditGenerator.totalOriginalUpdates;
    }

    get totalSharedUpdates() {
        return this.__twitterGenerator.totalSharedUpdates +
            this.__redditGenerator.totalSharedUpdates;
    }

    get providersUsersWithSharedUpdatesInfo() {
        let users = [];

        users = users
            .concat(this.__twitterGenerator.providersUsersWithSharedUpdatesInfo)
            .concat(this.__redditGenerator.providersUsersWithSharedUpdatesInfo);

        return users;
    }
};
