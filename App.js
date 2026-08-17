import React, { useMemo, useState } from 'react';
import {
  Alert, Image, Pressable, SafeAreaView, ScrollView, StatusBar,
  StyleSheet, Text, TextInput, View
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { starterRecipes } from './data/recipes';

const categories = ['All', 'Breakfast', 'Lunch', 'Dinner', 'Dessert', 'Vegan', 'Healthy', 'Italian', 'Mexican', 'Asian', 'Favorites', 'My Food'];
const foodCategories = categories.slice(1, 10);
const blankRecipe = { name: '', category: 'Dinner', image: '', ingredients: '', instructions: '', prepTime: '', servings: '', calories: '', difficulty: 'Easy' };

export default function App() {
  const [screen, setScreen] = useState({ name: 'home', category: 'All' });
  const [history, setHistory] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [myRecipes, setMyRecipes] = useState([]);

  const allRecipes = useMemo(() => [...myRecipes, ...starterRecipes], [myRecipes]);
  const navigate = (next) => { setHistory((old) => [...old, screen]); setScreen(next); };
  const goBack = () => {
    if (!history.length) return;
    setScreen(history[history.length - 1]);
    setHistory((old) => old.slice(0, -1));
  };
  const toggleFavorite = (id) => setFavorites((old) => old.includes(id) ? old.filter((item) => item !== id) : [...old, id]);
  const removeRecipe = (id) => Alert.alert('Delete recipe?', 'This recipe will be permanently removed.', [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Delete', style: 'destructive', onPress: () => setMyRecipes((old) => old.filter((recipe) => recipe.id !== id)) }
  ]);

  const showRecipe = (recipe) => navigate({ name: 'details', recipe });

  const Header = ({ title, subtitle }) => (
    <View style={styles.header}>
      {history.length > 0 ? <Pressable onPress={goBack} style={styles.backButton}><Ionicons name="arrow-back" size={23} color="#213547" /><Text style={styles.backText}>Back</Text></Pressable> : <View style={styles.backSpacer} />}
      <View style={styles.headerCopy}><Text style={styles.title}>{title}</Text>{subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}</View>
    </View>
  );

  const CategoryBar = ({ selected = 'All' }) => (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryList}>
      {categories.map((category) => (
        <Pressable key={category} onPress={() => category === 'My Food' ? navigate({ name: 'myFood' }) : navigate({ name: 'home', category })}
          style={[styles.category, selected === category && styles.categoryActive]}>
          <Text style={[styles.categoryText, selected === category && styles.categoryTextActive]}>{category}</Text>
        </Pressable>
      ))}
    </ScrollView>
  );

  const RecipeCard = ({ recipe, personal = false }) => (
    <View style={styles.card}>
      <Pressable onPress={() => showRecipe(recipe)}>
        <Image source={{ uri: recipe.image }} style={styles.cardImage} />
        <View style={styles.cardBody}><Text style={styles.cardTitle}>{recipe.name}</Text><Text style={styles.cardMeta}>{recipe.category} · {recipe.prepTime}</Text></View>
      </Pressable>
      {personal && <View style={styles.cardActions}>
        <Pressable style={styles.editButton} onPress={() => navigate({ name: 'form', editing: recipe })}><Ionicons name="create-outline" size={17} color="#16785B" /><Text style={styles.editText}>Edit</Text></Pressable>
        <Pressable style={styles.deleteButton} onPress={() => removeRecipe(recipe.id)}><Ionicons name="trash-outline" size={17} color="#B33333" /><Text style={styles.deleteText}>Delete</Text></Pressable>
      </View>}
    </View>
  );

  const Home = () => {
    const { category } = screen;
    const recipes = category === 'Favorites' ? allRecipes.filter((recipe) => favorites.includes(recipe.id)) : category === 'All' ? allRecipes : allRecipes.filter((recipe) => recipe.category === category);
    return <>
      <Header title="Foodie" subtitle="Find something delicious today" />
      <CategoryBar selected={category} />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionTitle}>{category === 'All' ? 'Popular recipes' : category}</Text>
        {recipes.length ? recipes.map((recipe) => <RecipeCard recipe={recipe} key={recipe.id} personal={myRecipes.some((item) => item.id === recipe.id)} />) : <Empty text="No recipes here yet. Choose a different category or add one in My Food." />}
      </ScrollView>
    </>;
  };

  const Details = () => {
    const { recipe } = screen;
    const isFavorite = favorites.includes(recipe.id);
    return <ScrollView contentContainerStyle={styles.detailsPage}>
      <Header title="Recipe details" />
      <Image source={{ uri: recipe.image }} style={styles.heroImage} />
      <View style={styles.detailTitleRow}><Text style={styles.detailName}>{recipe.name}</Text><Pressable onPress={() => toggleFavorite(recipe.id)} style={[styles.heart, isFavorite && styles.heartActive]}><Ionicons name={isFavorite ? 'heart' : 'heart-outline'} size={28} color={isFavorite ? '#fff' : '#E94F64'} /></Pressable></View>
      <Text style={styles.detailCategory}>{recipe.category}</Text>
      <View style={styles.stats}>
        <Stat icon="time-outline" label="Prep time" value={recipe.prepTime} /><Stat icon="people-outline" label="Servings" value={recipe.servings} />
        <Stat icon="flame-outline" label="Calories" value={recipe.calories} /><Stat icon="speedometer-outline" label="Difficulty" value={recipe.difficulty} />
      </View>
      <Text style={styles.detailHeading}>Ingredients</Text>
      {recipe.ingredients.map((item, index) => <Text key={index} style={styles.listLine}>• {item}</Text>)}
      <Text style={styles.detailHeading}>Instructions</Text>
      {recipe.instructions.map((item, index) => <View key={index} style={styles.step}><Text style={styles.stepNumber}>{index + 1}</Text><Text style={styles.stepText}>{item}</Text></View>)}
    </ScrollView>;
  };

  const MyFood = () => <>
    <Header title="My Food" subtitle="Your personal recipe collection" />
    <CategoryBar selected="My Food" />
    <ScrollView contentContainerStyle={styles.content}>
      <Pressable style={styles.addButton} onPress={() => navigate({ name: 'form' })}><Ionicons name="add-circle" size={24} color="#fff" /><Text style={styles.addButtonText}>Add New Recipe</Text></Pressable>
      <Text style={styles.sectionTitle}>My Recipes</Text>
      {myRecipes.length ? myRecipes.map((recipe) => <RecipeCard key={recipe.id} recipe={recipe} personal />) : <Empty text="Your recipes will appear here after you save one." />}
    </ScrollView>
  </>;

  const RecipeForm = () => {
    const editing = screen.editing;
    const initial = editing ? { ...editing, ingredients: editing.ingredients.join('\n'), instructions: editing.instructions.join('\n') } : blankRecipe;
    const [form, setForm] = useState(initial);
    const update = (field, value) => setForm((old) => ({ ...old, [field]: value }));
    const pickImage = async () => {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) return Alert.alert('Permission needed', 'Please allow photo access to upload your dish image.');
      const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [4, 3], quality: 0.8 });
      if (!result.canceled) update('image', result.assets[0].uri);
    };
    const save = () => {
      if (!form.name.trim() || !form.image || !form.ingredients.trim() || !form.instructions.trim()) return Alert.alert('Missing information', 'Please provide a name, image, ingredients, and instructions.');
      const recipe = {
        ...form, id: editing ? editing.id : `my-${Date.now()}`, name: form.name.trim(),
        ingredients: form.ingredients.split('\n').map((x) => x.trim()).filter(Boolean), instructions: form.instructions.split('\n').map((x) => x.trim()).filter(Boolean),
        prepTime: form.prepTime || 'Not specified', servings: form.servings || 'Not specified', calories: form.calories || 'Not specified'
      };
      setMyRecipes((old) => editing ? old.map((item) => item.id === recipe.id ? recipe : item) : [recipe, ...old]);
      Alert.alert('Saved!', `${recipe.name} is now in My Recipes.`, [{ text: 'OK', onPress: goBack }]);
    };
    return <ScrollView contentContainerStyle={styles.formPage} keyboardShouldPersistTaps="handled">
      <Header title={editing ? 'Edit Recipe' : 'Add New Recipe'} subtitle="Share your culinary creation" />
      <Field label="Recipe name *" value={form.name} onChangeText={(v) => update('name', v)} placeholder="e.g. Garlic Lemon Chicken" />
      <Text style={styles.fieldLabel}>Dish image *</Text>
      <Pressable style={styles.imagePicker} onPress={pickImage}>{form.image ? <Image source={{ uri: form.image }} style={styles.previewImage} /> : <><Ionicons name="image-outline" size={30} color="#16785B" /><Text style={styles.pickerText}>Tap to upload an image</Text></>}</Pressable>
      <Text style={styles.fieldLabel}>Category</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.formCategoryList}>{foodCategories.map((category) => <Pressable key={category} onPress={() => update('category', category)} style={[styles.formCategory, form.category === category && styles.formCategoryActive]}><Text style={[styles.formCategoryText, form.category === category && styles.formCategoryTextActive]}>{category}</Text></Pressable>)}</ScrollView>
      <Field label="Ingredients *" value={form.ingredients} onChangeText={(v) => update('ingredients', v)} placeholder="One ingredient per line" multiline />
      <Field label="Step-by-step instructions *" value={form.instructions} onChangeText={(v) => update('instructions', v)} placeholder="One step per line" multiline />
      <View style={styles.fieldRow}><View style={styles.half}><Field label="Prep time" value={form.prepTime} onChangeText={(v) => update('prepTime', v)} placeholder="30 min" /></View><View style={styles.half}><Field label="Servings" value={String(form.servings)} onChangeText={(v) => update('servings', v)} placeholder="4" keyboardType="numeric" /></View></View>
      <View style={styles.fieldRow}><View style={styles.half}><Field label="Calories" value={form.calories} onChangeText={(v) => update('calories', v)} placeholder="400 kcal" /></View><View style={styles.half}><Field label="Difficulty" value={form.difficulty} onChangeText={(v) => update('difficulty', v)} placeholder="Easy" /></View></View>
      <Pressable style={styles.saveButton} onPress={save}><Ionicons name="save-outline" size={21} color="#fff" /><Text style={styles.saveText}>Save Recipe</Text></Pressable>
    </ScrollView>;
  };

  return <SafeAreaView style={styles.safe}><StatusBar barStyle="dark-content" />{screen.name === 'home' && <Home />}{screen.name === 'details' && <Details />}{screen.name === 'myFood' && <MyFood />}{screen.name === 'form' && <RecipeForm />}</SafeAreaView>;
}

