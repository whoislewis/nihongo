// Priority Radicals - 50 Essential Radicals for Core Learning
// Selected by frequency in vocabulary and importance for kanji comprehension

const PRIORITY_RADICALS = {
    // Total: 50 radicals organized by category
    radicals: [
        // People & Body (12)
        { char: '人', meaning: 'person', category: 'people', priority: 1 },
        { char: '亻', meaning: 'person (left)', category: 'people', priority: 2 },
        { char: '口', meaning: 'mouth', category: 'people', priority: 3 },
        { char: '目', meaning: 'eye', category: 'people', priority: 4 },
        { char: '手', meaning: 'hand', category: 'people', priority: 5 },
        { char: '扌', meaning: 'hand (left)', category: 'people', priority: 6 },
        { char: '心', meaning: 'heart/mind', category: 'people', priority: 7 },
        { char: '忄', meaning: 'heart (left)', category: 'people', priority: 8 },
        { char: '女', meaning: 'woman', category: 'people', priority: 9 },
        { char: '子', meaning: 'child', category: 'people', priority: 10 },
        { char: '力', meaning: 'power', category: 'people', priority: 11 },
        { char: '足', meaning: 'foot/leg', category: 'people', priority: 12 },

        // Nature (10)
        { char: '木', meaning: 'tree/wood', category: 'nature', priority: 13 },
        { char: '艹', meaning: 'grass/plant', category: 'nature', priority: 14 },
        { char: '日', meaning: 'sun/day', category: 'nature', priority: 15 },
        { char: '月', meaning: 'moon/month', category: 'nature', priority: 16 },
        { char: '山', meaning: 'mountain', category: 'nature', priority: 17 },
        { char: '土', meaning: 'earth/soil', category: 'nature', priority: 18 },
        { char: '田', meaning: 'rice field', category: 'nature', priority: 19 },
        { char: '水', meaning: 'water', category: 'nature', priority: 20 },
        { char: '氵', meaning: 'water (left)', category: 'nature', priority: 21 },
        { char: '火', meaning: 'fire', category: 'nature', priority: 22 },

        // Objects & Tools (8)
        { char: '金', meaning: 'metal/gold', category: 'objects', priority: 23 },
        { char: '糸', meaning: 'thread/silk', category: 'objects', priority: 24 },
        { char: '車', meaning: 'vehicle/wheel', category: 'objects', priority: 25 },
        { char: '門', meaning: 'gate', category: 'objects', priority: 26 },
        { char: '食', meaning: 'food/eat', category: 'objects', priority: 27 },
        { char: '刀', meaning: 'sword', category: 'objects', priority: 28 },
        { char: '刂', meaning: 'sword (right)', category: 'objects', priority: 29 },
        { char: '貝', meaning: 'shell/money', category: 'objects', priority: 30 },

        // Actions & Movement (6)
        { char: '言', meaning: 'speech/say', category: 'actions', priority: 31 },
        { char: '訁', meaning: 'speech (left)', category: 'actions', priority: 32 },
        { char: '走', meaning: 'run', category: 'actions', priority: 33 },
        { char: '辶', meaning: 'road/walk', category: 'actions', priority: 34 },
        { char: '見', meaning: 'see', category: 'actions', priority: 35 },
        { char: '立', meaning: 'stand', category: 'actions', priority: 36 },

        // Enclosures & Positions (6)
        { char: '囗', meaning: 'enclosure', category: 'enclosures', priority: 37 },
        { char: '广', meaning: 'cliff/building', category: 'enclosures', priority: 38 },
        { char: '宀', meaning: 'roof', category: 'enclosures', priority: 39 },
        { char: '冖', meaning: 'cover', category: 'enclosures', priority: 40 },
        { char: '⻌', meaning: 'walk (left)', category: 'enclosures', priority: 41 },
        { char: '阝', meaning: 'hill/city', category: 'enclosures', priority: 42 },

        // Abstract & Numbers (8)
        { char: '一', meaning: 'one', category: 'abstract', priority: 43 },
        { char: '二', meaning: 'two', category: 'abstract', priority: 44 },
        { char: '十', meaning: 'ten', category: 'abstract', priority: 45 },
        { char: '大', meaning: 'big', category: 'abstract', priority: 46 },
        { char: '小', meaning: 'small', category: 'abstract', priority: 47 },
        { char: '中', meaning: 'middle', category: 'abstract', priority: 48 },
        { char: '上', meaning: 'up/above', category: 'abstract', priority: 49 },
        { char: '下', meaning: 'down/below', category: 'abstract', priority: 50 }
    ],

    // Get all priority radicals
    getAll() {
        return this.radicals;
    },

    // Get radicals by category
    getByCategory(category) {
        return this.radicals.filter(r => r.category === category);
    },

    // Check if a radical is a priority radical
    isPriority(char) {
        return this.radicals.some(r => r.char === char);
    },

    // Get priority radical by character
    get(char) {
        return this.radicals.find(r => r.char === char);
    },

    // Get radicals sorted by priority
    getSorted() {
        return [...this.radicals].sort((a, b) => a.priority - b.priority);
    },

    // Get category counts
    getCategoryCounts() {
        const counts = {};
        this.radicals.forEach(r => {
            counts[r.category] = (counts[r.category] || 0) + 1;
        });
        return counts;
    },

    // Get total count
    getCount() {
        return this.radicals.length;
    }
};

// Make available globally
window.PRIORITY_RADICALS = PRIORITY_RADICALS;
