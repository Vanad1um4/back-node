import { getConnection } from './db.js';

//                                                                         DIARY

export async function dbCreateDiaryEntry(dateISO, foodCatalogueId, foodWeight, history, userId) {
  const connection = await getConnection();
  try {
    const query = `
      INSERT INTO
        foodDiary (dateISO, foodCatalogueId, foodWeight, history, usersId, ver, del)
      VALUES
        (?, ?, ?, ?, ?, ?, ?);
    `;
    const result = await connection.run(query, [dateISO, foodCatalogueId, foodWeight, history, userId, 0, 0]);
    return result.lastID;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function dbGetDiaryEntriesHistory(diaryId, userId) {
  const connection = await getConnection();
  try {
    const query = `
      SELECT
        history
      FROM
        foodDiary
      WHERE
        id = ?
        AND usersId = ?;
    `;
    const result = await connection.all(query, [diaryId, userId]);
    return result;
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function getRangeOfUsersDiaryEntries(userId, startDate, endDate) {
  const connection = await getConnection();
  try {
    const query = `
      SELECT
        id, dateISO, foodCatalogueId, foodWeight, history
      FROM
        foodDiary
      WHERE
        usersId = ?
        AND dateISO BETWEEN ? AND ?
      ORDER BY
        dateISO ASC;
      `;
    const result = await connection.all(query, [userId, startDate, endDate]);
    return result;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function dbEditDiaryEntry(foodWeight, history, diaryId, userId) {
  const connection = await getConnection();
  try {
    const query = `
      UPDATE
        foodDiary
      SET
        foodWeight = ?, history = ?
      WHERE
        id = ?
        AND usersId = ?;
    `;
    const values = [foodWeight, history, diaryId, userId];
    await connection.run(query, values);
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
}

export async function dbDeleteDiaryEntry(diaryId, userId) {
  const connection = await getConnection();
  try {
    const query = `
      DELETE FROM
        foodDiary
      WHERE
        id = ?
        AND usersId = ?;
    `;
    const result = await connection.run(query, [diaryId, userId]);
    return result.changes > 0;
  } catch (error) {
    console.error(error);
    return false;
  }
}

export async function getDiaryEntriesForDay(startOfDay, endOfDay) {
  const connection = await getConnection();
  try {
    const query = `
      SELECT
        id, date
      FROM
        foodDiary
      WHERE
        date BETWEEN ? AND ?
      ORDER BY
        date ASC;
    `;
    const result = await connection.all(query, [startOfDay, endOfDay]);
    return result;
  } catch (error) {
    console.error('Error in getDiaryEntriesForDay:', error);
    return [];
  }
}

export async function getDiaryEntriesHistory(userId, startDate, endDate) {
  const connection = await getConnection();
  try {
    const query = `
      SELECT
        d.dateISO,
        d.foodWeight,
        d.foodCatalogueId,
        c.kcals
      FROM
        foodDiary d JOIN foodCatalogue c ON d.foodCatalogueId = c.id
      WHERE
        d.usersId = ?
        AND d.dateISO BETWEEN ? AND ?
      ORDER BY
        d.dateISO ASC;
    `;
    const result = await connection.all(query, [userId, startDate, endDate]);
    return result;
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function getUserFirstDate(userId) {
  const connection = await getConnection();
  try {
    const query = `
      SELECT
        MIN(date) as firstDate
      FROM (
        SELECT dateISO as date FROM foodDiary WHERE usersId = ?
          UNION
        SELECT dateISO as date FROM foodBodyWeight WHERE usersId = ?
      );
    `;
    const result = await connection.get(query, [userId, userId]);
    return result.firstDate;
  } catch (error) {
    console.error(error);
    return null;
  }
}

//                                                                MAIN CATALOGUE

export async function addFoodCatalogueEntry(foodName, foodKcals) {
  const connection = await getConnection();
  try {
    const query = `
      INSERT INTO
        foodCatalogue (name, kcals)
      VALUES
        (?, ?);
    `;
    const result = await connection.run(query, [foodName, foodKcals]);
    return result.lastID;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function updateFoodCatalogueEntry(foodId, foodName, foodKcals) {
  const connection = await getConnection();
  try {
    const query = `
      UPDATE
        foodCatalogue
      SET
        name = ?, kcals = ?
      WHERE
        id = ?;
    `;
    await connection.run(query, [foodName, foodKcals, foodId]);
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
}

export async function deleteFoodCatalogueEntry(id) {
  const connection = await getConnection();
  try {
    const query = `
      DELETE FROM
        foodCatalogue
      WHERE
        id = ?;
    `;
    await connection.run(query, [id]);
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
}

export async function getAllFoodCatalogueEntries() {
  const connection = await getConnection();
  try {
    const query = `
      SELECT
        id, name, kcals
      FROM
        foodCatalogue
      ORDER BY
        name ASC;
    `;
    const result = await connection.all(query);
    return result;
  } catch (error) {
    console.error(error);
    return null;
  }
}

//                                                                USER CATALOGUE

export async function getUsersFoodCatalogueIds(userId) {
  const connection = await getConnection();
  try {
    const query = `
      SELECT
        selectedCatalogueIds
      FROM
        foodSettings
      WHERE
        usersId = ?;
    `;
    const result = await connection.all(query, [userId]);
    return result;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function updateUsersFoodCatalogueIdsList(selectedCatalogueIds, userId) {
  const connection = await getConnection();
  try {
    const query = `
      UPDATE
        foodSettings
      SET
        selectedCatalogueIds = ?
      WHERE
        usersId = ?;
    `;
    await connection.run(query, [selectedCatalogueIds, userId]);
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
}

//                                                                   BODY WEIGHT

export async function getWeightByDate(dateISO, userId) {
  const connection = await getConnection();
  try {
    const query = `
      SELECT
        id, weight
      FROM
        foodBodyWeight
      WHERE
        dateISO = ? AND usersId = ?;
    `;
    const result = await connection.get(query, [dateISO, userId]);
    return result;
  } catch (error) {
    console.error('Error getting weight:', error);
    throw error;
  }
}

export async function getRangeOfUsersBodyWeightEntries(userId, startDate, endDate) {
  const connection = await getConnection();
  try {
    const query = `
      SELECT
        id, dateISO, weight
      FROM
        foodBodyWeight
      WHERE
        usersId = ?
        AND dateISO BETWEEN ? AND ?
      ORDER BY
        dateISO ASC;
    `;
    const result = await connection.all(query, [userId, startDate, endDate]);
    return result;
  } catch (error) {
    console.error(error);
  }
}

export async function dbCreateWeight(dateISO, weight, userId) {
  const connection = await getConnection();
  try {
    const query = `
      INSERT INTO
        foodBodyWeight (dateISO, weight, usersId)
      VALUES
        (?, ?, ?);
    `;
    const result = await connection.run(query, [dateISO, weight, userId]);
    return result.lastID;
  } catch (error) {
    console.error('Error creating weight:', error);
    throw error;
  }
}

export async function dbUpdateWeight(weight, dateISO, userId) {
  const connection = await getConnection();
  try {
    const query = `
      UPDATE
        foodBodyWeight
      SET
        weight = ?
      WHERE
        dateISO = ?
        AND usersId = ?;
    `;
    const result = await connection.run(query, [weight, dateISO, userId]);
    return result.changes > 0;
  } catch (error) {
    console.error('Error updating weight:', error);
    throw error;
  }
}

export async function getWeightHistory(userId, startDate, endDate) {
  const connection = await getConnection();
  try {
    const query = `
      SELECT
        dateISO,
        weight
      FROM
        foodBodyWeight
      WHERE
        usersId = ?
        AND dateISO BETWEEN ? AND ?
      ORDER BY
        dateISO ASC;
    `;
    const result = await connection.all(query, [userId, startDate, endDate]);
    return result;
  } catch (error) {
    console.error(error);
    return [];
  }
}

//                                                                         STATS

export async function getUsersCachedStats(userId) {
  const connection = await getConnection();
  try {
    const query = `
      SELECT
        upToDate, stats
      FROM
        userStats
      WHERE
        usersId = ?;
    `;
    const result = await connection.get(query, [userId]);
    return result;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function saveUserStats(userId, upToDate, stats) {
  const connection = await getConnection();
  try {
    const checkQuery = `
      SELECT
        COUNT(*) as count
      FROM
        userStats
      WHERE
        usersId = ?;
    `;
    const checkResult = await connection.get(checkQuery, [userId]);

    if (checkResult.count > 0) {
      await updateUserStats(userId, upToDate, stats);
    } else {
      await createUserStats(userId, upToDate, stats);
    }
  } catch (error) {
    console.error(error);
    throw new Error('Failed to save user stats');
  }
}

async function updateUserStats(userId, upToDate, stats) {
  const connection = await getConnection();
  try {
    const query = `
      UPDATE
        userStats
      SET
        upToDate = ?,
        stats = ?
      WHERE
        usersId = ?;
    `;
    await connection.run(query, [upToDate, stats, userId]);
  } catch (error) {
    console.error(error);
    throw new Error('Failed to update user stats');
  }
}

async function createUserStats(userId, upToDate, stats) {
  const connection = await getConnection();
  try {
    const query = `
      INSERT INTO
        userStats (usersId, upToDate, stats)
      VALUES
        (?, ?, ?);
    `;
    await connection.run(query, [userId, upToDate, stats]);
  } catch (error) {
    console.error(error);
    throw new Error('Failed to create user stats');
  }
}

export async function getUsersCoefficients(userId) {
  const connection = await getConnection();
  try {
    const query = `
      SELECT
        coefficients
      FROM
        foodSettings
      WHERE
        usersId = ?;
    `;
    const result = await connection.get(query, [userId]);
    return result;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function setUsersCoefficients(userId, coefficients) {
  const connection = await getConnection();
  try {
    const checkQuery = `
      SELECT
        COUNT(*) as count
      FROM
        foodSettings
      WHERE
        usersId = ?;
    `;
    const checkResult = await connection.get(checkQuery, [userId]);

    if (checkResult.count > 0) {
      await updateUserCoefficients(userId, coefficients);
    } else {
      await createUserCoefficients(userId, coefficients);
    }
  } catch (error) {
    console.error(error);
    throw new Error('Failed to save coefficients');
  }
}

async function updateUserCoefficients(userId, coefficients) {
  const connection = await getConnection();
  try {
    const query = `
      UPDATE
        foodSettings
      SET
        coefficients = ?
      WHERE
        usersId = ?;
    `;
    await connection.run(query, [coefficients, userId]);
  } catch (error) {
    console.error(error);
    throw new Error('Failed to update coefficients');
  }
}

async function createUserCoefficients(userId, coefficients) {
  const connection = await getConnection();
  try {
    const query = `
      INSERT INTO
        foodSettings (usersId, coefficients)
      VALUES
        (?, ?);
    `;
    await connection.run(query, [userId, coefficients]);
  } catch (error) {
    console.error(error);
    throw new Error('Failed to create coefficients');
  }
}