function Field({ label, multiline, ...props }) { return <View style={styles.field}><Text style={styles.fieldLabel}>{label}</Text><TextInput style={[styles.input, multiline && styles.textArea]} placeholderTextColor="#91A09B" multiline={multiline} textAlignVertical={multiline ? 'top' : 'center'} {...props} /></View>; }
function Empty({ text }) { return <View style={styles.empty}><Ionicons name="restaurant-outline" size={35} color="#82A097" /><Text style={styles.emptyText}>{text}</Text></View>; }
function Stat({ icon, label, value }) { return <View style={styles.stat}><Ionicons name={icon} size={21} color="#16785B" /><Text style={styles.statLabel}>{label}</Text><Text style={styles.statValue}>{value}</Text></View>; }

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F8FBF8' }, header: { minHeight: 78, paddingHorizontal: 18, flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FBF8' }, backButton: { width: 72, flexDirection: 'row', alignItems: 'center', gap: 2 }, backSpacer: { width: 72 }, backText: { fontWeight: '700', color: '#213547', marginLeft: 3 }, headerCopy: { flex: 1, alignItems: 'center', marginRight: 72 }, title: { fontSize: 26, fontWeight: '800', color: '#163B2B' }, subtitle: { color: '#719085', marginTop: 2, fontSize: 12 }, categoryList: { paddingHorizontal: 14, gap: 9, paddingBottom: 14 }, category: { paddingHorizontal: 15, paddingVertical: 9, borderRadius: 22, backgroundColor: '#E7F0EA' }, categoryActive: { backgroundColor: '#16785B' }, categoryText: { color: '#386353', fontWeight: '700' }, categoryTextActive: { color: '#fff' }, content: { padding: 18, paddingBottom: 40 }, sectionTitle: { fontSize: 20, fontWeight: '800', color: '#163B2B', marginBottom: 13 }, card: { borderRadius: 16, backgroundColor: '#fff', overflow: 'hidden', marginBottom: 15, shadowColor: '#193A2F', shadowOpacity: 0.09, shadowRadius: 10, elevation: 3 }, cardImage: { height: 180, width: '100%', backgroundColor: '#DDE8E0' }, cardBody: { padding: 13 }, cardTitle: { fontSize: 18, fontWeight: '800', color: '#17372B' }, cardMeta: { marginTop: 4, color: '#6B857B' }, cardActions: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#EDF2EE' }, editButton: { flex: 1, padding: 12, flexDirection: 'row', justifyContent: 'center', gap: 6 }, deleteButton: { flex: 1, padding: 12, flexDirection: 'row', justifyContent: 'center', gap: 6, borderLeftWidth: 1, borderLeftColor: '#EDF2EE' }, editText: { color: '#16785B', fontWeight: '800' }, deleteText: { color: '#B33333', fontWeight: '800' }, empty: { alignItems: 'center', padding: 32, backgroundColor: '#EDF5EF', borderRadius: 16 }, emptyText: { marginTop: 10, textAlign: 'center', color: '#638075', lineHeight: 21 }, detailsPage: { paddingBottom: 35 }, heroImage: { width: '100%', height: 270, backgroundColor: '#DDE8E0' }, detailTitleRow: { flexDirection: 'row', paddingHorizontal: 20, paddingTop: 18, alignItems: 'center' }, detailName: { flex: 1, fontSize: 25, fontWeight: '800', color: '#163B2B' }, heart: { height: 49, width: 49, borderRadius: 25, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFF0F2' }, heartActive: { backgroundColor: '#E94F64' }, detailCategory: { paddingHorizontal: 20, color: '#16785B', fontWeight: '800', marginTop: 3 }, stats: { margin: 20, flexDirection: 'row', flexWrap: 'wrap', borderRadius: 15, backgroundColor: '#EAF4ED', padding: 10 }, stat: { width: '50%', padding: 10 }, statLabel: { color: '#668378', fontSize: 12, marginTop: 3 }, statValue: { color: '#17372B', fontWeight: '800', marginTop: 2 }, detailHeading: { paddingHorizontal: 20, fontSize: 20, fontWeight: '800', color: '#163B2B', marginTop: 10, marginBottom: 8 }, listLine: { paddingHorizontal: 24, color: '#405C50', fontSize: 15, lineHeight: 27 }, step: { flexDirection: 'row', marginHorizontal: 20, marginBottom: 11, alignItems: 'flex-start' }, stepNumber: { backgroundColor: '#16785B', color: '#fff', fontWeight: '800', width: 25, height: 25, textAlign: 'center', borderRadius: 13, paddingTop: 3, marginRight: 10 }, stepText: { flex: 1, color: '#405C50', lineHeight: 22, paddingTop: 1 }, addButton: { backgroundColor: '#16785B', padding: 16, borderRadius: 14, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8, marginBottom: 23 }, addButtonText: { color: '#fff', fontWeight: '800', fontSize: 16 }, formPage: { paddingBottom: 45 }, field: { marginHorizontal: 18, marginBottom: 14 }, fieldLabel: { fontSize: 14, color: '#24483A', fontWeight: '800', marginBottom: 7 }, input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#D5E2D9', borderRadius: 11, minHeight: 46, paddingHorizontal: 12, color: '#183D2C', fontSize: 15 }, textArea: { minHeight: 115, paddingTop: 12 }, imagePicker: { marginHorizontal: 18, height: 180, borderRadius: 13, borderWidth: 2, borderColor: '#BFD8C8', borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', backgroundColor: '#F1F8F3', marginBottom: 16 }, previewImage: { width: '100%', height: '100%' }, pickerText: { color: '#16785B', fontWeight: '700', marginTop: 8 }, formCategoryList: { paddingHorizontal: 18, gap: 7, paddingBottom: 15 }, formCategory: { paddingVertical: 8, paddingHorizontal: 13, backgroundColor: '#E7F0EA', borderRadius: 18 }, formCategoryActive: { backgroundColor: '#16785B' }, formCategoryText: { fontWeight: '700', color: '#4B6D5D' }, formCategoryTextActive: { color: '#fff' }, fieldRow: { flexDirection: 'row', paddingHorizontal: 18, gap: 10 }, half: { flex: 1 }, half: { flex: 1 }, fieldRow: { flexDirection: 'row', paddingHorizontal: 18, gap: 10 }, fieldRow: { flexDirection: 'row', paddingHorizontal: 18, gap: 10 }, saveButton: { margin: 18, backgroundColor: '#16785B', padding: 16, borderRadius: 14, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8 }, saveText: { color: '#fff', fontSize: 17, fontWeight: '800' }
});
