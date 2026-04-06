import EmptyState from '@/components/EmptyState';
import { useTheme } from '@/context/ThemeContext';
import { db } from '@/db/client';
import { activitiesTable, targetsTable, usersTable } from '@/db/schema';
import { cancelAllReminders, requestNotificationPermission, scheduleDailyReminder } from '@/utils/notifications';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { eq } from 'drizzle-orm';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Alert, Linking, SafeAreaView, ScrollView,
  StyleSheet, Switch, Text, TextInput,
  TouchableOpacity, View
} from 'react-native';

type Target = typeof targetsTable.$inferSelect;

export default function ProfileScreen() {
  const { colours, isDark, toggleTheme } = useTheme();
  const router = useRouter();

  const [targets, setTargets]         = useState<Target[]>([]);
  const [progress, setProgress]       = useState<Record<number, number>>({});
  const [showForm, setShowForm]       = useState(false);
  const [label, setLabel]             = useState('');
  const [period, setPeriod]           = useState<'weekly' | 'monthly'>('weekly');
  const [targetValue, setTargetValue] = useState('');
  const [unit, setUnit]               = useState<'activities' | 'hours'>('activities');
  const [editingId, setEditingId]     = useState<number | null>(null);
  const [notificationsOn, setNotificationsOn] = useState(false);
  const [userName, setUserName] = useState('');

  const styles = StyleSheet.create({
    safe:    { flex: 1, backgroundColor: colours.background },
    content: { padding: 20, gap: 14 },
    title:   { fontSize: 28, fontWeight: '800', color: colours.textPrimary },

    sectionRow:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    sectionHeader:{ fontSize: 13, fontWeight: '700', color: colours.textSecondary, textTransform: 'uppercase', letterSpacing: 1.2 },
    addLink:      { color: colours.primary, fontWeight: '700', fontSize: 14 },

    form:   { backgroundColor: colours.surface, borderRadius: 14, padding: 16, borderWidth: 1, borderColor: colours.border, gap: 10 },
    input:  { backgroundColor: colours.background, borderWidth: 1, borderColor: colours.border, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 11, fontSize: 15, color: colours.textPrimary },
    inputLabel: { fontSize: 12, fontWeight: '600', color: colours.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 },

    toggleRow:       { flexDirection: 'row', borderRadius: 10, overflow: 'hidden', borderWidth: 1, borderColor: colours.border },
    toggleBtn:       { flex: 1, paddingVertical: 10, alignItems: 'center', backgroundColor: colours.surface },
    toggleActive:    { backgroundColor: colours.primary },
    toggleText:      { fontWeight: '600', color: colours.textSecondary, fontSize: 14 },
    toggleTextActive:{ color: '#fff' },

    saveBtn:     { backgroundColor: colours.primary, borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
    saveBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },

    card:     { backgroundColor: colours.surface, borderRadius: 14, padding: 20, borderWidth: 1, borderColor: colours.border, gap: 10 },
    cardMuted:{ fontSize: 14, color: colours.textMuted, fontStyle: 'italic' },

    targetCard:   { backgroundColor: colours.surface, borderRadius: 14, padding: 16, borderWidth: 1, borderColor: colours.border, gap: 8 },
    targetLabel:  { fontSize: 15, fontWeight: '700', color: colours.textPrimary, flex: 1 },
    targetProgress:{ fontSize: 22, fontWeight: '800', color: colours.textPrimary },
    progressTrack: { height: 8, backgroundColor: colours.border, borderRadius: 4, overflow: 'hidden' },
    progressFill:  { height: 8, borderRadius: 4 },
    targetHint:   { fontSize: 11, color: colours.textMuted },

    notifRow:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    notifTitle:     { fontSize: 15, fontWeight: '600', color: colours.textPrimary },
    notifSub:       { fontSize: 12, color: colours.textMuted, marginTop: 2 },

    logoutText: { fontSize: 16, fontWeight: '600', color: colours.primary },
    deleteText: { fontSize: 16, fontWeight: '600', color: colours.error },
    divider:    { height: 1, backgroundColor: colours.border },

   greetingRow: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 6,
},

greeting: {
  fontSize: 18,
  fontWeight: '500',
  color: colours.textSecondary,
  marginBottom: 8,
},

greetingName: {
  fontSize: 18,
  fontWeight: '700',
  color: colours.textPrimary,
},
  });

  

  async function load() {
    const userId = await AsyncStorage.getItem('userId');
    if (!userId) return;

     
const [user] = await db
  .select()
  .from(usersTable)
  .where(eq(usersTable.id, Number(userId)));

if (user) setUserName(user.name);

    const rows = await db
      .select()
      .from(targetsTable)
      .where(eq(targetsTable.userId, Number(userId)));

    setTargets(rows);
    await calculateProgress(rows);
  }

  async function calculateProgress(rows: Target[]) {
    const now = new Date();
    const prog: Record<number, number> = {};

    for (const target of rows) {
      let start: string;

      if (target.period === 'weekly') {
        const day = now.getDay();
        const monday = new Date(now);
        monday.setDate(now.getDate() - (day === 0 ? 6 : day - 1));
        start = monday.toISOString().split('T')[0];
      } else {
        start = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
      }

      const today = now.toISOString().split('T')[0];
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) return;

      const acts = await db
        .select()
        .from(activitiesTable)
        .where(eq(activitiesTable.userId, Number(userId)));

      const inRange = acts.filter(a => a.date >= start && a.date <= today);

      if (target.unit === 'activities') {
        prog[target.id] = inRange.length;
      } else {
        const totalMins = inRange.reduce((sum, a) => sum + (a.durationMinutes ?? 0), 0);
        prog[target.id] = Math.round((totalMins / 60) * 10) / 10;
      }
    }

    setProgress(prog);
  }

  useEffect(() => {
    async function init() {
      await load();
      const saved = await AsyncStorage.getItem('notifications');
      setNotificationsOn(saved === 'true');
    }
    init();
  }, []);

  

  async function handleSave() {
    if (!label.trim() || !targetValue) {
      Alert.alert('Fill in all fields');
      return;
    }

    const userId = await AsyncStorage.getItem('userId');
    if (!userId) return;

    if (editingId) {
      await db.update(targetsTable).set({
        label: label.trim(), period,
        targetValue: Number(targetValue), unit,
        userId: Number(userId),
      }).where(eq(targetsTable.id, editingId));
    } else {
      await db.insert(targetsTable).values({
        label: label.trim(), period,
        targetValue: Number(targetValue), unit,
        userId: Number(userId),
        createdAt: new Date().toISOString(),
      });
    }

    setLabel(''); setTargetValue(''); setEditingId(null); setShowForm(false);
    load();
  }

  async function handleDelete(id: number) {
    Alert.alert('Delete target', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          await db.delete(targetsTable).where(eq(targetsTable.id, id));
          load();
        },
      },
    ]);
  }

  function startEdit(t: Target) {
    setEditingId(t.id);
    setLabel(t.label);
    setPeriod(t.period as 'weekly' | 'monthly');
    setTargetValue(t.targetValue.toString());
    setUnit(t.unit as 'activities' | 'hours');
    setShowForm(true);
  }

  async function handleLogout() {
    await AsyncStorage.removeItem('userId');
    router.replace('/login' as any);
  }

  async function handleDeleteAccount() {
    Alert.alert('Delete account', 'This will permanently delete your account.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          const userId = await AsyncStorage.getItem('userId');
          if (userId) {
            await db.delete(usersTable).where(eq(usersTable.id, Number(userId)));
          }
          await AsyncStorage.removeItem('userId');
          router.replace('/login' as any);
        },
      },
    ]);
  }

  async function toggleNotifications() {
    if (notificationsOn) {
      await cancelAllReminders();
      await AsyncStorage.setItem('notifications', 'false');
      setNotificationsOn(false);
      return;
    }

    const granted = await requestNotificationPermission();

    if (!granted) {
      Alert.alert('Notifications disabled', 'Enable them in settings', [
        { text: 'Open Settings', onPress: () => Linking.openSettings() },
        { text: 'Cancel' },
      ]);
      return;
    }

    await scheduleDailyReminder();
    await AsyncStorage.setItem('notifications', 'true');
    setNotificationsOn(true);
    Alert.alert('Reminders on!', "You'll get a reminder at 8pm every day.");
  }

  

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Profile</Text>

       <View style={styles.greetingRow}>
  <Text style={styles.greeting}>
    Hi{userName ? ', ' : ''}
    <Text style={styles.greetingName}>{userName}</Text>
  </Text>

  <Ionicons name="hand-left" size={22} color={colours.primary} />
