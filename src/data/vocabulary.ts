export interface Symbol {
  id: string;
  label: string;
  /** Icon key, emoji character, or a data: URL for a custom uploaded image */
  emoji: string;
  speak?: string; // override spoken text if different from label
  color?: string; // background color category
  /** When true this tile was created by the user and can be deleted */
  isCustom?: boolean;
}

export interface Category {
  id: string;
  label: string;
  emoji: string;
  symbols: Symbol[];
}

export const CATEGORIES: Category[] = [
  {
    id: "core",
    label: "Core",
    emoji: "star",
    symbols: [
      { id: "yes", label: "Yes", emoji: "✅", color: "green" },
      { id: "no", label: "No", emoji: "❌", color: "red" },
      { id: "i", label: "I", emoji: "👤", speak: "I", color: "blue" },
      { id: "want", label: "Want", emoji: "🙏", color: "orange" },
      { id: "more", label: "More", emoji: "➕", color: "orange" },
      { id: "help", label: "Help", emoji: "🆘", color: "red" },
      { id: "stop", label: "Stop", emoji: "🛑", color: "red" },
      { id: "go", label: "Go", emoji: "🚀", color: "green" },
      { id: "like", label: "Like", emoji: "👍", color: "green" },
      { id: "dont-like", label: "Don't Like", emoji: "👎", color: "red" },
      { id: "all-done", label: "All Done", emoji: "🏁", color: "purple" },
      { id: "look", label: "Look", emoji: "👀", color: "blue" },
      { id: "have", label: "Have", emoji: "🤲", color: "blue" },
      { id: "get", label: "Get", emoji: "🫴", color: "orange" },
      { id: "make", label: "Make", emoji: "🛠️", color: "orange" },
      { id: "need", label: "Need", emoji: "💡", color: "yellow" },
    ],
  },
  {
    id: "people",
    label: "People",
    emoji: "users",
    symbols: [
      { id: "me", label: "Me", emoji: "🙋", speak: "me", color: "blue" },
      { id: "you", label: "You", emoji: "👉", speak: "you", color: "blue" },
      { id: "he", label: "He", emoji: "👦", speak: "he", color: "blue" },
      { id: "she", label: "She", emoji: "👧", speak: "she", color: "blue" },
      { id: "we", label: "We", emoji: "👫", speak: "we", color: "blue" },
      { id: "they", label: "They", emoji: "👥", speak: "they", color: "blue" },
      { id: "mom", label: "Mom", emoji: "👩", color: "pink" },
      { id: "dad", label: "Dad", emoji: "👨", color: "blue" },
      { id: "friend", label: "Friend", emoji: "🤝", color: "yellow" },
      { id: "teacher", label: "Teacher", emoji: "👩‍🏫", color: "purple" },
      { id: "doctor", label: "Doctor", emoji: "👨‍⚕️", color: "teal" },
      { id: "family", label: "Family", emoji: "👨‍👩‍👦", color: "yellow" },
    ],
  },
  {
    id: "actions",
    label: "Actions",
    emoji: "activity",
    symbols: [
      { id: "eat", label: "Eat", emoji: "🍽️", color: "orange" },
      { id: "drink", label: "Drink", emoji: "🥤", color: "teal" },
      { id: "play", label: "Play", emoji: "🎮", color: "green" },
      { id: "sleep", label: "Sleep", emoji: "😴", color: "purple" },
      { id: "walk", label: "Walk", emoji: "🚶", color: "green" },
      { id: "run", label: "Run", emoji: "🏃", color: "green" },
      { id: "sit", label: "Sit", emoji: "🪑", color: "blue" },
      { id: "stand", label: "Stand", emoji: "🧍", color: "blue" },
      { id: "read", label: "Read", emoji: "📖", color: "yellow" },
      { id: "write", label: "Write", emoji: "✏️", color: "yellow" },
      { id: "listen", label: "Listen", emoji: "👂", color: "blue" },
      { id: "talk", label: "Talk", emoji: "🗣️", color: "blue" },
      { id: "watch", label: "Watch", emoji: "📺", color: "teal" },
      { id: "work", label: "Work", emoji: "💼", color: "orange" },
      { id: "swim", label: "Swim", emoji: "🏊", color: "teal" },
      { id: "dance", label: "Dance", emoji: "💃", color: "pink" },
    ],
  },
  {
    id: "feelings",
    label: "Feelings",
    emoji: "smile",
    symbols: [
      { id: "happy", label: "Happy", emoji: "😊", color: "yellow" },
      { id: "sad", label: "Sad", emoji: "😢", color: "blue" },
      { id: "angry", label: "Angry", emoji: "😠", color: "red" },
      { id: "scared", label: "Scared", emoji: "😨", color: "purple" },
      { id: "excited", label: "Excited", emoji: "🤩", color: "yellow" },
      { id: "tired", label: "Tired", emoji: "😪", color: "blue" },
      { id: "hurt", label: "Hurt", emoji: "🤕", color: "red" },
      { id: "sick", label: "Sick", emoji: "🤒", color: "green" },
      { id: "okay", label: "Okay", emoji: "😐", color: "yellow" },
      { id: "love", label: "Love", emoji: "❤️", color: "pink" },
      { id: "confused", label: "Confused", emoji: "😕", color: "orange" },
      { id: "bored", label: "Bored", emoji: "😑", color: "gray" },
      { id: "surprised", label: "Surprised", emoji: "😲", color: "yellow" },
      { id: "calm", label: "Calm", emoji: "😌", color: "teal" },
      { id: "proud", label: "Proud", emoji: "😤", color: "orange" },
      { id: "embarrassed", label: "Embarrassed", emoji: "😳", color: "pink" },
    ],
  },
  {
    id: "food",
    label: "Food & Drink",
    emoji: "apple",
    symbols: [
      { id: "water", label: "Water", emoji: "💧", color: "teal" },
      { id: "milk", label: "Milk", emoji: "🥛", color: "blue" },
      { id: "juice", label: "Juice", emoji: "🧃", color: "yellow" },
      { id: "bread", label: "Bread", emoji: "🍞", color: "yellow" },
      { id: "apple", label: "Apple", emoji: "🍎", color: "red" },
      { id: "banana", label: "Banana", emoji: "🍌", color: "yellow" },
      { id: "pizza", label: "Pizza", emoji: "🍕", color: "orange" },
      { id: "chicken", label: "Chicken", emoji: "🍗", color: "orange" },
      { id: "rice", label: "Rice", emoji: "🍚", color: "blue" },
      { id: "sandwich", label: "Sandwich", emoji: "🥪", color: "yellow" },
      { id: "cookie", label: "Cookie", emoji: "🍪", color: "orange" },
      { id: "ice-cream", label: "Ice Cream", emoji: "🍦", color: "pink" },
      { id: "chips", label: "Chips", emoji: "🥨", color: "yellow" },
      { id: "soup", label: "Soup", emoji: "🍲", color: "orange" },
      { id: "cheese", label: "Cheese", emoji: "🧀", color: "yellow" },
      { id: "yogurt", label: "Yogurt", emoji: "🥣", color: "pink" },
    ],
  },
  {
    id: "places",
    label: "Places",
    emoji: "home",
    symbols: [
      { id: "home", label: "Home", emoji: "🏠", color: "yellow" },
      { id: "school", label: "School", emoji: "🏫", color: "blue" },
      { id: "bathroom", label: "Bathroom", emoji: "🚽", color: "teal" },
      { id: "bedroom", label: "Bedroom", emoji: "🛏️", color: "purple" },
      { id: "kitchen", label: "Kitchen", emoji: "🍳", color: "orange" },
      { id: "outside", label: "Outside", emoji: "🌳", color: "green" },
      { id: "park", label: "Park", emoji: "🏞️", color: "green" },
      { id: "store", label: "Store", emoji: "🏪", color: "orange" },
      { id: "car", label: "Car", emoji: "🚗", color: "blue" },
      { id: "hospital", label: "Hospital", emoji: "🏥", color: "red" },
      { id: "restaurant", label: "Restaurant", emoji: "🍴", color: "orange" },
      { id: "pool", label: "Pool", emoji: "🏊", color: "teal" },
    ],
  },
  {
    id: "describe",
    label: "Describe",
    emoji: "file-text",
    symbols: [
      { id: "big", label: "Big", emoji: "🔺", color: "orange" },
      { id: "small", label: "Small", emoji: "🔻", color: "blue" },
      { id: "hot", label: "Hot", emoji: "🔥", color: "red" },
      { id: "cold", label: "Cold", emoji: "❄️", color: "teal" },
      { id: "fast", label: "Fast", emoji: "⚡", color: "yellow" },
      { id: "slow", label: "Slow", emoji: "🐢", color: "green" },
      { id: "loud", label: "Loud", emoji: "📢", color: "orange" },
      { id: "quiet", label: "Quiet", emoji: "🤫", color: "blue" },
      { id: "good", label: "Good", emoji: "⭐", color: "green" },
      { id: "bad", label: "Bad", emoji: "👎", color: "red" },
      { id: "fun", label: "Fun", emoji: "🎉", color: "yellow" },
      { id: "hard", label: "Hard", emoji: "💪", color: "orange" },
      { id: "easy", label: "Easy", emoji: "😄", color: "green" },
      { id: "new", label: "New", emoji: "✨", color: "teal" },
      { id: "old", label: "Old", emoji: "📜", color: "yellow" },
      { id: "many", label: "Many", emoji: "🔢", color: "purple" },
    ],
  },
  {
    id: "social",
    label: "Social",
    emoji: "handshake",
    symbols: [
      { id: "hello", label: "Hello", emoji: "👋", color: "yellow" },
      { id: "goodbye", label: "Goodbye", emoji: "👋", speak: "Goodbye", color: "orange" },
      { id: "please", label: "Please", emoji: "🙏", color: "purple" },
      { id: "thank-you", label: "Thank You", emoji: "🙌", color: "green" },
      { id: "sorry", label: "Sorry", emoji: "😔", color: "blue" },
      { id: "excuse-me", label: "Excuse Me", emoji: "🤚", color: "orange" },
      { id: "wait", label: "Wait", emoji: "⏳", color: "yellow" },
      { id: "finished", label: "Finished", emoji: "✅", color: "green" },
      { id: "question", label: "Question", emoji: "❓", color: "blue" },
      { id: "again", label: "Again", emoji: "🔄", color: "teal" },
      { id: "together", label: "Together", emoji: "🤝", color: "yellow" },
      { id: "my-turn", label: "My Turn", emoji: "☝️", color: "orange" },
    ],
  },
];

export const ALL_SYMBOLS: Symbol[] = CATEGORIES.flatMap((c) => c.symbols);
