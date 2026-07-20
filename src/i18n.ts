import type { Category, Symbol } from "./data/vocabulary";

export type Language = "en" | "es" | "fr";
export type Theme = "light" | "dark";
export type LayoutOrder = "tabs-top" | "speech-top";

export const LANGUAGE_OPTIONS: Array<{ code: Language; label: string }> = [
  { code: "en", label: "English" },
  { code: "es", label: "Español" },
  { code: "fr", label: "Français" },
];

type UiStringKey =
  | "appName"
  | "openSettings"
  | "settings"
  | "sentenceBuilder"
  | "currentSentence"
  | "sentencePlaceholder"
  | "speakWord"
  | "speaking"
  | "speakSentence"
  | "speak"
  | "removeLastWord"
  | "backspace"
  | "clearSentence"
  | "clear"
  | "symbolCategories"
  | "categorySuffix"
  | "symbolGrid"
  | "closeSettings"
  | "voice"
  | "noVoices"
  | "defaultVoice"
  | "previewVoice"
  | "voicePreviewSample"
  | "vocalStyle"
  | "customNatural"
  | "baritone"
  | "alto"
  | "soprano"
  | "bass"
  | "speed"
  | "normal"
  | "slow"
  | "fast"
  | "slower"
  | "faster"
  | "pitch"
  | "lower"
  | "higher"
  | "volume"
  | "softer"
  | "louder"
  | "gridSize"
  | "columns"
  | "fewerLarger"
  | "moreSmaller"
  | "textSize"
  | "smaller"
  | "larger"
  | "done"
  | "language"
  | "theme"
  | "light"
  | "dark"
  | "myWords"
  | "addWord"
  | "editTiles"
  | "doneTiles"
  | "deleteTile"
  | "addTileTitle"
  | "editTileTitle"
  | "tileLabel"
  | "tileLabelPlaceholder"
  | "tileSpeak"
  | "tileSpeakPlaceholder"
  | "tileIcon"
  | "tileIconEmoji"
  | "tileIconImage"
  | "tileIconEmojiPlaceholder"
  | "tileIconFilterLabel"
  | "tileIconFilterPlaceholder"
  | "tileIconFilterNoMatch"
  | "tileIconStyle"
  | "tileIconStyleOutline"
  | "tileIconStyleFilled"
  | "tileColor"
  | "tileIconColor"
  | "tileIconColorDefault"
  | "tileColorGreen"
  | "tileColorBlue"
  | "tileColorOrange"
  | "tileColorYellow"
  | "tileColorRed"
  | "tileColorPurple"
  | "tileColorPink"
  | "tileColorTeal"
  | "tileColorGray"
  | "uploadImage"
  | "changeImage"
  | "cancel"
  | "save"
  | "close"
  | "skipToMain"
  | "noCustomTiles"
  | "voiceFilterLabel"
  | "voiceFilterPlaceholder"
  | "voiceFilterNoMatch"
  | "onlineVoiceSuffix"
  | "moreVoicesTipAndroid"
  | "moreVoicesTipWeb"
  | "exportBoard"
  | "importBoard"
  | "importBoardError"
  | "manageBoards"
  | "newBoard"
  | "boardName"
  | "boardNamePlaceholder"
  | "createBoard"
  | "deleteBoard"
  | "confirmDeleteBoard"
  | "moveUp"
  | "moveDown"
  | "userBoards"
  | "renameBoard"
  | "importExport"
  | "boardSettingsTab"
  | "importExportTab"
  | "exportSection"
  | "importSection"
  | "exportBoardsLabel"
  | "exportSelected"
  | "exportFormatNone"
  | "exportFormatOBF"
  | "exportFormatOBZ"
  | "importBoardHint"
  | "importSuccess"
  | "importedBoard"
  | "selectAll"
  | "deselectAll"
  | "editTile"
  | "tileSizeLabel"
  | "tileSizeDefault"
  | "tileSizeXs"
  | "tileSizeSm"
  | "tileSizeMd"
  | "tileSizeLg"
  | "tileSizeXl"
  | "tileHeightLabel"
  | "tileHeightNormal"
  | "tileHeightTall"
  | "tileHeightTaller"
  | "tileBackgroundImage"
  | "removeBackgroundImage"
  | "tileSoundFile"
  | "uploadSoundFile"
  | "changeSoundFile"
  | "previewSound"
  | "removeSoundFile"
  | "soundFileHint"
  | "moveTile"
  | "moveTileUp"
  | "moveTileDown"
  | "layoutOrder"
  | "layoutTabsTop"
  | "layoutSpeechTop"
  | "typeToSearch"
  | "addWordToBoard"
  | "addToSentence"
  | "settingsTabSpeech"
  | "settingsTabDisplay"
  | "settingsTabApp"
  | "settingsTabBoards"
  | "accentColor"
  | "ttsEngine"
  | "ttsEngineAll"
  | "suggestions"
  | "sentenceBuilderMode"
  | "sentenceBuilderOn"
  | "sentenceBuilderOff"
  | "sentenceBuilderOnHint"
  | "sentenceBuilderOffHint"
  | "tileDlgTabIcon"
  | "tileDlgTabStyle"
  | "tileDlgTabMedia"
  | "toggleModeLabel";

