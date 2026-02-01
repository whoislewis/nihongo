// Learning Stages Configuration
// Defines the structured learning path from foundations to advanced

const LEARNING_STAGES = {
    stages: [
        {
            id: 'kana_mastery',
            name: 'Kana Mastery',
            order: 1,
            description: 'Master Hiragana and Katakana - the foundation of Japanese reading',
            modules: ['hiragana', 'katakana'],
            icon: 'あ',
            criteria: {
                hiragana: { minScore: 90, description: 'Hiragana quiz 90%+' },
                katakana: { minScore: 90, description: 'Katakana quiz 90%+' }
            }
        },
        {
            id: 'heisig_kanji',
            name: 'Heisig Kanji',
            order: 2,
            description: 'Learn kanji meanings using the Remembering the Kanji method in exact book order',
            prerequisite: 'kana_mastery',
            target: 300,
            icon: '漢',
            criteria: {
                heisigLearned: { count: 300, description: '~300 kanji before vocabulary (recommended)' }
            },
            note: 'Learn kanji by meaning first. Vocabulary comes after building kanji foundation.'
        },
        {
            id: 'vocabulary_building',
            name: 'Vocabulary Building',
            order: 3,
            description: 'Build vocabulary using the kanji you know - words now have meaning!',
            prerequisite: 'heisig_kanji',
            target: 1500,
            icon: '📚',
            criteria: {
                wordsLearned: { count: 1500, description: 'Progressive vocabulary building' }
            },
            note: 'With kanji foundation, vocabulary learning becomes much easier.'
        },
        {
            id: 'grammar_mastery',
            name: 'Grammar Mastery',
            order: 4,
            description: 'Deep dive into grammar patterns and sentence structures',
            prerequisite: 'kana_mastery',
            parallelWith: 'vocabulary_building',
            unlockAt: 50, // Can start early
            icon: '🎓',
            criteria: {
                grammarPatternsLearned: { count: 50, description: 'Core grammar patterns' }
            }
        }
    ],

    // Stage status enum
    STATUS: {
        LOCKED: 'locked',
        ACTIVE: 'active',
        COMPLETE: 'complete'
    },

    // Get stage by ID
    getStage(stageId) {
        return this.stages.find(s => s.id === stageId);
    },

    // Get stages in order
    getOrderedStages() {
        return [...this.stages].sort((a, b) => a.order - b.order);
    },

    // Get next stage after given stage
    getNextStage(stageId) {
        const currentStage = this.getStage(stageId);
        if (!currentStage) return null;
        return this.stages.find(s => s.order === currentStage.order + 1);
    },

    // Check if stage has prerequisite
    hasPrerequisite(stageId) {
        const stage = this.getStage(stageId);
        return stage && !!stage.prerequisite;
    },

    // Get prerequisite stage
    getPrerequisite(stageId) {
        const stage = this.getStage(stageId);
        if (!stage || !stage.prerequisite) return null;
        return this.getStage(stage.prerequisite);
    }
};

// Foundation module content
const FOUNDATION_MODULES = {
    grammar_intro: {
        id: 'grammar_intro',
        name: 'Grammar Introduction',
        cards: [
            {
                id: 'grammar_1',
                title: 'Sentence Structure',
                content: 'Japanese sentences follow Subject-Object-Verb (SOV) order. The verb always comes last.',
                example: '私は りんごを 食べる',
                exampleMeaning: 'I eat an apple (I + apple + eat)'
            },
            {
                id: 'grammar_2',
                title: 'Particles',
                content: 'Particles are small words that mark the grammatical function of words. は (wa) marks the topic, を (wo) marks the object, が (ga) marks the subject.',
                example: '猫が 魚を 食べる',
                exampleMeaning: 'The cat eats fish'
            },
            {
                id: 'grammar_3',
                title: 'Politeness Levels',
                content: 'Japanese has different politeness levels. Adding です/ます makes speech polite. Casual form drops these endings.',
                example: '食べます → 食べる',
                exampleMeaning: 'I eat (polite) → I eat (casual)'
            },
            {
                id: 'grammar_4',
                title: 'Adjectives',
                content: 'Japanese has two types of adjectives: い-adjectives (end in い) and な-adjectives (require な before nouns).',
                example: '大きい猫 / 静かな部屋',
                exampleMeaning: 'Big cat / Quiet room'
            },
            {
                id: 'grammar_5',
                title: 'Existence Verbs',
                content: 'いる is used for animate things (people, animals), ある is used for inanimate things.',
                example: '猫がいる / 本がある',
                exampleMeaning: 'There is a cat / There is a book'
            },
            {
                id: 'grammar_6',
                title: 'Questions',
                content: 'Add か (ka) at the end of a statement to make it a question. Question words like 何 (what), どこ (where) go where the answer would be.',
                example: 'これは何ですか？',
                exampleMeaning: 'What is this?'
            }
        ]
    },
    kanji_intro: {
        id: 'kanji_intro',
        name: 'Kanji Introduction',
        cards: [
            {
                id: 'kanji_1',
                title: 'What is Kanji?',
                content: 'Kanji are logographic characters borrowed from Chinese. Each character carries meaning and can have multiple readings.',
                example: '山 = mountain, 川 = river, 森 = forest',
                exampleMeaning: 'Nature kanji often look like what they represent'
            },
            {
                id: 'kanji_2',
                title: 'Radicals',
                content: 'Kanji are made up of smaller components called radicals. Learning radicals helps you break down and remember complex kanji.',
                example: '休 = 人 (person) + 木 (tree)',
                exampleMeaning: 'A person resting against a tree = rest'
            },
            {
                id: 'kanji_3',
                title: 'On\'yomi vs Kun\'yomi',
                content: 'On\'yomi is the Chinese-derived reading, often used in compound words. Kun\'yomi is the native Japanese reading, often used alone.',
                example: '山: サン (on) / やま (kun)',
                exampleMeaning: 'Mountain: "san" in 富士山, "yama" alone'
            },
            {
                id: 'kanji_4',
                title: 'Learning Strategy',
                content: 'Learn kanji through vocabulary, not in isolation. When you learn a word, study its kanji components and radicals.',
                example: '食べる → 食 (eat radical)',
                exampleMeaning: 'Learning "to eat" also teaches you the "eat" kanji'
            },
            {
                id: 'kanji_5',
                title: 'Stroke Order',
                content: 'Kanji have a specific stroke order: generally top-to-bottom, left-to-right. Proper stroke order helps with recognition and handwriting.',
                example: '日: horizontal, left vertical, right vertical, bottom',
                exampleMeaning: 'The sun kanji in 4 strokes'
            },
            {
                id: 'kanji_6',
                title: 'Common Patterns',
                content: 'Many kanji share components. The same radical often indicates similar meaning or pronunciation categories.',
                example: '語, 話, 読, 説 all use 言 (speech)',
                exampleMeaning: 'All are related to speaking/language'
            }
        ]
    }
};

// Make available globally
window.LEARNING_STAGES = LEARNING_STAGES;
window.FOUNDATION_MODULES = FOUNDATION_MODULES;
