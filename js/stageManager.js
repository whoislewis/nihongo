// Stage Manager
// Handles stage unlock logic, progress tracking, and stage transitions

const StageManager = {
    // Get the currently active stage
    getActiveStage(progress) {
        const stageProgress = progress || Storage.getStageProgress();
        return stageProgress.currentStage || 'foundations';
    },

    // Check if a specific stage is complete
    isStageComplete(stageId) {
        const stageProgress = Storage.getStageProgress();
        const foundationProgress = Storage.getFoundationProgress();
        const unifiedProgress = Storage.getUnifiedProgress();
        const wordProgress = Storage.getWordProgress();

        switch (stageId) {
            case 'foundations':
                return this.isFoundationsComplete(foundationProgress);

            case 'core_radicals':
                return this.isCoreRadicalsComplete(unifiedProgress);

            case 'vocabulary_kanji':
                // Progressive stage - never truly "complete"
                return this.getKnownWordsCount(wordProgress) >= 1500;

            case 'advanced_grammar':
                // Unlocks at 100 words, completes when all patterns learned
                return false; // Can define completion criteria later

            default:
                return false;
        }
    },

    // Check foundations completion - uses new individual kana mastery
    isFoundationsComplete(foundationProgress) {
        if (!foundationProgress) {
            foundationProgress = Storage.getFoundationProgress();
        }

        // Use new kana mastery system - both must be 100%
        const kanaMastery = Storage.getKanaMastery();
        const kanaComplete = kanaMastery.hiraganaComplete && kanaMastery.katakanaComplete;

        // Grammar and kanji intro only count AFTER kana is complete
        if (!kanaComplete) return false;

        const grammarComplete = foundationProgress.grammarIntro?.completed;
        const kanjiIntroComplete = foundationProgress.kanjiIntro?.completed;

        return kanaComplete && grammarComplete && kanjiIntroComplete;
    },

    // Check core radicals completion
    isCoreRadicalsComplete(unifiedProgress) {
        const learnedCount = this.getLearnedRadicalsCount(unifiedProgress);
        return learnedCount >= 50;
    },

    // Get learned radicals count
    getLearnedRadicalsCount(unifiedProgress) {
        if (!unifiedProgress) {
            unifiedProgress = Storage.getUnifiedProgress();
        }

        let count = 0;
        Object.entries(unifiedProgress).forEach(([key, data]) => {
            if (key.startsWith('radical_') && (data.stack === 'learning' || data.stack === 'known')) {
                count++;
            }
        });
        return count;
    },

    // Get known words count
    getKnownWordsCount(wordProgress) {
        if (!wordProgress) {
            wordProgress = Storage.getWordProgress();
        }

        return Object.values(wordProgress).filter(p => p.stack === 'known').length;
    },

    // Get learning words count
    getLearningWordsCount(wordProgress) {
        if (!wordProgress) {
            wordProgress = Storage.getWordProgress();
        }

        return Object.values(wordProgress).filter(p => p.stack === 'learning').length;
    },

    // Get all unlocked stages
    getUnlockedStages(progress) {
        const stages = LEARNING_STAGES.getOrderedStages();
        const unlocked = [];

        stages.forEach(stage => {
            if (this.isStageUnlocked(stage.id)) {
                unlocked.push(stage.id);
            }
        });

        return unlocked;
    },

    // Check if a stage is unlocked
    isStageUnlocked(stageId) {
        const stage = LEARNING_STAGES.getStage(stageId);
        if (!stage) return false;

        // First stage is always unlocked
        if (stage.order === 1) return true;

        // Check prerequisite
        if (stage.prerequisite) {
            if (!this.isStageComplete(stage.prerequisite)) {
                // Check for parallel unlock
                if (stage.parallelWith) {
                    const parallelStage = LEARNING_STAGES.getStage(stage.parallelWith);
                    if (parallelStage && this.isStageComplete(parallelStage.prerequisite)) {
                        // Check unlock threshold
                        if (stage.unlockAt) {
                            const wordProgress = Storage.getWordProgress();
                            const wordsLearned = this.getLearningWordsCount(wordProgress) +
                                this.getKnownWordsCount(wordProgress);
                            return wordsLearned >= stage.unlockAt;
                        }
                    }
                }
                return false;
            }
        }

        return true;
    },

    // Get progress percentage for a stage
    getStageProgress(stageId) {
        const foundationProgress = Storage.getFoundationProgress();
        const unifiedProgress = Storage.getUnifiedProgress();
        const wordProgress = Storage.getWordProgress();

        switch (stageId) {
            case 'foundations':
                return this.getFoundationsProgress(foundationProgress);

            case 'core_radicals':
                const radicalsLearned = this.getLearnedRadicalsCount(unifiedProgress);
                return {
                    percent: Math.round((radicalsLearned / 50) * 100),
                    current: radicalsLearned,
                    target: 50,
                    details: {
                        learned: radicalsLearned,
                        remaining: Math.max(0, 50 - radicalsLearned)
                    }
                };

            case 'vocabulary_kanji':
                const wordsKnown = this.getKnownWordsCount(wordProgress);
                const wordsLearning = this.getLearningWordsCount(wordProgress);
                return {
                    percent: Math.round((wordsKnown / 1500) * 100),
                    current: wordsKnown,
                    target: 1500,
                    details: {
                        known: wordsKnown,
                        learning: wordsLearning,
                        total: wordsKnown + wordsLearning
                    }
                };

            case 'advanced_grammar':
                // Can be expanded with grammar tracking
                return {
                    percent: 0,
                    current: 0,
                    target: 100,
                    details: {}
                };

            default:
                return { percent: 0, current: 0, target: 100 };
        }
    },

    // Get detailed foundations progress - uses new individual kana mastery
    getFoundationsProgress(foundationProgress) {
        if (!foundationProgress) {
            foundationProgress = Storage.getFoundationProgress();
        }

        // Use new kana mastery system
        const kanaMastery = Storage.getKanaMastery();
        const grammarViewed = foundationProgress.grammarIntro?.viewedCards?.length || 0;
        const kanjiViewed = foundationProgress.kanjiIntro?.viewedCards?.length || 0;

        // Calculate kana progress (both must be 100%)
        const hiraganaProgress = kanaMastery.hiraganaPercent / 100;  // 0-1
        const katakanaProgress = kanaMastery.katakanaPercent / 100;  // 0-1
        const kanaProgress = (hiraganaProgress + katakanaProgress) / 2;  // Average

        // Kana is 60% of foundations, grammar and kanji intro split remaining 40%
        // But only count grammar/kanji if kana is complete
        let overallPercent;
        if (!kanaMastery.totalComplete) {
            // Kana not complete - show just kana progress (scaled to 60%)
            overallPercent = Math.round(kanaProgress * 60);
        } else {
            // Kana complete - include grammar and kanji intro
            const grammarProgress = grammarViewed / 6;  // 0-1
            const kanjiProgress = kanjiViewed / 6;  // 0-1
            overallPercent = Math.round(
                60 + (grammarProgress * 20) + (kanjiProgress * 20)
            );
        }

        return {
            percent: overallPercent,
            current: overallPercent,
            target: 100,
            details: {
                kana: {
                    hiraganaCount: kanaMastery.hiraganaCount,
                    katakanaCount: kanaMastery.katakanaCount,
                    hiraganaPercent: kanaMastery.hiraganaPercent,
                    katakanaPercent: kanaMastery.katakanaPercent,
                    complete: kanaMastery.totalComplete
                },
                grammar: {
                    viewed: grammarViewed,
                    total: 6,
                    complete: grammarViewed >= 6
                },
                kanjiIntro: {
                    viewed: kanjiViewed,
                    total: 6,
                    complete: kanjiViewed >= 6
                }
            }
        };
    },

    // Get status for a stage (locked, active, complete)
    getStageStatus(stageId) {
        if (!this.isStageUnlocked(stageId)) {
            return LEARNING_STAGES.STATUS.LOCKED;
        }

        if (this.isStageComplete(stageId)) {
            return LEARNING_STAGES.STATUS.COMPLETE;
        }

        const stageProgress = Storage.getStageProgress();
        if (stageProgress.currentStage === stageId) {
            return LEARNING_STAGES.STATUS.ACTIVE;
        }

        // Unlocked but not current - still active if previous is complete
        const stage = LEARNING_STAGES.getStage(stageId);
        if (stage && stage.prerequisite && this.isStageComplete(stage.prerequisite)) {
            return LEARNING_STAGES.STATUS.ACTIVE;
        }

        return LEARNING_STAGES.STATUS.ACTIVE;
    },

    // Advance to next stage if current is complete
    checkAndAdvanceStage() {
        const stageProgress = Storage.getStageProgress();
        const currentStage = stageProgress.currentStage;

        if (this.isStageComplete(currentStage)) {
            // Mark current as complete
            if (!stageProgress.completedStages.includes(currentStage)) {
                stageProgress.completedStages.push(currentStage);
            }

            // Get next stage
            const nextStage = LEARNING_STAGES.getNextStage(currentStage);
            if (nextStage && this.isStageUnlocked(nextStage.id)) {
                stageProgress.currentStage = nextStage.id;
            }

            Storage.saveStageProgress(stageProgress);
            return nextStage?.id || currentStage;
        }

        return currentStage;
    },

    // Get all stages with their status and progress
    getAllStagesStatus() {
        return LEARNING_STAGES.getOrderedStages().map(stage => ({
            ...stage,
            status: this.getStageStatus(stage.id),
            progress: this.getStageProgress(stage.id),
            unlocked: this.isStageUnlocked(stage.id),
            complete: this.isStageComplete(stage.id)
        }));
    },

    // Get summary for dashboard
    getDashboardSummary() {
        const stages = this.getAllStagesStatus();
        const currentStage = this.getActiveStage();
        const currentStageData = stages.find(s => s.id === currentStage);

        return {
            currentStage: currentStageData,
            allStages: stages,
            completedCount: stages.filter(s => s.complete).length,
            totalStages: stages.length,
            nextMilestone: this.getNextMilestone(currentStage)
        };
    },

    // Get next milestone for motivation
    getNextMilestone(currentStageId) {
        const stageProgress = this.getStageProgress(currentStageId);

        switch (currentStageId) {
            case 'foundations':
                const foundDetails = stageProgress.details;
                // Check kana first (both must be 100%)
                if (!foundDetails.kana.complete) {
                    const hiraganaRemaining = 46 - foundDetails.kana.hiraganaCount;
                    const katakanaRemaining = 46 - foundDetails.kana.katakanaCount;
                    if (hiraganaRemaining > 0 && katakanaRemaining > 0) {
                        return {
                            text: `Master ${hiraganaRemaining} hiragana + ${katakanaRemaining} katakana`,
                            type: 'kana'
                        };
                    } else if (hiraganaRemaining > 0) {
                        return { text: `Master ${hiraganaRemaining} more hiragana`, type: 'kana' };
                    } else {
                        return { text: `Master ${katakanaRemaining} more katakana`, type: 'kana' };
                    }
                }
                if (!foundDetails.grammar.complete) {
                    return { text: `View ${6 - foundDetails.grammar.viewed} more grammar cards`, type: 'grammar' };
                }
                if (!foundDetails.kanjiIntro.complete) {
                    return { text: `View ${6 - foundDetails.kanjiIntro.viewed} more kanji intro cards`, type: 'kanji' };
                }
                return { text: 'Foundations complete!', type: 'complete' };

            case 'core_radicals':
                const remaining = 50 - stageProgress.current;
                return { text: `Learn ${remaining} more radicals`, type: 'radicals' };

            case 'vocabulary_kanji':
                const nextGoal = Math.ceil(stageProgress.current / 100) * 100 + 100;
                return { text: `Reach ${nextGoal} words known`, type: 'vocabulary' };

            default:
                return { text: 'Keep learning!', type: 'general' };
        }
    }
};

// Make available globally
window.StageManager = StageManager;
