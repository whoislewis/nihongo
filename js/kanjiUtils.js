// Kanji Utilities - Extract and organize kanji from vocabulary

const KanjiUtils = {
    // Regex to match kanji characters
    kanjiRegex: /[\u4e00-\u9faf\u3400-\u4dbf]/g,

    // Extract all unique kanji from vocabulary
    extractKanjiFromVocabulary(vocabulary) {
        const kanjiMap = new Map(); // kanji -> { firstWordIndex, words: [], count }

        vocabulary.forEach((word, index) => {
            const kanji = word.word.match(this.kanjiRegex) || [];
            kanji.forEach(k => {
                if (!kanjiMap.has(k)) {
                    kanjiMap.set(k, {
                        kanji: k,
                        firstWordIndex: index,
                        words: [],
                        count: 0
                    });
                }
                const entry = kanjiMap.get(k);
                if (!entry.words.find(w => w.id === word.id)) {
                    entry.words.push(word);
                }
                entry.count++;
            });
        });

        // Sort by first appearance
        return Array.from(kanjiMap.values())
            .sort((a, b) => a.firstWordIndex - b.firstWordIndex);
    },

    // Get kanji ordered by component dependencies (topological sort)
    getOrderedKanji(kanjiList, componentsData) {
        // Build dependency graph
        const graph = new Map();
        const inDegree = new Map();

        kanjiList.forEach(k => {
            const kanji = k.kanji;
            graph.set(kanji, []);
            inDegree.set(kanji, 0);
        });

        // Add edges based on components
        kanjiList.forEach(k => {
            const components = componentsData[k.kanji] || [];
            components.forEach(comp => {
                if (graph.has(comp)) {
                    graph.get(comp).push(k.kanji);
                    inDegree.set(k.kanji, (inDegree.get(k.kanji) || 0) + 1);
                }
            });
        });

        // Topological sort with stable ordering by first appearance
        const result = [];
        const queue = kanjiList
            .filter(k => inDegree.get(k.kanji) === 0)
            .map(k => k.kanji);

        while (queue.length > 0) {
            const kanji = queue.shift();
            result.push(kanji);

            (graph.get(kanji) || []).forEach(dependent => {
                inDegree.set(dependent, inDegree.get(dependent) - 1);
                if (inDegree.get(dependent) === 0) {
                    queue.push(dependent);
                }
            });
        }

        // Add any remaining kanji (cycles or disconnected)
        kanjiList.forEach(k => {
            if (!result.includes(k.kanji)) {
                result.push(k.kanji);
            }
        });

        return result;
    },

    // Find which radicals are used in a kanji
    getRadicalsForKanji(kanji, radicalsData) {
        const usedRadicals = [];
        radicalsData.radicals.forEach(radical => {
            if (radical.examples && radical.examples.includes(kanji)) {
                usedRadicals.push(radical);
            }
        });
        return usedRadicals;
    },

    // Find all kanji containing a specific radical
    getKanjiWithRadical(radical, kanjiList) {
        return kanjiList.filter(k => {
            // Check if kanji contains this radical character
            return k.kanji.includes(radical) ||
                   (k.components && k.components.includes(radical));
        });
    },

    // Generate a learning path for radicals based on vocabulary
    generateRadicalLearningPath(vocabulary, radicalsData) {
        const kanjiList = this.extractKanjiFromVocabulary(vocabulary);
        const radicalUsage = new Map();

        // Count radical usage in vocabulary kanji
        radicalsData.radicals.forEach(radical => {
            let count = 0;
            let firstAppearance = Infinity;

            kanjiList.forEach((k, index) => {
                if (radical.examples && radical.examples.includes(k.kanji)) {
                    count++;
                    firstAppearance = Math.min(firstAppearance, index);
                }
            });

            if (count > 0) {
                radicalUsage.set(radical.char, {
                    radical,
                    count,
                    firstAppearance
                });
            }
        });

        // Sort by first appearance, then by frequency
        return Array.from(radicalUsage.values())
            .sort((a, b) => {
                if (a.firstAppearance !== b.firstAppearance) {
                    return a.firstAppearance - b.firstAppearance;
                }
                return b.count - a.count;
            });
    },

    // Check if a character is kanji
    isKanji(char) {
        return this.kanjiRegex.test(char);
    },

    // Get similar looking kanji
    getSimilarKanji(kanji, kanjiList) {
        // This is a simplified version - in production, use a proper similarity database
        const similarPairs = {
            '日': ['目', '白', '田'],
            '目': ['日', '自', '貝'],
            '人': ['入', '八'],
            '入': ['人', '八'],
            '土': ['士', '工'],
            '士': ['土', '工'],
            '木': ['本', '林', '森'],
            '本': ['木', '体'],
            '大': ['太', '犬', '天'],
            '太': ['大', '犬'],
            '犬': ['大', '太'],
            '未': ['末', '味'],
            '末': ['未', '味'],
            '千': ['干', '于'],
            '干': ['千', '于']
        };
        return similarPairs[kanji] || [];
    }
};

// Make available globally
window.KanjiUtils = KanjiUtils;
