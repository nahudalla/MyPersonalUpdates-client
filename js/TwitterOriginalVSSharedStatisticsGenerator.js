window.TwitterOriginalVSSharedStatisticsGenerator =
class TwitterOriginalVSSharedStatisticsGenerator {
    constructor() {
        this.__totalUpdates = 0;
        this.__totalOriginalUpdates = 0;
        this.__totalSharedUpdates = 0;
        this.__usersMap = new Map();
        this.__users = [];
    }

    async __processUpdate(update) {
        if(update.provider.id !== Twitter.id)
            return;

        this.__totalUpdates++;

        if(update.attributes.Retweet === 'true') {
            this.__totalSharedUpdates++;
        } else {
            this.__totalOriginalUpdates++;

            const userID = update.attributes['Usuario'];

            if(userID) {
                let user;

                if (!this.__usersMap.has(userID)) {
                    user = {
                        identifierByProvider: userID,
                        humanReadableName: Twitter.findUserScreenNameByID(userID),
                        shareCount: 0,
                        provider: Twitter
                    };
                    this.__usersMap.set(userID, user);

                    user.humanReadableName = await user.humanReadableName;
                    this.__users.push(user);
                } else {
                    user = this.__usersMap.get(userID);
                }

                user.shareCount++;

                await user.humanReadableName;
            }
        }
    }

    get totalProcessedUpdates() {
        return this.__totalUpdates;
    }

    get totalOriginalUpdates() {
        return this.__totalOriginalUpdates;
    }

    get totalSharedUpdates() {
        return this.__totalSharedUpdates;
    }

    get providersUsersWithSharedUpdatesInfo() {
        return this.__users;
    }
};
