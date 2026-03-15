import { useState, useEffect, useRef, useCallback, useMemo } from "react";

/* ─── Persistent Storage Helper (localStorage) ─── */
const store = {
  async get(k) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : null; } catch { return null; } },
  async set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
};

/* ─── STORY DATA ─── */
const CHAPTERS = [
  {
    id: 1, difficulty: "beginner", color: "#b5651d",
    title: "Un café en Santiago",
    titleEn: "A coffee in Santiago",
    cover: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=900&q=80",
    synopsis: "Ana arrives at a café in Santiago and meets Carlos for the first time. Learn greetings, introductions, and how to order your first coffee in Spanish.",
    pages: [
      {
        type: "story",
        img: "https://images.unsplash.com/photo-1445116572660-236099ec97a0?w=700&q=80",
        imgCaption: "El Café Luna — Santiago de los Caballeros",
        narrative: [
          "It's a warm Tuesday morning in Santiago de los Caballeros. Ana walks into a small café called *El Café Luna*. The smell of fresh coffee fills the air.",
          "She approaches the counter and smiles at the barista.",
        ],
        dialogue: [
          { speaker: "Ana", line: "¡Buenos días! ¿Cómo está usted?" },
          { speaker: "Barista", line: "¡Buenos días, señorita! Muy bien, gracias. ¿Y usted?" },
          { speaker: "Ana", line: "Muy bien, gracias. Quiero un café con leche, por favor." },
          { speaker: "Barista", line: "¡Claro! ¿Algo más?" },
          { speaker: "Ana", line: "No, gracias. ¿Cuánto es?" },
          { speaker: "Barista", line: "Son ciento cincuenta pesos." },
        ],
        vocab: [
          { es: "Buenos días", en: "Good morning", note: "Used until about noon" },
          { es: "¿Cómo está usted?", en: "How are you? (formal)", note: "Use 'usted' with strangers" },
          { es: "Quiero", en: "I want", note: "From the verb 'querer'" },
          { es: "Por favor", en: "Please", note: "Essential polite word" },
          { es: "¿Cuánto es?", en: "How much is it?", note: "For asking prices" },
          { es: "Gracias", en: "Thank you", note: "Always be polite!" },
        ],
      },
      {
        type: "exercise",
        title: "En el café",
        subtitle: "Help Ana order at the café",
        img: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=700&q=80",
        exercises: [
          { kind: "fill", sentence: "¡Buenos _____! ¿Cómo está?", answer: "días", hint: "Morning greeting", explain: "'Buenos días' means 'good morning' — used until midday." },
          { kind: "fill", sentence: "Muy bien, _____. ¿Y usted?", answer: "gracias", hint: "Thank you", explain: "'Gracias' (thank you) is one of the first words every learner needs." },
          { kind: "fill", sentence: "_____ un café con leche, por favor.", answer: "Quiero", hint: "I want", explain: "'Quiero' means 'I want' — from the irregular verb 'querer'." },
          { kind: "fill", sentence: "¿_____ es?", answer: "Cuánto", hint: "How much", explain: "'¿Cuánto es?' is how you ask for the price of something." },
          { kind: "complete", prompt: "Ana greets the barista: ¡Buenos días! ¿Cómo…", answer: "está usted", accept: ["está usted", "esta usted", "esta", "está"], explain: "'¿Cómo está usted?' is the formal way to ask 'How are you?'" },
          { kind: "complete", prompt: "The barista asks if she wants anything else: ¿Algo…", answer: "más", accept: ["más", "mas"], explain: "'¿Algo más?' means 'Anything else?' — very common in shops and restaurants." },
        ],
      },
      {
        type: "story",
        img: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=700&q=80",
        imgCaption: "Ana meets Carlos",
        narrative: [
          "Ana takes her coffee and sits at a table near the window. A young man at the next table looks up from his book and smiles.",
        ],
        dialogue: [
          { speaker: "Carlos", line: "¡Hola! ¿Eres de aquí?" },
          { speaker: "Ana", line: "¡Hola! Sí, soy de Santiago. Me llamo Ana. ¿Y tú?" },
          { speaker: "Carlos", line: "Me llamo Carlos. Soy de Santo Domingo, pero estoy aquí por trabajo." },
          { speaker: "Ana", line: "¡Mucho gusto, Carlos!" },
          { speaker: "Carlos", line: "El gusto es mío. ¿Qué haces, Ana?" },
          { speaker: "Ana", line: "Soy profesora de inglés. ¿Y tú?" },
          { speaker: "Carlos", line: "Soy diseñador. Trabajo en una agencia de publicidad." },
        ],
        vocab: [
          { es: "Me llamo…", en: "My name is…", note: "Literally: 'I call myself'" },
          { es: "Soy de…", en: "I am from…", note: "Uses 'ser' for origin" },
          { es: "Mucho gusto", en: "Nice to meet you", note: "Very common greeting" },
          { es: "¿Qué haces?", en: "What do you do?", note: "Asking about their job" },
          { es: "Profesora", en: "Teacher (female)", note: "Male form: 'profesor'" },
          { es: "Trabajo", en: "I work / job", note: "From 'trabajar' — to work" },
        ],
      },
      {
        type: "exercise",
        title: "Conociendo a Carlos",
        subtitle: "Practice introductions and descriptions",
        img: "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=700&q=80",
        exercises: [
          { kind: "fill", sentence: "Me _____ Ana. ¿Y tú?", answer: "llamo", hint: "I call myself", explain: "'Me llamo' literally means 'I call myself' — the standard way to say your name." },
          { kind: "fill", sentence: "_____ de Santiago.", answer: "Soy", hint: "I am (permanent)", explain: "'Soy' comes from the verb 'ser' — used for identity, origin, and profession." },
          { kind: "fill", sentence: "¡Mucho _____!", answer: "gusto", hint: "Pleasure", explain: "'Mucho gusto' means 'much pleasure' — the standard 'nice to meet you'." },
          { kind: "fill", sentence: "Soy _____ de inglés.", answer: "profesora", hint: "Teacher (f)", explain: "Professions change endings for gender: profesor (m) / profesora (f)." },
          { kind: "complete", prompt: "Carlos says where he's from: Soy de Santo…", answer: "Domingo", accept: ["Domingo", "domingo"], explain: "Santo Domingo is the capital city of the Dominican Republic." },
          { kind: "fill", sentence: "_____ en una agencia de publicidad.", answer: "Trabajo", hint: "I work", explain: "'Trabajo' means 'I work' — regular -AR verb conjugation for 'yo'." },
          { kind: "complete", prompt: "Ana asks Carlos his name: ¿Y…", answer: "tú", accept: ["tú", "tu", "tú?", "tu?"], explain: "'¿Y tú?' means 'And you?' — the informal way to turn a question back." },
          { kind: "fill", sentence: "Estoy aquí _____ trabajo.", answer: "por", hint: "Because of / for", explain: "'Por' means 'because of' or 'for' when explaining a reason." },
        ],
      },
    ],
  },
  {
    id: 2, difficulty: "beginner", color: "#2e7d5a",
    title: "El mercado de la ciudad",
    titleEn: "The city market",
    cover: "https://images.unsplash.com/photo-1533900298318-6b8da08a523e?w=900&q=80",
    synopsis: "Ana takes Carlos to the local market. They explore food, colors, and numbers while shopping for ingredients to cook together.",
    pages: [
      {
        type: "story",
        img: "https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=700&q=80",
        imgCaption: "El Mercado Central — frutas frescas",
        narrative: [
          "The next Saturday, Ana invites Carlos to the Mercado Central. The market is full of life — colorful fruits, loud vendors, and the rhythm of bachata playing from a nearby radio.",
          "Ana grabs a basket and leads the way.",
        ],
        dialogue: [
          { speaker: "Ana", line: "¡Mira! Las frutas aquí son muy frescas." },
          { speaker: "Carlos", line: "¡Es verdad! ¿Qué necesitamos comprar?" },
          { speaker: "Ana", line: "Necesitamos plátanos, aguacates, tomates y cebollas." },
          { speaker: "Carlos", line: "¿Cuántos plátanos?" },
          { speaker: "Ana", line: "Seis plátanos y tres aguacates." },
          { speaker: "Vendedor", line: "¡Buenos días! ¿Qué les doy?" },
          { speaker: "Ana", line: "Deme seis plátanos maduros, por favor." },
          { speaker: "Vendedor", line: "Aquí tiene. Son cuarenta pesos." },
        ],
        vocab: [
          { es: "Mira", en: "Look", note: "Informal command — 'look at this!'" },
          { es: "Fresco/a", en: "Fresh", note: "Changes with gender: fresco (m) / fresca (f)" },
          { es: "Necesitamos", en: "We need", note: "From 'necesitar' — regular -AR verb" },
          { es: "Comprar", en: "To buy", note: "A regular -AR verb" },
          { es: "Deme", en: "Give me (formal)", note: "Polite form for shops" },
          { es: "Maduro/a", en: "Ripe", note: "Used for fruits, also means 'mature'" },
        ],
      },
      {
        type: "exercise",
        title: "Comprando frutas",
        subtitle: "Navigate the market like a local",
        img: "https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=700&q=80",
        exercises: [
          { kind: "fill", sentence: "¡_____! Las frutas son muy frescas.", answer: "Mira", hint: "Look!", explain: "'¡Mira!' is the informal command for 'Look!' — used with friends and family." },
          { kind: "fill", sentence: "¿Qué _____ comprar?", answer: "necesitamos", hint: "We need", explain: "'Necesitamos' = we need. The -amos ending marks 'nosotros' (we) form of -AR verbs." },
          { kind: "fill", sentence: "Deme seis plátanos _____, por favor.", answer: "maduros", hint: "Ripe (plural)", explain: "Adjectives agree in number: maduro (1 item) → maduros (multiple items)." },
          { kind: "fill", sentence: "_____ cuarenta pesos.", answer: "Son", hint: "They are (price)", explain: "For prices above one, use 'son' (they are). For one unit, use 'es'." },
          { kind: "complete", prompt: "Carlos asks how many bananas: ¿Cuántos…", answer: "plátanos", accept: ["plátanos", "platanos", "plátanos?", "platanos?"], explain: "'¿Cuántos?' means 'how many?' — use 'cuántos' for masculine nouns, 'cuántas' for feminine." },
          { kind: "fill", sentence: "Las frutas aquí son muy _____.", answer: "frescas", hint: "Fresh (feminine plural)", explain: "'Frescas' agrees with 'frutas' (feminine plural). Fresh → fresco/fresca/frescos/frescas." },
          { kind: "complete", prompt: "The vendor greets them: ¡Buenos días! ¿Qué les…", answer: "doy", accept: ["doy", "doy?"], explain: "'¿Qué les doy?' means 'What can I give you?' — a common vendor greeting in markets." },
        ],
      },
      {
        type: "story",
        img: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=700&q=80",
        imgCaption: "Cooking together",
        narrative: [
          "Back at Ana's apartment, they unpack the groceries and start cooking. Carlos is surprised — Ana is an excellent cook.",
        ],
        dialogue: [
          { speaker: "Carlos", line: "¿Qué vamos a cocinar?" },
          { speaker: "Ana", line: "Vamos a hacer mangú con los tres golpes. Es un plato típico dominicano." },
          { speaker: "Carlos", line: "¡Me encanta el mangú! Pero no sé cocinarlo." },
          { speaker: "Ana", line: "No te preocupes. Primero, pela los plátanos. Después, ponlos a hervir." },
          { speaker: "Carlos", line: "¿Con sal?" },
          { speaker: "Ana", line: "Sí, con un poco de sal y mantequilla." },
          { speaker: "Carlos", line: "Esto huele delicioso." },
          { speaker: "Ana", line: "¡Gracias! La cocina es mi pasión." },
        ],
        vocab: [
          { es: "Vamos a…", en: "We're going to…", note: "Ir + a + infinitive = near future" },
          { es: "Cocinar", en: "To cook", note: "Regular -AR verb" },
          { es: "Me encanta", en: "I love (it)", note: "Stronger than 'me gusta'" },
          { es: "No te preocupes", en: "Don't worry", note: "A very useful reassuring phrase" },
          { es: "Primero / Después", en: "First / Then", note: "Sequencing words" },
          { es: "Huele", en: "It smells", note: "From 'oler' — to smell" },
        ],
      },
      {
        type: "exercise",
        title: "En la cocina",
        subtitle: "Cook with Ana and Carlos",
        img: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=700&q=80",
        exercises: [
          { kind: "fill", sentence: "¿Qué _____ a cocinar?", answer: "vamos", hint: "We go / we are going", explain: "'Vamos a + infinitive' is the easiest way to talk about future plans: 'We're going to…'" },
          { kind: "fill", sentence: "¡Me _____ el mangú!", answer: "encanta", hint: "I love (it)", explain: "'Me encanta' means 'I love it' — the structure is like 'me gusta' but stronger." },
          { kind: "fill", sentence: "No te _____. Yo te enseño.", answer: "preocupes", hint: "Worry", explain: "'No te preocupes' means 'Don't worry' — a reflexive verb in the tú command form." },
          { kind: "fill", sentence: "_____, pela los plátanos.", answer: "Primero", hint: "First", explain: "'Primero' means 'first' — used to order steps in a sequence." },
          { kind: "complete", prompt: "Carlos compliments the food: Esto huele…", answer: "delicioso", accept: ["delicioso", "delicioso!", "bien", "rico"], explain: "'Huele delicioso' means 'it smells delicious'. 'Oler' (to smell) is an irregular verb." },
          { kind: "fill", sentence: "La cocina es mi _____.", answer: "pasión", hint: "Passion", explain: "'Pasión' means 'passion' — notice the accent on the last syllable." },
          { kind: "fill", sentence: "Con un poco de sal y _____.", answer: "mantequilla", hint: "Butter", explain: "'Mantequilla' means butter — an essential ingredient in Dominican cooking!" },
        ],
      },
    ],
  },
  {
    id: 3, difficulty: "intermediate", color: "#5c3d8f",
    title: "Un viaje a la playa",
    titleEn: "A trip to the beach",
    cover: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=900&q=80",
    synopsis: "Carlos invites Ana on a weekend trip to the coast. They navigate transportation, check into a hotel, and deal with an unexpected rainstorm.",
    pages: [
      {
        type: "story",
        img: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=700&q=80",
        imgCaption: "On the road to the coast",
        narrative: [
          "Two weeks have passed. Carlos calls Ana with an idea — a weekend trip to Cabarete, a beautiful beach town on the north coast.",
          "They meet at the bus station early Saturday morning.",
        ],
        dialogue: [
          { speaker: "Carlos", line: "¡Llegaste temprano! El autobús sale a las ocho." },
          { speaker: "Ana", line: "Sí, no quiero llegar tarde. ¿Ya compraste los boletos?" },
          { speaker: "Carlos", line: "Sí, compré dos boletos de ida y vuelta. Costaron quinientos pesos cada uno." },
          { speaker: "Ana", line: "Perfecto. ¿Cuánto tiempo tarda el viaje?" },
          { speaker: "Carlos", line: "Aproximadamente tres horas. Podemos dormir un poco en el camino." },
          { speaker: "Ana", line: "Buena idea. Anoche no dormí bien porque estaba emocionada." },
          { speaker: "Carlos", line: "¡Yo también! Va a ser un fin de semana increíble." },
        ],
        vocab: [
          { es: "Llegaste", en: "You arrived", note: "Past tense (pretérito) of 'llegar'" },
          { es: "El autobús", en: "The bus", note: "Also 'guagua' in DR slang" },
          { es: "Boletos de ida y vuelta", en: "Round-trip tickets", note: "'Ida' = going, 'vuelta' = return" },
          { es: "¿Cuánto tiempo tarda?", en: "How long does it take?", note: "Very useful for travel" },
          { es: "Anoche", en: "Last night", note: "Time expression for past tense" },
          { es: "Emocionada", en: "Excited (f)", note: "Masculine: emocionado" },
        ],
      },
      {
        type: "exercise",
        title: "Viajando en autobús",
        subtitle: "Navigate Dominican transportation",
        img: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=700&q=80",
        exercises: [
          { kind: "fill", sentence: "El autobús _____ a las ocho.", answer: "sale", hint: "Leaves / departs", explain: "'Sale' is from 'salir' (to leave) — an irregular verb. 'El tren sale a las…' works the same way." },
          { kind: "fill", sentence: "Compré dos boletos de _____ y vuelta.", answer: "ida", hint: "Going", explain: "'Ida y vuelta' = 'going and return' — this is how you say 'round trip' in Spanish." },
          { kind: "fill", sentence: "¿Cuánto tiempo _____ el viaje?", answer: "tarda", hint: "Takes (time)", explain: "'Tardar' means 'to take time'. '¿Cuánto tarda?' is essential for planning travel." },
          { kind: "fill", sentence: "Anoche no _____ bien.", answer: "dormí", hint: "I slept", explain: "'Dormí' is the past tense of 'dormir'. Notice the stem change: o→u in the yo form." },
          { kind: "complete", prompt: "Carlos is excited about the weekend: Va a ser un fin de semana…", answer: "increíble", accept: ["increíble", "increible", "maravilloso", "genial"], explain: "'Increíble' means 'incredible' — a great adjective for expressing excitement." },
          { kind: "fill", sentence: "No quiero _____ tarde.", answer: "llegar", hint: "To arrive", explain: "'Llegar tarde' = 'to arrive late'. 'Quiero' + infinitive = 'I want to…'" },
          { kind: "fill", sentence: "_____ tres horas de viaje.", answer: "Son", hint: "It's / They are", explain: "For durations with hours: 'es una hora' (1 hour), 'son dos/tres/cuatro horas' (2+ hours)." },
          { kind: "complete", prompt: "Ana couldn't sleep because she was excited: estaba…", answer: "emocionada", accept: ["emocionada", "emocionada.", "muy emocionada"], explain: "'Estaba emocionada' uses the imperfect of 'estar' — describing an ongoing feeling in the past." },
        ],
      },
      {
        type: "story",
        img: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=700&q=80",
        imgCaption: "Hotel Cabarete — arriving at last",
        narrative: [
          "They arrive in Cabarete and take a taxi to the hotel. The lobby is bright and open, with a view of palm trees and the ocean.",
        ],
        dialogue: [
          { speaker: "Recepcionista", line: "¡Bienvenidos! ¿Tienen reservación?" },
          { speaker: "Carlos", line: "Sí, a nombre de Carlos Méndez. Reservé dos habitaciones individuales." },
          { speaker: "Recepcionista", line: "Perfecto. Aquí están sus llaves. Habitaciones 204 y 205, en el segundo piso." },
          { speaker: "Ana", line: "¿A qué hora es el desayuno?" },
          { speaker: "Recepcionista", line: "El desayuno se sirve de siete a diez de la mañana en el restaurante del primer piso." },
          { speaker: "Carlos", line: "¿La playa está cerca?" },
          { speaker: "Recepcionista", line: "¡Claro! Está a solo dos minutos caminando. Pueden usar las toallas del hotel." },
          { speaker: "Ana", line: "¡Perfecto! Muchas gracias." },
        ],
        vocab: [
          { es: "Bienvenidos", en: "Welcome (plural)", note: "Bienvenido(a) for one person" },
          { es: "A nombre de…", en: "Under the name of…", note: "Used for reservations" },
          { es: "Las llaves", en: "The keys", note: "Singular: la llave" },
          { es: "El segundo piso", en: "The second floor", note: "Primero, segundo, tercero…" },
          { es: "Se sirve", en: "Is served", note: "Reflexive construction for passive" },
          { es: "Caminando", en: "Walking", note: "Present participle (-ando/-iendo)" },
        ],
      },
      {
        type: "exercise",
        title: "En el hotel",
        subtitle: "Check in like a confident traveler",
        img: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=700&q=80",
        exercises: [
          { kind: "fill", sentence: "¡_____! ¿Tienen reservación?", answer: "Bienvenidos", hint: "Welcome (plural)", explain: "'Bienvenidos' is the plural welcome. For one woman: 'bienvenida', one man: 'bienvenido'." },
          { kind: "fill", sentence: "Reservé a _____ de Carlos Méndez.", answer: "nombre", hint: "Name", explain: "'A nombre de…' is the set phrase for checking into hotels, restaurants, and picking up orders." },
          { kind: "fill", sentence: "Aquí están sus _____.", answer: "llaves", hint: "Keys", explain: "'Llaves' = keys. 'Aquí está(n)' = 'Here is/are' — common when handing something over." },
          { kind: "fill", sentence: "¿A qué hora es el _____?", answer: "desayuno", hint: "Breakfast", explain: "'El desayuno' = breakfast. Almuerzo = lunch, cena = dinner." },
          { kind: "complete", prompt: "The beach is very close: Está a solo dos minutos…", answer: "caminando", accept: ["caminando", "caminando.", "a pie"], explain: "'Caminando' is the gerund of 'caminar' — '2 minutes walking' describes distance by time." },
          { kind: "fill", sentence: "Habitaciones en el _____ piso.", answer: "segundo", hint: "Second", explain: "Ordinal numbers: primero, segundo, tercero, cuarto, quinto (1st–5th)." },
          { kind: "fill", sentence: "Pueden usar las _____ del hotel.", answer: "toallas", hint: "Towels", explain: "'Toallas' = towels. 'Pueden usar' = 'you can use' — a polite offer." },
        ],
      },
    ],
  },
  {
    id: 4, difficulty: "intermediate", color: "#c2553a",
    title: "La tormenta",
    titleEn: "The storm",
    cover: "https://images.unsplash.com/photo-1527482937786-6f4b4d9c4b68?w=900&q=80",
    synopsis: "An unexpected rainstorm traps Ana and Carlos at a restaurant. They share stories about the past, express opinions, and make plans for the future.",
    pages: [
      {
        type: "story",
        img: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=700&q=80",
        imgCaption: "The sky darkens over Cabarete",
        narrative: [
          "Sunday morning. Ana and Carlos are having lunch at a beachfront restaurant when the sky suddenly turns dark. Within minutes, heavy rain begins to pour.",
          "They have no choice but to wait it out over food and conversation.",
        ],
        dialogue: [
          { speaker: "Carlos", line: "¡Qué lluvia tan fuerte! No podemos salir ahora." },
          { speaker: "Ana", line: "No importa. Me gusta la lluvia. Es relajante." },
          { speaker: "Carlos", line: "¿De verdad? A mí me pone un poco triste." },
          { speaker: "Ana", line: "¿Por qué? Creo que es bonita. Me recuerda a mi infancia." },
          { speaker: "Carlos", line: "Cuando era niño, mi abuela siempre hacía chocolate caliente cuando llovía." },
          { speaker: "Ana", line: "¡Qué bonito recuerdo! Mi madre hacía lo mismo. Extraño esos momentos." },
          { speaker: "Carlos", line: "Deberíamos pedir chocolate caliente ahora. ¿Qué dices?" },
          { speaker: "Ana", line: "¡Me encanta la idea! Pidamos dos." },
        ],
        vocab: [
          { es: "¡Qué lluvia tan fuerte!", en: "What heavy rain!", note: "'Qué + noun + tan + adj' = exclamation" },
          { es: "No importa", en: "It doesn't matter", note: "A great casual phrase" },
          { es: "Creo que…", en: "I think that…", note: "For sharing opinions" },
          { es: "Cuando era niño", en: "When I was a child", note: "Imperfect tense for memories" },
          { es: "Extraño", en: "I miss", note: "'Extrañar' = to miss someone/something" },
          { es: "Deberíamos", en: "We should", note: "Conditional of 'deber' — polite suggestion" },
        ],
      },
      {
        type: "exercise",
        title: "Recuerdos y opiniones",
        subtitle: "Share memories and express yourself",
        img: "https://images.unsplash.com/photo-1515694346937-94d85e39d29b?w=700&q=80",
        exercises: [
          { kind: "fill", sentence: "¡Qué lluvia tan _____!", answer: "fuerte", hint: "Strong / heavy", explain: "The '¡Qué + noun + tan + adjective!' pattern is used for exclamations: 'What a…!'" },
          { kind: "fill", sentence: "No _____. Me gusta la lluvia.", answer: "importa", hint: "It matters", explain: "'No importa' = 'It doesn't matter' — one of the most useful casual phrases in Spanish." },
          { kind: "fill", sentence: "_____ que es bonita.", answer: "Creo", hint: "I believe / think", explain: "'Creo que…' introduces your opinion. From 'creer' (to believe)." },
          { kind: "fill", sentence: "Cuando _____ niño, jugaba en la lluvia.", answer: "era", hint: "I was (ongoing)", explain: "'Era' is the imperfect of 'ser' — used for descriptions and habitual past states." },
          { kind: "fill", sentence: "_____ esos momentos con mi familia.", answer: "Extraño", hint: "I miss", explain: "'Extrañar' means 'to miss'. Unlike English, you don't need a preposition." },
          { kind: "complete", prompt: "Carlos suggests they order hot chocolate: Deberíamos pedir chocolate…", answer: "caliente", accept: ["caliente", "caliente."], explain: "'Caliente' = hot (temperature). Don't confuse with 'picante' (spicy hot)." },
          { kind: "fill", sentence: "Mi abuela siempre _____ chocolate caliente.", answer: "hacía", hint: "She used to make", explain: "'Hacía' is the imperfect of 'hacer' — used for habitual actions in the past." },
          { kind: "complete", prompt: "Ana agrees enthusiastically: ¡Me encanta la…", answer: "idea", accept: ["idea", "idea!"], explain: "'¡Me encanta la idea!' = 'I love the idea!' — a great way to show enthusiasm for a suggestion." },
        ],
      },
    ],
  },
];

