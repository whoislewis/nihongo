// Stage Manager
// Handles stage unlock logic, progress tracking, and stage transitions

const StageManager = {
    // Get the currently active stage
    getActiveStage(progress) {
        const stageProgress = progress || Storage.getStageProgress();
        return stageProgress.currentStage || 'kana_mastery';
    },

    // Check if a specific stage is complete
    isStageComplete(stageId) {
        const stageProgress = Storage.getStageProgress();
        const foundationProgress = Storage.getFoundationProgress();
        const unifiedProgress = Storage.getUnifiedProgress();
        const wordProgress = Storage.getWordProgress();

        switch (stageId) {
            case 'kana_mastery':
                // Kana mastery is complete when both hiragana AND katakana are 100%
                const kanaMastery = Storage.getKanaMastery();
                return kanaMastery.hiraganaComplete && kanaMastery.katakanaComplete;

            case 'heisig_kanji':
                // Heisig stage complete when 300+ kanji learned via Heisig method
                return this.getLearnedHeisigCount(unifiedProgress) >= 300;

            case 'vocabulary_building':
                // Progressive stage - never truly "complete" but milestone at 1500
                return this.getKnownWordsCount(wordProgress) >= 1500;

            case 'grammar_mastery':
                // Unlocks at 50 words, completes when all patterns learned
                return false; // Can define completion criteria later

            default:
                return false;
        }
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
            case 'kana_mastery':
                return this.getKanaMasteryProgress();

            case 'heisig_kanji':
                const heisigLearned = this.getLearnedHeisigCount(unifiedProgress);
                return {
                    percent: Math.round((heisigLearned / 300) * 100),
                    current: heisigLearned,
                    target: 300,
                    details: {
                        learned: heisigLearned,
                        remaining: Math.max(0, 300 - heisigLearned)
                    }
                };

            case 'vocabulary_building':
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

            case 'grammar_mastery':
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

    // Get kana mastery progress using new individual character tracking
    getKanaMasteryProgress() {
        const kanaMastery = Storage.getKanaMastery();

        const totalMastered = kanaMastery.hiraganaCount + kanaMastery.katakanaCount;
        const totalRequired = 92; // 46 hiragana + 46 katakana
        const percent = Math.round((totalMastered / totalRequired) * 100);

        return {
            percent: percent,
            current: totalMastered,
            target: totalRequired,
            details: {
                hiragana: {
                    count: kanaMastery.hiraganaCount,
                    total: 46,
                    percent: kanaMastery.hiraganaPercent,
                    complete: kanaMastery.hiraganaComplete
                },
                katakana: {
                    count: kanaMastery.katakanaCount,
                    total: 46,
                    percent: kanaMastery.katakanaPercent,
                    complete: kanaMastery.katakanaComplete
                },
                totalComplete: kanaMastery.totalComplete
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
            case 'kana_mastery':
                const kanaDetails = stageProgress.details;
                if (!kanaDetails.totalComplete) {
                    const hiraganaRemaining = 46 - kanaDetails.hiragana.count;
                    const katakanaRemaining = 46 - kanaDetails.katakana.count;
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
                return { text: 'Kana mastery complete!', type: 'complete' };

            case 'heisig_kanji':
                const heisigRemaining = 300 - stageProgress.current;
                if (heisigRemaining > 0) {
                    return { text: `Learn ${heisigRemaining} more kanji`, type: 'kanji' };
                }
                return { text: 'Heisig foundation complete!', type: 'complete' };

            case 'vocabulary_building':
                const nextGoal = Math.ceil(stageProgress.current / 100) * 100 + 100;
                return { text: `Reach ${nextGoal} words known`, type: 'vocabulary' };

            case 'grammar_mastery':
                return { text: 'Continue learning grammar patterns', type: 'grammar' };

            default:
                return { text: 'Keep learning!', type: 'general' };
        }
    }
};

// Make available globally
window.StageManager = StageManager;
