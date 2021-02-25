import ActivitySync from '../jobs/actvitySync';

export default (): void => {
  const activitySync = new ActivitySync(Number(process.env.ACTIVITY_SYNC_DELAY_MS));

  activitySync.start();
};
