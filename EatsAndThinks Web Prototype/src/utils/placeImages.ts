// src/utils/placeImages.ts
// Galería de imágenes genéricas por tipo de local - GARANTIZADO 100%
import Fuse from 'fuse.js';

export const PLACE_IMAGES: Record<string, string[]> = {
    // Restaurantes (categoría más amplia)
    "restaurant": [
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80",
      "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800&q=80",
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80",
      "https://images.unsplash.com/photo-1505275350441-83dcda8eeef5?w=800&q=80",
      "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800&q=80",
      "https://images.unsplash.com/photo-1579027989536-b7b1f875659b?w=800&q=80",
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80"
    ],
    
    // Bares
    "bar": [
      "https://images.unsplash.com/photo-1572116469696-31de0f17cc34?w=800&q=80",
      "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800&q=80",
      "https://images.unsplash.com/photo-1566417713940-fe7c737a9ef2?w=800&q=80",
      "https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=800&q=80",
      "https://images.unsplash.com/photo-1532634922-8fe0b757fb13?w=800&q=80",
      "https://images.unsplash.com/photo-1551509134-eb7c5ea9ad2d?w=800&q=80"
    ],
    
    // Cafeterías
    "cafe": [
      "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&q=80",
      "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&q=80",
      "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&q=80",
      "https://images.unsplash.com/photo-1445116572660-236099ec97a0?w=800&q=80",
      "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&q=80",
      "https://images.unsplash.com/photo-1498804103079-a6351b050096?w=800&q=80"
    ],
    
    // Heladerías
    "heladeria": [
      "https://images.unsplash.com/photo-1564801629778-eabf6ed7d440?w=800&q=80",
      "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=800&q=80",
      "https://images.unsplash.com/photo-1551024601-bec78aea704b?w=800&q=80",
      "https://images.unsplash.com/photo-1570197788417-0e82375c9371?w=800&q=80",
      "https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=800&q=80",
      "https://images.unsplash.com/photo-1488900128323-21503983a07e?w=800&q=80"
    ],
    
    // Comida rápida
    "comida_rapida": [
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80",
      "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=800&q=80",
      "https://images.unsplash.com/photo-1550547660-d9450f859349?w=800&q=80",
      "https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?w=800&q=80",
      "https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=800&q=80",
      "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=800&q=80"
    ],
    
    // Pizzerías
    "pizzeria": [
      "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&q=80",
      "https://images.unsplash.com/photo-1595708544948-c67f72ef5d2e?w=800&q=80",
      "https://images.unsplash.com/photo-1571407970349-bc81e7e96a47?w=800&q=80",
      "https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?w=800&q=80",
      "https://images.unsplash.com/photo-1604382355076-af4b0eb60143?w=800&q=80",
      "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800&q=80"
    ],
    
    // Asiático
    "asiatico": [
      "https://images.unsplash.com/photo-1629712257540-e03dfbd96b0b?w=800&q=80",
      "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800&q=80",
      "https://images.unsplash.com/photo-1617093727343-374698b1b08d?w=800&q=80",
      "https://images.unsplash.com/photo-1611143669185-af224c5e3252?w=800&q=80",
      "https://images.unsplash.com/photo-1553621042-f6e147245754?w=800&q=80",
      "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=800&q=80"
    ],

    // Panaderías
    "panaderia": [
      "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&q=80",
      "https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=800&q=80",
      "https://images.unsplash.com/photo-1558961364-881f8a664864?w=800&q=80",
      "https://images.unsplash.com/photo-1574085733277-851d9d856a3a?w=800&q=80",
      "https://images.unsplash.com/photo-1483695028939-5bb13f8648b0?w=800&q=80",
      "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&q=80"
    ],

    // Mexicano
    "mexicano": [
      "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=800&q=80",
      "https://images.unsplash.com/photo-1565299585323-38174c13fae8?w=800&q=80",
      "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=800&q=80",
      "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800&q=80",
      "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800&q=80"
    ],

    // Italiano
    "italiano": [
      "https://images.unsplash.com/photo-1598866594230-a7c12756260f?w=800&q=80",
      "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800&q=80",
      "https://images.unsplash.com/photo-1590947132387-155cc02fee76?w=800&q=80",
      "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=800&q=80"
    ],

    // Vegetariano
    "vegetariano": [
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80",
      "https://images.unsplash.com/photo-1540420828642-fca2c5c18abb?w=800&q=80",
      "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=800&q=80",
      "https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=800&q=80"
    ],

    // Marisquería
    "marisqueria": [
      "https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=800&q=80",
      "https://images.unsplash.com/photo-1519708227888-3856c6c8220e?w=800&q=80",
      "https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62?w=800&q=80",
      "https://images.unsplash.com/photo-1611250508553-951992e4b7b5?w=800&q=80"
    ],

    // Tapas
    "tapas": [
      "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=800&q=80",
      "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800&q=80",
      "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&q=80",
      "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=800&q=80"
    ],

    // DEFAULT - SIEMPRE disponible
    "default": [
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80",
      "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800&q=80",
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80",
      "https://images.unsplash.com/photo-1505275350441-83dcda8eeef5?w=800&q=80",
      "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800&q=80"
    ]
  };
  
  // Mapeo COMPLETO de tipos - versión expandida
