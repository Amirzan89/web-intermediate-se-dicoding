import { openDB } from 'idb';

const DATABASE_NAME = 'second-web-intermediate-db';
const DATABASE_VERSION = 1;
const OBJECT_STORE_NAME = 'savedStories';

const dbPromise = openDB(DATABASE_NAME, DATABASE_VERSION, {
  upgrade(database) {
    database.createObjectStore(OBJECT_STORE_NAME, { keyPath: 'id' });
  },
});

const IdbHelper = {
  async getAllStories() {
    return (await dbPromise).getAll(OBJECT_STORE_NAME);
  },

  async getStory(id) {
    return (await dbPromise).get(OBJECT_STORE_NAME, id);
  },

  async saveStory(story) {
    return (await dbPromise).put(OBJECT_STORE_NAME, story);
  },

  async deleteStory(id) {
    return (await dbPromise).delete(OBJECT_STORE_NAME, id);
  },

  async isStoryPresentSaved(id) {
    const story = await this.getStory(id);
    return !!story;
  },

  async clearAllSavedStories() {
    const tx = (await dbPromise).transaction(OBJECT_STORE_NAME, 'readwrite');
    await tx.objectStore(OBJECT_STORE_NAME).clear();
    await tx.done;
  },
};

export default IdbHelper; 