// 214 Kangxi Radicals organized by category
// Each radical has: character, stroke count, meaning, category, mnemonic, examples
// Priority radicals (50 core) are marked with priority: true
// detailedExamples follow the format: { kanji, word, reading, meaning, breakdown, story }

const RADICALS_DATA = {
    categories: [
        { id: 'people', name: 'People & Body', color: '#3B82F6', icon: '👤' },
        { id: 'nature', name: 'Nature', color: '#22C55E', icon: '🌿' },
        { id: 'water', name: 'Water & Fire', color: '#06B6D4', icon: '💧' },
        { id: 'animals', name: 'Animals', color: '#F59E0B', icon: '🐾' },
        { id: 'objects', name: 'Objects & Tools', color: '#8B5CF6', icon: '🔧' },
        { id: 'actions', name: 'Actions & Movement', color: '#EF4444', icon: '⚡' },
        { id: 'enclosures', name: 'Enclosures & Positions', color: '#EC4899', icon: '📦' },
        { id: 'abstract', name: 'Abstract & Numbers', color: '#6B7280', icon: '✨' }
    ],
    radicals: [
        // People & Body
        { char: '人', strokes: 2, meaning: 'person', name: 'hito', category: 'people', priority: true,
          mnemonic: 'A person walking - two legs striding forward',
          examples: ['休', '体', '住', '作', '何'],
          detailedExamples: [
              { kanji: '休', word: '休む', reading: 'やすむ', meaning: 'to rest',
                breakdown: '休 = 人 (person) + 木 (tree)',
                story: 'A PERSON leaning against a TREE to REST' },
              { kanji: '体', word: '体', reading: 'からだ', meaning: 'body',
                breakdown: '体 = 亻 (person) + 本 (book/origin)',
                story: 'A PERSON\'s main/origin structure is their BODY' }
          ]},
        { char: '亻', strokes: 2, meaning: 'person (left)', name: 'ninben', category: 'people', priority: true,
          mnemonic: 'Person radical on the left side - standing tall',
          examples: ['他', '代', '仕', '件', '低'],
          detailedExamples: [
              { kanji: '他', word: '他', reading: 'ほか', meaning: 'other',
                breakdown: '他 = 亻 (person) + 也 (also)',
                story: 'Another PERSON who is ALSO there - OTHER' }
          ]},
        { char: '口', strokes: 3, meaning: 'mouth', name: 'kuchi', category: 'people', priority: true,
          mnemonic: 'An open mouth - square shape for speaking',
          examples: ['言', '食', '話', '問', '味'],
          detailedExamples: [
              { kanji: '古', word: '古い', reading: 'ふるい', meaning: 'old',
                breakdown: '古 = 十 (ten) + 口 (mouth)',
                story: 'Something passed down through TEN MOUTHS (generations) is OLD' },
              { kanji: '品', word: '品', reading: 'しな', meaning: 'goods',
                breakdown: '品 = 口 + 口 + 口 (three mouths)',
                story: 'Three MOUTHS consuming mass-produced GOODS' }
          ]},
        { char: '目', strokes: 5, meaning: 'eye', name: 'me', category: 'people', priority: true,
          mnemonic: 'An eye turned sideways - see the pupil inside',
          examples: ['見', '直', '真', '眠', '着'],
          detailedExamples: [
              { kanji: '見', word: '見る', reading: 'みる', meaning: 'to see',
                breakdown: '見 = 目 (eye) + 儿 (legs)',
                story: 'An EYE with LEGS - actively looking, SEEING' },
              { kanji: '冒', word: '冒険', reading: 'ぼうけん', meaning: 'adventure/risk',
                breakdown: '冒 = 日 (sun) + 目 (eye)',
                story: 'Looking at the SUN with your EYE - a RISK!' }
          ]},
        { char: '耳', strokes: 6, meaning: 'ear', name: 'mimi', category: 'people',
          mnemonic: 'The outer ear with curves - listening closely', examples: ['聞', '聴', '声', '取'] },
        { char: '手', strokes: 4, meaning: 'hand', name: 'te', category: 'people', priority: true,
          mnemonic: 'A hand with fingers spread out', examples: ['持', '打', '指', '押', '拾'] },
        { char: '扌', strokes: 3, meaning: 'hand (left)', name: 'tehen', category: 'people', priority: true,
          mnemonic: 'Hand radical reaching to the left', examples: ['投', '抱', '折', '招', '授'] },
        { char: '足', strokes: 7, meaning: 'foot/leg', name: 'ashi', category: 'people', priority: true,
          mnemonic: 'A foot with toes at the bottom', examples: ['走', '路', '踊', '距', '跡'] },
        { char: '心', strokes: 4, meaning: 'heart/mind', name: 'kokoro', category: 'people', priority: true,
          mnemonic: 'A heart with chambers visible - emotions live here', examples: ['思', '感', '想', '愛', '悲'] },
        { char: '忄', strokes: 3, meaning: 'heart (left)', name: 'risshinben', category: 'people', priority: true,
          mnemonic: 'Standing heart - emotions on the side', examples: ['情', '悪', '性', '快', '忙'] },
        { char: '女', strokes: 3, meaning: 'woman', name: 'onna', category: 'people', priority: true,
          mnemonic: 'A woman kneeling gracefully', examples: ['好', '妹', '姉', '婚', '嫁'] },
        { char: '子', strokes: 3, meaning: 'child', name: 'ko', category: 'people', priority: true,
          mnemonic: 'A baby with arms outstretched', examples: ['学', '字', '孫', '存'] },
        { char: '力', strokes: 2, meaning: 'power/strength', name: 'chikara', category: 'people', priority: true,
          mnemonic: 'A flexed arm showing muscle', examples: ['動', '働', '助', '勉', '努'] },

        // Nature
        { char: '木', strokes: 4, meaning: 'tree/wood', name: 'ki', category: 'nature', priority: true,
          mnemonic: 'A tree with branches and roots spreading',
          examples: ['林', '森', '本', '休', '村'],
          detailedExamples: [
              { kanji: '休', word: '休む', reading: 'やすむ', meaning: 'to rest',
                breakdown: '休 = 人 (person) + 木 (tree)',
                story: 'A PERSON leaning against a TREE to REST' },
              { kanji: '林', word: '林', reading: 'はやし', meaning: 'grove/woods',
                breakdown: '林 = 木 + 木 (two trees)',
                story: 'Two TREES standing together make a GROVE' },
              { kanji: '森', word: '森', reading: 'もり', meaning: 'forest',
                breakdown: '森 = 木 + 木 + 木 (three trees)',
                story: 'Three TREES together make a FOREST' }
          ]},
        { char: '艹', strokes: 3, meaning: 'grass/plant', name: 'kusakanmuri', category: 'nature', priority: true,
          mnemonic: 'Two blades of grass growing - sits on top',
          examples: ['花', '草', '茶', '薬', '英'],
          detailedExamples: [
              { kanji: '花', word: '花', reading: 'はな', meaning: 'flower',
                breakdown: '花 = 艹 (grass) + 化 (change)',
                story: 'GRASS that CHANGES into something beautiful - a FLOWER' }
          ]},
        { char: '日', strokes: 4, meaning: 'sun/day', name: 'hi', category: 'nature', priority: true,
          mnemonic: 'The sun - a bright square with light inside',
          examples: ['明', '時', '早', '昼', '晴'],
          detailedExamples: [
              { kanji: '明', word: '明るい', reading: 'あかるい', meaning: 'bright',
                breakdown: '明 = 日 (sun) + 月 (moon)',
                story: 'The SUN and MOON together make it BRIGHT' },
              { kanji: '早', word: '早い', reading: 'はやい', meaning: 'early/fast',
                breakdown: '早 = 日 (sun) + 十 (ten/needle)',
                story: 'The SUN on a NEEDLE stem - the EARLY sunflower' }
          ]},
        { char: '月', strokes: 4, meaning: 'moon/month', name: 'tsuki', category: 'nature', priority: true,
          mnemonic: 'The crescent moon with lines inside',
          examples: ['明', '期', '朝', '有', '服'],
          detailedExamples: [
              { kanji: '明', word: '明日', reading: 'あした', meaning: 'tomorrow',
                breakdown: '明 = 日 (sun) + 月 (moon)',
                story: 'When SUN and MOON both shine - BRIGHT tomorrow' },
              { kanji: '朋', word: '朋友', reading: 'ほうゆう', meaning: 'friend/companion',
                breakdown: '朋 = 月 (flesh) + 月 (flesh)',
                story: 'Two pieces of FLESH together - COMPANIONS, like Adam and Eve' }
          ]},
        { char: '山', strokes: 3, meaning: 'mountain', name: 'yama', category: 'nature', priority: true,
          mnemonic: 'Three peaks of a mountain range', examples: ['島', '岸', '崎', '峰'] },
        { char: '土', strokes: 3, meaning: 'earth/soil', name: 'tsuchi', category: 'nature', priority: true,
          mnemonic: 'A cross planted in the ground - earth below', examples: ['地', '場', '塩', '堂', '基'] },
        { char: '石', strokes: 5, meaning: 'stone', name: 'ishi', category: 'nature',
          mnemonic: 'A cliff with a rock at the bottom', examples: ['研', '破', '硬', '確'] },
        { char: '田', strokes: 5, meaning: 'rice field', name: 'ta', category: 'nature', priority: true,
          mnemonic: 'A divided rice paddy seen from above', examples: ['男', '町', '界', '画', '略'] },
        { char: '竹', strokes: 6, meaning: 'bamboo', name: 'take', category: 'nature',
          mnemonic: 'Two bamboo stalks with leaves', examples: ['筆', '笑', '答', '箱', '簡'] },

        // Water & Fire
        { char: '水', strokes: 4, meaning: 'water', name: 'mizu', category: 'water', priority: true,
          mnemonic: 'Water flowing - a stream with splashes', examples: ['氷', '永', '泳', '海'] },
        { char: '氵', strokes: 3, meaning: 'water (left)', name: 'sanzui', category: 'water', priority: true,
          mnemonic: 'Three drops of water on the left side', examples: ['海', '池', '波', '洗', '深'] },
        { char: '雨', strokes: 8, meaning: 'rain', name: 'ame', category: 'water',
          mnemonic: 'A cloud with rain drops falling', examples: ['雪', '雲', '電', '霧', '雷'] },
        { char: '火', strokes: 4, meaning: 'fire', name: 'hi', category: 'water', priority: true,
          mnemonic: 'Flames rising from a central point', examples: ['灯', '炎', '災', '煙'] },
        { char: '灬', strokes: 4, meaning: 'fire (bottom)', name: 'rekka', category: 'water',
          mnemonic: 'Four flames burning at the bottom', examples: ['熱', '無', '然', '煮', '照'] },

        // Animals
        { char: '犬', strokes: 4, meaning: 'dog', name: 'inu', category: 'animals',
          mnemonic: 'A dog with a big head and wagging tail', examples: ['狂', '独', '献'] },
        { char: '犭', strokes: 3, meaning: 'animal (left)', name: 'kemono', category: 'animals',
          mnemonic: 'Wild animal radical - looks alert', examples: ['猫', '狭', '猛', '獣', '狙'] },
        { char: '馬', strokes: 10, meaning: 'horse', name: 'uma', category: 'animals',
          mnemonic: 'A horse seen from the side - mane and legs', examples: ['駅', '騒', '験', '駐'] },
        { char: '魚', strokes: 11, meaning: 'fish', name: 'sakana', category: 'animals',
          mnemonic: 'A fish with scales and tail - swimming', examples: ['鮮', '鯨', '鳥'] },
        { char: '鳥', strokes: 11, meaning: 'bird', name: 'tori', category: 'animals',
          mnemonic: 'A bird with feathers and claws', examples: ['鶏', '鳴', '鶴'] },
        { char: '虫', strokes: 6, meaning: 'insect', name: 'mushi', category: 'animals',
          mnemonic: 'A creepy crawly bug with legs', examples: ['蛇', '蚊', '蜂', '虹'] },
        { char: '貝', strokes: 7, meaning: 'shell/money', name: 'kai', category: 'animals', priority: true,
          mnemonic: 'A shell - used as currency in ancient times', examples: ['買', '売', '貨', '費', '資'] },

        // Objects & Tools
        { char: '金', strokes: 8, meaning: 'metal/gold', name: 'kane', category: 'objects', priority: true,
          mnemonic: 'Gold nuggets in a mine - precious metal', examples: ['鉄', '銀', '銅', '針', '鏡'] },
        { char: '刀', strokes: 2, meaning: 'sword', name: 'katana', category: 'objects', priority: true,
          mnemonic: 'A curved blade - sharp and deadly', examples: ['切', '分', '列', '刻'] },
        { char: '刂', strokes: 2, meaning: 'sword (right)', name: 'rittou', category: 'objects', priority: true,
          mnemonic: 'Blade on the right side - cutting edge', examples: ['別', '利', '判', '制', '割'] },
        { char: '糸', strokes: 6, meaning: 'thread/silk', name: 'ito', category: 'objects', priority: true,
          mnemonic: 'Twisted threads of silk - delicate strands', examples: ['紙', '細', '終', '結', '続'] },
        { char: '衣', strokes: 6, meaning: 'clothing', name: 'koromo', category: 'objects',
          mnemonic: 'A flowing robe or kimono', examples: ['装', '裏', '製', '複'] },
        { char: '車', strokes: 7, meaning: 'vehicle/wheel', name: 'kuruma', category: 'objects', priority: true,
          mnemonic: 'A cart seen from above - wheels and axle', examples: ['転', '軽', '輪', '軍'] },
        { char: '門', strokes: 8, meaning: 'gate', name: 'mon', category: 'objects', priority: true,
          mnemonic: 'Two doors of a traditional gate - entrance', examples: ['開', '閉', '間', '関', '聞'] },
        { char: '食', strokes: 9, meaning: 'food/eat', name: 'shoku', category: 'objects', priority: true,
          mnemonic: 'A covered dish of food - meal time', examples: ['飯', '飲', '館', '飼'] },

        // Actions & Movement
        { char: '言', strokes: 7, meaning: 'speech/say', name: 'koto', category: 'actions', priority: true,
          mnemonic: 'Words coming from the mouth', examples: ['話', '語', '読', '説', '記'] },
        { char: '訁', strokes: 2, meaning: 'speech (left)', name: 'gonben', category: 'actions', priority: true,
          mnemonic: 'Speaking radical on the left', examples: ['計', '訪', '設', '許', '訳'] },
        { char: '走', strokes: 7, meaning: 'run', name: 'hashiru', category: 'actions', priority: true,
          mnemonic: 'A person running with legs in motion', examples: ['起', '越', '超', '趣'] },
        { char: '辶', strokes: 3, meaning: 'road/walk', name: 'shinnyou', category: 'actions', priority: true,
          mnemonic: 'A winding road or path - journey ahead', examples: ['通', '進', '近', '返', '運'] },
        { char: '立', strokes: 5, meaning: 'stand', name: 'tatsu', category: 'actions', priority: true,
          mnemonic: 'A person standing on the ground', examples: ['位', '産', '親', '童', '端'] },
        { char: '見', strokes: 7, meaning: 'see', name: 'miru', category: 'actions', priority: true,
          mnemonic: 'An eye on legs - actively looking', examples: ['親', '観', '覚', '規'] },

        // Enclosures & Positions
        { char: '囗', strokes: 3, meaning: 'enclosure', name: 'kunigamae', category: 'enclosures', priority: true,
          mnemonic: 'A box or border surrounding something', examples: ['国', '園', '図', '回', '団'] },
        { char: '广', strokes: 3, meaning: 'cliff/building', name: 'madare', category: 'enclosures', priority: true,
          mnemonic: 'A shelter or roof providing cover', examples: ['広', '店', '庫', '府', '康'] },
        { char: '宀', strokes: 3, meaning: 'roof', name: 'ukanmuri', category: 'enclosures', priority: true,
          mnemonic: 'A house roof - protection above', examples: ['家', '室', '安', '寒', '宿'] },
        { char: '冖', strokes: 2, meaning: 'cover', name: 'wakanmuri', category: 'enclosures', priority: true,
          mnemonic: 'A flat cover or lid over something', examples: ['写', '冗', '冠', '軍'] },
        { char: '⻌', strokes: 3, meaning: 'walk (left)', name: 'shinnyuu', category: 'enclosures', priority: true,
          mnemonic: 'Moving or walking radical', examples: ['道', '達', '週', '過', '遠'] },
        { char: '阝', strokes: 2, meaning: 'hill/city', name: 'kozato', category: 'enclosures', priority: true,
          mnemonic: 'A hill or city wall on the side', examples: ['院', '階', '陽', '防', '際'] },

        // Abstract & Numbers
        { char: '一', strokes: 1, meaning: 'one', name: 'ichi', category: 'abstract', priority: true,
          mnemonic: 'A single horizontal line - the number one', examples: ['二', '三', '上', '下', '百'] },
        { char: '二', strokes: 2, meaning: 'two', name: 'ni', category: 'abstract', priority: true,
          mnemonic: 'Two parallel lines stacked', examples: ['元', '仁', '云'] },
        { char: '十', strokes: 2, meaning: 'ten', name: 'juu', category: 'abstract', priority: true,
          mnemonic: 'A cross shape - ten fingers crossed', examples: ['千', '午', '半', '卒', '博'] },
        { char: '大', strokes: 3, meaning: 'big', name: 'dai', category: 'abstract', priority: true,
          mnemonic: 'A person with arms spread wide - BIG', examples: ['太', '天', '央', '奇', '契'] },
        { char: '小', strokes: 3, meaning: 'small', name: 'shou', category: 'abstract', priority: true,
          mnemonic: 'A tiny thing between two dots - small', examples: ['少', '尚', '省'] },
        { char: '上', strokes: 3, meaning: 'up/above', name: 'ue', category: 'abstract', priority: true,
          mnemonic: 'A line pointing upward', examples: [] },
        { char: '下', strokes: 3, meaning: 'down/below', name: 'shita', category: 'abstract', priority: true,
          mnemonic: 'A line pointing downward', examples: [] },
        { char: '中', strokes: 4, meaning: 'middle', name: 'naka', category: 'abstract', priority: true,
          mnemonic: 'A line going through the center', examples: ['仲', '忠', '沖'] },
        { char: '貝', strokes: 7, meaning: 'shell/money', name: 'kai', category: 'objects', priority: true,
          mnemonic: 'A shell - used as currency in ancient times', examples: ['買', '売', '貨', '費', '資'] }
    ]
};

// Make available globally
window.RADICALS_DATA = RADICALS_DATA;
