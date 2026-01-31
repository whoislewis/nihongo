// Storage module for persisting user data

const STORAGE_KEYS = {
    WORD_PROGRESS: 'nihongo_word_progress',
    USER_SETTINGS: 'nihongo_settings',
    STUDY_STATS: 'nihongo_stats',
    MNEMONICS: 'nihongo_mnemonics',
    KANJI_NOTES: 'nihongo_kanji_notes'
};

// Default settings
const DEFAULT_SETTINGS = {
    dailyNewWords: 10,
    maxDailyReviews: 0, // 0 = unlimited
    graduationThreshold: 5,
    showFurigana: true,
    showSentences: true,
    audioEnabled: false,
    quizDirection: 'both' // 'jp-to-en', 'en-to-jp', 'both'
};

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
    }
};

// Make available globally
window.Storage = Storage;
window.DEFAULT_SETTINGS = DEFAULT_SETTINGS;