const UI_STRINGS: Record<Language, Record<UiStringKey, string>> = {
  en: {
    appName: "AlwaysFreeAAC",
    openSettings: "Open settings",
    settings: "Settings",
    sentenceBuilder: "Sentence builder",
    currentSentence: "Current sentence",
    sentencePlaceholder: "Tap symbols below to build a sentence…",
    speakWord: "Speak: {{word}}",
    speaking: "Speaking…",
    speakSentence: "Speak sentence",
    speak: "Speak",
    removeLastWord: "Remove last word",
    backspace: "Backspace",
    clearSentence: "Clear sentence",
    clear: "Clear",
    symbolCategories: "Symbol categories",
    categorySuffix: "category",
    symbolGrid: "Symbol grid",
    closeSettings: "Close settings",
    voice: "Voice",
    noVoices: "No voices available — your browser may not support speech synthesis.",
    defaultVoice: "Default voice",
    vocalStyle: "Vocal style (traditional)",
    customNatural: "Custom / Natural",
    baritone: "Baritone",
    alto: "Alto",
    soprano: "Soprano",
    bass: "Bass",
    speed: "Speed",
    normal: "Normal",
    slow: "Slow",
    fast: "Fast",
    slower: "Slower",
    faster: "Faster",
    pitch: "Pitch",
    lower: "Lower",
    higher: "Higher",
    volume: "Volume",
    softer: "Softer",
    louder: "Louder",
    gridSize: "Grid size",
    columns: "columns",
    fewerLarger: "Fewer (larger)",
    moreSmaller: "More (smaller)",
    textSize: "Text size",
    smaller: "Smaller",
    larger: "Larger",
    done: "Done",
    language: "Language",
    theme: "Theme",
    light: "Light",
    dark: "Dark",
    previewVoice: "Preview voice",
    voicePreviewSample: "The quick brown fox jumps over the lazy dog.",
    myWords: "My Words",
    addWord: "+ Add Word",
    editTiles: "Edit",
    doneTiles: "Done",
    deleteTile: "Delete tile",
    addTileTitle: "Add Word Tile",
    editTileTitle: "Edit Word Tile",
    tileLabel: "Word / Label",
    tileLabelPlaceholder: "e.g. Cat",
    tileSpeak: "Spoken text (optional)",
    tileSpeakPlaceholder: "Defaults to label",
    tileIcon: "Icon",
    tileIconEmoji: "Emoji",
    tileIconImage: "Image",
    tileIconEmojiPlaceholder: "Paste or type an emoji…",
    tileIconFilterLabel: "Filter icons",
    tileIconFilterPlaceholder: "Search icons…",
    tileIconFilterNoMatch: "No icons match your search.",
    tileIconStyle: "Icon style",
    tileIconStyleOutline: "Outline",
    tileIconStyleFilled: "Filled",
    tileColor: "Tile Color",
    tileIconColor: "Icon Color",
    tileIconColorDefault: "Default",
    tileColorGreen: "Green",
    tileColorBlue: "Blue",
    tileColorOrange: "Orange",
    tileColorYellow: "Yellow",
    tileColorRed: "Red",
    tileColorPurple: "Purple",
    tileColorPink: "Pink",
    tileColorTeal: "Teal",
    tileColorGray: "Gray",
    uploadImage: "Upload Image",
    changeImage: "Change Image",
    cancel: "Cancel",
    save: "Save",
    close: "Close",
    skipToMain: "Skip to main content",
    noCustomTiles: "No custom tiles yet. Tap \"+ Add Word\" to create one.",
    voiceFilterLabel: "Filter voices",
    voiceFilterPlaceholder: "Search by name or language…",
    voiceFilterNoMatch: "No voices match your search.",
    onlineVoiceSuffix: "(Online)",
    moreVoicesTipAndroid: "Tip: For more diverse voices, open your device Settings and look for Accessibility → Text-to-Speech to install additional voice packs.",
    moreVoicesTipWeb: "Tip: Voice quality and variety depend on your browser and OS. Chrome and Edge on desktop typically offer the most options.",
    exportBoard: "Export (.obf)",
    importBoard: "Import (.obf / .obz)",
    importBoardError: "Could not import board. Please select a valid .obf or .obz file.",
    manageBoards: "Manage Boards",
    newBoard: "New Board",
    boardName: "Board Name",
    boardNamePlaceholder: "e.g. School, Home…",
    createBoard: "Create Board",
    deleteBoard: "Delete Board",
    confirmDeleteBoard: "Delete this board and all its tiles?",
    moveUp: "Move up",
    moveDown: "Move down",
    userBoards: "My Boards",
    renameBoard: "Rename board",
    importExport: "Import / Export",
    boardSettingsTab: "Board Settings",
    importExportTab: "Import / Export",
    exportSection: "Export Boards",
    importSection: "Import Boards",
    exportBoardsLabel: "Select boards to export",
    exportSelected: "Export Selected",
    exportFormatNone: "Select at least one board to export.",
    exportFormatOBF: "1 board selected → will download as .obf",
    exportFormatOBZ: "2+ boards selected → will download as .obz",
    importBoardHint: "Import a .obf (single board) or .obz (multiple boards) file. Each board is added as a new board.",
    importSuccess: "Imported {{count}} board(s) successfully.",
    importedBoard: "Imported Board",
    selectAll: "Select all",
    deselectAll: "Deselect all",
    editTile: "Edit tile",
    tileSizeLabel: "Tile width",
    tileSizeDefault: "Default",
    tileSizeXs: "XS — Extra small",
    tileSizeSm: "SM — Small",
    tileSizeMd: "MD — Medium",
    tileSizeLg: "LG — Large",
    tileSizeXl: "XL — Extra large",
    tileHeightLabel: "Tile height",
    tileHeightNormal: "Normal (1 row)",
    tileHeightTall: "Tall (2 rows)",
    tileHeightTaller: "Taller (3 rows)",
    tileBackgroundImage: "Background Image",
    removeBackgroundImage: "Remove background image",
    tileSoundFile: "Sound File (replaces TTS)",
    uploadSoundFile: "Upload Sound",
    changeSoundFile: "Change Sound",
    previewSound: "Preview",
    removeSoundFile: "Remove sound file",
    soundFileHint: "This tile will play the uploaded audio instead of text-to-speech.",
    moveTile: "Move tile",
    moveTileUp: "Move tile left",
    moveTileDown: "Move tile right",
    layoutOrder: "Layout order",
    layoutTabsTop: "Tabs on top, speech at bottom",
    layoutSpeechTop: "Speech on top, tabs below",
    typeToSearch: "Type words… (space to chip)",
    addWordToBoard: "Add \"{{word}}\" to board",
    addToSentence: "Add to sentence",
    settingsTabSpeech: "Speech",
    settingsTabDisplay: "Display",
    settingsTabApp: "App",
    settingsTabBoards: "Boards",
    accentColor: "Accent Color",
    ttsEngine: "TTS Engine",
    ttsEngineAll: "System",
    suggestions: "Suggestions",
    sentenceBuilderMode: "Interaction mode",
    sentenceBuilderOn: "Sentence Builder",
    sentenceBuilderOff: "Soundboard",
    sentenceBuilderOnHint: "Tap tiles to build a sentence, then speak it.",
    sentenceBuilderOffHint: "Tap tiles to immediately play their sound or speech.",
    tileDlgTabIcon: "Icon",
    tileDlgTabStyle: "Style",
    tileDlgTabMedia: "Media",
    toggleModeLabel: "Toggle interaction mode",
  },
  es: {
    appName: "AlwaysFreeAAC",
    openSettings: "Abrir ajustes",
    settings: "Ajustes",
    sentenceBuilder: "Constructor de frases",
    currentSentence: "Frase actual",
    sentencePlaceholder: "Toca símbolos abajo para crear una frase…",
    speakWord: "Decir: {{word}}",
    speaking: "Hablando…",
    speakSentence: "Decir frase",
    speak: "Decir",
    removeLastWord: "Quitar última palabra",
    backspace: "Borrar",
    clearSentence: "Limpiar frase",
    clear: "Limpiar",
    symbolCategories: "Categorías de símbolos",
    categorySuffix: "categoría",
    symbolGrid: "Cuadrícula de símbolos",
    closeSettings: "Cerrar ajustes",
    voice: "Voz",
    noVoices: "No hay voces disponibles; tu navegador podría no soportar síntesis de voz.",
    defaultVoice: "Voz predeterminada",
    vocalStyle: "Estilo vocal (tradicional)",
    customNatural: "Personalizado / Natural",
    baritone: "Barítono",
    alto: "Alto",
    soprano: "Soprano",
    bass: "Bajo",
    speed: "Velocidad",
    normal: "Normal",
    slow: "Lento",
    fast: "Rápido",
    slower: "Más lento",
    faster: "Más rápido",
    pitch: "Tono",
    lower: "Más grave",
    higher: "Más agudo",
    volume: "Volumen",
    softer: "Más suave",
    louder: "Más fuerte",
    gridSize: "Tamaño de cuadrícula",
    columns: "columnas",
    fewerLarger: "Menos (más grande)",
    moreSmaller: "Más (más pequeño)",
    textSize: "Tamaño de texto",
    smaller: "Más pequeño",
    larger: "Más grande",
    done: "Listo",
    language: "Idioma",
    theme: "Tema",
    light: "Claro",
    dark: "Oscuro",
    previewVoice: "Previsualizar voz",
    voicePreviewSample: "Benjamín pidió una bebida de kiwi y fresa; Noé la quiso sin hielo.",
    myWords: "Mis palabras",
    addWord: "+ Agregar palabra",
    editTiles: "Editar",
    doneTiles: "Listo",
    deleteTile: "Eliminar ficha",
    addTileTitle: "Agregar ficha",
    editTileTitle: "Editar ficha",
    tileLabel: "Palabra / Etiqueta",
    tileLabelPlaceholder: "Ej. Gato",
    tileSpeak: "Texto hablado (opcional)",
    tileSpeakPlaceholder: "Por defecto, la etiqueta",
    tileIcon: "Ícono",
    tileIconEmoji: "Emoji",
    tileIconImage: "Imagen",
    tileIconEmojiPlaceholder: "Pega o escribe un emoji…",
    tileIconFilterLabel: "Filtrar íconos",
    tileIconFilterPlaceholder: "Buscar íconos…",
    tileIconFilterNoMatch: "Ningún ícono coincide con tu búsqueda.",
    tileIconStyle: "Estilo de ícono",
    tileIconStyleOutline: "Contorno",
    tileIconStyleFilled: "Relleno",
    tileColor: "Color de ficha",
    tileIconColor: "Color del ícono",
    tileIconColorDefault: "Por defecto",
    tileColorGreen: "Verde",
    tileColorBlue: "Azul",
    tileColorOrange: "Naranja",
    tileColorYellow: "Amarillo",
    tileColorRed: "Rojo",
    tileColorPurple: "Morado",
    tileColorPink: "Rosa",
    tileColorTeal: "Turquesa",
    tileColorGray: "Gris",
    uploadImage: "Subir imagen",
    changeImage: "Cambiar imagen",
    cancel: "Cancelar",
    save: "Guardar",
    close: "Cerrar",
    skipToMain: "Saltar al contenido principal",
    noCustomTiles: "Aún no hay fichas. Toca \"+ Agregar palabra\" para crear una.",
    voiceFilterLabel: "Filtrar voces",
    voiceFilterPlaceholder: "Buscar por nombre o idioma…",
    voiceFilterNoMatch: "Ninguna voz coincide con tu búsqueda.",
    onlineVoiceSuffix: "(En línea)",
    moreVoicesTipAndroid: "Consejo: Para más voces, abre Ajustes en tu dispositivo y busca Accesibilidad → Texto a voz para instalar paquetes de voces adicionales.",
    moreVoicesTipWeb: "Consejo: La calidad y variedad de voces dependen de tu navegador y sistema operativo. Chrome y Edge en escritorio suelen ofrecer más opciones.",
    exportBoard: "Exportar (.obf)",
    importBoard: "Importar (.obf / .obz)",
    importBoardError: "No se pudo importar el tablero. Selecciona un archivo .obf o .obz válido.",
    manageBoards: "Gestionar tableros",
    newBoard: "Nuevo tablero",
    boardName: "Nombre del tablero",
    boardNamePlaceholder: "Ej. Escuela, Casa…",
    createBoard: "Crear tablero",
    deleteBoard: "Eliminar tablero",
    confirmDeleteBoard: "¿Eliminar este tablero y todos sus mosaicos?",
    moveUp: "Mover arriba",
    moveDown: "Mover abajo",
    userBoards: "Mis tableros",
    renameBoard: "Renombrar tablero",
    importExport: "Importar / Exportar",
    boardSettingsTab: "Ajustes de tableros",
    importExportTab: "Importar / Exportar",
    exportSection: "Exportar tableros",
    importSection: "Importar tableros",
    exportBoardsLabel: "Seleccionar tableros para exportar",
    exportSelected: "Exportar seleccionados",
    exportFormatNone: "Selecciona al menos un tablero para exportar.",
    exportFormatOBF: "1 tablero seleccionado → se descargará como .obf",
    exportFormatOBZ: "2+ tableros seleccionados → se descargará como .obz",
    importBoardHint: "Importa un archivo .obf (un tablero) o .obz (varios tableros). Cada tablero se añade como un nuevo tablero.",
    importSuccess: "Se importaron {{count}} tablero(s) correctamente.",
    importedBoard: "Tablero importado",
    selectAll: "Seleccionar todo",
    deselectAll: "Deseleccionar todo",
    editTile: "Editar ficha",
    tileSizeLabel: "Ancho de ficha",
    tileSizeDefault: "Por defecto",
    tileSizeXs: "XS — Extra pequeño",
    tileSizeSm: "SM — Pequeño",
    tileSizeMd: "MD — Mediano",
    tileSizeLg: "LG — Grande",
    tileSizeXl: "XL — Extra grande",
    tileHeightLabel: "Alto de ficha",
    tileHeightNormal: "Normal (1 fila)",
    tileHeightTall: "Alto (2 filas)",
    tileHeightTaller: "Más alto (3 filas)",
    tileBackgroundImage: "Imagen de fondo",
    removeBackgroundImage: "Eliminar imagen de fondo",
    tileSoundFile: "Archivo de sonido (reemplaza TTS)",
    uploadSoundFile: "Subir sonido",
    changeSoundFile: "Cambiar sonido",
    previewSound: "Vista previa",
    removeSoundFile: "Eliminar archivo de sonido",
    soundFileHint: "Esta ficha reproducirá el audio cargado en lugar de la síntesis de voz.",
    moveTile: "Mover ficha",
    moveTileUp: "Mover ficha a la izquierda",
    moveTileDown: "Mover ficha a la derecha",
    layoutOrder: "Orden del diseño",
    layoutTabsTop: "Pestañas arriba, voz abajo",
    layoutSpeechTop: "Voz arriba, pestañas abajo",
    typeToSearch: "Escribe palabras… (espacio para chip)",
    addWordToBoard: "Agregar \"{{word}}\" al tablero",
    addToSentence: "Agregar a la frase",
    settingsTabSpeech: "Voz",
    settingsTabDisplay: "Pantalla",
    settingsTabApp: "App",
    settingsTabBoards: "Tableros",
    accentColor: "Color de acento",
    ttsEngine: "Motor TTS",
    ttsEngineAll: "Sistema",
    suggestions: "Sugerencias",
    sentenceBuilderMode: "Modo de interacción",
    sentenceBuilderOn: "Constructor de frases",
    sentenceBuilderOff: "Tablero de sonidos",
    sentenceBuilderOnHint: "Toca fichas para construir una frase y luego hablarla.",
    sentenceBuilderOffHint: "Toca fichas para reproducir su sonido o voz inmediatamente.",
    tileDlgTabIcon: "Ícono",
    tileDlgTabStyle: "Estilo",
    tileDlgTabMedia: "Medios",
    toggleModeLabel: "Cambiar modo de interacción",
  },
  fr: {
    appName: "AlwaysFreeAAC",
    openSettings: "Ouvrir les paramètres",
    settings: "Paramètres",
    sentenceBuilder: "Constructeur de phrase",
    currentSentence: "Phrase actuelle",
    sentencePlaceholder: "Touchez les symboles ci-dessous pour créer une phrase…",
    speakWord: "Dire : {{word}}",
    speaking: "Lecture…",
    speakSentence: "Dire la phrase",
    speak: "Dire",
    removeLastWord: "Supprimer le dernier mot",
    backspace: "Retour",
    clearSentence: "Effacer la phrase",
    clear: "Effacer",
    symbolCategories: "Catégories de symboles",
    categorySuffix: "catégorie",
    symbolGrid: "Grille de symboles",
    closeSettings: "Fermer les paramètres",
    voice: "Voix",
    noVoices: "Aucune voix disponible : votre navigateur ne prend peut-être pas en charge la synthèse vocale.",
    defaultVoice: "Voix par défaut",
    vocalStyle: "Style vocal (traditionnel)",
    customNatural: "Personnalisé / Naturel",
    baritone: "Baryton",
    alto: "Alto",
    soprano: "Soprano",
    bass: "Basse",
    speed: "Vitesse",
    normal: "Normal",
    slow: "Lent",
    fast: "Rapide",
    slower: "Plus lent",
    faster: "Plus rapide",
    pitch: "Hauteur",
    lower: "Plus grave",
    higher: "Plus aigu",
    volume: "Volume",
    softer: "Plus doux",
    louder: "Plus fort",
    gridSize: "Taille de la grille",
    columns: "colonnes",
    fewerLarger: "Moins (plus grand)",
    moreSmaller: "Plus (plus petit)",
    textSize: "Taille du texte",
    smaller: "Plus petit",
    larger: "Plus grand",
    done: "Terminé",
    language: "Langue",
    theme: "Thème",
    light: "Clair",
    dark: "Sombre",
    previewVoice: "Aperçu de la voix",
    voicePreviewSample: "Voyez le brick géant que j'examine près du wharf.",
    myWords: "Mes mots",
    addWord: "+ Ajouter un mot",
    editTiles: "Modifier",
    doneTiles: "Terminé",
    deleteTile: "Supprimer la fiche",
    addTileTitle: "Ajouter une fiche",
    editTileTitle: "Modifier la fiche",
    tileLabel: "Mot / Étiquette",
    tileLabelPlaceholder: "Ex. Chat",
    tileSpeak: "Texte parlé (optionnel)",
    tileSpeakPlaceholder: "Par défaut, l'étiquette",
    tileIcon: "Icône",
    tileIconEmoji: "Emoji",
    tileIconImage: "Image",
    tileIconEmojiPlaceholder: "Coller ou saisir un emoji…",
    tileIconFilterLabel: "Filtrer les icônes",
    tileIconFilterPlaceholder: "Rechercher des icônes…",
    tileIconFilterNoMatch: "Aucune icône ne correspond à votre recherche.",
    tileIconStyle: "Style d'icône",
    tileIconStyleOutline: "Contour",
    tileIconStyleFilled: "Plein",
    tileColor: "Couleur de la fiche",
    tileIconColor: "Couleur de l'icône",
    tileIconColorDefault: "Par défaut",
    tileColorGreen: "Vert",
    tileColorBlue: "Bleu",
    tileColorOrange: "Orange",
    tileColorYellow: "Jaune",
    tileColorRed: "Rouge",
    tileColorPurple: "Violet",
    tileColorPink: "Rose",
    tileColorTeal: "Sarcelle",
    tileColorGray: "Gris",
    uploadImage: "Télécharger une image",
    changeImage: "Changer l'image",
    cancel: "Annuler",
    save: "Enregistrer",
    close: "Fermer",
    skipToMain: "Passer au contenu principal",
    noCustomTiles: "Aucune fiche pour l'instant. Appuyez sur \"+ Ajouter un mot\" pour en créer une.",
    voiceFilterLabel: "Filtrer les voix",
    voiceFilterPlaceholder: "Rechercher par nom ou langue…",
    voiceFilterNoMatch: "Aucune voix ne correspond à votre recherche.",
    onlineVoiceSuffix: "(En ligne)",
    moreVoicesTipAndroid: "Conseil : Pour plus de voix, ouvrez les Paramètres de votre appareil et cherchez Accessibilité → Synthèse vocale pour installer des packs de voix supplémentaires.",
    moreVoicesTipWeb: "Conseil : La qualité et la variété des voix dépendent de votre navigateur et de votre système d'exploitation. Chrome et Edge sur ordinateur offrent généralement le plus d'options.",
    exportBoard: "Exporter (.obf)",
    importBoard: "Importer (.obf / .obz)",
    importBoardError: "Impossible d'importer le tableau. Sélectionnez un fichier .obf ou .obz valide.",
    manageBoards: "Gérer les tableaux",
    newBoard: "Nouveau tableau",
    boardName: "Nom du tableau",
    boardNamePlaceholder: "Ex. École, Maison…",
    createBoard: "Créer le tableau",
    deleteBoard: "Supprimer le tableau",
    confirmDeleteBoard: "Supprimer ce tableau et toutes ses fiches ?",
    moveUp: "Monter",
    moveDown: "Descendre",
    userBoards: "Mes tableaux",
    renameBoard: "Renommer le tableau",
    importExport: "Importer / Exporter",
    boardSettingsTab: "Réglages des tableaux",
    importExportTab: "Importer / Exporter",
    exportSection: "Exporter des tableaux",
    importSection: "Importer des tableaux",
    exportBoardsLabel: "Sélectionner les tableaux à exporter",
    exportSelected: "Exporter la sélection",
    exportFormatNone: "Sélectionnez au moins un tableau à exporter.",
    exportFormatOBF: "1 tableau sélectionné → téléchargement en .obf",
    exportFormatOBZ: "2+ tableaux sélectionnés → téléchargement en .obz",
    importBoardHint: "Importez un fichier .obf (un tableau) ou .obz (plusieurs tableaux). Chaque tableau est ajouté comme un nouveau tableau.",
    importSuccess: "{{count}} tableau(x) importé(s) avec succès.",
    importedBoard: "Tableau importé",
    selectAll: "Tout sélectionner",
    deselectAll: "Tout désélectionner",
    editTile: "Modifier la fiche",
    tileSizeLabel: "Largeur de la fiche",
    tileSizeDefault: "Par défaut",
    tileSizeXs: "XS — Très petite",
    tileSizeSm: "SM — Petite",
    tileSizeMd: "MD — Moyenne",
    tileSizeLg: "LG — Grande",
    tileSizeXl: "XL — Très grande",
    tileHeightLabel: "Hauteur de la fiche",
    tileHeightNormal: "Normal (1 ligne)",
    tileHeightTall: "Haut (2 lignes)",
    tileHeightTaller: "Plus haut (3 lignes)",
    tileBackgroundImage: "Image de fond",
    removeBackgroundImage: "Supprimer l'image de fond",
    tileSoundFile: "Fichier audio (remplace TTS)",
    uploadSoundFile: "Charger un son",
    changeSoundFile: "Changer le son",
    previewSound: "Aperçu",
    removeSoundFile: "Supprimer le fichier audio",
    soundFileHint: "Cette fiche jouera l'audio chargé au lieu de la synthèse vocale.",
    moveTile: "Déplacer la fiche",
    moveTileUp: "Déplacer la fiche à gauche",
    moveTileDown: "Déplacer la fiche à droite",
    layoutOrder: "Ordre de mise en page",
    layoutTabsTop: "Onglets en haut, parole en bas",
    layoutSpeechTop: "Parole en haut, onglets en bas",
    typeToSearch: "Tapez des mots… (espace pour chip)",
    addWordToBoard: "Ajouter « {{word}} » au tableau",
    addToSentence: "Ajouter à la phrase",
    settingsTabSpeech: "Voix",
    settingsTabDisplay: "Affichage",
    settingsTabApp: "App",
    settingsTabBoards: "Tableaux",
    accentColor: "Couleur d'accent",
    ttsEngine: "Moteur TTS",
    ttsEngineAll: "Système",
    suggestions: "Suggestions",
    sentenceBuilderMode: "Mode d'interaction",
    sentenceBuilderOn: "Constructeur de phrases",
    sentenceBuilderOff: "Tableau de sons",
    sentenceBuilderOnHint: "Tapez sur les fiches pour construire une phrase, puis parlez.",
    sentenceBuilderOffHint: "Tapez sur les fiches pour jouer immédiatement leur son ou voix.",
    tileDlgTabIcon: "Icône",
    tileDlgTabStyle: "Style",
    tileDlgTabMedia: "Médias",
    toggleModeLabel: "Changer le mode d'interaction",
  },
};

