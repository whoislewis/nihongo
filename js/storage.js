// Storage module for persisting user data

const STORAGE_KEYS = {
    WORD_PROGRESS: 'nihongo_word_progress',
    USER_SETTINGS: 'nihongo_settings',
    STUDY_STATS: 'nihongo_stats',
    MNEMONICS: 'nihongo_mnemonics',
    KANJI_NOTES: 'nihongo_kanji_notes',
    UNIFIED_PROGRESS: 'nihongo_unified_progress',
    STAGE_PROGRESS: 'nihongo_stage_progress',
    FOUNDATION_PROGRESS: 'nihongo_foundation_progress'
};

// Default settings
const DEFAULT_SETTINGS = {
    dailyNewWords: 10,
    maxDailyReviews: 0, // 0 = unlimited
    graduationThreshold: 5,
    showFurigana: true,
    showSentences: true,
    audioEnabled: false,
    quizDirection: 'both', // 'jp-to-en', 'en-to-jp', 'both'
    softDependencies: true, // If false, strictly enforce dependencies
    autoExpandKanji: true   // Auto-expand kanji breakdown for new vocab
};

// Default stage progress
const DEFAULT_STAGE_PROGRESS = {
    currentStage: 'foundations',
    completedStages: [],
    stageData: {
        foundations: {
            kanaScore: 0,
            grammarCardsViewed: [],
            kanjiCardsViewed: []
        },
        core_radicals: {
            radicalsLearned: []
        },
        vocabulary_kanji: {
            wordsLearned: 0
        },
        advanced_grammar: {
            unlocked: false,
            patternsLearned: []
        }
    }
};

// Default foundation progress
const DEFAULT_FOUNDATION_PROGRESS = {
    kana: {
        // Individual kana mastery tracking
        masteredHiragana: [],  // Array of kana chars answered correctly
        masteredKatakana: [],  // Array of kana chars answered correctly
        hiraganaScore: 0,      // Percentage (calculated from mastered count)
        katakanaScore: 0,      // Percentage (calculated from mastered count)
        lastQuizDate: null
    },
    grammarIntro: {
        viewedCards: [],
        completed: false
    },
    kanjiIntro: {
        viewedCards: [],
        completed: false
    }
};

// Total kana counts
const HIRAGANA_COUNT = 46;
const KATAKANA_COUNT = 46;

// Default stats
const DEFAULT_STATS = {
    streak: 0,
    lastStudyDate: null,
    totalWordsLearned: 0,
    totalReviews: 0,
    todayNewWords: 0,
    todayReviews: 0,
    todayDate: null
};