const DIFF_LABELS = { beginner: "Principiante", intermediate: "Intermedio", advanced: "Avanzado" };
const DIFF_EN = { beginner: "Beginner", intermediate: "Intermediate", advanced: "Advanced" };

/* ─── MAIN APP ─── */
export default function App() {
  const [view, setView] = useState("home");
  const [chapterIdx, setChapterIdx] = useState(0);
  const [pageIdx, setPageIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [checked, setChecked] = useState({});
  const [showHints, setShowHints] = useState({});
  const [showExplain, setShowExplain] = useState({});
  const [vocabOpen, setVocabOpen] = useState(null);
  const [transitioning, setTransitioning] = useState(false);
  const [stats, setStats] = useState({ xp: 0, streak: 0, completed: {}, lastDate: null, totalCorrect: 0, totalAttempted: 0 });
  const [showStats, setShowStats] = useState(false);
  const inputRefs = useRef({});
  const scrollRef = useRef(null);

  // Load stats
  useEffect(() => { store.get("spanish-book-stats").then(s => s && setStats(s)); }, []);
  const saveStats = useCallback((s) => { setStats(s); store.set("spanish-book-stats", s); }, []);

  // Streak check
  useEffect(() => {
    const today = new Date().toDateString();
    if (stats.lastDate && stats.lastDate !== today) {
      const last = new Date(stats.lastDate);
      const diff = (new Date(today) - last) / 86400000;
      if (diff > 1) saveStats({ ...stats, streak: 0 });
    }
  }, []);

  const chapter = CHAPTERS[chapterIdx];
  const page = chapter?.pages[pageIdx];

  const flipPage = useCallback((cb) => {
    setTransitioning(true);
    setTimeout(() => { cb(); setTransitioning(false); }, 280);
    setTimeout(() => { if (scrollRef.current) scrollRef.current.scrollTo({ top: 0, behavior: "instant" }); }, 300);
  }, []);

  const openChapter = (ci) => flipPage(() => { setChapterIdx(ci); setPageIdx(0); setView("read"); setAnswers({}); setChecked({}); setShowHints({}); setShowExplain({}); });
  const goHome = () => flipPage(() => setView("home"));
  const nextPage = () => { if (pageIdx < chapter.pages.length - 1) flipPage(() => { setPageIdx(p => p + 1); setAnswers({}); setChecked({}); setShowHints({}); setShowExplain({}); }); else if (chapterIdx < CHAPTERS.length - 1) openChapter(chapterIdx + 1); };
  const prevPage = () => { if (pageIdx > 0) flipPage(() => { setPageIdx(p => p - 1); setAnswers({}); setChecked({}); setShowHints({}); setShowExplain({}); }); };

  const handleCheck = (i) => {
    const ex = page.exercises[i];
    const ua = (answers[i] || "").trim();
    let correct;
    if (ex.kind === "complete") {
      correct = (ex.accept || [ex.answer]).some(a => ua.toLowerCase().replace(/[?!.,]/g, "") === a.toLowerCase().replace(/[?!.,]/g, ""));
    } else {
      correct = ua.toLowerCase() === ex.answer.toLowerCase();
    }
    setChecked(p => ({ ...p, [i]: correct ? "correct" : "wrong" }));
    if (!checked[i]) {
      const today = new Date().toDateString();
      const newStats = {
        ...stats,
        xp: stats.xp + (correct ? 15 : 2),
        totalCorrect: stats.totalCorrect + (correct ? 1 : 0),
        totalAttempted: stats.totalAttempted + 1,
        streak: stats.lastDate !== today ? stats.streak + 1 : stats.streak,
        lastDate: today,
      };
      saveStats(newStats);
    }
  };

  const revealAnswer = (i) => {
    const ex = page.exercises[i];
    setAnswers(p => ({ ...p, [i]: ex.answer }));
    setChecked(p => ({ ...p, [i]: "revealed" }));
    setShowExplain(p => ({ ...p, [i]: true }));
  };

  const checkAll = () => {
    if (!page?.exercises) return;
    page.exercises.forEach((_, i) => { if (answers[i] && !checked[i]) handleCheck(i); });
  };

  const markChapterDone = () => {
    const key = `${chapterIdx}-${pageIdx}`;
    if (!stats.completed[key]) saveStats({ ...stats, completed: { ...stats.completed, [key]: true }, xp: stats.xp + 25 });
  };

  const allDone = page?.exercises ? page.exercises.every((_, i) => checked[i]) : false;
  useEffect(() => { if (allDone && page?.type === "exercise") markChapterDone(); }, [allDone]);

  const progress = useMemo(() => {
    const total = CHAPTERS.reduce((a, c) => a + c.pages.filter(p => p.type === "exercise").length, 0);
    const done = Object.keys(stats.completed).length;
    return Math.round((done / total) * 100);
  }, [stats.completed]);

  const level = Math.floor(stats.xp / 150) + 1;
  const xpInLevel = stats.xp % 150;

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: "#f7f3ec", fontFamily: "'Cormorant Garamond', Georgia, serif", color: "#2a231b", overflow: "hidden" }}>
      <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400;1,500&family=Crimson+Pro:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&display=swap" rel="stylesheet" />
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes flipOut { to { opacity: 0; transform: translateX(-30px) rotateY(6deg); } }
        @keyframes pulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.06); } }
        @keyframes shimmer { 0% { background-position: -200% center; } 100% { background-position: 200% center; } }
        .fade-in { animation: fadeIn 0.5s ease-out both; }
        .slide-up { animation: slideUp 0.55s ease-out both; }
        .flip-out { animation: flipOut 0.25s ease-in both; }
        .blank {
          border: none; border-bottom: 2.5px solid #a0734a; background: transparent;
          font-family: 'Crimson Pro', Georgia, serif; font-size: 18px; color: #2a231b;
          padding: 2px 6px 4px; min-width: 80px; max-width: 200px; text-align: center;
          outline: none; transition: all 0.25s; font-style: italic; font-weight: 500;
        }
        .blank:focus { border-color: #c49058; box-shadow: 0 4px 12px rgba(160,115,74,0.15); }
        .blank.correct { border-color: #3a7d44; color: #2d6634; font-weight: 600; background: rgba(58,125,68,0.04); }
        .blank.wrong { border-color: #b5413b; color: #9a332e; }
        .blank.revealed { border-color: #999; color: #888; }
        .complete-input {
          border: 2px solid #d4c4ae; border-radius: 10px; background: rgba(255,252,247,0.6);
          font-family: 'Crimson Pro', Georgia, serif; font-size: 18px; color: #2a231b;
          padding: 10px 16px; width: 100%; outline: none; transition: all 0.25s;
          font-style: italic; font-weight: 500;
        }
        .complete-input:focus { border-color: #a0734a; box-shadow: 0 4px 16px rgba(160,115,74,0.12); }
        .complete-input.correct { border-color: #3a7d44; background: rgba(58,125,68,0.04); color: #2d6634; }
        .complete-input.wrong { border-color: #b5413b; background: rgba(181,65,59,0.03); }
        .complete-input.revealed { border-color: #bbb; color: #888; }
        .pill-btn { background: none; border: 1.5px solid #a0734a; color: #a0734a; padding: 4px 14px; border-radius: 16px; cursor: pointer; font-family: 'Crimson Pro', Georgia, serif; font-size: 13px; transition: all 0.2s; font-weight: 500; }
        .pill-btn:hover { background: rgba(160,115,74,0.08); }
        .pill-btn-s { background: none; border: none; color: #8a7c6a; cursor: pointer; font-family: 'Crimson Pro', Georgia, serif; font-size: 13px; font-style: italic; }
        .pill-btn-s:hover { color: #a0734a; }
        .nav-a { background: none; border: 1.5px solid #c4b49e; color: #8a7c6a; padding: 8px 22px; border-radius: 20px; cursor: pointer; font-family: 'Cormorant Garamond', Georgia, serif; font-size: 15px; font-weight: 500; transition: all 0.2s; }
        .nav-a:hover { border-color: #a0734a; color: #a0734a; }
        .nav-a:disabled { opacity: 0.3; cursor: default; }
        .chap-card { cursor: pointer; transition: all 0.3s; border-radius: 14px; overflow: hidden; }
        .chap-card:hover { transform: translateY(-3px); box-shadow: 0 12px 40px rgba(42,35,27,0.12); }
        .vocab-item { transition: all 0.2s; cursor: pointer; border-radius: 10px; }
        .vocab-item:hover { background: rgba(160,115,74,0.06); transform: translateX(4px); }
        .xp-bar { height: 6px; border-radius: 3px; background: #e8e0d4; overflow: hidden; }
        .xp-fill { height: 100%; border-radius: 3px; background: linear-gradient(90deg, #c49058, #a0734a); transition: width 0.6s ease; }
        .dialogue-line { animation: fadeIn 0.4s ease-out both; }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #d4c4ae; border-radius: 3px; }
      `}</style>

      {/* ─── TOP BAR ─── */}
      <header style={{ flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 20px", borderBottom: "1px solid rgba(160,115,74,0.12)", background: "rgba(247,243,236,0.95)", backdropFilter: "blur(10px)", zIndex: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }} onClick={view !== "home" ? goHome : undefined}>
          {view !== "home" && <span style={{ fontSize: 16, color: "#a0734a" }}>‹</span>}
          <span style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 18, fontWeight: 600, color: "#2a231b", letterSpacing: 0.5 }}>Español</span>
          <span style={{ fontSize: 11, fontWeight: 400, color: "#a0734a", letterSpacing: 2, textTransform: "uppercase", fontFamily: "'Crimson Pro', Georgia, serif", marginLeft: -4 }}>para viajeros</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div onClick={() => setShowStats(!showStats)} style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 8, padding: "4px 12px", borderRadius: 16, background: "rgba(160,115,74,0.07)", border: "1px solid rgba(160,115,74,0.12)" }}>
            <span style={{ fontFamily: "'Crimson Pro'", fontSize: 13, fontWeight: 600, color: "#a0734a" }}>Nivel {level}</span>
            <span style={{ fontSize: 12, color: "#8a7c6a", fontFamily: "'Crimson Pro'" }}>{stats.xp} XP</span>
          </div>
          {stats.streak > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: 4, padding: "4px 10px", borderRadius: 14, background: "rgba(58,125,68,0.07)", border: "1px solid rgba(58,125,68,0.12)" }}>
              <span style={{ fontSize: 13, color: "#3a7d44", fontFamily: "'Crimson Pro'", fontWeight: 600 }}>{stats.streak}d</span>
              <span style={{ fontSize: 12, color: "#5a9a63", fontFamily: "'Crimson Pro'" }}>racha</span>
            </div>
          )}
        </div>
      </header>

      {/* ─── STATS PANEL ─── */}
      {showStats && (
        <div className="slide-up" style={{ position: "absolute", top: 52, right: 16, zIndex: 20, background: "#fffcf7", border: "1px solid rgba(160,115,74,0.15)", borderRadius: 14, padding: 20, width: 260, boxShadow: "0 12px 40px rgba(42,35,27,0.12)" }}>
          <div style={{ fontFamily: "'Cormorant Garamond'", fontSize: 20, fontWeight: 600, marginBottom: 12 }}>Tu progreso</div>
          <div style={{ fontFamily: "'Crimson Pro'", fontSize: 13, color: "#8a7c6a", marginBottom: 16, lineHeight: 1.7 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}><span>Nivel</span><span style={{ fontWeight: 600, color: "#2a231b" }}>{level}</span></div>
            <div style={{ display: "flex", justifyContent: "space-between" }}><span>XP total</span><span style={{ fontWeight: 600, color: "#2a231b" }}>{stats.xp}</span></div>
            <div style={{ display: "flex", justifyContent: "space-between" }}><span>Racha</span><span style={{ fontWeight: 600, color: "#3a7d44" }}>{stats.streak} días</span></div>
            <div style={{ display: "flex", justifyContent: "space-between" }}><span>Respuestas correctas</span><span style={{ fontWeight: 600, color: "#2a231b" }}>{stats.totalCorrect}/{stats.totalAttempted}</span></div>
            <div style={{ display: "flex", justifyContent: "space-between" }}><span>Progreso del libro</span><span style={{ fontWeight: 600, color: "#a0734a" }}>{progress}%</span></div>
          </div>
          <div className="xp-bar"><div className="xp-fill" style={{ width: `${(xpInLevel / 150) * 100}%` }} /></div>
          <div style={{ fontFamily: "'Crimson Pro'", fontSize: 11, color: "#b0a494", marginTop: 4 }}>{xpInLevel}/150 XP para nivel {level + 1}</div>
          <button onClick={() => { saveStats({ xp: 0, streak: 0, completed: {}, lastDate: null, totalCorrect: 0, totalAttempted: 0 }); setShowStats(false); }} style={{ marginTop: 12, fontFamily: "'Crimson Pro'", fontSize: 12, color: "#b5413b", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}>Reiniciar progreso</button>
        </div>
      )}

      {/* ─── MAIN SCROLLABLE AREA ─── */}
      <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", overflowX: "hidden" }} onClick={() => showStats && setShowStats(false)}>
        <div style={{ maxWidth: 680, margin: "0 auto", padding: "0 20px 60px" }}>

          {/* ═══ HOME / TABLE OF CONTENTS ═══ */}
          {view === "home" && (
            <div className={transitioning ? "flip-out" : "fade-in"}>
              {/* Hero */}
              <div style={{ textAlign: "center", padding: "36px 10px 28px" }}>
                <div style={{ fontSize: 11, letterSpacing: 4, textTransform: "uppercase", color: "#a0734a", fontFamily: "'Crimson Pro'", fontWeight: 500, marginBottom: 10 }}>Cuaderno interactivo</div>
                <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 38, fontWeight: 300, lineHeight: 1.15, color: "#2a231b" }}>
                  Español<br /><span style={{ fontWeight: 700, fontStyle: "italic" }}>para Viajeros</span>
                </h1>
                <p style={{ fontFamily: "'Crimson Pro'", fontSize: 15, color: "#8a7c6a", marginTop: 10, lineHeight: 1.6, maxWidth: 420, marginLeft: "auto", marginRight: "auto" }}>
                  Learn Spanish through stories. Fill in the blanks, complete sentences, and build vocabulary — one chapter at a time.
                </p>
                {/* Progress bar */}
                <div style={{ maxWidth: 320, margin: "18px auto 0" }}>
                  <div className="xp-bar" style={{ height: 8 }}><div className="xp-fill" style={{ width: `${progress}%` }} /></div>
                  <div style={{ fontFamily: "'Crimson Pro'", fontSize: 12, color: "#b0a494", marginTop: 5 }}>{progress}% completado</div>
                </div>
              </div>

              {/* Ornament */}
              <div style={{ textAlign: "center", fontSize: 20, color: "rgba(160,115,74,0.25)", letterSpacing: 12, margin: "0 0 24px" }}>❧</div>

              {/* Chapter Cards */}
              <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                {CHAPTERS.map((ch, ci) => {
                  const chDone = ch.pages.filter(p => p.type === "exercise").every((_, pi) => {
                    const exercisePages = ch.pages.map((p, idx) => p.type === "exercise" ? idx : null).filter(x => x !== null);
                    return stats.completed[`${ci}-${exercisePages[pi] || 0}`];
                  });
                  return (
                    <div key={ci} className="chap-card slide-up" onClick={() => openChapter(ci)} style={{ animationDelay: `${ci * 0.08}s`, background: "#fffcf7", border: "1px solid rgba(160,115,74,0.1)", boxShadow: "0 2px 16px rgba(42,35,27,0.05)" }}>
                      <div style={{ position: "relative", height: 180, overflow: "hidden" }}>
                        <img src={ch.cover} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", filter: "brightness(0.6) saturate(0.75)" }} />
                        <div style={{ position: "absolute", inset: 0, background: `linear-gradient(160deg, ${ch.color}33 0%, transparent 50%), linear-gradient(to top, rgba(26,20,14,0.75) 0%, transparent 60%)` }} />
                        <div style={{ position: "absolute", top: 14, left: 16, display: "flex", gap: 6 }}>
                          <span style={{ fontFamily: "'Crimson Pro'", fontSize: 11, background: "rgba(255,252,247,0.85)", color: ch.color, padding: "3px 10px", borderRadius: 10, fontWeight: 600, letterSpacing: 0.5 }}>
                            Capítulo {ch.id}
                          </span>
                          <span style={{ fontFamily: "'Crimson Pro'", fontSize: 11, background: "rgba(255,252,247,0.85)", color: "#8a7c6a", padding: "3px 10px", borderRadius: 10, fontWeight: 500 }}>
                            {DIFF_LABELS[ch.difficulty]}
                          </span>
                        </div>
                        {chDone && <span style={{ position: "absolute", top: 14, right: 16, fontFamily: "'Crimson Pro'", fontSize: 11, background: "rgba(58,125,68,0.9)", color: "#fff", padding: "3px 10px", borderRadius: 10, fontWeight: 600 }}>Completado</span>}
                        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "20px 18px 14px" }}>
                          <h2 style={{ fontFamily: "'Cormorant Garamond'", fontSize: 26, fontWeight: 700, color: "#fff", lineHeight: 1.15 }}>{ch.title}</h2>
                          <p style={{ fontFamily: "'Crimson Pro'", fontSize: 13, color: "rgba(255,255,255,0.7)", fontStyle: "italic", marginTop: 2 }}>{ch.titleEn}</p>
                        </div>
                      </div>
                      <div style={{ padding: "12px 18px 14px" }}>
                        <p style={{ fontFamily: "'Crimson Pro'", fontSize: 14, color: "#8a7c6a", lineHeight: 1.65 }}>{ch.synopsis}</p>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10 }}>
                          <span style={{ fontFamily: "'Crimson Pro'", fontSize: 12, color: "#b0a494" }}>{ch.pages.length} páginas · {ch.pages.filter(p => p.type === "exercise").reduce((a, p) => a + p.exercises.length, 0)} ejercicios</span>
                          <span style={{ fontFamily: "'Cormorant Garamond'", fontSize: 14, color: ch.color, fontWeight: 600 }}>Leer →</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div style={{ textAlign: "center", padding: "32px 0", fontFamily: "'Crimson Pro'", fontSize: 12, color: "#c4b49e" }}>
                Más capítulos próximamente…
              </div>
            </div>
          )}

          {/* ═══ READING VIEW ═══ */}
          {view === "read" && chapter && page && (
            <div className={transitioning ? "flip-out" : "fade-in"} key={`${chapterIdx}-${pageIdx}`}>

              {/* Page header */}
              <div style={{ textAlign: "center", padding: "24px 0 16px" }}>
                <div style={{ fontFamily: "'Crimson Pro'", fontSize: 11, letterSpacing: 3, textTransform: "uppercase", color: chapter.color, fontWeight: 500 }}>
                  Capítulo {chapter.id} · {chapter.title}
                </div>
                <div style={{ fontFamily: "'Crimson Pro'", fontSize: 12, color: "#b0a494", marginTop: 4 }}>
                  Página {pageIdx + 1} de {chapter.pages.length}
                </div>
                {/* Page dots */}
                <div style={{ display: "flex", justifyContent: "center", gap: 5, marginTop: 10 }}>
                  {chapter.pages.map((_, i) => (
                    <div key={i} style={{ width: i === pageIdx ? 20 : 7, height: 7, borderRadius: 4, background: i === pageIdx ? chapter.color : "rgba(160,115,74,0.15)", transition: "all 0.3s" }} />
                  ))}
                </div>
              </div>

              {/* ─── STORY PAGE ─── */}
              {page.type === "story" && (
                <div>
                  {/* Image */}
                  <div className="slide-up" style={{ borderRadius: 14, overflow: "hidden", marginBottom: 6, border: "1px solid rgba(160,115,74,0.1)", boxShadow: "0 4px 24px rgba(42,35,27,0.08)" }}>
                    <img src={page.img} alt="" style={{ width: "100%", height: 220, objectFit: "cover", display: "block" }} />
                  </div>
                  {page.imgCaption && <div style={{ fontFamily: "'Crimson Pro'", fontSize: 12, color: "#b0a494", textAlign: "center", fontStyle: "italic", marginBottom: 20 }}>{page.imgCaption}</div>}

                  {/* Narrative */}
                  <div style={{ marginBottom: 20 }}>
                    {page.narrative.map((p, i) => (
                      <p key={i} className="slide-up" style={{ animationDelay: `${0.15 + i * 0.1}s`, fontFamily: "'Crimson Pro'", fontSize: 17, lineHeight: 1.8, color: "#3d3428", marginBottom: 12, textIndent: i > 0 ? 24 : 0 }} dangerouslySetInnerHTML={{ __html: p.replace(/\*(.*?)\*/g, '<em style="color:#a0734a">$1</em>') }} />
                    ))}
                  </div>

                  {/* Dialogue */}
                  <div style={{ background: "rgba(255,252,247,0.7)", border: "1px solid rgba(160,115,74,0.1)", borderRadius: 14, padding: "18px 20px", marginBottom: 24 }}>
                    <div style={{ fontFamily: "'Crimson Pro'", fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: "#b0a494", marginBottom: 14, fontWeight: 500 }}>Diálogo</div>
                    {page.dialogue.map((d, i) => (
                      <div key={i} className="dialogue-line" style={{ animationDelay: `${0.3 + i * 0.08}s`, display: "flex", gap: 10, marginBottom: i < page.dialogue.length - 1 ? 10 : 0, alignItems: "baseline" }}>
                        <span style={{ fontFamily: "'Cormorant Garamond'", fontWeight: 700, fontSize: 14, color: chapter.color, minWidth: 90, textAlign: "right", flexShrink: 0 }}>{d.speaker}</span>
                        <span style={{ fontFamily: "'Crimson Pro'", fontSize: 16, color: "#2a231b", lineHeight: 1.6, fontStyle: "italic" }}>— {d.line}</span>
                      </div>
                    ))}
                  </div>

                  {/* Vocabulary */}
                  {page.vocab && (
                    <div className="slide-up" style={{ animationDelay: "0.4s" }}>
                      <div style={{ fontFamily: "'Crimson Pro'", fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: "#a0734a", fontWeight: 600, marginBottom: 10, display: "flex", alignItems: "center", gap: 8 }}>
                        <span>Vocabulario</span>
                        <div style={{ flex: 1, height: 1, background: "rgba(160,115,74,0.15)" }} />
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(185px, 1fr))", gap: 6 }}>
                        {page.vocab.map((v, i) => (
                          <div key={i} className="vocab-item" onClick={() => setVocabOpen(vocabOpen === i ? null : i)} style={{ padding: "10px 12px", border: `1px solid ${vocabOpen === i ? "rgba(160,115,74,0.2)" : "transparent"}`, background: vocabOpen === i ? "rgba(160,115,74,0.04)" : "transparent" }}>
                            <div style={{ fontFamily: "'Cormorant Garamond'", fontSize: 16, fontWeight: 600, color: "#2a231b" }}>{v.es}</div>
                            <div style={{ fontFamily: "'Crimson Pro'", fontSize: 13, color: "#8a7c6a", fontStyle: "italic" }}>{v.en}</div>
                            {vocabOpen === i && v.note && (
                              <div className="fade-in" style={{ fontFamily: "'Crimson Pro'", fontSize: 12, color: "#a0734a", marginTop: 4, lineHeight: 1.5, paddingTop: 4, borderTop: "1px solid rgba(160,115,74,0.1)" }}>{v.note}</div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ─── EXERCISE PAGE ─── */}
              {page.type === "exercise" && (
                <div>
                  {/* Image + Title */}
                  <div className="slide-up" style={{ borderRadius: 14, overflow: "hidden", marginBottom: 6, position: "relative", border: "1px solid rgba(160,115,74,0.1)", boxShadow: "0 4px 24px rgba(42,35,27,0.08)" }}>
                    <img src={page.img} alt="" style={{ width: "100%", height: 180, objectFit: "cover", display: "block", filter: "brightness(0.55) saturate(0.75)" }} />
                    <div style={{ position: "absolute", inset: 0, background: `linear-gradient(to top, rgba(26,20,14,0.7), transparent 50%)` }} />
                    <div style={{ position: "absolute", bottom: 16, left: 20, right: 20 }}>
                      <h2 style={{ fontFamily: "'Cormorant Garamond'", fontSize: 26, fontWeight: 700, color: "#fff" }}>{page.title}</h2>
                      <p style={{ fontFamily: "'Crimson Pro'", fontSize: 14, color: "rgba(255,255,255,0.7)", fontStyle: "italic" }}>{page.subtitle}</p>
                    </div>
                  </div>

                  <div style={{ fontFamily: "'Crimson Pro'", fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: chapter.color, fontWeight: 600, margin: "20px 0 14px", display: "flex", alignItems: "center", gap: 8 }}>
                    <span>Ejercicios</span>
                    <div style={{ flex: 1, height: 1, background: "rgba(160,115,74,0.15)" }} />
                    <span style={{ fontWeight: 400, color: "#b0a494", textTransform: "none", letterSpacing: 0 }}>{Object.values(checked).filter(v => v === "correct").length}/{page.exercises.length}</span>
                  </div>

                  {/* Exercise list */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {page.exercises.map((ex, i) => {
                      const status = checked[i];
                      return (
                        <div key={i} className="slide-up" style={{
                          animationDelay: `${0.1 + i * 0.05}s`,
                          background: status === "correct" ? "rgba(58,125,68,0.03)" : status === "wrong" ? "rgba(181,65,59,0.02)" : "rgba(255,252,247,0.6)",
                          border: `1px solid ${status === "correct" ? "rgba(58,125,68,0.15)" : status === "wrong" ? "rgba(181,65,59,0.12)" : "rgba(160,115,74,0.08)"}`,
                          borderRadius: 12, padding: "16px 18px", transition: "all 0.3s",
                        }}>
                          {/* Exercise type badge */}
                          <div style={{ fontFamily: "'Crimson Pro'", fontSize: 11, color: "#b0a494", marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
                            <span style={{ background: ex.kind === "fill" ? "rgba(160,115,74,0.08)" : "rgba(92,61,143,0.08)", color: ex.kind === "fill" ? "#a0734a" : "#5c3d8f", padding: "2px 8px", borderRadius: 6, fontWeight: 600, letterSpacing: 0.5 }}>
                              {ex.kind === "fill" ? "Completa el espacio" : "Termina la oración"}
                            </span>
                            <span>{i + 1} / {page.exercises.length}</span>
                          </div>

                          {ex.kind === "fill" ? (
                            <div style={{ fontFamily: "'Crimson Pro'", fontSize: 18, lineHeight: 2.2, color: "#2a231b" }}>
                              {(() => {
                                const parts = ex.sentence.split("_____");
                                return (
                                  <>
                                    {parts[0]}
                                    <input
                                      ref={el => (inputRefs.current[i] = el)}
                                      className={`blank ${status || ""}`}
                                      value={answers[i] || ""}
                                      onChange={e => { setAnswers(p => ({ ...p, [i]: e.target.value })); if (checked[i]) setChecked(p => { const n = { ...p }; delete n[i]; return n; }); }}
                                      onKeyDown={e => { if (e.key === "Enter") { handleCheck(i); const n = inputRefs.current[i + 1]; if (n) n.focus(); } }}
                                      placeholder="…"
                                      disabled={status === "correct" || status === "revealed"}
                                      style={{ width: Math.max(80, ((answers[i] || "").length || 3) * 12 + 30) }}
                                      autoComplete="off"
                                      spellCheck="false"
                                    />
                                    {parts[1]}
                                  </>
                                );
                              })()}
                            </div>
                          ) : (
                            <div>
                              <p style={{ fontFamily: "'Crimson Pro'", fontSize: 17, color: "#3d3428", lineHeight: 1.6, marginBottom: 10 }}>
                                {ex.prompt}
                              </p>
                              <input
                                ref={el => (inputRefs.current[i] = el)}
                                className={`complete-input ${status || ""}`}
                                value={answers[i] || ""}
                                onChange={e => { setAnswers(p => ({ ...p, [i]: e.target.value })); if (checked[i]) setChecked(p => { const n = { ...p }; delete n[i]; return n; }); }}
                                onKeyDown={e => { if (e.key === "Enter") { handleCheck(i); const n = inputRefs.current[i + 1]; if (n) n.focus(); } }}
                                placeholder="Escribe tu respuesta…"
                                disabled={status === "correct" || status === "revealed"}
                                autoComplete="off"
                                spellCheck="false"
                              />
                            </div>
                          )}

                          {/* Actions & Feedback */}
                          <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                            {!status && (
                              <>
                                <button className="pill-btn" onClick={() => handleCheck(i)}>Verificar</button>
                                <button className="pill-btn-s" onClick={() => setShowHints(p => ({ ...p, [i]: !p[i] }))}>
                                  {showHints[i] ? `💡 ${ex.hint}` : "¿Pista?"}
                                </button>
                              </>
                            )}
                            {status === "correct" && (
                              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <span style={{ fontFamily: "'Crimson Pro'", fontSize: 14, color: "#3a7d44", fontWeight: 600 }}>¡Correcto! +15 XP</span>
                                <button className="pill-btn-s" onClick={() => setShowExplain(p => ({ ...p, [i]: !p[i] }))} style={{ color: "#3a7d44" }}>
                                  {showExplain[i] ? "Ocultar" : "¿Por qué?"}
                                </button>
                              </div>
                            )}
                            {status === "wrong" && (
                              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <span style={{ fontFamily: "'Crimson Pro'", fontSize: 14, color: "#b5413b" }}>Inténtalo de nuevo</span>
                                <button className="pill-btn-s" onClick={() => revealAnswer(i)} style={{ color: "#b5413b" }}>
                                  Ver respuesta
                                </button>
                              </div>
                            )}
                            {status === "revealed" && (
                              <span style={{ fontFamily: "'Crimson Pro'", fontSize: 14, color: "#888", fontStyle: "italic" }}>
                                Respuesta: <strong>{ex.answer}</strong>
                              </span>
                            )}
                          </div>

                          {/* Explanation */}
                          {(showExplain[i] || status === "revealed") && ex.explain && (
                            <div className="fade-in" style={{
                              marginTop: 10, padding: "10px 14px", background: "rgba(160,115,74,0.05)",
                              borderRadius: 8, borderLeft: `3px solid ${chapter.color}`,
                              fontFamily: "'Crimson Pro'", fontSize: 14, color: "#5a4d3c", lineHeight: 1.6,
                            }}>
                              {ex.explain}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Check All / Completion */}
                  <div style={{ marginTop: 18, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
                    {!allDone ? (
                      <button onClick={checkAll} style={{
                        background: chapter.color, color: "#fff", border: "none",
                        padding: "11px 28px", borderRadius: 22, cursor: "pointer",
                        fontFamily: "'Cormorant Garamond'", fontSize: 16, fontWeight: 600,
                        boxShadow: `0 4px 16px ${chapter.color}33`, transition: "all 0.2s",
                      }}>
                        Verificar todo
                      </button>
                    ) : (
                      <div className="fade-in" style={{
                        background: "rgba(58,125,68,0.06)", border: "1px solid rgba(58,125,68,0.15)",
                        padding: "12px 20px", borderRadius: 12,
                        fontFamily: "'Cormorant Garamond'", fontSize: 17, color: "#3a7d44", fontWeight: 600,
                      }}>
                        ¡Lección completada! +25 XP bonus
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ─── PAGE NAVIGATION ─── */}
              <div style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                marginTop: 36, paddingTop: 20, borderTop: "1px solid rgba(160,115,74,0.1)",
              }}>
                <button className="nav-a" onClick={prevPage} disabled={pageIdx === 0 && chapterIdx === 0}>
                  ← Anterior
                </button>
                <div style={{ fontFamily: "'Crimson Pro'", fontSize: 12, color: "#b0a494" }}>
                  {page.type === "story" ? "Historia" : "Ejercicios"}
                </div>
                <button className="nav-a" onClick={nextPage} disabled={pageIdx === chapter.pages.length - 1 && chapterIdx === CHAPTERS.length - 1} style={{ borderColor: chapter.color, color: chapter.color }}>
                  Siguiente →
                </button>
              </div>

              {/* Decorative */}
              <div style={{ textAlign: "center", margin: "28px 0 12px", fontSize: 18, color: "rgba(160,115,74,0.2)", letterSpacing: 10 }}>❧</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
