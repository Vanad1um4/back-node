import * as dbSettings from '../../db/db-settings.js';
import * as dbUsers from '../../db/db-users.js';
import { defaultSettings } from './settings-service.js';

export async function getSettings(request, reply) {
  const userId = request.user.id;
  if (!userId) return;
  try {
    let settings = await dbSettings.getUsersSettings(userId);
    if (settings === undefined) {
      settings = defaultSettings;
    }
    const isUserAdmin = await dbUsers.isUserAdmin(userId);
    settings.isUserAdmin = isUserAdmin;
    settings.userName = request.user.username;

    await reply.code(200).send(settings);
  } catch (error) {
    reply.code(400).send({ message: error.message });
  }
}

export async function postSettings(request, reply) {
  const userId = request.user.id;
  if (!userId) return;
  const settings = request.body;

  try {
    await dbSettings.postUsersSettings(userId, settings);
    await reply.code(200).send({ message: 'Settings saved successfully' });
  } catch (error) {
    reply.code(400).send({ message: error.message });
  }
}
