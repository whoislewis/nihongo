// Spaced Repetition System (SRS) Logic
// Based on SM-2 algorithm with modifications

const SRS = {
    // SRS intervals in days
    INTERVALS: [1, 3, 7, 14, 30, 60, 120],

    // Calculate next review date based on success/failure
    calculateNextReview(wordData, wasCorrect) {
        const now = new Date();
        let { interval, easeFactor, successCount, failCount } = wordData;

        if (wasCorrect) {
            // Increase success count
            successCount++;

            // Calculate new interval
            if (successCount === 1) {
                interval = 1;
            } else if (successCount === 2) {
                interval = 3;
            } else {
                interval = Math.round(interval * easeFactor);
            }

            // Increase ease factor slightly
            easeFactor = Math.min(easeFactor + 0.1, 3.0);
        } else {
            // Reset on failure
            failCount++;
            interval = 1;
            successCount = Math.max(0, successCount - 2); // Reduce success count

            // Decrease ease factor
            easeFactor = Math.max(easeFactor - 0.2, 1.3);
        }

        // Calculate next review date
        const nextReview = new Date(now);
        nextReview.setDate(nextReview.getDate() + interval);

        return {
            successCount,
            failCount,
            interval,
            easeFactor,
            lastReview: now.toISOString(),
            nextReview: nextReview.toISOString()
        };
    },

    // Check if a word is due for review
    isDue(wordData) {
        if (!wordData.nextReview) return true;

        const now = new Date();
        const nextReview = new Date(wordData.nextReview);

        return now >= nextReview;
    },

    // Get words available for quiz (all Learning stack words)
    getDueWords(vocabulary, progress, settings) {
        const learningWords = [];

        vocabulary.forEach(word => {
            const wordProgress = progress[word.id] || { stack: 'unlearned' };

            // Include ALL words in the learning stack for quiz
            if (wordProgress.stack === 'learning') {
                learningWords.push({
                    ...word,
                    progress: wordProgress,
                    isDue: this.isDue(wordProgress)
                });
            }
        });

        // Sort: due words first (oldest first), then non-due words
        learningWords.sort((a, b) => {
            // Due words come before non-due words
            if (a.isDue && !b.isDue) return -1;
            if (!a.isDue && b.isDue) return 1;

            // Within each group, sort by next review date (oldest first)
            const aDate = a.progress.nextReview ? new Date(a.progress.nextReview) : new Date(0);
            const bDate = b.progress.nextReview ? new Date(b.progress.nextReview) : new Date(0);
            return aDate - bDate;
        });

        // Apply max daily reviews limit if set
        if (settings.maxDailyReviews > 0) {
            const stats = Storage.getStats();
            const remaining = Math.max(0, settings.maxDailyReviews - stats.todayReviews);
            return learningWords.slice(0, remaining);
        }

        return learningWords;
    },

    // Get count of truly due words (for display purposes)
    getDueCount(vocabulary, progress) {
        let count = 0;
        vocabulary.forEach(word => {
            const wordProgress = progress[word.id];
            if (wordProgress && wordProgress.stack === 'learning' && this.isDue(wordProgress)) {
                count++;
            }
        });
        return count;
    },

    // Get new words to introduce (for Study mode - includes Learning stack)
    getNewWords(vocabulary, progress, settings) {
        // First, get words in the Learning stack (these should always be shown)
        const learningWords = vocabulary.filter(word => {
            const wordProgress = progress[word.id];
            return wordProgress && wordProgress.stack === 'learning';
        }).map(word => ({
            ...word,
            progress: progress[word.id]
        }));

        // If there are words in Learning, show those
        if (learningWords.length > 0) {
            return learningWords.slice(0, settings.dailyNewWords || 10);
        }

        // Otherwise, get unlearned words up to daily limit
        const stats = Storage.getStats();
        const remaining = Math.max(0, settings.dailyNewWords - stats.todayNewWords);

        if (remaining === 0) return [];

        // Get unlearned words sorted by frequency (most common first)
        const unlearnedWords = vocabulary.filter(word => {
            const wordProgress = progress[word.id];
            return !wordProgress || wordProgress.stack === 'unlearned';
        });

        return unlearnedWords.slice(0, remaining);
    },

    // Build a study session - Quiz should show same words as Study mode
    buildStudySession(vocabulary, progress, settings) {
        // Get due reviews first (words in learning stack)
        const dueWords = this.getDueWords(vocabulary, progress, settings);

        // Get unlearned words - same logic as Study mode, ignoring daily quota
        // This ensures Quiz shows same words as Study
        const unlearnedWords = vocabulary.filter(word => {
            const wordProgress = progress[word.id];
            return !wordProgress || wordProgress.stack === 'unlearned';
        });

        // Limit to daily new words setting (same as Study)
        const newWords = unlearnedWords.slice(0, settings.dailyNewWords || 10);

        // Mark new words for introduction
        const newWordsWithFlag = newWords.map(word => ({
            ...word,
            isNew: true,
            progress: { stack: 'unlearned', successCount: 0 }
        }));

        // Combine: reviews first, then new words
        const session = [...dueWords, ...newWordsWithFlag];

        // Shuffle for variety (but keep new words at the end)
        const reviews = session.filter(w => !w.isNew);
        const introductions = session.filter(w => w.isNew);

        // Shuffle reviews
        for (let i = reviews.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [reviews[i], reviews[j]] = [reviews[j], reviews[i]];
        }

        return [...reviews, ...introductions];
    },

    // Process an answer
    processAnswer(wordId, wasCorrect, isNew, settings) {
        const wordData = Storage.getWordData(wordId);

        // Calculate new SRS data
        const newData = this.calculateNextReview(wordData, wasCorrect);

        // Update stack based on success count and threshold
        if (newData.successCount >= settings.graduationThreshold) {
            // Ready for graduation confirmation
            newData.readyToGraduate = true;
        }

        // If it was a new word, move to learning stack
        if (isNew) {
            newData.stack = 'learning';
        }

        // Save updated data
        Storage.updateWordData(wordId, newData);

        // Record the study action
        Storage.recordStudy(isNew);

        return newData;
    },

    // Graduate a word to known
    graduateWord(wordId) {
        Storage.updateWordData(wordId, {
            stack: 'known',
            readyToGraduate: false,
            graduatedAt: new Date().toISOString()
        });
    },

    // Reset word progress (when user says they don't know it)
    resetWord(wordId) {
        Storage.updateWordData(wordId, {
            successCount: 0,
            readyToGraduate: false,
            interval: 1,
            nextReview: new Date().toISOString()
        });
    },

    // Get stack counts
    getStackCounts(vocabulary, progress) {
        let unlearned = 0;
        let learning = 0;
        let known = 0;

        vocabulary.forEach(word => {
            const wordProgress = progress[word.id];
            if (!wordProgress || wordProgress.stack === 'unlearned') {
                unlearned++;
            } else if (wordProgress.stack === 'learning') {
                learning++;
            } else if (wordProgress.stack === 'known') {
                known++;
            }
        });

        return { unlearned, learning, known, total: vocabulary.length };
    },

    // Get words by stack
    getWordsByStack(vocabulary, progress, stack) {
        return vocabulary.filter(word => {
            const wordProgress = progress[word.id];
            if (stack === 'unlearned') {
                return !wordProgress || wordProgress.stack === 'unlearned';
            }
            return wordProgress && wordProgress.stack === stack;
        }).map(word => ({
            ...word,
            progress: progress[word.id] || { stack: 'unlearned' }
        }));
    }
};

// Make available globally
window.SRS = SRS;
