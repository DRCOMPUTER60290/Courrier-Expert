import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export async function scheduleReminder(date: Date, title: string, body: string): Promise<string> {
  await Notifications.requestPermissionsAsync();
  return await Notifications.scheduleNotificationAsync({
    content: { title, body },
    trigger: date,
  });
}

export async function cancelReminder(id: string) {
  await Notifications.cancelScheduledNotificationAsync(id);
}

export async function rescheduleReminder(
  id: string,
  date: Date,
  title: string,
  body: string
): Promise<string> {
  await cancelReminder(id);
  return scheduleReminder(date, title, body);
}
