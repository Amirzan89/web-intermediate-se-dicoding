import IdbHelper from '../utils/idb';

export default () => {
    const getCache = async () => {
        return await IdbHelper.getAllStories();
    }
    const updateCache = async (fetch) => {
        for (const story of fetch) {
            await IdbHelper.saveStory(story);
        }
    }
    const resetCache = async () => {
        const stories = await IdbHelper.getAllStories();
        for (const story of stories) {
            await IdbHelper.deleteStory(story.id);
        }
    }
    return { getCache, updateCache, resetCache }
}