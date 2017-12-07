window.TwitterOriginalVSSharedStatisticsGenerator =
class TwitterOriginalVSSharedStatisticsGenerator {
    constructor() {
        this.__totalUpdates = 0;
        this.__totalOriginalUpdates = 0;
        this.__totalSharedUpdates = 0;
        this.__usersMap = new Map();
    }

    async __processUpdate(update) {
        if(update.provider.id !== Twitter.id)
            return;

        this.__totalUpdates++;

        if(update.attributes.Retweet) {
            this.__totalSharedUpdates++;
        } else {
            this.__totalOriginalUpdates++;
        }

        const origUserID = update.attributes['ID del usuario del Tweet Original'];

        if(origUserID) {
            let user;
            if (!this.__usersMap.has(origUserID)) {
                user = {
                    humanReadableName: await Twitter.findUserScreenNameByID(origUserID),
                    shareCount: 0
                };
                this.__usersMap.set(origUserID, user);
            } else {
                this.__usersMap.get(origUserID);
            }

            user.shareCount++;
        }
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
