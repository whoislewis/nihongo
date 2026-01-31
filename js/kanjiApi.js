// Kanji API Module - Fetches kanji data from external sources

const KanjiAPI = {
    // Cache for fetched kanji data
    cache: {},

    // Initialize cache from localStorage
    init() {
        try {
            const cached = localStorage.getItem('nihongo_kanji_cache');
            if (cached) {
                this.cache = JSON.parse(cached);
            }
        } catch (e) {
            console.error('Failed to load kanji cache:', e);
        }
    },

    // Save cache to localStorage
    saveCache() {
        try {
            localStorage.setItem('nihongo_kanji_cache', JSON.stringify(this.cache));
        } catch (e) {
            console.error('Failed to save kanji cache:', e);
        }
    },

    // Extract kanji characters from a word
    extractKanji(word) {
        if (!word) return [];
        const kanjiRegex = /[\u4e00-\u9faf]/g;
        const matches = word.match(kanjiRegex);
        return matches ? [...new Set(matches)] : [];
    },

    // Fetch kanji data from Jisho.org API
    async fetchFromJisho(kanji) {
        try {
            // Use a CORS proxy since Jisho doesn't have CORS headers
            const proxyUrl = 'https://api.allorigins.win/raw?url=';
            const jishoUrl = `https://jisho.org/api/v1/search/words?keyword=${encodeURIComponent(kanji)}%20%23kanji`;

            const response = await fetch(proxyUrl + encodeURIComponent(jishoUrl));
            if (!response.ok) throw new Error('Jisho fetch failed');

            const data = await response.json();

            if (data.data && data.data.length > 0) {
                const kanjiData = data.data[0];
                return {
                    character: kanji,
                    meanings: kanjiData.senses?.[0]?.english_definitions || [],
                    readings: {
                        onyomi: kanjiData.japanese?.[0]?.reading || '',
                        kunyomi: ''
                    },
                    source: 'jisho'
                };
            }
            return null;
        } catch (e) {
            console.error('Jisho fetch error:', e);
            return null;
        }
    },

    // Fetch detailed kanji info from KanjiAPI.dev (free, no auth needed)
    async fetchFromKanjiApi(kanji) {
        try {
            const response = await fetch(`https://kanjiapi.dev/v1/kanji/${encodeURIComponent(kanji)}`);
            if (!response.ok) return null;

            const data = await response.json();
            return {
                character: kanji,
                meanings: data.meanings || [],
                readings: {
                    onyomi: (data.on_readings || []).join(', '),
                    kunyomi: (data.kun_readings || []).join(', ')
                },
                grade: data.grade,
                jlpt: data.jlpt,
                strokes: data.stroke_count,
                source: 'kanjiapi'
            };
        } catch (e) {
            console.error('KanjiAPI fetch error:', e);
            return null;
        }
    },

    // Fetch radical/component breakdown from KanjiAlive (via RapidAPI proxy alternative)
    // Using a free alternative: kanjiapi.dev doesn't have radicals, so we'll use a lookup table
    getRadicalInfo(kanji) {
        // Common radical mappings (subset for most frequent kanji)
        const radicalData = {
            '人': { radical: '人', radicalMeaning: 'person', components: ['人'] },
            '日': { radical: '日', radicalMeaning: 'sun/day', components: ['日'] },
            '月': { radical: '月', radicalMeaning: 'moon/month', components: ['月'] },
            '水': { radical: '水', radicalMeaning: 'water', components: ['水'] },
            '火': { radical: '火', radicalMeaning: 'fire', components: ['火'] },
            '木': { radical: '木', radicalMeaning: 'tree/wood', components: ['木'] },
            '金': { radical: '金', radicalMeaning: 'gold/metal', components: ['金'] },
            '土': { radical: '土', radicalMeaning: 'earth/soil', components: ['土'] },
            '口': { radical: '口', radicalMeaning: 'mouth', components: ['口'] },
            '目': { radical: '目', radicalMeaning: 'eye', components: ['目'] },
            '手': { radical: '手', radicalMeaning: 'hand', components: ['手'] },
            '心': { radical: '心', radicalMeaning: 'heart/mind', components: ['心'] },
            '言': { radical: '言', radicalMeaning: 'speech/say', components: ['言'] },
            '女': { radical: '女', radicalMeaning: 'woman', components: ['女'] },
            '子': { radical: '子', radicalMeaning: 'child', components: ['子'] },
            '力': { radical: '力', radicalMeaning: 'power/strength', components: ['力'] },
            '田': { radical: '田', radicalMeaning: 'rice field', components: ['田'] },
            '山': { radical: '山', radicalMeaning: 'mountain', components: ['山'] },
            '川': { radical: '川', radicalMeaning: 'river', components: ['川'] },
            '大': { radical: '大', radicalMeaning: 'big/large', components: ['大'] },
            '小': { radical: '小', radicalMeaning: 'small', components: ['小'] },
            '中': { radical: '丨', radicalMeaning: 'middle', components: ['口', '丨'] },
            '上': { radical: '一', radicalMeaning: 'above/up', components: ['一', '卜'] },
            '下': { radical: '一', radicalMeaning: 'below/down', components: ['一', '卜'] },
            '見': { radical: '見', radicalMeaning: 'see', components: ['目', '儿'] },
            '行': { radical: '行', radicalMeaning: 'go/walk', components: ['彳', '亍'] },
            '来': { radical: '木', radicalMeaning: 'come', components: ['木', '米'] },
            '出': { radical: '凵', radicalMeaning: 'exit/leave', components: ['山', '山'] },
            '入': { radical: '入', radicalMeaning: 'enter', components: ['入'] },
            '食': { radical: '食', radicalMeaning: 'eat/food', components: ['人', '良'] },
            '飲': { radical: '食', radicalMeaning: 'drink', components: ['食', '欠'] },
            '話': { radical: '言', radicalMeaning: 'speak/story', components: ['言', '舌'] },
            '読': { radical: '言', radicalMeaning: 'read', components: ['言', '売'] },
            '書': { radical: '曰', radicalMeaning: 'write', components: ['聿', '日'] },
            '聞': { radical: '耳', radicalMeaning: 'hear/ask', components: ['門', '耳'] },
            '買': { radical: '貝', radicalMeaning: 'buy', components: ['罒', '貝'] },
            '売': { radical: '士', radicalMeaning: 'sell', components: ['士', '冖', '儿'] },
            '学': { radical: '子', radicalMeaning: 'study/learn', components: ['⺍', '冖', '子'] },
            '生': { radical: '生', radicalMeaning: 'life/birth', components: ['生'] },
            '先': { radical: '儿', radicalMeaning: 'ahead/previous', components: ['⺧', '儿'] },
            '私': { radical: '禾', radicalMeaning: 'I/private', components: ['禾', '厶'] },
            '今': { radical: '人', radicalMeaning: 'now', components: ['人', '一', 'フ'] },
            '何': { radical: '人', radicalMeaning: 'what', components: ['亻', '可'] },
            '時': { radical: '日', radicalMeaning: 'time/hour', components: ['日', '寺'] },
            '間': { radical: '門', radicalMeaning: 'interval/between', components: ['門', '日'] },
            '年': { radical: '干', radicalMeaning: 'year', components: ['年'] },
            '前': { radical: '刀', radicalMeaning: 'before/front', components: ['前'] },
            '後': { radical: '彳', radicalMeaning: 'after/behind', components: ['彳', '幺', '夂'] },
            '外': { radical: '夕', radicalMeaning: 'outside', components: ['夕', '卜'] },
            '国': { radical: '囗', radicalMeaning: 'country', components: ['囗', '玉'] },
            '語': { radical: '言', radicalMeaning: 'language/word', components: ['言', '吾'] },
            '本': { radical: '木', radicalMeaning: 'book/origin', components: ['木', '一'] },
            '新': { radical: '斤', radicalMeaning: 'new', components: ['立', '木', '斤'] },
            '古': { radical: '口', radicalMeaning: 'old', components: ['十', '口'] },
            '高': { radical: '高', radicalMeaning: 'tall/expensive', components: ['亠', '口', '冂', '口'] },
            '安': { radical: '宀', radicalMeaning: 'cheap/peaceful', components: ['宀', '女'] },
            '好': { radical: '女', radicalMeaning: 'like/good', components: ['女', '子'] },
            '悪': { radical: '心', radicalMeaning: 'bad/evil', components: ['亜', '心'] },
            '長': { radical: '長', radicalMeaning: 'long/leader', components: ['長'] },
            '短': { radical: '矢', radicalMeaning: 'short', components: ['矢', '豆'] },
            '多': { radical: '夕', radicalMeaning: 'many', components: ['夕', '夕'] },
            '少': { radical: '小', radicalMeaning: 'few/little', components: ['小', '丿'] },
            '早': { radical: '日', radicalMeaning: 'early', components: ['日', '十'] },
            '遅': { radical: '辶', radicalMeaning: 'late/slow', components: ['辶', '犀'] },
            '近': { radical: '辶', radicalMeaning: 'near', components: ['辶', '斤'] },
            '遠': { radical: '辶', radicalMeaning: 'far', components: ['辶', '袁'] },
            '強': { radical: '弓', radicalMeaning: 'strong', components: ['弓', '虫', '厶'] },
            '弱': { radical: '弓', radicalMeaning: 'weak', components: ['弓', '冫', '弓', '冫'] },
            '明': { radical: '日', radicalMeaning: 'bright', components: ['日', '月'] },
            '暗': { radical: '日', radicalMeaning: 'dark', components: ['日', '音'] },
            '白': { radical: '白', radicalMeaning: 'white', components: ['白'] },
            '黒': { radical: '黒', radicalMeaning: 'black', components: ['黒'] },
            '赤': { radical: '赤', radicalMeaning: 'red', components: ['赤'] },
            '青': { radical: '青', radicalMeaning: 'blue/green', components: ['青'] },
            '電': { radical: '雨', radicalMeaning: 'electricity', components: ['雨', '電'] },
            '車': { radical: '車', radicalMeaning: 'car/vehicle', components: ['車'] },
            '駅': { radical: '馬', radicalMeaning: 'station', components: ['馬', '尺'] },
            '道': { radical: '辶', radicalMeaning: 'road/way', components: ['辶', '首'] },
            '店': { radical: '广', radicalMeaning: 'shop/store', components: ['广', '占'] },
            '会': { radical: '人', radicalMeaning: 'meet/society', components: ['人', '云'] },
            '社': { radical: '示', radicalMeaning: 'company/shrine', components: ['礻', '土'] },
            '家': { radical: '宀', radicalMeaning: 'house/family', components: ['宀', '豕'] },
            '室': { radical: '宀', radicalMeaning: 'room', components: ['宀', '至'] },
            '物': { radical: '牛', radicalMeaning: 'thing/object', components: ['牜', '勿'] },
            '事': { radical: '亅', radicalMeaning: 'thing/matter', components: ['事'] },
            '仕': { radical: '人', radicalMeaning: 'serve/work', components: ['亻', '士'] },
            '使': { radical: '人', radicalMeaning: 'use', components: ['亻', '吏'] },
            '作': { radical: '人', radicalMeaning: 'make/create', components: ['亻', '乍'] },
            '思': { radical: '心', radicalMeaning: 'think', components: ['田', '心'] },
            '知': { radical: '矢', radicalMeaning: 'know', components: ['矢', '口'] },
            '持': { radical: '手', radicalMeaning: 'hold/have', components: ['扌', '寺'] },
            '待': { radical: '彳', radicalMeaning: 'wait', components: ['彳', '寺'] },
            '立': { radical: '立', radicalMeaning: 'stand', components: ['立'] },
            '座': { radical: '广', radicalMeaning: 'sit', components: ['广', '坐'] },
            '起': { radical: '走', radicalMeaning: 'wake/rise', components: ['走', '己'] },
            '寝': { radical: '宀', radicalMeaning: 'sleep', components: ['宀', '㝲'] },
            '休': { radical: '人', radicalMeaning: 'rest', components: ['亻', '木'] },
            '働': { radical: '人', radicalMeaning: 'work', components: ['亻', '動'] },
            '動': { radical: '力', radicalMeaning: 'move', components: ['重', '力'] },
            '止': { radical: '止', radicalMeaning: 'stop', components: ['止'] },
            '始': { radical: '女', radicalMeaning: 'begin', components: ['女', '台'] },
            '終': { radical: '糸', radicalMeaning: 'end', components: ['糸', '冬'] },
            '開': { radical: '門', radicalMeaning: 'open', components: ['門', '开'] },
            '閉': { radical: '門', radicalMeaning: 'close', components: ['門', '才'] },
            '教': { radical: '攵', radicalMeaning: 'teach', components: ['孝', '攵'] },
            '習': { radical: '羽', radicalMeaning: 'learn/practice', components: ['羽', '白'] },
            '覚': { radical: '見', radicalMeaning: 'remember/wake', components: ['⺍', '冖', '見'] },
            '忘': { radical: '心', radicalMeaning: 'forget', components: ['亡', '心'] },
            '答': { radical: '竹', radicalMeaning: 'answer', components: ['竹', '合'] },
            '問': { radical: '口', radicalMeaning: 'question', components: ['門', '口'] },
            '説': { radical: '言', radicalMeaning: 'explain', components: ['言', '兌'] },
            '試': { radical: '言', radicalMeaning: 'try/test', components: ['言', '式'] },
            '験': { radical: '馬', radicalMeaning: 'examine', components: ['馬', '僉'] },
            '意': { radical: '心', radicalMeaning: 'meaning/mind', components: ['音', '心'] },
            '味': { radical: '口', radicalMeaning: 'taste/meaning', components: ['口', '未'] },
            '同': { radical: '口', radicalMeaning: 'same', components: ['冂', '一', '口'] },
            '違': { radical: '辶', radicalMeaning: 'differ/wrong', components: ['辶', '韋'] },
            '変': { radical: '夂', radicalMeaning: 'change/strange', components: ['亠', '䜌', '夂'] },
            '決': { radical: '水', radicalMeaning: 'decide', components: ['氵', '夬'] },
            '定': { radical: '宀', radicalMeaning: 'determine/fixed', components: ['宀', '疋'] },
            '届': { radical: '尸', radicalMeaning: 'reach/deliver', components: ['尸', '届'] },
            '届': { radical: '尸', radicalMeaning: 'deliver', components: ['尸', '由'] },
            '届': { radical: '尸', radicalMeaning: 'deliver', components: ['尸', '由'] }
        };

        return radicalData[kanji] || null;
    },

    // Generate mnemonic suggestions based on components
    generateMnemonic(kanji, meanings, components) {
        const mnemonicTemplates = [
            `Think of ${kanji} as combining ${components.join(' + ')} to mean "${meanings[0]}"`,
            `Remember: ${components.join(' and ')} together create the idea of "${meanings[0]}"`,
            `Visualize ${components[0]} ${components.length > 1 ? 'with ' + components.slice(1).join(' and ') : ''} = ${meanings[0]}`
        ];

        // Add specific mnemonics for common patterns
        const specificMnemonics = {
            '休': 'A person (亻) leaning against a tree (木) to REST',
            '好': 'A woman (女) with her child (子) - what she LIKES/LOVES',
            '明': 'Sun (日) and moon (月) together make things BRIGHT',
            '林': 'Two trees (木木) make a GROVE/FOREST',
            '森': 'Three trees (木木木) make a FOREST',
            '男': 'Strength (力) in the rice field (田) - a MAN',
            '安': 'A woman (女) under a roof (宀) is PEACEFUL/CHEAP',
            '家': 'A pig (豕) under a roof (宀) - a HOUSE/HOME (pigs were kept inside)',
            '字': 'A child (子) under a roof (宀) learning CHARACTERS',
            '思': 'The heart/mind (心) in a field (田) - to THINK',
            '想': 'Tree (木), eye (目), and heart (心) - to IMAGINE/THINK',
            '見': 'An eye (目) on legs (儿) - to SEE/LOOK',
            '聞': 'An ear (耳) at a gate (門) - to HEAR/ASK',
            '話': 'Words (言) from a tongue (舌) - to TALK/STORY',
            '読': 'Words (言) being sold (売) - to READ (books were sold)',
            '買': 'A net (罒) over a shell/money (貝) - to BUY',
            '売': 'A scholar (士) showing something - to SELL',
            '間': 'Sun (日) coming through a gate (門) - a SPACE/INTERVAL',
            '時': 'Sun/day (日) at a temple (寺) - TIME (temples kept time)',
            '持': 'Hand (扌) at a temple (寺) - to HOLD/HAVE',
            '待': 'Go (彳) to a temple (寺) and WAIT',
            '知': 'An arrow (矢) hits the mouth (口) - to KNOW (speak truth)',
            '私': 'Grain (禾) kept private (厶) - I/PRIVATE',
            '会': 'People (人) under a cloud (云) - to MEET',
            '今': 'Person (人) pointing down - NOW (this moment)',
            '何': 'Person (亻) asking "can?" (可) - WHAT?',
            '分': 'Cutting (八) with a knife (刀) - to DIVIDE/MINUTE',
            '切': 'Seven (七) plus knife (刀) - to CUT',
            '近': 'Walk (辶) with an axe (斤) - NEAR (within axe-throwing distance)',
            '遠': 'Walk (辶) in long robes (袁) - FAR (formal journey)',
            '道': 'Walk (辶) with your head (首) - the WAY/PATH',
            '送': 'Walk (辶) with a gift (关) - to SEND',
            '週': 'Walk (辶) around (周) - a WEEK (going full circle)',
            '届': 'Body (尸) from origin (由) - to DELIVER/REACH'
        };

        if (specificMnemonics[kanji]) {
            return [specificMnemonics[kanji], ...mnemonicTemplates];
        }

        return mnemonicTemplates;
    },

    // Main function to get full kanji data
    async getKanjiData(kanji) {
        // Check cache first
        if (this.cache[kanji]) {
            return this.cache[kanji];
        }

        // Fetch from KanjiAPI.dev (most reliable free API)
        let data = await this.fetchFromKanjiApi(kanji);

        // Get radical info from our lookup
        const radicalInfo = this.getRadicalInfo(kanji);

        // Combine data
        const fullData = {
            character: kanji,
            meanings: data?.meanings || [],
            readings: data?.readings || { onyomi: '', kunyomi: '' },
            strokes: data?.strokes || null,
            grade: data?.grade || null,
            jlpt: data?.jlpt || null,
            radical: radicalInfo?.radical || null,
            radicalMeaning: radicalInfo?.radicalMeaning || null,
            components: radicalInfo?.components || [kanji],
            mnemonics: this.generateMnemonic(
                kanji,
                data?.meanings || [kanji],
                radicalInfo?.components || [kanji]
            )
        };

        // Cache the result
        this.cache[kanji] = fullData;
        this.saveCache();

        return fullData;
    },

    // Get data for all kanji in a word
    async getWordKanjiData(word) {
        const kanjiList = this.extractKanji(word);
        const results = await Promise.all(
            kanjiList.map(k => this.getKanjiData(k))
        );
        return results;
    }
};

// Initialize on load
KanjiAPI.init();

// Make available globally
window.KanjiAPI = KanjiAPI;
