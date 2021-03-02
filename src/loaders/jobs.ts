import config from '../config';
import ActivitySync from '../jobs/actvitySync';

export default (): void => {
  const activitySync = new ActivitySync(config.server.ACTIVITY_SYNC_DELAY_MS);

  activitySync.start();
};