const CATEGORY_LABELS: Record<Language, Record<string, string>> = {
  en: {},
  es: {
    core: "Básico",
    people: "Personas",
    actions: "Acciones",
    feelings: "Sentimientos",
    food: "Comida y bebida",
    places: "Lugares",
    describe: "Describir",
    social: "Social",
  },
  fr: {
    core: "Essentiel",
    people: "Personnes",
    actions: "Actions",
    feelings: "Émotions",
    food: "Nourriture et boissons",
    places: "Lieux",
    describe: "Décrire",
    social: "Social",
  },
};

const SYMBOL_LABELS: Record<Language, Record<string, string>> = {
  en: {},
  es: {
    yes: "Sí",
    no: "No",
    i: "Yo",
    want: "Quiero",
    more: "Más",
    help: "Ayuda",
    stop: "Parar",
    go: "Ir",
    like: "Me gusta",
    "dont-like": "No me gusta",
    "all-done": "Terminé",
    look: "Mira",
    have: "Tengo",
    get: "Obtener",
    make: "Hacer",
    need: "Necesito",
    eat: "Comer",
    drink: "Beber",
    play: "Jugar",
    sleep: "Dormir",
    happy: "Feliz",
    sad: "Triste",
    angry: "Enojado",
    water: "Agua",
    home: "Casa",
    hello: "Hola",
    goodbye: "Adiós",
    please: "Por favor",
    "thank-you": "Gracias",
    sorry: "Lo siento",
  },
  fr: {
    yes: "Oui",
    no: "Non",
    i: "Je",
    want: "Veux",
    more: "Plus",
    help: "Aide",
    stop: "Stop",
    go: "Aller",
    like: "J'aime",
    "dont-like": "Je n'aime pas",
    "all-done": "Fini",
    look: "Regarde",
    have: "Avoir",
    get: "Obtenir",
    make: "Faire",
    need: "Besoin",
    eat: "Manger",
    drink: "Boire",
    play: "Jouer",
    sleep: "Dormir",
    happy: "Heureux",
    sad: "Triste",
    angry: "En colère",
    water: "Eau",
    home: "Maison",
    hello: "Bonjour",
    goodbye: "Au revoir",
    please: "S'il vous plaît",
    "thank-you": "Merci",
    sorry: "Désolé",
  },
};

export function t(
  language: Language,
  key: UiStringKey,
  variables?: Record<string, string | number>
): string {
  const template = UI_STRINGS[language][key] ?? UI_STRINGS.en[key];
  if (!variables) return template;
  return Object.entries(variables).reduce(
    (result, [name, value]) => result.replaceAll(`{{${name}}}`, String(value)),
    template
  );
}

export function getCategoryLabel(language: Language, category: Category): string {
  return CATEGORY_LABELS[language][category.id] ?? category.label;
}

export function getSymbolLabel(language: Language, symbol: Symbol): string {
  return SYMBOL_LABELS[language][symbol.id] ?? symbol.label;
}

export function getSymbolSpeak(language: Language, symbol: Symbol): string {
  return SYMBOL_LABELS[language][symbol.id] ?? symbol.speak ?? symbol.label;
}

export function localizeCategories(language: Language, categories: Category[]): Category[] {
  return categories.map((category) => ({
    ...category,
    label: getCategoryLabel(language, category),
    symbols: category.symbols.map((symbol) => ({
      ...symbol,
      label: getSymbolLabel(language, symbol),
      speak: getSymbolSpeak(language, symbol),
    })),
  }));
}
