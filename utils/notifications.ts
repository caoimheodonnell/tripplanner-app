import * as Notifications from 'expo-notifications';

// ask user for notification permission
export async function requestNotificationPermission(): Promise<boolean> {
  const { status: existing } = await Notifications.getPermissionsAsync();
   // already allowed
  if (existing === 'granted') return true;

  // request permission
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

// schedule a daily reminder notification
export async function scheduleDailyReminder(): Promise<void> {

    // clear any existing reminders first
  await Notifications.cancelAllScheduledNotificationsAsync();

  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'TripPlanner',
      body: "Don't forget to log today's activities!",
    },
    trigger: {
  type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
  seconds: 10,
  repeats: false,
}
  });
}

// cancel all reminders
export async function cancelAllReminders(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();


}