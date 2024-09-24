import * as dbDebug from './db-debug.js';
import { INIT_USERS } from '../../env.js';

export async function ping() {
  return 'pong';
}

export async function pg2sqliteTransfer(oldUserId) {
  try {
    // Getting source data
    const diary = await dbDebug.readSourceDiary(oldUserId);
    // console.log('diary', diary.slice(0, 3));
    const bodyWeights = await dbDebug.readSourceWeights(oldUserId);
    const catalogue = await dbDebug.readSourceCatalogue();
    const settings = await dbDebug.readSourceSettings();

    // Converting ISO dates to UNIX time. Using a counter to give entries unique timestamps.
    let counter = 36000; // plus 10 hours, so it's not like an entry was made at midnight.
    diary.forEach((entry) => (entry.date = new Date(entry.date).getTime() / 1000 + counter++));
    counter = 36000;
    bodyWeights.forEach((entry) => (entry.date = new Date(entry.date).getTime() / 1000 + counter++));

    // Moving food ownership from 'foodCatalogue' table to 'foodSettings' table
    const catalogueIdsGroupedByUser = Object.fromEntries(
      Object.keys(INIT_USERS).map(userId => [userId, []])
    );
    catalogue.forEach((catalogueEntry) => {
      const entryUserId = catalogueEntry.users_id.toString();
      if (entryUserId === '0') {
        Object.values(catalogueIdsGroupedByUser).forEach(arr => arr.push(catalogueEntry.id));
      } else if (catalogueIdsGroupedByUser.hasOwnProperty(entryUserId)) {
        catalogueIdsGroupedByUser[entryUserId].push(catalogueEntry.id);
      }
    });
    settings.forEach((row) => {
      row.selectedCatalogueIds = JSON.stringify(catalogueIdsGroupedByUser[row.user_id]);
    });

    // Clearing tables
    await dbDebug.clearTargetTableOfUser('foodDiary', oldUserId);
    await dbDebug.clearTargetTableOfUser('foodBodyWeight', oldUserId);
    await dbDebug.clearWholeTargetTable('foodCatalogue');
    await dbDebug.clearWholeTargetTable('foodSettings');

    // // Dumping data into db
    await dbDebug.writeTargetDiary(diary);
    await dbDebug.writeTargetWeights(bodyWeights);
    await dbDebug.writeTargetCatalogue(catalogue);
    await dbDebug.writeTargetFoodSettings(settings);
  } catch (error) {
    console.error(error);
  }
}
