import { useTheme } from '@/context/ThemeContext';
import { db } from '@/db/client';
import { categoriesTable } from '@/db/schema';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { eq } from 'drizzle-orm';
import { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput, TouchableOpacity,
  View,
} from 'react-native';

type Category = typeof categoriesTable.$inferSelect;
// list of colours to choose from
const COLOUR_OPTIONS = ['#E8A838','#3AAA5E','#D94F3D','#4A90D9','#9B59B6','#E67E22','#1ABC9C','#E74C3C'];
// list of icons to choose from
const ICON_OPTIONS = [
  { name: 'map-outline', lib: 'Ionicons' },
  { name: 'bank', lib: 'MaterialCommunityIcons' },
  { name: 'hiking', lib: 'MaterialCommunityIcons' },
  { name: 'restaurant-outline', lib: 'Ionicons' },
  { name: 'airplane-outline', lib: 'Ionicons' },
  { name: 'beach', lib: 'MaterialCommunityIcons' },
  { name: 'theater', lib: 'MaterialCommunityIcons' },
  { name: 'cart-outline', lib: 'Ionicons' },          
  { name: 'sail-boat', lib: 'MaterialCommunityIcons' },
  { name: 'image-outline', lib: 'Ionicons' },
  { name: 'camera-outline', lib: 'Ionicons' },
  { name: 'musical-notes-outline', lib: 'Ionicons' },
];

export default function CategoriesScreen() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState('');
  const [colour, setColour] = useState(COLOUR_OPTIONS[0]);
  const [icon, setIcon] = useState<string>(ICON_OPTIONS[0].name);
  const [editingId, setEditingId] = useState<number | null>(null);
  const { colours } = useTheme();

  
  const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: colours.background },

    header: {
      paddingHorizontal: 20,
      paddingTop: 60,
      paddingBottom: 8,
    },

    title: {
      fontSize: 28,
      fontWeight: '800',
      color: colours.textPrimary,
    },

    form: {
      paddingHorizontal: 20,
      gap: 10,
      marginBottom: 16,
    },

    label: {
      fontSize: 12,
      fontWeight: '600',
      color: colours.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: 0.4,
    },

    input: {
      backgroundColor: colours.surface,
      borderWidth: 1,
      borderColor: colours.border,
      borderRadius: 10,
      paddingHorizontal: 14,
      paddingVertical: 12,
      fontSize: 16,
      color: colours.textPrimary,
    },

    swatchRow: {
      flexDirection: 'row',
      gap: 8,
      flexWrap: 'wrap',
    },

    swatch: {
      width: 32,
      height: 32,
      borderRadius: 16,
    },

    swatchSelected: {
      borderWidth: 3,
      borderColor: colours.textPrimary,
    },

    iconRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },

    iconBtn: {
      padding: 8,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colours.border,
      backgroundColor: colours.surface,
    },

    iconBtnSelected: {
      borderColor: colours.primary,
      backgroundColor: colours.primaryDim,
    },

    iconText: {
      fontSize: 20,
    },

    saveBtn: {
      backgroundColor: colours.primary,
      borderRadius: 10,
      paddingVertical: 12,
      alignItems: 'center',
    },

    saveBtnText: {
      color: '#fff',
      fontWeight: '700',
      fontSize: 15,
    },

    cancelText: {
      color: colours.textSecondary,
      textAlign: 'center',
      fontSize: 14,
    },

    list: {
      paddingHorizontal: 20,
      gap: 10,
    },

    catRow: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colours.surface,
      borderRadius: 12,
      padding: 14,
      borderWidth: 1,
      borderColor: colours.border,
      gap: 12,
    },

    catIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
    },

    catIconText: {
      fontSize: 20,
    },

    catName: {
      flex: 1,
      fontSize: 16,
      fontWeight: '600',
      color: colours.textPrimary,
    },

    editHint: {
      fontSize: 13,
      color: colours.textMuted,
    },
  });

  // get categories from the database
  async function load() {
    const rows = await db.select().from(categoriesTable);
    setCategories(rows);
  }

  // load once when screen opens
  useEffect(() => { load(); }, []);