const TYPE_MAPPING: Record<string, string> = {
    // ----------------------------------------------------------------
    // RESTAURANTE (General / Varios)
    // ----------------------------------------------------------------
    "restaurant": "restaurant",
    "restaurante": "restaurant",
    "restaurantes": "restaurant",
    "restoran": "restaurant",
    "restorán": "restaurant",
    "food": "restaurant",
    "comida": "restaurant",
    "eat": "restaurant",
    "eating": "restaurant",
    "dining": "restaurant",
    "eatery": "restaurant",
    "bistro": "restaurant",
    "brasserie": "restaurant",
    "local de comida": "restaurant",
    "casa de comidas": "restaurant",
    "gourmet": "restaurant",
    "cenar": "restaurant",
    "almorzar": "restaurant",
    "comer": "restaurant",
  
    // ----------------------------------------------------------------
    // BAR / PUB / COPAS
    // ----------------------------------------------------------------
    "bar": "bar",
    "bares": "bar",
    "pub": "bar",
    "pubs": "bar",
    "cerveceria": "bar",
    "cervecería": "bar",
    "cervecerias": "bar",
    "taberna": "bar",
    "tasca": "bar",
    "cantina": "bar",
    "coctelería": "bar",
    "cocteleria": "bar",
    "cocktail": "bar",
    "cocktails": "bar",
    "vermutería": "bar",
    "vermuteria": "bar",
    "vinoteca": "bar",
    "bar de vinos": "bar",
    "wine_bar": "bar",
    "drinks": "bar",
    "bebidas": "bar",
    "copas": "bar",
    "tragos": "bar",
    "bodega": "bar",
  
    // ----------------------------------------------------------------
    // CAFÉ / DESAYUNOS / BRUNCH
    // ----------------------------------------------------------------
    "cafe": "cafe",
    "café": "cafe",
    "cafés": "cafe",
    "cafeteria": "cafe",
    "cafetería": "cafe",
    "cafeterias": "cafe",
    "coffee": "cafe",
    "coffee_shop": "cafe",
    "brunch": "cafe",
    "desayuno": "cafe",
    "desayunos": "cafe",
    "breakfast": "cafe",
    "té": "cafe",
    "tea": "cafe",
    "tea_room": "cafe",
    "salón de té": "cafe",
    "merienda": "cafe",
    "tostadas": "cafe",
    "churrería": "cafe",
    "churreria": "cafe",
    "churros": "cafe",
  
    // ----------------------------------------------------------------
    // COMIDA RÁPIDA (Fast Food)
    // ----------------------------------------------------------------
    "fast_food": "comida_rapida",
    "comida rápida": "comida_rapida",
    "comida rapida": "comida_rapida",
    "hamburguesería": "comida_rapida",
    "hamburgueseria": "comida_rapida",
    "hamburguesas": "comida_rapida",
    "burger": "comida_rapida",
    "burgers": "comida_rapida",
    "kebab": "comida_rapida",
    "döner": "comida_rapida",
    "hot dog": "comida_rapida",
    "perrito caliente": "comida_rapida",
    "papas fritas": "comida_rapida",
    "fries": "comida_rapida",
    "pollo frito": "comida_rapida",
    "fried chicken": "comida_rapida",
    "sandwich": "comida_rapida",
    "sandwiches": "comida_rapida",
    "bocadillo": "comida_rapida",
    "bocadillos": "comida_rapida",
    "bocata": "comida_rapida",
    "bocatas": "comida_rapida",
    
    // ----------------------------------------------------------------
    // PIZZERÍA
    // ----------------------------------------------------------------
    "pizzeria": "pizzeria",
    "pizzería": "pizzeria",
    "pizzerias": "pizzeria",
    "pizza": "pizzeria",
    "pizzas": "pizzeria",
  
    // ----------------------------------------------------------------
    // ASIÁTICO (Japonés, Chino, Thai, Indio, Coreano, etc.)
    // ----------------------------------------------------------------
    "asian_restaurant": "asiatico",
    "asiatico": "asiatico",
    "asiático": "asiatico",
    "japanese": "asiatico",
    "japonés": "asiatico",
    "japones": "asiatico",
    "chinese": "asiatico",
    "chino": "asiatico",
    "chinos": "asiatico",
    "sushi": "asiatico",
    "sashimi": "asiatico",
    "maki": "asiatico",
    "nigiri": "asiatico",
    "ramen": "asiatico",
    "thai": "asiatico",
    "tailandés": "asiatico",
    "tailandes": "asiatico",
    "pad thai": "asiatico",
    "coreano": "asiatico",
    "korean": "asiatico",
    "vietnamese": "asiatico",
    "vietnamita": "asiatico",
    "pho": "asiatico",
    "indian": "asiatico",
    "indio": "asiatico",
    "hindú": "asiatico",
    "curry": "asiatico",
    "tandoori": "asiatico",
    "dim sum": "asiatico",
    "wok": "asiatico",
    "poke": "asiatico", // Aunque hawaiano, se asocia popularmente
    
    // ----------------------------------------------------------------
    // HELADERÍA / POSTRES
    // ----------------------------------------------------------------
    "ice_cream": "heladeria",
    "heladeria": "heladeria",
    "heladería": "heladeria",
    "helado": "heladeria",
    "helados": "heladeria",
    "gelato": "heladeria",
    "gelateria": "heladeria",
    "gelatería": "heladeria",
    "ice_cream_shop": "heladeria",
    "yogurtería": "heladeria",
    "yogurteria": "heladeria",
    "frozen yogurt": "heladeria",
    "yogur helado": "heladeria",
    "postres": "heladeria", // Valor genérico
    "dessert": "heladeria", // Valor genérico
  
    // ----------------------------------------------------------------
    // PANADERÍA / PASTELERÍA
    // ----------------------------------------------------------------
    "bakery": "panaderia",
    "panaderia": "panaderia",
    "panadería": "panaderia",
    "bakeries": "panaderia",
    "pasteleria": "panaderia",
    "pastelería": "panaderia",
    "pan": "panaderia",
    "bread": "panaderia",
    "croissant": "panaderia",
    "pastel": "panaderia",
    "pasteles": "panaderia",
    "tarta": "panaderia",
    "torta": "panaderia",
    "cake": "panaderia",
    "dulces": "panaderia",
    "sweets": "panaderia",
    "repostería": "panaderia",
    "reposteria": "panaderia",
    "bollería": "panaderia",
    "bolleria": "panaderia",
    "donuts": "panaderia",
    "rosquillas": "panaderia",
    "boulangerie": "panaderia",
    
    // ----------------------------------------------------------------
    // MEXICANO / TEX-MEX
    // ----------------------------------------------------------------
    "mexican": "mexicano",
    "mejico": "mexicano",
    "mexicano": "mexicano",
    "mexican_restaurant": "mexicano",
    "tex-mex": "mexicano",
    "texmex": "mexicano",
    "tacos": "mexicano",
    "taco": "mexicano",
    "burrito": "mexicano",
    "burritos": "mexicano",
    "quesadilla": "mexicano",
    "quesadillas": "mexicano",
    "nachos": "mexicano",
    "guacamole": "mexicano",
    "margaritas": "mexicano",
    "fajitas": "mexicano",
    "enchiladas": "mexicano",
    "pozole": "mexicano",
  
    // ----------------------------------------------------------------
    // ITALIANO
    // ----------------------------------------------------------------
    "italian": "italiano",
    "italia": "italiano",
    "italiano": "italiano",
    "italian_restaurant": "italiano",
    "pasta": "italiano",
    "ristorante": "italiano",
    "trattoria": "italiano",
    "trattoría": "italiano",
    "spaghetti": "italiano",
    "lasagna": "italiano",
    "lasaña": "italiano",
    "focaccia": "italiano",
    "gnocchi": "italiano",
    "ñoquis": "italiano",
    "ravioli": "italiano",
    // Pizza tiene su propia categoría
  
    // ----------------------------------------------------------------
    // VEGETARIANO / VEGANO / SALUDABLE
    // ----------------------------------------------------------------
    "vegetarian": "vegetariano",
    "vegetariano": "vegetariano",
    "vegetarian_restaurant": "vegetariano",
    "vegetarianos": "vegetariano",
    "vegan": "vegetariano",
    "vegano": "vegetariano",
    "vegana": "vegetariano",
    "plant_based": "vegetariano",
    "basado en plantas": "vegetariano",
    "comida sana": "vegetariano",
    "healthy": "vegetariano",
    "healthy_food": "vegetariano",
    "ensaladas": "vegetariano",
    "ensalada": "vegetariano",
    "salad": "vegetariano",
    "salad_bar": "vegetariano",
  
    // ----------------------------------------------------------------
    // ESPAÑOL (Tapas, Ibéricos, Paella, etc.)
    // ----------------------------------------------------------------
    "spanish": "español",
    "español": "español",
    "españa": "español",
    "spanish_restaurant": "español",
    "restaurante español": "español",
    "comida española": "español",
    "cocina española": "español",
    "ibérico": "español",
    "iberico": "español",
    "jamón": "español",
    "jamon": "español",
    "jamoneria": "español",
    "jamonería": "español",
    "paella": "español",
    "cocido": "español",
    "fabada": "español",
    "gazpacho": "español",
    "tortilla": "español",
    "tortilla de patatas": "español",
    "tapas": "español",
    "tapas_restaurant": "español",
    "tapas_bar": "español",
    "raciones": "español",
    "pinchos": "español",
    "pintxos": "español",
    "tapeo": "español",
    "ir de tapas": "español",
    "croquetas": "español",
    
    // ----------------------------------------------------------------
    // MEDITERRÁNEO (Griego, Turco, Libanés...)
    // ----------------------------------------------------------------
    "mediterranean": "mediterraneo",
    "mediterráneo": "mediterraneo",
    "mediterranea": "mediterraneo",
    "mediterranean_restaurant": "mediterraneo",
    "comida mediterránea": "mediterraneo",
    "cocina mediterranea": "mediterraneo",
    "griego": "mediterraneo",
    "greek": "mediterraneo",
    "moussaka": "mediterraneo",
    "turco": "mediterraneo",
    "turkish": "mediterraneo",
    "libanés": "mediterraneo",
    "lebanese": "mediterraneo",
    "hummus": "mediterraneo",
    "falafel": "mediterraneo",
    "pita": "mediterraneo",
    // Kebab está en fast_food, pero aquí también encaja
    
    // ----------------------------------------------------------------
    // AMERICANO (BBQ, Diner, Steakhouse)
    // ----------------------------------------------------------------
    "american": "americano",
    "america": "americano",
    "americano": "americano",
    "american_restaurant": "americano",
    "comida americana": "americano",
    "diner": "americano",
    "bbq": "americano",
    "barbacoa": "americano",
    "ribs": "americano",
    "costillas": "americano",
    "steakhouse": "americano",
    "steak": "americano",
    "filete": "americano",
    "parrilla americana": "americano",
    // Hamburguesa está en fast_food
    
    // ----------------------------------------------------------------
    // MARISQUERÍA / PESCADO
    // ----------------------------------------------------------------
    "seafood": "marisqueria",
    "marisqueria": "marisqueria",
    "marisquería": "marisqueria",
    "seafood_restaurant": "marisqueria",
    "pescado": "marisqueria",
    "pescados": "marisqueria",
    "marisco": "marisqueria",
    "mariscos": "marisqueria",
    "pulpería": "marisqueria",
    "pulperia": "marisqueria",
    "pulpo": "marisqueria",
    "ostras": "marisqueria",
    "oyster_bar": "marisqueria",
    "fish": "marisqueria",
    "fish_and_chips": "marisqueria",
    "ceviche": "marisqueria", // Podría ser latino también
    "cevichería": "marisqueria", // Podría ser latino también
    
    // ----------------------------------------------------------------
    // LATINOAMERICANO (Peruano, Argentino, Colombiano...)
    // ----------------------------------------------------------------
    "latino": "latino",
    "latinoamericano": "latino",
    "comida latina": "latino",
    "sudamericano": "latino",
    "peruano": "latino",
    "peruvian": "latino",
    "lomo saltado": "latino",
    "argentino": "latino",
    "parrillada": "latino",
    "asado": "latino",
    "chimichurri": "latino",
    "colombiano": "latino",
    "arepa": "latino",
    "arepas": "latino",
    "venezolano": "latino",
    "brasileño": "latino",
    "brasilero": "latino",
    "rodizio": "latino",
    "picanha": "latino",
    "cubano": "latino",
    "caribeño": "latino",
  
    // ----------------------------------------------------------------
    // FRANCÉS
    // ----------------------------------------------------------------
    "french": "frances",
    "francés": "frances",
    "francia": "frances",
    "frances": "frances",
    "comida francesa": "frances",
    "creperie": "frances",
    "crepería": "frances",
    "crepes": "frances",
    "galettes": "frances",
    "foie gras": "frances",
    "ratatouille": "frances",
    "raclette": "frances",
    "fondue": "frances",
    // Boulangerie y Croissant están en panaderia/cafe
  
    // ----------------------------------------------------------------
    // ÁRABE / AFRICANO
    // ----------------------------------------------------------------
    "arabe": "arabe_africano",
    "árabe": "arabe_africano",
    "middle eastern": "arabe_africano",
    "moroccan": "arabe_africano",
    "marroquí": "arabe_africano",
    "tajine": "arabe_africano",
    "tagine": "arabe_africano",
    "couscous": "arabe_africano",
    "cuscús": "arabe_africano",
    "egipcio": "arabe_africano",
    "etiope": "arabe_africano",
    "ethiopian": "arabe_africano",
    "injera": "arabe_africano",
  
    // ----------------------------------------------------------------
    // FOOD TRUCK / CALLEJERO
    // ----------------------------------------------------------------
    "food_truck": "food_truck",
    "food truck": "food_truck",
    "camion de comida": "food_truck",
    "gastroneta": "food_truck",
    "street_food": "food_truck",
    "comida callejera": "food_truck",
    "puesto": "food_truck",
    "puesto de comida": "food_truck",
  
    // ----------------------------------------------------------------
    // MERCADO / FOOD HALL
    // ----------------------------------------------------------------
    "market": "mercado",
    "mercado": "mercado",
    "food_hall": "mercado",
    "food hall": "mercado",
    "food_court": "mercado",
    "patio de comidas": "mercado",
    "mercado gastronómico": "mercado",
  
    // ----------------------------------------------------------------
    // Por defecto - SIEMPRE al final
    // ----------------------------------------------------------------
    "default": "default"
  };
  
  // --- INICIO DE LA NUEVA LÓGICA ---