</View>


        {/*Targets*/}
        <View style={styles.sectionRow}>
          <Text style={styles.sectionHeader}>Targets</Text>
          <TouchableOpacity onPress={() => {
            setShowForm(!showForm);
            setEditingId(null);
            setLabel('');
            setTargetValue('');
          }}>
            <Text style={styles.addLink}>{showForm ? 'Cancel' : '+ Add'}</Text>
          </TouchableOpacity>
        </View>

        {/* Add and Edit form */}
        {showForm && (
          <View style={styles.form}>
            <Text style={styles.inputLabel}>Label</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Run more"
              placeholderTextColor={colours.textMuted}
              value={label}
              onChangeText={setLabel}
            />

            <Text style={styles.inputLabel}>Target number</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 5"
              placeholderTextColor={colours.textMuted}
              value={targetValue}
              onChangeText={setTargetValue}
              keyboardType="numeric"
            />

            <Text style={styles.inputLabel}>Period</Text>
            <View style={styles.toggleRow}>
              {(['weekly', 'monthly'] as const).map(p => (
                <TouchableOpacity
                  key={p}
                  style={[styles.toggleBtn, period === p && styles.toggleActive]}
                  onPress={() => setPeriod(p)}
                >
                  <Text style={[styles.toggleText, period === p && styles.toggleTextActive]}>
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.inputLabel}>Unit</Text>
            <View style={styles.toggleRow}>
              {(['activities', 'hours'] as const).map(u => (
                <TouchableOpacity
                  key={u}
                  style={[styles.toggleBtn, unit === u && styles.toggleActive]}
                  onPress={() => setUnit(u)}
                >
                  <Text style={[styles.toggleText, unit === u && styles.toggleTextActive]}>
                    {u.charAt(0).toUpperCase() + u.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
              <Text style={styles.saveBtnText}>{editingId ? 'Save Changes' : 'Add Target'}</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Target cards */}
        {targets.length === 0 && !showForm && (
        <EmptyState
          title="No targets set"
          subtitle="Challenge yourself - set a weekly or monthly goal"
          actionLabel="Set a target"
          onAction={() => setShowForm(true)}
        />
          )}

        {targets.map(t => {
          const current = progress[t.id] ?? 0;
          const pct = Math.min((current / t.targetValue) * 100, 100);
          const met = current >= t.targetValue;

          return (
            <TouchableOpacity
              key={t.id}
              style={styles.targetCard}
              onPress={() => startEdit(t)}
              onLongPress={() => handleDelete(t.id)}
            >
              <Text style={styles.targetLabel}>{t.label}</Text>
              <Text style={styles.targetProgress}>
                {current} / {t.targetValue} {t.unit}
              </Text>
              <View style={styles.progressTrack}>
                <View style={[
                  styles.progressFill,
                  { width: `${pct}%`, backgroundColor: met ? colours.success : colours.primary },
                ]} />
              </View>
              <Text style={styles.targetHint}>Long press to delete · tap to edit</Text>
            </TouchableOpacity>
          );
        })}

        {/* Reminders */}
        <Text style={styles.sectionHeader}>Reminders</Text>
        <View style={styles.card}>
          <View style={styles.notifRow}>
            <View>
              <Text style={styles.notifTitle}>Trip Notifications</Text>
              <Text style={styles.notifSub}>Daily reminder at 8pm</Text>
            </View>
            <Switch
              value={notificationsOn}
              onValueChange={toggleNotifications}
              trackColor={{ false: colours.border, true: colours.primary }}
              thumbColor={colours.surface}
            />
          </View>
        </View>

        
        <Text style={styles.sectionHeader}>Appearance</Text>
        <View style={styles.card}>
          <View style={styles.notifRow}>
            <View>
              <Text style={styles.notifTitle}>Dark Mode</Text>
              <Text style={styles.notifSub}>{isDark ? 'Currently dark' : 'Currently light'}</Text>
            </View>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: colours.border, true: colours.primary }}
              thumbColor={colours.surface}
            />
          </View>
        </View>

        
        <Text style={styles.sectionHeader}>Account</Text>

        <View style={styles.card}>

          <TouchableOpacity
            onPress={handleLogout}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}
          >
            <Ionicons name="log-out-outline" size={18} color={colours.primary} />
            <Text style={styles.logoutText}>Log Out</Text>
          </TouchableOpacity>

          <View style={styles.divider} />

          
          <TouchableOpacity
            onPress={handleDeleteAccount}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}
          >
            <Ionicons name="trash-outline" size={18} color={colours.error} />
            <Text style={styles.deleteText}>Delete Account</Text>
          </TouchableOpacity>

        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
