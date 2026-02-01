// Dependency Graph System
// Manages vocabulary → kanji → radical dependency chains

const DependencyGraph = {
    // Cache for performance
    _cache: {
        vocabDependencies: new Map(),
        kanjiComponents: new Map()
    },

    // Extract kanji from a word
    extractKanji(word) {
        if (!word) return [];
        const kanjiRegex = /[\u4e00-\u9faf]/g;
        return [...new Set(word.match(kanjiRegex) || [])];
    },

    // Get kanji components (radicals) from kanjiApi
    getKanjiComponents(kanji) {
        if (this._cache.kanjiComponents.has(kanji)) {
            return this._cache.kanjiComponents.get(kanji);
        }

        // Try to get from KanjiAPI if available
        if (typeof KanjiAPI !== 'undefined' && KanjiAPI.getRadicalInfo) {
            const info = KanjiAPI.getRadicalInfo(kanji);
            if (info && info.components) {
                this._cache.kanjiComponents.set(kanji, info.components);
                return info.components;
            }
        }

        // Fallback: try to find in RADICALS_DATA
        if (typeof RADICALS_DATA !== 'undefined') {
            const radical = RADICALS_DATA.radicals.find(r =>
                r.examples && r.examples.includes(kanji)
            );
            if (radical) {
                const components = [radical.char];
                this._cache.kanjiComponents.set(kanji, components);
                return components;
            }
        }

        this._cache.kanjiComponents.set(kanji, []);
        return [];
    },

    // Build dependency chain for a vocabulary word
    buildVocabDependencies(word) {
        const cacheKey = word.id || word.word;
        if (this._cache.vocabDependencies.has(cacheKey)) {
            return this._cache.vocabDependencies.get(cacheKey);
        }

        const dependencies = {
            kanji: [],
            radicals: new Set()
        };

        // Extract kanji from the word
        const kanjiChars = this.extractKanji(word.word);
        dependencies.kanji = kanjiChars;

        // Get radicals for each kanji
        kanjiChars.forEach(kanji => {
            const components = this.getKanjiComponents(kanji);
            components.forEach(comp => dependencies.radicals.add(comp));
        });

        const result = {
            kanji: dependencies.kanji,
            radicals: [...dependencies.radicals]
        };

        this._cache.vocabDependencies.set(cacheKey, result);
        return result;
    },

    // Check if all dependencies for an item are satisfied
    canLearn(itemId, itemType, unifiedProgress, settings) {
        // If soft dependencies are enabled, always return true (but show warnings)
        if (settings && settings.softDependencies) {
            return { canLearn: true, soft: true, missing: this.getMissingDependencies(itemId, itemType, unifiedProgress) };
        }

        const missing = this.getMissingDependencies(itemId, itemType, unifiedProgress);
        return {
            canLearn: missing.radicals.length === 0 && missing.kanji.length === 0,
            soft: false,
            missing
        };
    },

    // Get missing dependencies for an item
    getMissingDependencies(itemId, itemType, unifiedProgress) {
        const missing = { kanji: [], radicals: [] };

        if (itemType === 'vocabulary') {
            // For vocabulary, check if kanji radicals are learned
            const word = this.findVocabWord(itemId);
            if (!word) return missing;

            const deps = this.buildVocabDependencies(word);

            // Check radicals (for priority radicals only)
            deps.radicals.forEach(radical => {
                if (typeof PRIORITY_RADICALS !== 'undefined' && PRIORITY_RADICALS.isPriority(radical)) {
                    const radicalProgress = unifiedProgress[`radical_${radical}`];
                    if (!radicalProgress || radicalProgress.stack === 'unlearned') {
                        missing.radicals.push(radical);
                    }
                }
            });
        } else if (itemType === 'kanji') {
            // For kanji, check if component radicals are learned
            const components = this.getKanjiComponents(itemId);
            components.forEach(comp => {
                if (typeof PRIORITY_RADICALS !== 'undefined' && PRIORITY_RADICALS.isPriority(comp)) {
                    const radicalProgress = unifiedProgress[`radical_${comp}`];
                    if (!radicalProgress || radicalProgress.stack === 'unlearned') {
                        missing.radicals.push(comp);
                    }
                }
            });
        }

        return missing;
    },

    // Find vocabulary word by ID
    findVocabWord(wordId) {
        if (typeof VOCABULARY_DATA === 'undefined') return null;
        return VOCABULARY_DATA.find(w => w.id === wordId || w.id === parseInt(wordId));
    },

    // Get all learnable items (items with satisfied dependencies)
    getLearnableItems(itemType, vocabulary, unifiedProgress, settings) {
        const learnable = [];

        if (itemType === 'vocabulary') {
            vocabulary.forEach(word => {
                const wordProgress = unifiedProgress[`vocabulary_${word.id}`];
                if (!wordProgress || wordProgress.stack === 'unlearned') {
                    const canLearnResult = this.canLearn(word.id, 'vocabulary', unifiedProgress, settings);
                    if (canLearnResult.canLearn) {
                        learnable.push({
                            ...word,
                            dependencies: this.buildVocabDependencies(word),
                            missingDependencies: canLearnResult.missing,
                            softDependency: canLearnResult.soft
                        });
                    }
                }
            });
        } else if (itemType === 'radical') {
            // All priority radicals are learnable (no dependencies)
            if (typeof PRIORITY_RADICALS !== 'undefined') {
                PRIORITY_RADICALS.getAll().forEach(radical => {
                    const radicalProgress = unifiedProgress[`radical_${radical.char}`];
                    if (!radicalProgress || radicalProgress.stack === 'unlearned') {
                        learnable.push({
                            ...radical,
                            dependencies: { kanji: [], radicals: [] }
                        });
                    }
                });
            }
        }

        return learnable;
    },

    // Get words that use a specific kanji
    getWordsWithKanji(kanji, vocabulary) {
        return vocabulary.filter(word => word.word.includes(kanji));
    },

    // Get words that use a specific radical
    getWordsWithRadical(radical, vocabulary) {
        return vocabulary.filter(word => {
            const deps = this.buildVocabDependencies(word);
            return deps.radicals.includes(radical);
        });
    },

    // Sort vocabulary by dependency satisfaction (learnable first)
    sortByDependencies(vocabulary, unifiedProgress, settings) {
        return [...vocabulary].sort((a, b) => {
            const aMissing = this.getMissingDependencies(a.id, 'vocabulary', unifiedProgress);
            const bMissing = this.getMissingDependencies(b.id, 'vocabulary', unifiedProgress);

            const aCount = aMissing.radicals.length + aMissing.kanji.length;
            const bCount = bMissing.radicals.length + bMissing.kanji.length;

            // Sort by number of missing dependencies (fewer = higher priority)
            if (aCount !== bCount) return aCount - bCount;

            // Then by frequency (if available)
            return (a.frequency || 9999) - (b.frequency || 9999);
        });
    },

    // Clear cache
    clearCache() {
        this._cache.vocabDependencies.clear();
        this._cache.kanjiComponents.clear();
    },

    // Get dependency statistics
    getStats(vocabulary, unifiedProgress) {
        let totalWords = vocabulary.length;
        let learnableNow = 0;
        let blocked = 0;
        let missingRadicals = new Set();

        vocabulary.forEach(word => {
            const wordProgress = unifiedProgress[`vocabulary_${word.id}`];
            if (!wordProgress || wordProgress.stack === 'unlearned') {
                const missing = this.getMissingDependencies(word.id, 'vocabulary', unifiedProgress);
                if (missing.radicals.length === 0 && missing.kanji.length === 0) {
                    learnableNow++;
                } else {
                    blocked++;
                    missing.radicals.forEach(r => missingRadicals.add(r));
                }
            }
        });

        return {
            totalWords,
            learnableNow,
            blocked,
            uniqueMissingRadicals: missingRadicals.size,
            missingRadicals: [...missingRadicals]
        };
    }
};

// Make available globally
window.DependencyGraph = DependencyGraph;
