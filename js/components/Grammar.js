// Grammar Section Component - Japanese grammar reference with learning system

const { useState, useEffect, useMemo } = React;

const Grammar = () => {
    const [activeCategory, setActiveCategory] = useState('particles');
    const [selectedItem, setSelectedItem] = useState(null);
    const [detailType, setDetailType] = useState(null);
    const [grammarProgress, setGrammarProgress] = useState({});
    const [showLearned, setShowLearned] = useState(true);

    // Load progress from storage on mount
    useEffect(() => {
        const savedProgress = Storage.get('nihongo_grammar_progress', {});
        setGrammarProgress(savedProgress);
    }, []);

    // Save progress to storage
    const saveProgress = (newProgress) => {
        setGrammarProgress(newProgress);
        Storage.set('nihongo_grammar_progress', newProgress);
    };

    // Generate unique ID for grammar items
    const getItemId = (category, item) => {
        if (category === 'particles') return `particle_${item.particle}`;
        if (category === 'counters') return `counter_${item.counter}`;
        if (category === 'conjugation') return `conj_${item.form}`;
        if (category === 'adjectives') return `adj_${item.type}`;
        if (category === 'expressions') return `expr_${item.pattern}`;
        return `item_${Math.random()}`;
    };

    // Mark item as learned
    const markAsLearned = (category, item) => {
        const id = getItemId(category, item);
        const newProgress = {
            ...grammarProgress,
            [id]: {
                learned: true,
                learnedAt: new Date().toISOString()
            }
        };
        saveProgress(newProgress);
    };

    // Mark item as unlearned (reset)
    const markAsUnlearned = (category, item) => {
        const id = getItemId(category, item);
        const newProgress = { ...grammarProgress };
        delete newProgress[id];
        saveProgress(newProgress);
    };

    // Check if item is learned
    const isLearned = (category, item) => {
        const id = getItemId(category, item);
        return grammarProgress[id]?.learned || false;
    };

    // Play audio using Web Speech API
    const playAudio = (text) => {
        if ('speechSynthesis' in window) {
            speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'ja-JP';
            utterance.rate = 0.7;
            speechSynthesis.speak(utterance);
        }
    };

    // Close detail modal
    const closeDetail = () => {
        setSelectedItem(null);
        setDetailType(null);
    };

    // Open particle detail
    const openParticleDetail = (particle) => {
        setSelectedItem(particle);
        setDetailType('particle');
    };

    // Open counter detail
    const openCounterDetail = (counter) => {
        setSelectedItem(counter);
        setDetailType('counter');
    };

    // Grammar data
    const grammarData = {
        particles: {
            title: 'Particles',
            titleJp: '助詞',
            items: [
                {
                    particle: 'は',
                    reading: 'wa',
                    name: 'Topic Marker',
                    explanation: 'Marks the topic of the sentence (what the sentence is about)',
                    examples: [
                        { jp: '私は学生です', reading: 'わたしはがくせいです', en: 'I am a student (As for me, I am a student)' },
                        { jp: '今日は暑いです', reading: 'きょうはあついです', en: 'Today is hot (As for today, it is hot)' }
                    ]
                },
                {
                    particle: 'が',
                    reading: 'ga',
                    name: 'Subject Marker',
                    explanation: 'Marks the subject, often introduces new information or shows emphasis/contrast',
                    examples: [
                        { jp: '誰が来ましたか', reading: 'だれがきましたか', en: 'Who came?' },
                        { jp: '猫が好きです', reading: 'ねこがすきです', en: 'I like cats (cats are liked)' }
                    ]
                },
                {
                    particle: 'を',
                    reading: 'wo/o',
                    name: 'Object Marker',
                    explanation: 'Marks the direct object of an action verb',
                    examples: [
                        { jp: 'りんごを食べる', reading: 'りんごをたべる', en: 'Eat an apple' },
                        { jp: '日本語を勉強する', reading: 'にほんごをべんきょうする', en: 'Study Japanese' }
                    ]
                },
                {
                    particle: 'に',
                    reading: 'ni',
                    name: 'Target/Time/Location',
                    explanation: 'Indicates destination, time, location of existence, indirect object',
                    examples: [
                        { jp: '学校に行く', reading: 'がっこうにいく', en: 'Go to school' },
                        { jp: '7時に起きる', reading: 'しちじにおきる', en: 'Wake up at 7 o\'clock' },
                        { jp: '友達にあげる', reading: 'ともだちにあげる', en: 'Give to a friend' }
                    ]
                },
                {
                    particle: 'で',
                    reading: 'de',
                    name: 'Means/Location of Action',
                    explanation: 'Indicates means, method, location where action takes place',
                    examples: [
                        { jp: 'バスで行く', reading: 'バスでいく', en: 'Go by bus' },
                        { jp: '図書館で勉強する', reading: 'としょかんでべんきょうする', en: 'Study at the library' }
                    ]
                },
                {
                    particle: 'と',
                    reading: 'to',
                    name: 'And/With/Quotation',
                    explanation: 'Connects nouns (and), indicates companionship (with), marks quotes',
                    examples: [
                        { jp: '犬と猫', reading: 'いぬとねこ', en: 'Dogs and cats' },
                        { jp: '友達と遊ぶ', reading: 'ともだちとあそぶ', en: 'Play with friends' },
                        { jp: '「はい」と言う', reading: '「はい」という', en: 'Say "yes"' }
                    ]
                },
                {
                    particle: 'の',
                    reading: 'no',
                    name: 'Possessive/Connector',
                    explanation: 'Shows possession or connects nouns (like "of" or "\'s")',
                    examples: [
                        { jp: '私の本', reading: 'わたしのほん', en: 'My book' },
                        { jp: '日本の文化', reading: 'にほんのぶんか', en: 'Japanese culture / Culture of Japan' }
                    ]
                },
                {
                    particle: 'から',
                    reading: 'kara',
                    name: 'From/Because',
                    explanation: 'Indicates starting point (from) or reason (because)',
                    examples: [
                        { jp: '東京から来た', reading: 'とうきょうからきた', en: 'Came from Tokyo' },
                        { jp: '暑いから窓を開ける', reading: 'あついからまどをあける', en: 'Open the window because it\'s hot' }
                    ]
                },
                {
                    particle: 'まで',
                    reading: 'made',
                    name: 'Until/To',
                    explanation: 'Indicates ending point in time or space',
                    examples: [
                        { jp: '5時まで働く', reading: 'ごじまではたらく', en: 'Work until 5 o\'clock' },
                        { jp: '駅まで歩く', reading: 'えきまであるく', en: 'Walk to the station' }
                    ]
                },
                {
                    particle: 'も',
                    reading: 'mo',
                    name: 'Also/Too',
                    explanation: 'Indicates inclusion (also, too, even)',
                    examples: [
                        { jp: '私も行きます', reading: 'わたしもいきます', en: 'I will go too' },
                        { jp: '何も食べない', reading: 'なにもたべない', en: 'Not eat anything' }
                    ]
                }
            ]
        },
        counters: {
            title: 'Counters',
            titleJp: '助数詞',
            items: [
                { counter: '人', reading: 'にん/り', usage: 'People', examples: '一人(ひとり), 二人(ふたり), 三人(さんにん)',
                  fullList: ['一人 (ひとり)', '二人 (ふたり)', '三人 (さんにん)', '四人 (よにん)', '五人 (ごにん)', '六人 (ろくにん)', '七人 (しちにん/ななにん)', '八人 (はちにん)', '九人 (きゅうにん)', '十人 (じゅうにん)'],
                  notes: 'Note: 一人 and 二人 use special readings (ひとり, ふたり). 四人 uses よにん (not しにん).' },
                { counter: '本', reading: 'ほん', usage: 'Long/cylindrical objects (bottles, pens, trees)', examples: '一本(いっぽん), 二本(にほん), 三本(さんぼん)',
                  fullList: ['一本 (いっぽん)', '二本 (にほん)', '三本 (さんぼん)', '四本 (よんほん)', '五本 (ごほん)', '六本 (ろっぽん)', '七本 (ななほん)', '八本 (はっぽん)', '九本 (きゅうほん)', '十本 (じゅっぽん)'],
                  notes: 'Sound changes: ほん→ぽん after 1,6,8,10; ほん→ぼん after 3.' },
                { counter: '枚', reading: 'まい', usage: 'Flat objects (paper, shirts, plates)', examples: '一枚(いちまい), 二枚(にまい)',
                  fullList: ['一枚 (いちまい)', '二枚 (にまい)', '三枚 (さんまい)', '四枚 (よんまい)', '五枚 (ごまい)', '六枚 (ろくまい)', '七枚 (ななまい)', '八枚 (はちまい)', '九枚 (きゅうまい)', '十枚 (じゅうまい)'],
                  notes: 'No sound changes - regular counting pattern.' },
                { counter: '台', reading: 'だい', usage: 'Machines, vehicles', examples: '一台(いちだい), 二台(にだい)',
                  fullList: ['一台 (いちだい)', '二台 (にだい)', '三台 (さんだい)', '四台 (よんだい)', '五台 (ごだい)', '六台 (ろくだい)', '七台 (ななだい)', '八台 (はちだい)', '九台 (きゅうだい)', '十台 (じゅうだい)'],
                  notes: 'Used for cars, computers, TVs, and other machines.' },
                { counter: '匹', reading: 'ひき', usage: 'Small animals (dogs, cats, fish)', examples: '一匹(いっぴき), 二匹(にひき), 三匹(さんびき)',
                  fullList: ['一匹 (いっぴき)', '二匹 (にひき)', '三匹 (さんびき)', '四匹 (よんひき)', '五匹 (ごひき)', '六匹 (ろっぴき)', '七匹 (ななひき)', '八匹 (はっぴき)', '九匹 (きゅうひき)', '十匹 (じゅっぴき)'],
                  notes: 'Sound changes: ひき→ぴき after 1,6,8,10; ひき→びき after 3.' },
                { counter: '頭', reading: 'とう', usage: 'Large animals (horses, elephants)', examples: '一頭(いっとう), 二頭(にとう)',
                  fullList: ['一頭 (いっとう)', '二頭 (にとう)', '三頭 (さんとう)', '四頭 (よんとう)', '五頭 (ごとう)'],
                  notes: 'Used for large animals like horses, cows, elephants.' },
                { counter: '羽', reading: 'わ', usage: 'Birds, rabbits', examples: '一羽(いちわ), 二羽(にわ)',
                  fullList: ['一羽 (いちわ)', '二羽 (にわ)', '三羽 (さんわ/さんば)', '四羽 (よんわ)', '五羽 (ごわ)', '六羽 (ろくわ/ろっぱ)', '七羽 (ななわ)', '八羽 (はちわ)', '九羽 (きゅうわ)', '十羽 (じゅうわ)'],
                  notes: 'Rabbits use this counter because of their long ears resembling wings.' },
                { counter: '冊', reading: 'さつ', usage: 'Books, volumes', examples: '一冊(いっさつ), 二冊(にさつ)',
                  fullList: ['一冊 (いっさつ)', '二冊 (にさつ)', '三冊 (さんさつ)', '四冊 (よんさつ)', '五冊 (ごさつ)', '六冊 (ろくさつ)', '七冊 (ななさつ)', '八冊 (はっさつ)', '九冊 (きゅうさつ)', '十冊 (じゅっさつ)'],
                  notes: 'Used for bound items: books, magazines, notebooks.' },
                { counter: '杯', reading: 'はい', usage: 'Cups, glasses, bowls (of liquid)', examples: '一杯(いっぱい), 二杯(にはい)',
                  fullList: ['一杯 (いっぱい)', '二杯 (にはい)', '三杯 (さんばい)', '四杯 (よんはい)', '五杯 (ごはい)', '六杯 (ろっぱい)', '七杯 (ななはい)', '八杯 (はっぱい)', '九杯 (きゅうはい)', '十杯 (じゅっぱい)'],
                  notes: 'Sound changes similar to 本. Also used for bowls of food (ramen, rice).' },
                { counter: '個', reading: 'こ', usage: 'Small objects (general)', examples: '一個(いっこ), 二個(にこ)',
                  fullList: ['一個 (いっこ)', '二個 (にこ)', '三個 (さんこ)', '四個 (よんこ)', '五個 (ごこ)', '六個 (ろっこ)', '七個 (ななこ)', '八個 (はっこ)', '九個 (きゅうこ)', '十個 (じゅっこ)'],
                  notes: 'General-purpose counter for small, compact objects.' },
                { counter: '回', reading: 'かい', usage: 'Times, occurrences', examples: '一回(いっかい), 二回(にかい)',
                  fullList: ['一回 (いっかい)', '二回 (にかい)', '三回 (さんかい)', '四回 (よんかい)', '五回 (ごかい)'],
                  notes: 'Used for counting frequency or number of times.' },
                { counter: '階', reading: 'かい', usage: 'Floors of a building', examples: '一階(いっかい), 二階(にかい)',
                  fullList: ['一階 (いっかい)', '二階 (にかい)', '三階 (さんがい)', '四階 (よんかい)', '五階 (ごかい)', '六階 (ろっかい)', '七階 (ななかい)', '八階 (はっかい)', '九階 (きゅうかい)', '十階 (じゅっかい)'],
                  notes: 'Note: 三階 uses さんがい (not さんかい).' },
                { counter: '歳/才', reading: 'さい', usage: 'Age', examples: '一歳(いっさい), 二十歳(はたち)',
                  fullList: ['一歳 (いっさい)', '二歳 (にさい)', '三歳 (さんさい)', '四歳 (よんさい)', '五歳 (ごさい)', '六歳 (ろくさい)', '七歳 (ななさい)', '八歳 (はっさい)', '九歳 (きゅうさい)', '十歳 (じゅっさい)', '二十歳 (はたち)'],
                  notes: '才 is simpler kanji but same meaning. 二十歳 has special reading はたち.' },
                { counter: '時', reading: 'じ', usage: 'O\'clock (hours)', examples: '一時(いちじ), 二時(にじ)',
                  fullList: ['一時 (いちじ)', '二時 (にじ)', '三時 (さんじ)', '四時 (よじ)', '五時 (ごじ)', '六時 (ろくじ)', '七時 (しちじ)', '八時 (はちじ)', '九時 (くじ)', '十時 (じゅうじ)', '十一時 (じゅういちじ)', '十二時 (じゅうにじ)'],
                  notes: 'Note: 四時(よじ), 七時(しちじ), 九時(くじ) use special readings.' },
                { counter: '分', reading: 'ふん/ぷん', usage: 'Minutes', examples: '一分(いっぷん), 二分(にふん)',
                  fullList: ['一分 (いっぷん)', '二分 (にふん)', '三分 (さんぷん)', '四分 (よんぷん)', '五分 (ごふん)', '六分 (ろっぷん)', '七分 (ななふん)', '八分 (はっぷん)', '九分 (きゅうふん)', '十分 (じゅっぷん)'],
                  notes: 'Sound changes: ふん→ぷん after 1,3,4,6,8,10.' }
            ]
        },
        conjugation: {
            title: 'Verb Conjugation',
            titleJp: '動詞の活用',
            items: [
                {
                    form: 'Dictionary Form',
                    formJp: '辞書形',
                    explanation: 'Basic form found in dictionaries',
                    ru: '食べる (taberu)',
                    u: '書く (kaku)',
                    irregular: 'する、来る'
                },
                {
                    form: 'Masu Form',
                    formJp: 'ます形',
                    explanation: 'Polite present/future',
                    ru: '食べます',
                    u: '書きます',
                    irregular: 'します、来ます'
                },
                {
                    form: 'Te Form',
                    formJp: 'て形',
                    explanation: 'Connecting form, requests',
                    ru: '食べて',
                    u: '書いて',
                    irregular: 'して、来て'
                },
                {
                    form: 'Ta Form (Past)',
                    formJp: 'た形',
                    explanation: 'Past tense',
                    ru: '食べた',
                    u: '書いた',
                    irregular: 'した、来た'
                },
                {
                    form: 'Nai Form (Negative)',
                    formJp: 'ない形',
                    explanation: 'Negative',
                    ru: '食べない',
                    u: '書かない',
                    irregular: 'しない、来ない'
                },
                {
                    form: 'Potential',
                    formJp: '可能形',
                    explanation: 'Can do / able to',
                    ru: '食べられる',
                    u: '書ける',
                    irregular: 'できる、来られる'
                },
                {
                    form: 'Volitional',
                    formJp: '意向形',
                    explanation: 'Let\'s / shall we',
                    ru: '食べよう',
                    u: '書こう',
                    irregular: 'しよう、来よう'
                },
                {
                    form: 'Imperative',
                    formJp: '命令形',
                    explanation: 'Command (direct)',
                    ru: '食べろ',
                    u: '書け',
                    irregular: 'しろ、来い'
                },
                {
                    form: 'Passive',
                    formJp: '受身形',
                    explanation: 'Passive voice',
                    ru: '食べられる',
                    u: '書かれる',
                    irregular: 'される、来られる'
                },
                {
                    form: 'Causative',
                    formJp: '使役形',
                    explanation: 'Make/let someone do',
                    ru: '食べさせる',
                    u: '書かせる',
                    irregular: 'させる、来させる'
                }
            ]
        },
        adjectives: {
            title: 'Adjectives',
            titleJp: '形容詞',
            description: 'Japanese has two types of adjectives: い-adjectives and な-adjectives',
            items: [
                {
                    type: 'い-adjectives',
                    typeJp: 'い形容詞',
                    example: '高い (takai - tall/expensive)',
                    forms: [
                        { name: 'Present', form: '高い', usage: 'Is tall/expensive' },
                        { name: 'Past', form: '高かった', usage: 'Was tall/expensive' },
                        { name: 'Negative', form: '高くない', usage: 'Is not tall/expensive' },
                        { name: 'Neg. Past', form: '高くなかった', usage: 'Was not tall/expensive' },
                        { name: 'Adverb', form: '高く', usage: 'Highly (modifies verb)' }
                    ]
                },
                {
                    type: 'な-adjectives',
                    typeJp: 'な形容詞',
                    example: '静か (shizuka - quiet)',
                    forms: [
                        { name: 'Before Noun', form: '静かな部屋', usage: 'Quiet room' },
                        { name: 'Present', form: '静かだ/です', usage: 'Is quiet' },
                        { name: 'Past', form: '静かだった', usage: 'Was quiet' },
                        { name: 'Negative', form: '静かじゃない', usage: 'Is not quiet' },
                        { name: 'Adverb', form: '静かに', usage: 'Quietly (modifies verb)' }
                    ]
                }
            ]
        },
        expressions: {
            title: 'Common Patterns',
            titleJp: '文型',
            items: [
                { pattern: '〜たい', meaning: 'Want to ~', example: '食べたい', exampleReading: 'たべたい', exampleEn: 'want to eat', notes: 'Attach to verb stem' },
                { pattern: '〜ている', meaning: 'Currently ~ing / State', example: '食べている', exampleReading: 'たべている', exampleEn: 'eating', notes: 'Ongoing action or result state' },
                { pattern: '〜てある', meaning: '~ has been done', example: '窓が開けてある', exampleReading: 'まどがあけてある', exampleEn: 'the window has been opened', notes: 'Resultant state (intentional)' },
                { pattern: '〜ておく', meaning: 'Do ~ in advance', example: '準備しておく', exampleReading: 'じゅんびしておく', exampleEn: 'prepare in advance', notes: 'Preparation for future' },
                { pattern: '〜てしまう', meaning: 'Completely / Regrettably', example: '食べてしまった', exampleReading: 'たべてしまった', exampleEn: 'ate it all (unfortunately)', notes: 'Completion or regret' },
                { pattern: '〜なければならない', meaning: 'Must ~', example: '行かなければならない', exampleReading: 'いかなければならない', exampleEn: 'must go', notes: 'Obligation' },
                { pattern: '〜てもいい', meaning: 'May ~ / It\'s okay to ~', example: '食べてもいい', exampleReading: 'たべてもいい', exampleEn: 'may eat', notes: 'Permission' },
                { pattern: '〜たことがある', meaning: 'Have experienced ~', example: '日本に行ったことがある', exampleReading: 'にほんにいったことがある', exampleEn: 'have been to Japan', notes: 'Past experience' },
                { pattern: '〜ようにする', meaning: 'Try to ~ / Make sure to ~', example: '早く寝るようにする', exampleReading: 'はやくねるようにする', exampleEn: 'try to sleep early', notes: 'Effort toward habit' },
                { pattern: '〜そう', meaning: 'Looks like ~ / I heard ~', example: '美味しそう', exampleReading: 'おいしそう', exampleEn: 'looks delicious', notes: 'Appearance or hearsay' },
                { pattern: '〜らしい', meaning: 'Seems ~ / I heard ~', example: '彼は日本人らしい', exampleReading: 'かれはにほんじんらしい', exampleEn: 'he seems to be Japanese', notes: 'Inference or hearsay' },
                { pattern: '〜ば', meaning: 'If ~', example: '食べれば', exampleReading: 'たべれば', exampleEn: 'if (you) eat', notes: 'Conditional (hypothetical)' },
                { pattern: '〜たら', meaning: 'If ~ / When ~', example: '食べたら', exampleReading: 'たべたら', exampleEn: 'if/when (you) eat', notes: 'Conditional (more concrete)' },
                { pattern: '〜ても', meaning: 'Even if ~', example: '食べても', exampleReading: 'たべても', exampleEn: 'even if (you) eat', notes: 'Concessive' },
                { pattern: '〜のに', meaning: 'Although ~ / Despite ~', example: '食べたのに', exampleReading: 'たべたのに', exampleEn: 'although (I) ate', notes: 'Contrary to expectation' }
            ]
        }
    };

    const currentData = grammarData[activeCategory];

    // Calculate progress stats
    const getProgressStats = () => {
        let totalItems = 0;
        let learnedItems = 0;

        Object.entries(grammarData).forEach(([category, data]) => {
            data.items.forEach(item => {
                totalItems++;
                if (isLearned(category, item)) {
                    learnedItems++;
                }
            });
        });

        return { total: totalItems, learned: learnedItems };
    };

    // Get category-specific stats
    const getCategoryStats = (category) => {
        const data = grammarData[category];
        let total = data.items.length;
        let learned = data.items.filter(item => isLearned(category, item)).length;
        return { total, learned };
    };

    // Sort items: unlearned first, then learned
    const getSortedItems = (items, category) => {
        if (!showLearned) {
            return items.filter(item => !isLearned(category, item));
        }

        const unlearned = items.filter(item => !isLearned(category, item));
        const learned = items.filter(item => isLearned(category, item));
        return [...unlearned, ...learned];
    };

    const progressStats = getProgressStats();
    const categoryStats = getCategoryStats(activeCategory);

    return (
        <div className="grammar-section">
            {/* Overall Progress Bar */}
            <div className="grammar-progress-header">
                <div className="grammar-progress-info">
                    <span className="progress-label">Overall Progress</span>
                    <span className="progress-count">{progressStats.learned} / {progressStats.total} learned</span>
                </div>
                <div className="grammar-progress-bar">
                    <div
                        className="grammar-progress-fill"
                        style={{ width: `${(progressStats.learned / progressStats.total) * 100}%` }}
                    />
                </div>
            </div>

            {/* Category Tabs */}
            <div className="grammar-tabs">
                {Object.entries(grammarData).map(([key, data]) => {
                    const stats = getCategoryStats(key);
                    return (
                        <button
                            key={key}
                            className={`grammar-tab ${activeCategory === key ? 'active' : ''}`}
                            onClick={() => setActiveCategory(key)}
                        >
                            <span className="japanese">{data.titleJp}</span>
                            <span>{data.title}</span>
                            <span className="tab-progress">{stats.learned}/{stats.total}</span>
                        </button>
                    );
                })}
            </div>

            {/* Content */}
            <div className="grammar-content">
                <div className="grammar-content-header">
                    <h2 className="grammar-title">
                        <span className="japanese">{currentData.titleJp}</span>
                        <span>{currentData.title}</span>
                    </h2>
                    <label className="show-learned-toggle">
                        <input
                            type="checkbox"
                            checked={showLearned}
                            onChange={(e) => setShowLearned(e.target.checked)}
                        />
                        <span>Show learned ({categoryStats.learned})</span>
                    </label>
                </div>

                {currentData.description && (
                    <p className="grammar-description">{currentData.description}</p>
                )}

                {/* Category Progress */}
                <div className="category-progress">
                    <span>{categoryStats.learned} of {categoryStats.total} learned</span>
                </div>

                {/* Particles */}
                {activeCategory === 'particles' && (
                    <div className="particles-list">
                        {getSortedItems(currentData.items, 'particles').map((item, idx) => {
                            const learned = isLearned('particles', item);
                            return (
                                <div
                                    key={idx}
                                    className={`particle-card clickable-card ${learned ? 'is-learned' : ''}`}
                                    onClick={() => openParticleDetail(item)}
                                >
                                    <div className="particle-header">
                                        <span className="particle-char japanese">{item.particle}</span>
                                        <button
                                            className="btn-audio"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                playAudio(item.particle);
                                            }}
                                        >
                                            🔊
                                        </button>
                                        <span className="particle-reading">({item.reading})</span>
                                        <span className="particle-name">{item.name}</span>
                                        {learned && <span className="learned-indicator">✓</span>}
                                    </div>
                                    <p className="particle-explanation">{item.explanation}</p>
                                    <div className="card-footer">
                                        <div className="click-hint">Click for examples</div>
                                        <button
                                            className={`btn-learn-small ${learned ? 'btn-unlearn' : ''}`}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                learned ? markAsUnlearned('particles', item) : markAsLearned('particles', item);
                                            }}
                                        >
                                            {learned ? 'Reset' : 'Mark Learned'}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Counters */}
                {activeCategory === 'counters' && (
                    <div className="counters-grid">
                        {getSortedItems(currentData.items, 'counters').map((item, idx) => {
                            const learned = isLearned('counters', item);
                            return (
                                <div
                                    key={idx}
                                    className={`counter-card clickable-card ${learned ? 'is-learned' : ''}`}
                                    onClick={() => openCounterDetail(item)}
                                >
                                    {learned && <span className="learned-badge-corner">✓</span>}
                                    <div className="counter-header">
                                        <div className="counter-char japanese">{item.counter}</div>
                                        <button
                                            className="btn-audio"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                playAudio(item.counter);
                                            }}
                                        >
                                            🔊
                                        </button>
                                    </div>
                                    <div className="counter-reading">{item.reading}</div>
                                    <div className="counter-usage">{item.usage}</div>
                                    <div className="card-footer">
                                        <div className="click-hint">Click for full list</div>
                                        <button
                                            className={`btn-learn-small ${learned ? 'btn-unlearn' : ''}`}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                learned ? markAsUnlearned('counters', item) : markAsLearned('counters', item);
                                            }}
                                        >
                                            {learned ? 'Reset' : 'Learned'}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Verb Conjugation */}
                {activeCategory === 'conjugation' && (
                    <div className="conjugation-table-wrapper">
                        <table className="conjugation-table">
                            <thead>
                                <tr>
                                    <th>Form</th>
                                    <th>る-verbs</th>
                                    <th>う-verbs</th>
                                    <th>Irregular</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {getSortedItems(currentData.items, 'conjugation').map((item, idx) => {
                                    const learned = isLearned('conjugation', item);
                                    return (
                                        <tr key={idx} className={learned ? 'is-learned' : ''}>
                                            <td>
                                                <div className="form-name">{item.form}</div>
                                                <div className="form-jp japanese">{item.formJp}</div>
                                                <div className="form-explanation">{item.explanation}</div>
                                            </td>
                                            <td className="japanese">
                                                {item.ru}
                                                <button
                                                    className="btn-audio-inline"
                                                    onClick={() => playAudio(item.ru.split(' ')[0])}
                                                >
                                                    🔊
                                                </button>
                                            </td>
                                            <td className="japanese">
                                                {item.u}
                                                <button
                                                    className="btn-audio-inline"
                                                    onClick={() => playAudio(item.u.split(' ')[0])}
                                                >
                                                    🔊
                                                </button>
                                            </td>
                                            <td className="japanese">{item.irregular}</td>
                                            <td>
                                                <button
                                                    className={`btn-learn-table ${learned ? 'btn-unlearn' : ''}`}
                                                    onClick={() => learned ? markAsUnlearned('conjugation', item) : markAsLearned('conjugation', item)}
                                                >
                                                    {learned ? '✓ Reset' : 'Learn'}
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Adjectives */}
                {activeCategory === 'adjectives' && (
                    <div className="adjectives-section">
                        {getSortedItems(currentData.items, 'adjectives').map((adjType, idx) => {
                            const learned = isLearned('adjectives', adjType);
                            return (
                                <div key={idx} className={`adjective-type ${learned ? 'is-learned' : ''}`}>
                                    <div className="adjective-header">
                                        <h3>
                                            <span className="japanese">{adjType.typeJp}</span>
                                            <span>{adjType.type}</span>
                                        </h3>
                                        <button
                                            className={`btn-learn-small ${learned ? 'btn-unlearn' : ''}`}
                                            onClick={() => learned ? markAsUnlearned('adjectives', adjType) : markAsLearned('adjectives', adjType)}
                                        >
                                            {learned ? '✓ Reset' : 'Mark Learned'}
                                        </button>
                                    </div>
                                    <p className="adjective-example">
                                        Example: <span className="japanese">{adjType.example}</span>
                                        <button
                                            className="btn-audio-inline"
                                            onClick={() => playAudio(adjType.example.split(' ')[0])}
                                        >
                                            🔊
                                        </button>
                                    </p>
                                    <table className="adjective-table">
                                        <tbody>
                                            {adjType.forms.map((form, i) => (
                                                <tr key={i}>
                                                    <td>{form.name}</td>
                                                    <td className="japanese">
                                                        {form.form}
                                                        <button
                                                            className="btn-audio-inline"
                                                            onClick={() => playAudio(form.form)}
                                                        >
                                                            🔊
                                                        </button>
                                                    </td>
                                                    <td>{form.usage}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Common Patterns */}
                {activeCategory === 'expressions' && (
                    <div className="patterns-list">
                        {getSortedItems(currentData.items, 'expressions').map((item, idx) => {
                            const learned = isLearned('expressions', item);
                            return (
                                <div key={idx} className={`pattern-card ${learned ? 'is-learned' : ''}`}>
                                    <div className="pattern-header">
                                        <span className="pattern-form japanese">{item.pattern}</span>
                                        <button
                                            className="btn-audio"
                                            onClick={() => playAudio(item.pattern.replace(/〜/g, ''))}
                                        >
                                            🔊
                                        </button>
                                        <span className="pattern-meaning">{item.meaning}</span>
                                        {learned && <span className="learned-indicator">✓</span>}
                                    </div>
                                    <div className="pattern-example">
                                        <span className="japanese">{item.example}</span>
                                        <button
                                            className="btn-audio"
                                            onClick={() => playAudio(item.example)}
                                        >
                                            🔊
                                        </button>
                                        <span className="pattern-example-en">{item.exampleEn}</span>
                                    </div>
                                    <div className="pattern-footer">
                                        <div className="pattern-notes">{item.notes}</div>
                                        <button
                                            className={`btn-learn-small ${learned ? 'btn-unlearn' : ''}`}
                                            onClick={() => learned ? markAsUnlearned('expressions', item) : markAsLearned('expressions', item)}
                                        >
                                            {learned ? 'Reset' : 'Mark Learned'}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Detail Modal */}
            {selectedItem && (
                <div className="modal-overlay" onClick={closeDetail}>
                    <div className="modal modal-grammar-detail" onClick={(e) => e.stopPropagation()}>
                        {/* Particle Detail */}
                        {detailType === 'particle' && (
                            <>
                                <div className="modal-header-grammar">
                                    <span className="modal-particle japanese">{selectedItem.particle}</span>
                                    <button
                                        className="btn-audio-large"
                                        onClick={() => playAudio(selectedItem.particle)}
                                    >
                                        🔊
                                    </button>
                                    <div className="modal-particle-info">
                                        <span className="modal-reading">({selectedItem.reading})</span>
                                        <span className="modal-name">{selectedItem.name}</span>
                                    </div>
                                </div>
                                <p className="modal-explanation">{selectedItem.explanation}</p>

                                <div className="modal-section">
                                    <h4>Examples</h4>
                                    <div className="modal-examples">
                                        {selectedItem.examples.map((ex, i) => (
                                            <div key={i} className="modal-example-row">
                                                <div className="example-jp-row">
                                                    <span className="example-jp japanese">{ex.jp}</span>
                                                    <button
                                                        className="btn-audio"
                                                        onClick={() => playAudio(ex.jp)}
                                                    >
                                                        🔊
                                                    </button>
                                                </div>
                                                {ex.reading && (
                                                    <div className="example-reading japanese">{ex.reading}</div>
                                                )}
                                                <div className="example-en">{ex.en}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="modal-actions-grammar">
                                    {!isLearned('particles', selectedItem) ? (
                                        <button
                                            className="btn btn-success"
                                            onClick={() => {
                                                markAsLearned('particles', selectedItem);
                                                closeDetail();
                                            }}
                                        >
                                            ✓ Mark as Learned
                                        </button>
                                    ) : (
                                        <button
                                            className="btn btn-secondary"
                                            onClick={() => {
                                                markAsUnlearned('particles', selectedItem);
                                            }}
                                        >
                                            Reset Progress
                                        </button>
                                    )}
                                    <button className="btn btn-ghost" onClick={closeDetail}>
                                        Close
                                    </button>
                                </div>
                            </>
                        )}

                        {/* Counter Detail */}
                        {detailType === 'counter' && (
                            <>
                                <div className="modal-header-grammar">
                                    <span className="modal-counter japanese">{selectedItem.counter}</span>
                                    <button
                                        className="btn-audio-large"
                                        onClick={() => playAudio(selectedItem.counter)}
                                    >
                                        🔊
                                    </button>
                                    <span className="modal-reading">({selectedItem.reading})</span>
                                </div>
                                <p className="modal-usage">{selectedItem.usage}</p>

                                <div className="modal-section">
                                    <h4>Full Counting List (1-10)</h4>
                                    <div className="counter-full-list">
                                        {selectedItem.fullList && selectedItem.fullList.map((item, i) => {
                                            // Extract the reading for audio
                                            const reading = item.match(/\(([^)]+)\)/)?.[1] || item;
                                            return (
                                                <div key={i} className="counter-item">
                                                    <span className="japanese">{item}</span>
                                                    <button
                                                        className="btn-audio-sm"
                                                        onClick={() => playAudio(reading)}
                                                    >
                                                        🔊
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {selectedItem.notes && (
                                    <div className="modal-notes">
                                        <strong>Note:</strong> {selectedItem.notes}
                                    </div>
                                )}

                                <div className="modal-actions-grammar">
                                    {!isLearned('counters', selectedItem) ? (
                                        <button
                                            className="btn btn-success"
                                            onClick={() => {
                                                markAsLearned('counters', selectedItem);
                                                closeDetail();
                                            }}
                                        >
                                            ✓ Mark as Learned
                                        </button>
                                    ) : (
                                        <button
                                            className="btn btn-secondary"
                                            onClick={() => {
                                                markAsUnlearned('counters', selectedItem);
                                            }}
                                        >
                                            Reset Progress
                                        </button>
                                    )}
                                    <button className="btn btn-ghost" onClick={closeDetail}>
                                        Close
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

window.Grammar = Grammar;
