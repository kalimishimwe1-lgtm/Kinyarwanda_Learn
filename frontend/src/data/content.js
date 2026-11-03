export const lessons = [
  {
    id: 1,
    title: 'Greetings & introductions',
    level: 'Beginner',
    duration: '12 min',
    description: 'Start with everyday greetings, polite phrases, and cultural manners.',
    objectives: ['Say hello', 'Ask names', 'Introduce yourself'],
  },
  {
    id: 2,
    title: 'Numbers & counting',
    level: 'Beginner',
    duration: '15 min',
    description: 'Learn number patterns and simple counting for daily tasks.',
    objectives: ['Count 1-20', 'Use prices', 'Talk about time'],
  },
  {
    id: 3,
    title: 'Family & relationships',
    level: 'Beginner',
    duration: '18 min',
    description: 'Build vocabulary for family members and common relationship terms.',
    objectives: ['Name relatives', 'Describe family', 'Use possessives'],
  },
  {
    id: 4,
    title: 'Daily conversation',
    level: 'Intermediate',
    duration: '22 min',
    description: 'Practice useful expression for school, work, and public life.',
    objectives: ['Ask for help', 'Make plans', 'Explain needs'],
  },
  {
    id: 5,
    title: 'Travel phrases',
    level: 'Intermediate',
    duration: '20 min',
    description: 'Speak confidently while moving around town or visiting new places.',
    objectives: ['Ask directions', 'Book a ride', 'Order food'],
  },
  {
    id: 6,
    title: 'Fluency practice',
    level: 'Advanced',
    duration: '25 min',
    description: 'Sharpen longer conversations with real-world speaking drills.',
    objectives: ['Hold conversation', 'Use past tense', 'Narrate events'],
  },
];

export const vocabulary = [
  { word: 'Muraho', meaning: 'Hello', example: 'Muraho neza! Good to see you.', category: 'Greetings' },
  { word: 'Murakoze', meaning: 'Thank you', example: 'Murakoze cyane.', category: 'Politeness' },
  { word: 'Yego', meaning: 'Yes', example: 'Yego, ndabizi.', category: 'Responses' },
  { word: 'Oya', meaning: 'No', example: 'Oya, sunkizaga.', category: 'Responses' },
  { word: 'Umuryango', meaning: 'Family', example: 'Umuryango wacu uratuje.', category: 'Family' },
  { word: 'Uruhu', meaning: 'Skin', category: 'Body' },
  { word: 'Inzira', meaning: 'Road / way', example: 'Ntabwo nzi inzira yo kujya mu kigo.', category: 'Travel' },
  { word: 'Soma', meaning: 'Read / study', example: 'Soma ibitabo byawe buri munsi.', category: 'Learning' },
];

export const quiz = [
  {
    id: 1,
    question: 'What does Muraho mean?',
    options: ['Hello', 'Goodbye', 'Thanks', 'No'],
  },
  {
    id: 2,
    question: 'What does Murakoze mean?',
    options: ['Please', 'Thank you', 'Good night', 'Welcome'],
  },
  {
    id: 3,
    question: 'Which word means “yes”?',
    options: ['Oya', 'Muraho', 'Yego', 'Murakoze'],
  },
];

export const stats = [
  { value: String(lessons.length), label: 'Starter lessons' },
  { value: String(vocabulary.length), label: 'Starter vocabulary entries' },
  { value: String(quiz.length), label: 'Practice quiz questions' },
  { value: String(new Set(lessons.map((lesson) => lesson.level)).size), label: 'Learning levels' },
];
