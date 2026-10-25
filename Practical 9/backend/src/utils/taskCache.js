const NodeCache = require("node-cache");

const cache = new NodeCache({ stdTTL: 60 });
let hits = 0;
let misses = 0;

function getCached(key) {
    const value = cache.get(key);

    if (value === undefined) {
        misses += 1;
        return undefined;
    }

    hits += 1;
    return value;
}

function setCached(key, value) {
    cache.set(key, value);
}

function invalidateTaskCaches(taskId) {
    cache.del("tasks:all");

    if (taskId) {
        cache.del(`tasks:${taskId.toLowerCase()}`);
    }
}

function getCacheStats() {
    return { hits, misses };
}

module.exports = {
    getCached,
    setCached,
    invalidateTaskCaches,
    getCacheStats
};