// save or update category
  async function handleSave() {
    if (!name.trim()) { Alert.alert('Name required'); return; }
    if (editingId) {
      // update existing categroy in database
      await db.update(categoriesTable).set({ name: name.trim(), colour, icon }).where(eq(categoriesTable.id, editingId));
    } else {
       // add new categroy 
      await db.insert(categoriesTable).values({ name: name.trim(), colour, icon });
    }
    // reset form after saving
    setName(''); setColour(COLOUR_OPTIONS[0]); setIcon(ICON_OPTIONS[0].name); setEditingId(null);
    load();
  }

  // fill form with selected category
  function startEdit(cat: Category) {
    setEditingId(cat.id); setName(cat.name); setColour(cat.colour); setIcon(cat.icon);
  }

  async function deleteCategory(id: number) {
  Alert.alert('Delete category', 'Are you sure?', [
    { text: 'Cancel', style: 'cancel' },
    {
      text: 'Delete',
      style: 'destructive',
      onPress: async () => {
        await db.delete(categoriesTable).where(eq(categoriesTable.id, id));
        load(); // refresh list
      },
    },
  ]);
}

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Categories</Text>
      </View>

      {/* form for adding/editing */}
      <View style={styles.form}>
        <TextInput style={styles.input} placeholder="Category name" placeholderTextColor={colours.textMuted}
          value={name} onChangeText={setName} accessibilityLabel="Category name" />

        <Text style={styles.label}>Colour</Text>
        <View style={styles.swatchRow}>
          {COLOUR_OPTIONS.map(c => (
            <TouchableOpacity key={c} onPress={() => setColour(c)}
              style={[styles.swatch, { backgroundColor: c }, colour === c && styles.swatchSelected]}
              accessibilityLabel={`Select colour ${c}`} />
          ))}
        </View>

        <Text style={styles.label}>Icon</Text>
        <View style={styles.iconRow}>
          {ICON_OPTIONS.map(ic => (
  <TouchableOpacity
    key={ic.name}
    onPress={() => setIcon(ic.name)}
    style={[styles.iconBtn, icon === ic.name && styles.iconBtnSelected]}
  >
    {ic.lib === 'Ionicons' ? (
      <Ionicons name={ic.name as any} size={20} color={colours.textPrimary} />
    ) : (
      <MaterialCommunityIcons name={ic.name as any} size={20} color={colours.textPrimary} />
    )}
  </TouchableOpacity>
))}
        </View>

        {/* save button */}
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave} accessibilityRole="button">
          <Text style={styles.saveBtnText}>{editingId ? 'Update Category' : 'Add Category'}</Text>
        </TouchableOpacity>

        {/* cancel editing */}
        {editingId && (
          <TouchableOpacity onPress={() => { setEditingId(null); setName(''); }} accessibilityRole="button">
            <Text style={styles.cancelText}>Cancel edit</Text>
          </TouchableOpacity>
        )}
      </View>

        {/* list of saved categories */}
      <FlatList
        data={categories}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.catRow} onPress={() => startEdit(item)}
            accessibilityRole="button" accessibilityLabel={`Edit ${item.name}`}>

              {/* coloured icon circle */}
            <View style={[styles.catIcon, { backgroundColor: item.colour }]}>
              {ICON_OPTIONS.find(i => i.name === item.icon)?.lib === 'MaterialCommunityIcons' ? (
  <MaterialCommunityIcons name={item.icon as any} size={20} color="#fff" />
) : (
  <Ionicons name={item.icon as any} size={20} color="#fff" />
)}
            </View>
            <View style={{ flex: 1 }}>
  <Text style={styles.catName}>{item.name}</Text>
  <Text style={{ fontSize: 12, color: colours.textMuted }}>
    Tap to edit
  </Text>
</View>
            <TouchableOpacity
  onPress={(e) => {
    e.stopPropagation(); 
    deleteCategory(item.id);
  }}
>
  <Ionicons name="trash-outline" size={18} color={colours.error} />
</TouchableOpacity>
</TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

