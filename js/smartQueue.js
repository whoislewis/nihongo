// Smart Study Queue
// Intelligent session building based on learning stage and dependencies

const SmartQueue = {
    // Session composition ratios
    RATIOS: {
        reviews: 0.70,      // 70% due reviews
        newItems: 0.30      // 30% new learnable items
    },

    // Minimum Heisig kanji required before vocabulary unlocks
    MIN_HEISIG_FOR_VOCAB: 50,

    // Build a smart study session based on current stage
    buildSession(vocabulary, progress, settings, stageProgress, foundationProgress) {
        const currentStage = stageProgress?.currentStage || 'kana_mastery';
        const unifiedProgress = Storage.getUnifiedProgress();
        const heisigCount = this.getLearnedHeisigCount(unifiedProgress);

        // Stage 1: Kana Mastery
        if (!this.isKanaMasteryComplete(foundationProgress)) {
            return this.buildFoundationsSession(foundationProgress);
        }

        // Stage 2: Heisig Kanji - MUST learn minimum kanji before vocabulary
        // This enforces the Heisig methodology: learn kanji meanings first
        if (heisigCount < this.MIN_HEISIG_FOR_VOCAB) {
            return this.buildHeisigSession(unifiedProgress, settings, heisigCount);
        }

        // Stage 3+: Mixed vocabulary/kanji/grammar session (only after 50+ Heisig kanji)
        return this.buildMixedSession(vocabulary, progress, settings, unifiedProgress, stageProgress);
    },

    // Check if KANA ONLY is complete (both hiragana AND katakana at 100%)
    isKanaMasteryComplete(foundationProgress) {
        // Use the new individual kana mastery tracking system
        const kanaMastery = Storage.getKanaMastery();
        return kanaMastery.hiraganaComplete && kanaMastery.katakanaComplete;
    },

    // Check if foundations stage is complete (kana mastery only - no grammar/kanji intro required)
    isFoundationsComplete(foundationProgress) {
        // Now just checks kana mastery since that's stage 1
        return this.isKanaMasteryComplete(foundationProgress);
    },

    // Check if Heisig kanji stage is complete (300 kanji milestone)
    isHeisigComplete(unifiedProgress) {
        const learnedCount = this.getLearnedHeisigCount(unifiedProgress);
        return learnedCount >= 300;
    },

    // Get count of Heisig kanji learned
    getLearnedHeisigCount(unifiedProgress) {
        if (!unifiedProgress) {
            unifiedProgress = Storage.getUnifiedProgress();
        }

        let count = 0;
        Object.entries(unifiedProgress).forEach(([key, data]) => {
            if (key.startsWith('heisig_') && (data.stack === 'learning' || data.stack === 'known')) {
                count++;
            }
        });
        return count;
    },

    // Build foundations learning session
    buildFoundationsSession(foundationProgress) {
        const session = {
            type: 'foundations',
            items: []
        };

        // CRITICAL: Check if kana is complete (BOTH hiragana AND katakana at 100%)
        const kanaComplete = this.isKanaMasteryComplete(foundationProgress);

        // If kana is NOT complete, ONLY show kana practice - nothing else!
        if (!kanaComplete) {
            session.items.push({
                type: 'kana_practice',
                id: 'kana_quiz',
                title: 'Kana Practice',
                description: 'Master hiragana and katakana (both at 100%) to unlock more content',
                hiraganaScore: foundationProgress?.kana?.hiraganaScore || 0,
                katakanaScore: foundationProgress?.kana?.katakanaScore || 0
            });

            session.totalItems = 1;
            return session;
        }

        // ONLY AFTER kana is complete: add grammar and kanji intro cards
        const grammarViewed = foundationProgress?.grammarIntro?.viewedCards || [];
        const kanjiViewed = foundationProgress?.kanjiIntro?.viewedCards || [];

        if (typeof FOUNDATION_MODULES !== 'undefined') {
            // Add unviewed grammar intro cards
            const grammarCards = FOUNDATION_MODULES.grammar_intro.cards;
            grammarCards.forEach(card => {
                if (!grammarViewed.includes(card.id)) {
                    session.items.push({
                        type: 'grammar_intro',
                        ...card
                    });
                }
            });

            // Add unviewed kanji intro cards
            const kanjiCards = FOUNDATION_MODULES.kanji_intro.cards;
            kanjiCards.forEach(card => {
                if (!kanjiViewed.includes(card.id)) {
                    session.items.push({
                        type: 'kanji_intro',
                        ...card
                    });
                }
            });
        }

        // Limit session size
        session.items = session.items.slice(0, 10);
        session.totalItems = session.items.length;

        return session;
    },

    // Build Heisig kanji learning session (primitives first, then compounds)
    buildHeisigSession(unifiedProgress, settings, currentHeisigCount = 0) {
        const session = {
            type: 'heisig',
            items: [],
            heisigCount: currentHeisigCount,
            vocabUnlockAt: this.MIN_HEISIG_FOR_VOCAB
        };

        // Get Heisig kanji in book order from HEISIG_DATA
        if (typeof HEISIG_DATA !== 'undefined') {
            const allHeisig = HEISIG_DATA.kanji || [];

            // Get unlearned kanji (maintaining book order - this is CRITICAL for Heisig method)
            const unlearnedHeisig = allHeisig.filter(kanji => {
                const progress = unifiedProgress[`heisig_${kanji.kanji}`];
                return !progress || progress.stack === 'unlearned';
            });

            // Get kanji that are due for review
            const dueReviews = allHeisig.filter(kanji => {
                const progress = unifiedProgress[`heisig_${kanji.kanji}`];
                return progress && progress.stack === 'learning' &&
                    progress.nextReview && new Date(progress.nextReview) <= new Date();
            });

            // Add due reviews first
            dueReviews.forEach(kanji => {
                session.items.push({
                    type: 'heisig_review',
                    ...kanji,
                    progress: unifiedProgress[`heisig_${kanji.kanji}`]
                });
            });

            // Add new kanji in book order (primitives come first in Heisig order)
            const newCount = Math.min(settings.dailyNewWords || 5, unlearnedHeisig.length);
            unlearnedHeisig.slice(0, newCount).forEach(kanji => {
                session.items.push({
                    type: 'heisig_new',
                    ...kanji,
                    isNew: true
                });
            });
        }

        session.totalItems = session.items.length;
        return session;
    },

    // Build mixed vocabulary/kanji/grammar session
    buildMixedSession(vocabulary, progress, settings, unifiedProgress, stageProgress) {
        const session = {
            type: 'mixed',
            items: []
        };

        // 1. Get due reviews (70% of session)
        const dueReviews = this.getDueReviews(vocabulary, progress, unifiedProgress, settings);
        const reviewCount = Math.ceil(settings.dailyNewWords * (this.RATIOS.reviews / this.RATIOS.newItems));
        const selectedReviews = this.shuffleArray(dueReviews).slice(0, reviewCount);

        selectedReviews.forEach(item => {
            session.items.push({
                type: `${item.itemType}_review`,
                ...item,
                isReview: true
            });
        });

        // 2. Get new vocabulary with satisfied dependencies (30%)
        const newItemCount = settings.dailyNewWords || 10;
        const stats = Storage.getStats();
        const remaining = Math.max(0, newItemCount - (stats.todayNewWords || 0));

        if (remaining > 0) {
            const learnableVocab = DependencyGraph.getLearnableItems(
                'vocabulary',
                vocabulary,
                unifiedProgress,
                settings
            );

            // Sort by dependency satisfaction and frequency
            const sortedVocab = DependencyGraph.sortByDependencies(
                learnableVocab.slice(0, remaining * 2), // Get extra for filtering
                unifiedProgress,
                settings
            );

            sortedVocab.slice(0, remaining).forEach(word => {
                session.items.push({
                    type: 'vocabulary_new',
                    ...word,
                    isNew: true,
                    itemType: 'vocabulary'
                });
            });
        }

        // 3. Inject contextual grammar (if word uses relevant pattern)
        session.items = this.injectContextualGrammar(session.items, stageProgress);

        session.totalItems = session.items.length;
        return session;
    },

    // Get all due reviews across item types
    getDueReviews(vocabulary, progress, unifiedProgress, settings) {
        const dueItems = [];
        const now = new Date();

        // Vocabulary reviews
        vocabulary.forEach(word => {
            const wordProgress = progress[word.id] || unifiedProgress[`vocabulary_${word.id}`];
            if (wordProgress && wordProgress.stack === 'learning') {
                const nextReview = wordProgress.nextReview ? new Date(wordProgress.nextReview) : now;
                if (nextReview <= now) {
                    dueItems.push({
                        ...word,
                        progress: wordProgress,
                        itemType: 'vocabulary',
                        overdueDays: Math.floor((now - nextReview) / (1000 * 60 * 60 * 24))
                    });
                }
            }
        });

        // Radical reviews
        if (typeof PRIORITY_RADICALS !== 'undefined') {
            PRIORITY_RADICALS.getAll().forEach(radical => {
                const radicalProgress = unifiedProgress[`radical_${radical.char}`];
                if (radicalProgress && radicalProgress.stack === 'learning') {
                    const nextReview = radicalProgress.nextReview ? new Date(radicalProgress.nextReview) : now;
                    if (nextReview <= now) {
                        const fullData = RADICALS_DATA?.radicals.find(r => r.char === radical.char);
                        dueItems.push({
                            ...radical,
                            ...(fullData || {}),
                            progress: radicalProgress,
                            itemType: 'radical',
                            overdueDays: Math.floor((now - nextReview) / (1000 * 60 * 60 * 24))
                        });
                    }
                }
            });
        }

        // Sort by overdue days (most overdue first)
        return dueItems.sort((a, b) => b.overdueDays - a.overdueDays);
    },

    // Inject contextual grammar when vocabulary uses relevant pattern
    injectContextualGrammar(items, stageProgress) {
        // Grammar patterns that can be detected in vocabulary
        const grammarPatterns = [
            { pattern: /ます$/, id: 'masu_form', title: 'Polite Form (ます)' },
            { pattern: /ている/, id: 'te_iru', title: 'Progressive/State (ている)' },
            { pattern: /たい$/, id: 'tai_form', title: 'Want to (たい)' },
            { pattern: /ない$/, id: 'nai_form', title: 'Negative Form (ない)' },
            { pattern: /れる$|られる$/, id: 'potential', title: 'Potential Form' },
            { pattern: /させる$/, id: 'causative', title: 'Causative Form' }
        ];

        const result = [];
        const injectedPatterns = new Set();

        items.forEach((item, index) => {
            result.push(item);

            // Check if vocabulary word uses a grammar pattern
            if (item.type === 'vocabulary_new' && item.word) {
                grammarPatterns.forEach(gp => {
                    if (gp.pattern.test(item.word) && !injectedPatterns.has(gp.id)) {
                        // Check if user has seen this pattern recently
                        const grammarProgress = Storage.getItemProgress(gp.id, 'grammar');
                        if (!grammarProgress || grammarProgress.stack === 'unlearned') {
                            result.push({
                                type: 'grammar_contextual',
                                ...gp,
                                contextWord: item.word,
                                contextMeaning: item.meaning
                            });
                            injectedPatterns.add(gp.id);
                        }
                    }
                });
            }
        });

        return result;
    },

    // Get session summary
    getSessionSummary(session) {
        const summary = {
            total: session.items.length,
            reviews: 0,
            newItems: 0,
            radicals: 0,
            vocabulary: 0,
            grammar: 0,
            kanji: 0
        };

        session.items.forEach(item => {
            if (item.isReview) summary.reviews++;
            if (item.isNew) summary.newItems++;
            if (item.type.includes('radical')) summary.radicals++;
            if (item.type.includes('vocabulary')) summary.vocabulary++;
            if (item.type.includes('grammar')) summary.grammar++;
            if (item.type.includes('kanji')) summary.kanji++;
        });

        return summary;
    },

    // Shuffle array (Fisher-Yates)
    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    },

    // Get quick study stats for dashboard
    getQuickStats(vocabulary, progress, settings) {
        const stageProgress = Storage.getStageProgress();
        const foundationProgress = Storage.getFoundationProgress();
        const unifiedProgress = Storage.getUnifiedProgress();

        const dueReviews = this.getDueReviews(vocabulary, progress, unifiedProgress, settings);
        const learnableVocab = DependencyGraph.getLearnableItems('vocabulary', vocabulary, unifiedProgress, settings);

        return {
            currentStage: stageProgress.currentStage,
            dueReviews: dueReviews.length,
            newAvailable: learnableVocab.length,
            heisigLearned: this.getLearnedHeisigCount(unifiedProgress),
            kanaMasteryComplete: this.isKanaMasteryComplete(foundationProgress),
            heisigComplete: this.isHeisigComplete(unifiedProgress)
        };
    }
};

// Make available globally
window.SmartQueue = SmartQueue;