// 2. Crear la lista de todas las palabras que conocemos
const allKnownTypes = Object.keys(TYPE_MAPPING);

// 3. Crear la instancia de Fuse.js (solo se hace una vez)
const fuse = new Fuse(allKnownTypes, {
  includeScore: true,
  threshold: 0.4, // Umbral de tolerancia (0.0 = perfecto, 1.0 = cualquiera)
});

/**
 * Normaliza un texto:
 * 1. Quita acentos (NFD)
 * 2. Pone en minúsculas
 * 3. Quita espacios extra
 * 4. Reemplaza guiones bajos por espacios
 */
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD") // Descomponer acentos
    .replace(/[\u0300-\u036f]/g, "") // Quitar acentos
    .replace(/_/g, ' ') // Reemplazar guiones bajos
    .trim();
}

/**
 * Obtiene una imagen genérica para un tipo de local - GARANTIZADO 100%
 * ¡AHORA CON LÓGICA "FUZZY" A PRUEBA DE ERRORES!
 */
export function getPlaceImage(placeType: string | undefined, seed?: string): string {
  // --- PASO 0: Si no hay tipo, usar default ---
  if (!placeType) {
    console.log("⚠️  No hay tipo, usando imagen por defecto");
    return PLACE_IMAGES.default[0];
  }

  // Normalizar el tipo de entrada
  const normalizedType = normalizeText(placeType);
  console.log(`🖼️ Buscando imagen para tipo: "${placeType}" (Normalizado: "${normalizedType}")`);

  // --- PASO 1: Búsqueda Exacta (La más rápida) ---
  let category = TYPE_MAPPING[normalizedType];
  if (category) {
    console.log(`✅ Encontrado (Exacto): "${normalizedType}" -> "${category}"`);
    return selectImage(category, seed);
  }

  // --- PASO 2: Búsqueda "Fuzzy" (Si la exacta falla) ---
  const fuzzyResult = fuse.search(normalizedType);
  if (fuzzyResult.length > 0) {
    const bestMatch = fuzzyResult[0].item; // La mejor coincidencia (ej. "japanese")
    const score = fuzzyResult[0].score; // Qué tan buena es (más bajo es mejor)
    
    category = TYPE_MAPPING[bestMatch]; // Obtener la categoría de la coincidencia
    
    console.log(`🔶 Encontrado (Fuzzy): "${normalizedType}" ~ "${bestMatch}" (Score: ${score}) -> "${category}"`);
    return selectImage(category, seed);
  }

  // --- PASO 3: Fallback a "default" ---
  console.log(`❌ No se encontró coincidencia exacta ni fuzzy para "${normalizedType}". Usando default.`);
  return selectImage("default", seed);
}