// Storage helper functions
const Storage = {
    // Get data from localStorage
    get(key, defaultValue = null) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : defaultValue;
        } catch (e) {
            console.error('Storage get error:', e);
            return defaultValue;
        }
    },

    // Set data in localStorage
    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (e) {
            console.error('Storage set error:', e);
            return false;
        }
    },

    // Remove data from localStorage
    remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (e) {
            console.error('Storage remove error:', e);
            return false;
        }
    },

    // Get user settings
    getSettings() {
        return { ...DEFAULT_SETTINGS, ...this.get(STORAGE_KEYS.USER_SETTINGS, {}) };
    },

    // Save user settings
    saveSettings(settings) {
        return this.set(STORAGE_KEYS.USER_SETTINGS, settings);
    },

    // Get study stats
    getStats() {
        const stats = { ...DEFAULT_STATS, ...this.get(STORAGE_KEYS.STUDY_STATS, {}) };

        // Reset daily stats if it's a new day
        const today = new Date().toDateString();
        if (stats.todayDate !== today) {
            // Check if we need to update streak
            if (stats.lastStudyDate) {
                const lastDate = new Date(stats.lastStudyDate);
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);

                if (lastDate.toDateString() !== yesterday.toDateString() &&
                    lastDate.toDateString() !== today) {
                    // Streak broken
                    stats.streak = 0;
                }
            }

            stats.todayDate = today;
            stats.todayNewWords = 0;
            stats.todayReviews = 0;
            this.saveStats(stats);
        }

        return stats;
    },

    // Save study stats
    saveStats(stats) {
        return this.set(STORAGE_KEYS.STUDY_STATS, stats);
    },

    // Record a study session
    recordStudy(isNewWord = false) {
        const stats = this.getStats();
        const today = new Date().toDateString();

        if (isNewWord) {
            stats.todayNewWords++;
            stats.totalWordsLearned++;
        }

        stats.todayReviews++;
        stats.totalReviews++;

        // Update streak if first review of the day
        if (stats.lastStudyDate !== today) {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);

            if (stats.lastStudyDate === yesterday.toDateString()) {
                stats.streak++;
            } else if (stats.lastStudyDate !== today) {
                stats.streak = 1;
            }

            stats.lastStudyDate = today;
        }

        this.saveStats(stats);
        return stats;
    },

    // Get word progress data
    getWordProgress() {
        return this.get(STORAGE_KEYS.WORD_PROGRESS, {});
    },

    // Save word progress
    saveWordProgress(progress) {
        return this.set(STORAGE_KEYS.WORD_PROGRESS, progress);
    },

    // Get progress for a specific word
    getWordData(wordId) {
        const progress = this.getWordProgress();
        return progress[wordId] || {
            stack: 'unlearned', // 'unlearned', 'learning', 'known'
            successCount: 0,
            failCount: 0,
            lastReview: null,
            nextReview: null,
            interval: 1, // days
            easeFactor: 2.5
        };
    },

    // Update progress for a specific word
    updateWordData(wordId, data) {
        const progress = this.getWordProgress();
        progress[wordId] = { ...this.getWordData(wordId), ...data };
        return this.saveWordProgress(progress);
    },

    // Get mnemonics
    getMnemonics() {
        return this.get(STORAGE_KEYS.MNEMONICS, {});
    },

    // Save mnemonic for a word
    saveMnemonic(wordId, mnemonic) {
        const mnemonics = this.getMnemonics();
        mnemonics[wordId] = mnemonic;
        return this.set(STORAGE_KEYS.MNEMONICS, mnemonics);
    },

    // Get mnemonic for a word
    getMnemonic(wordId) {
        const mnemonics = this.getMnemonics();
        return mnemonics[wordId] || '';
    },

    // Get kanji notes
    getKanjiNotesAll() {
        return this.get(STORAGE_KEYS.KANJI_NOTES, {});
    },

    // Save kanji notes for a word
    saveKanjiNotes(wordId, notes) {
        const kanjiNotes = this.getKanjiNotesAll();
        kanjiNotes[wordId] = notes;
        return this.set(STORAGE_KEYS.KANJI_NOTES, kanjiNotes);
    },

    // Get kanji notes for a word
    getKanjiNotes(wordId) {
        const kanjiNotes = this.getKanjiNotesAll();
        return kanjiNotes[wordId] || '';
    },

    // Add extra words to today's quota
    addExtraWords(count) {
        const stats = this.getStats();
        // Decrease todayNewWords to allow more words
        stats.todayNewWords = Math.max(0, stats.todayNewWords - count);
        this.saveStats(stats);
        return stats;
    },

    // Export all data
    exportData() {
        return {
            wordProgress: this.getWordProgress(),
            settings: this.getSettings(),
            stats: this.getStats(),
            mnemonics: this.getMnemonics(),
            kanjiNotes: this.getKanjiNotesAll(),
            exportDate: new Date().toISOString()
        };
    },

    // Import data
    importData(data) {
        if (data.wordProgress) this.saveWordProgress(data.wordProgress);
        if (data.settings) this.saveSettings(data.settings);
        if (data.stats) this.saveStats(data.stats);
        if (data.mnemonics) this.set(STORAGE_KEYS.MNEMONICS, data.mnemonics);
        if (data.kanjiNotes) this.set(STORAGE_KEYS.KANJI_NOTES, data.kanjiNotes);
        return true;
    },

    // Clear all data
    clearAll() {
        Object.values(STORAGE_KEYS).forEach(key => this.remove(key));
    },

    // === UNIFIED PROGRESS SYSTEM ===

    // Get unified progress (all item types)
    getUnifiedProgress() {
        return this.get(STORAGE_KEYS.UNIFIED_PROGRESS, {});
    },

    // Save unified progress
    saveUnifiedProgress(progress) {
        return this.set(STORAGE_KEYS.UNIFIED_PROGRESS, progress);
    },

    // Get progress for a specific item (vocab, kanji, radical, grammar)
    getItemProgress(itemId, itemType) {
        const key = `${itemType}_${itemId}`;
        const progress = this.getUnifiedProgress();
        return progress[key] || this.getDefaultItemProgress(itemType);
    },

    // Get default progress for an item type
    getDefaultItemProgress(itemType) {
        const baseProgress = {
            stack: 'unlearned',
            successCount: 0,
            failCount: 0,
            lastReview: null,
            nextReview: null,
            interval: 1,
            easeFactor: 2.5,
            dependencies: []
        };

        // Type-specific graduation thresholds
        const thresholds = {
            vocabulary: 5,
            kanji: 3,
            radical: 2,
            grammar: 3
        };

        return {
            ...baseProgress,
            graduationThreshold: thresholds[itemType] || 5
        };
    },

    // Update progress for a specific item
    updateItemProgress(itemId, itemType, data) {
        const key = `${itemType}_${itemId}`;
        const progress = this.getUnifiedProgress();
        const currentData = progress[key] || this.getDefaultItemProgress(itemType);
        progress[key] = { ...currentData, ...data, type: itemType };
        return this.saveUnifiedProgress(progress);
    },

    // Get all items of a specific type
    getItemsByType(itemType) {
        const progress = this.getUnifiedProgress();
        const items = {};
        Object.keys(progress).forEach(key => {
            if (key.startsWith(`${itemType}_`)) {
                items[key] = progress[key];
            }
        });
        return items;
    },

    // Get items by stack for a specific type
    getItemsByStack(itemType, stack) {
        const items = this.getItemsByType(itemType);
        return Object.entries(items)
            .filter(([_, data]) => data.stack === stack)
            .map(([key, data]) => ({ key, ...data }));
    },

    // === STAGE PROGRESS ===

    // Get stage progress
    getStageProgress() {
        return { ...DEFAULT_STAGE_PROGRESS, ...this.get(STORAGE_KEYS.STAGE_PROGRESS, {}) };
    },

    // Save stage progress
    saveStageProgress(progress) {
        return this.set(STORAGE_KEYS.STAGE_PROGRESS, progress);
    },

    // Update current stage
    setCurrentStage(stageId) {
        const progress = this.getStageProgress();
        progress.currentStage = stageId;
        return this.saveStageProgress(progress);
    },

    // Mark stage as complete
    completeStage(stageId) {
        const progress = this.getStageProgress();
        if (!progress.completedStages.includes(stageId)) {
            progress.completedStages.push(stageId);
        }
        return this.saveStageProgress(progress);
    },

    // Check if stage is complete
    isStageComplete(stageId) {
        const progress = this.getStageProgress();
        return progress.completedStages.includes(stageId);
    },

    // === FOUNDATION PROGRESS ===

    // Get foundation progress
    getFoundationProgress() {
        return { ...DEFAULT_FOUNDATION_PROGRESS, ...this.get(STORAGE_KEYS.FOUNDATION_PROGRESS, {}) };
    },

    // Save foundation progress
    saveFoundationProgress(progress) {
        return this.set(STORAGE_KEYS.FOUNDATION_PROGRESS, progress);
    },

    // Update kana score (legacy - for backwards compatibility)
    updateKanaScore(type, score) {
        const progress = this.getFoundationProgress();
        if (type === 'hiragana') {
            progress.kana.hiraganaScore = Math.max(progress.kana.hiraganaScore || 0, score);
        } else if (type === 'katakana') {
            progress.kana.katakanaScore = Math.max(progress.kana.katakanaScore || 0, score);
        }
        progress.kana.lastQuizDate = new Date().toISOString();
        return this.saveFoundationProgress(progress);
    },

    // Mark individual kana as mastered
    masterKana(kanaChar, type) {
        const progress = this.getFoundationProgress();

        // Initialize arrays if needed
        if (!progress.kana.masteredHiragana) progress.kana.masteredHiragana = [];
        if (!progress.kana.masteredKatakana) progress.kana.masteredKatakana = [];

        if (type === 'hiragana') {
            if (!progress.kana.masteredHiragana.includes(kanaChar)) {
                progress.kana.masteredHiragana.push(kanaChar);
            }
            // Calculate percentage based on mastered count
            progress.kana.hiraganaScore = Math.round((progress.kana.masteredHiragana.length / HIRAGANA_COUNT) * 100);
        } else if (type === 'katakana') {
            if (!progress.kana.masteredKatakana.includes(kanaChar)) {
                progress.kana.masteredKatakana.push(kanaChar);
            }
            progress.kana.katakanaScore = Math.round((progress.kana.masteredKatakana.length / KATAKANA_COUNT) * 100);
        }

        progress.kana.lastQuizDate = new Date().toISOString();
        return this.saveFoundationProgress(progress);
    },

    // Mark multiple kana as mastered at once
    masterKanaBatch(kanaChars, type) {
        const progress = this.getFoundationProgress();

        // Initialize arrays if needed
        if (!progress.kana.masteredHiragana) progress.kana.masteredHiragana = [];
        if (!progress.kana.masteredKatakana) progress.kana.masteredKatakana = [];

        kanaChars.forEach(kanaChar => {
            if (type === 'hiragana') {
                if (!progress.kana.masteredHiragana.includes(kanaChar)) {
                    progress.kana.masteredHiragana.push(kanaChar);
                }
            } else if (type === 'katakana') {
                if (!progress.kana.masteredKatakana.includes(kanaChar)) {
                    progress.kana.masteredKatakana.push(kanaChar);
                }
            }
        });

        // Calculate percentages
        progress.kana.hiraganaScore = Math.round((progress.kana.masteredHiragana.length / HIRAGANA_COUNT) * 100);
        progress.kana.katakanaScore = Math.round((progress.kana.masteredKatakana.length / KATAKANA_COUNT) * 100);
        progress.kana.lastQuizDate = new Date().toISOString();

        return this.saveFoundationProgress(progress);
    },

    // Get kana mastery status
    getKanaMastery() {
        const progress = this.getFoundationProgress();
        const masteredHiragana = progress.kana?.masteredHiragana || [];
        const masteredKatakana = progress.kana?.masteredKatakana || [];

        return {
            masteredHiragana,
            masteredKatakana,
            hiraganaCount: masteredHiragana.length,
            katakanaCount: masteredKatakana.length,
            hiraganaPercent: Math.round((masteredHiragana.length / HIRAGANA_COUNT) * 100),
            katakanaPercent: Math.round((masteredKatakana.length / KATAKANA_COUNT) * 100),
            hiraganaComplete: masteredHiragana.length >= HIRAGANA_COUNT,
            katakanaComplete: masteredKatakana.length >= KATAKANA_COUNT,
            totalComplete: masteredHiragana.length >= HIRAGANA_COUNT && masteredKatakana.length >= KATAKANA_COUNT
        };
    },

    // Reset all kana progress (for testing)
    resetKanaProgress() {
        const progress = this.getFoundationProgress();
        progress.kana = {
            masteredHiragana: [],
            masteredKatakana: [],
            hiraganaScore: 0,
            katakanaScore: 0,
            lastQuizDate: null
        };
        return this.saveFoundationProgress(progress);
    },

    // Master all kana (for testing)
    masterAllKana(hiraganaChars, katakanaChars) {
        const progress = this.getFoundationProgress();
        progress.kana = {
            masteredHiragana: [...hiraganaChars],
            masteredKatakana: [...katakanaChars],
            hiraganaScore: 100,
            katakanaScore: 100,
            lastQuizDate: new Date().toISOString()
        };
        return this.saveFoundationProgress(progress);
    },

    // Mark grammar intro card as viewed
    viewGrammarIntroCard(cardId) {
        const progress = this.getFoundationProgress();
        if (!progress.grammarIntro.viewedCards.includes(cardId)) {
            progress.grammarIntro.viewedCards.push(cardId);
        }
        if (progress.grammarIntro.viewedCards.length >= 6) {
            progress.grammarIntro.completed = true;
        }
        return this.saveFoundationProgress(progress);
    },

    // Mark kanji intro card as viewed
    viewKanjiIntroCard(cardId) {
        const progress = this.getFoundationProgress();
        if (!progress.kanjiIntro.viewedCards.includes(cardId)) {
            progress.kanjiIntro.viewedCards.push(cardId);
        }
        if (progress.kanjiIntro.viewedCards.length >= 6) {
            progress.kanjiIntro.completed = true;
        }
        return this.saveFoundationProgress(progress);
    },

    // === RADICAL PROGRESS ===

    // Mark radical as learned
    learnRadical(radicalChar) {
        return this.updateItemProgress(radicalChar, 'radical', {
            stack: 'learning',
            lastReview: new Date().toISOString()
        });
    },

    // Get learned radicals count
    getLearnedRadicalsCount() {
        const radicals = this.getItemsByType('radical');
        return Object.values(radicals).filter(r =>
            r.stack === 'learning' || r.stack === 'known'
        ).length;
    },

    // === DATA MIGRATION ===

    // Migrate existing data to unified format
    migrateToUnifiedProgress() {
        const migrated = this.get('nihongo_migration_complete', false);
        if (migrated) return;

        // Migrate word progress
        const oldWordProgress = this.getWordProgress();
        const unifiedProgress = this.getUnifiedProgress();

        Object.entries(oldWordProgress).forEach(([wordId, data]) => {
            const key = `vocabulary_${wordId}`;
            if (!unifiedProgress[key]) {
                unifiedProgress[key] = {
                    ...data,
                    type: 'vocabulary',
                    graduationThreshold: 5
                };
            }
        });

        this.saveUnifiedProgress(unifiedProgress);
        this.set('nihongo_migration_complete', true);
        console.log('Migration to unified progress complete');
    },

    // Export all data including new progress systems
    exportData() {
        return {
            wordProgress: this.getWordProgress(),
            unifiedProgress: this.getUnifiedProgress(),
            stageProgress: this.getStageProgress(),
            foundationProgress: this.getFoundationProgress(),
            settings: this.getSettings(),
            stats: this.getStats(),
            mnemonics: this.getMnemonics(),
            kanjiNotes: this.getKanjiNotesAll(),
            exportDate: new Date().toISOString()
        };
    },

    // Import data including new progress systems
    importData(data) {
        if (data.wordProgress) this.saveWordProgress(data.wordProgress);
        if (data.unifiedProgress) this.saveUnifiedProgress(data.unifiedProgress);
        if (data.stageProgress) this.saveStageProgress(data.stageProgress);
        if (data.foundationProgress) this.saveFoundationProgress(data.foundationProgress);
        if (data.settings) this.saveSettings(data.settings);
        if (data.stats) this.saveStats(data.stats);
        if (data.mnemonics) this.set(STORAGE_KEYS.MNEMONICS, data.mnemonics);
        if (data.kanjiNotes) this.set(STORAGE_KEYS.KANJI_NOTES, data.kanjiNotes);
        return true;
    }
};

// Make available globally
window.Storage = Storage;
window.DEFAULT_SETTINGS = DEFAULT_SETTINGS;
window.DEFAULT_STAGE_PROGRESS = DEFAULT_STAGE_PROGRESS;
window.DEFAULT_FOUNDATION_PROGRESS = DEFAULT_FOUNDATION_PROGRESS;