/**
 * Función helper para seleccionar la imagen (aleatoria o con seed)
 */
function selectImage(category: string, seed?: string): string {
  const images = PLACE_IMAGES[category] || PLACE_IMAGES.default;
  
  // Seleccionar imagen consistente basada en seed
  if (seed) {
    const hash = seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const selectedIndex = hash % images.length;
    return images[selectedIndex];
  }
  
  // Imagen aleatoria
  const randomIndex = Math.floor(Math.random() * images.length);
  return images[randomIndex];
}


/**
 * Obtiene la primera imagen para un tipo de local (útil para destacados)
 * (Esta función ahora también usa la lógica fuzzy)
 */
export function getPlaceImageByIndex(placeType: string | undefined, index: number = 0): string {
  console.log("🖼️ Buscando imagen por índice para tipo:", placeType, "índice:", index);
  
  if (!placeType) {
    return PLACE_IMAGES.default[0];
  }
  
  const normalizedType = normalizeText(placeType);
  let category = TYPE_MAPPING[normalizedType];

  // Búsqueda Fuzzy si falla la exacta
  if (!category) {
    const fuzzyResult = fuse.search(normalizedType);
    if (fuzzyResult.length > 0) {
      category = TYPE_MAPPING[fuzzyResult[0].item];
    } else {
      category = "default";
    }
  }

  const images = PLACE_IMAGES[category] || PLACE_IMAGES.default;
  return images[index % images.length];
}

/**
 * Función de emergencia - SIEMPRE devuelve una imagen
 */
export function getGuaranteedImage(placeType?: string, seed?: string): string {
  try {
    // getPlaceImage ahora es tan robusta que es casi imposible que falle
    const image = getPlaceImage(placeType, seed);
    if (image && image.startsWith('http')) {
      return image;
    }
  } catch (error) {
    console.error("❌ Error obteniendo imagen, usando fallback:", error);
  }
  
  // Fallback absoluto
  return PLACE_IMAGES.default[0];
}