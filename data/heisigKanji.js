// Heisig "Remembering the Kanji" Data
// Extracted from the book - kanji in exact Heisig learning order
// Each kanji includes: order number, character, keyword, story/mnemonic, primitives, strokes

const HEISIG_DATA = {
    // Primitive elements (not kanji themselves, but building blocks)
    primitives: [
        { id: 'walking_stick', char: '丨', meaning: 'walking stick',
          description: 'A picture of a cane or walking stick. Carries connotations of lameness.' },
        { id: 'drop', char: '丶', meaning: 'a drop of',
          description: 'Something so important it can change the whole picture - like a drop of arsenic.' },
        { id: 'divining_rod', char: '卜', meaning: 'divining rod / magic wand',
          description: 'A picture of a divining rod, composed of a drop and walking stick. Suggests magic or fortune-telling.' },
        { id: 'floor', char: '一', meaning: 'floor',
          description: 'When the horizontal stroke is below another primitive, it means floor.' },
        { id: 'ceiling', char: '一', meaning: 'ceiling',
          description: 'When the horizontal stroke is above another primitive, it means ceiling.' }
    ],

    // Kanji in exact Heisig order
    kanji: [
        // Lesson 1: Frames 1-15
        {
            frame: 1,
            kanji: '一',
            keyword: 'one',
            strokes: 1,
            lesson: 1,
            story: 'In Chinese characters, the number one is laid on its side, unlike the Roman numeral I which stands upright. Written from left to right.',
            components: [],
            primitiveAs: 'floor (below) or ceiling (above)'
        },
        {
            frame: 2,
            kanji: '二',
            keyword: 'two',
            strokes: 2,
            lesson: 1,
            story: 'Like the Roman numeral II, the kanji for two is a simple reduplication of the horizontal stroke. Order: above to below, first stroke slightly shorter.',
            components: ['one', 'one']
        },
        {
            frame: 3,
            kanji: '三',
            keyword: 'three',
            strokes: 3,
            lesson: 1,
            story: 'Like the Roman numeral III, triples the single horizontal stroke. Think "1 + 2 = 3" to keep the middle stroke shorter.',
            components: ['one', 'two']
        },
        {
            frame: 4,
            kanji: '四',
            keyword: 'four',
            strokes: 5,
            lesson: 1,
            story: 'Composed of mouth and human legs. Write north-to-south, west-to-east, northwest-to-southeast.',
            components: ['mouth', 'human legs']
        },
        {
            frame: 5,
            kanji: '五',
            keyword: 'five',
            strokes: 4,
            lesson: 1,
            story: 'The general principle of north-to-south, west-to-east applies to writing this character.',
            components: []
        },
        {
            frame: 6,
            kanji: '六',
            keyword: 'six',
            strokes: 4,
            lesson: 1,
            story: 'The primitives are top hat and animal legs.',
            components: ['top hat', 'animal legs']
        },
        {
            frame: 7,
            kanji: '七',
            keyword: 'seven',
            strokes: 2,
            lesson: 1,
            story: 'The first stroke "cuts" through the second. This distinguishes seven from spoon.',
            components: [],
            primitiveAs: 'diced (cut into little pieces)'
        },
        {
            frame: 8,
            kanji: '八',
            keyword: 'eight',
            strokes: 2,
            lesson: 1,
            story: 'Like the Arabic "8" with a small circle followed by a larger one. The expanse below suggests infinity or "all-encompassing."',
            components: []
        },
        {
            frame: 9,
            kanji: '九',
            keyword: 'nine',
            strokes: 2,
            lesson: 1,
            story: 'Remember the stroke order to distinguish it from the kanji for power.',
            components: [],
            primitiveAs: 'baseball team (nine players)'
        },
        {
            frame: 10,
            kanji: '十',
            keyword: 'ten',
            strokes: 2,
            lesson: 1,
            story: 'Turn 45 degrees either way and you have the X used for the Roman numeral ten.',
            components: [],
            primitiveAs: 'ten or needle'
        },
        {
            frame: 11,
            kanji: '口',
            keyword: 'mouth',
            strokes: 3,
            lesson: 1,
            story: 'A clear pictograph of a mouth. Since there are no circular shapes in kanji, the square depicts the circle.',
            components: [],
            primitiveAs: 'mouth, opening, entrance, cave, hole'
        },
        {
            frame: 12,
            kanji: '日',
            keyword: 'day',
            strokes: 4,
            lesson: 1,
            story: 'A pictograph of the sun - detect the circle and the big smile, like "Have a nice day!" badges.',
            components: [],
            primitiveAs: 'sun, day, or tongue wagging in mouth'
        },
        {
            frame: 13,
            kanji: '月',
            keyword: 'month',
            strokes: 4,
            lesson: 1,
            story: 'A picture of the moon with two horizontal lines representing the "man in the moon." One month = one cycle of the moon.',
            components: [],
            primitiveAs: 'moon, flesh, or part of body'
        },
        {
            frame: 14,
            kanji: '田',
            keyword: 'rice field',
            strokes: 5,
            lesson: 1,
            story: 'A bird\'s-eye view of a rice field divided into four plots.',
            components: [],
            primitiveAs: 'rice field or brains (looks like gray matter)'
        },
        {
            frame: 15,
            kanji: '目',
            keyword: 'eye',
            strokes: 5,
            lesson: 1,
            story: 'Round out the corners and curve the middle strokes to see something resembling an eye.',
            components: [],
            primitiveAs: 'eye or eyeball (sometimes turned on its side)'
        },

        // Lesson 2: Frames 16-34
        {
            frame: 16,
            kanji: '古',
            keyword: 'old',
            strokes: 5,
            lesson: 2,
            story: 'Ten + mouth, but easier as a pictograph of a tombstone with a cross on top. Think of old graveyards with old inscriptions.',
            components: ['ten', 'mouth'],
            primitiveAs: 'old (make it graphic)'
        },
        {
            frame: 17,
            kanji: '吾',
            keyword: 'I',
            strokes: 7,
            lesson: 2,
            story: 'The perceiving subject. The head has five mouths: 2 nostrils, 2 ears, 1 mouth. Five mouths = I.',
            components: ['five', 'mouth']
        },
        {
            frame: 18,
            kanji: '冒',
            keyword: 'risk',
            strokes: 9,
            lesson: 2,
            story: 'Remember when you were told never to look directly into the sun? A sun above and an eye below looking up = risk.',
            components: ['sun', 'eye']
        },
        {
            frame: 19,
            kanji: '朋',
            keyword: 'companion',
            strokes: 8,
            lesson: 2,
            story: 'The first companion God made was Eve. Adam exclaimed "Flesh of my flesh!" Two moons (flesh) together.',
            components: ['moon/flesh', 'moon/flesh']
        },
        {
            frame: 20,
            kanji: '明',
            keyword: 'bright',
            strokes: 8,
            lesson: 2,
            story: 'The sun to rule the day and the moon to rule the night - nature\'s bright lights. Sun = bright insight; moon = bright intuition.',
            components: ['sun', 'moon']
        },
        {
            frame: 21,
            kanji: '唱',
            keyword: 'chant',
            strokes: 11,
            lesson: 2,
            story: 'One mouth making no noise (choirmaster) and two mouths with wagging tongues (minimum for a chorus). Monastery singing.',
            components: ['mouth', 'day', 'day']
        },
        {
            frame: 22,
            kanji: '晶',
            keyword: 'sparkle',
            strokes: 12,
            lesson: 2,
            story: 'A diamond held up to light - every facet becomes like a miniature sun. Three suns = sparkles on all sides.',
            components: ['sun', 'sun', 'sun']
        },
        {
            frame: 23,
            kanji: '品',
            keyword: 'goods',
            strokes: 9,
            lesson: 2,
            story: 'Three mouths = "everywhere" or "heaps of." Mass-produced goods for masses of open mouths waiting to consume.',
            components: ['mouth', 'mouth', 'mouth']
        },
        {
            frame: 24,
            kanji: '呂',
            keyword: 'spine',
            strokes: 7,
            lesson: 2,
            story: 'A picture of two vertebrae in the spine linked by a single stroke.',
            components: ['mouth', 'mouth']
        },
        {
            frame: 25,
            kanji: '昌',
            keyword: 'prosperous',
            strokes: 8,
            lesson: 2,
            story: 'Two suns, not three. Prosperous times are sunny - what could be more prosperous than a sky with two suns?',
            components: ['sun', 'sun']
        },
        {
            frame: 26,
            kanji: '早',
            keyword: 'early',
            strokes: 6,
            lesson: 2,
            story: 'The first flower of the day - a sunflower with a needle for a stem. The sun shines on its namesake before all others.',
            components: ['sun', 'needle'],
            primitiveAs: 'sunflower'
        },
        {
            frame: 27,
            kanji: '旭',
            keyword: 'rising sun',
            strokes: 6,
            lesson: 2,
            story: 'The Japanese flag emblem. Picture two seams on the red sun, sitting on a baseball bat flagpole.',
            components: ['baseball', 'sun']
        },
        {
            frame: 28,
            kanji: '世',
            keyword: 'generation',
            strokes: 5,
            lesson: 2,
            story: 'One generation = thirty years (ten + ten + ten). Three tens with "addition" lines below them.',
            components: ['ten', 'ten', 'ten']
        },
        {
            frame: 29,
            kanji: '胃',
            keyword: 'stomach',
            strokes: 9,
            lesson: 2,
            story: 'Flesh (part of body) and brain (rice field). The part of the body that keeps the brain working is the stomach.',
            components: ['brain/rice field', 'flesh/moon']
        },
        {
            frame: 30,
            kanji: '旦',
            keyword: 'nightbreak',
            strokes: 5,
            lesson: 2,
            story: 'The "opening up of night" into day. The floor/horizon over which the sun is poking its head.',
            components: ['sun', 'floor']
        },
        {
            frame: 31,
            kanji: '胆',
            keyword: 'gall bladder',
            strokes: 9,
            lesson: 2,
            story: 'Part of body + nightbreak. Don\'t let the night break on your anger (gall). Sleep it off.',
            components: ['flesh/moon', 'nightbreak']
        },
        {
            frame: 32,
            kanji: '亘',
            keyword: 'span',
            strokes: 6,
            lesson: 2,
            story: '"Sunrise, sunset..." The sun\'s journey from floor (horizon) to ceiling and back - the span of our lives.',
            components: ['floor', 'sun', 'ceiling']
        },
        {
            frame: 33,
            kanji: '凹',
            keyword: 'concave',
            strokes: 5,
            lesson: 2,
            story: 'A perfect image of a concave lens, complete with its own little "cave."',
            components: []
        },
        {
            frame: 34,
            kanji: '凸',
            keyword: 'convex',
            strokes: 5,
            lesson: 2,
            story: 'The opposite of concave. Note the unusual third stroke.',
            components: []
        },

        // Lesson 3: Frames 35-47
        {
            frame: 35,
            kanji: '旧',
            keyword: 'olden times',
            strokes: 5,
            lesson: 3,
            story: 'A walking stick is needed for days of olden times. Think of the "good old days."',
            components: ['walking stick', 'day']
        },
        {
            frame: 36,
            kanji: '自',
            keyword: 'oneself',
            strokes: 6,
            lesson: 3,
            story: 'A stylized pictograph of the nose - that little drop between your eyes. Japanese point at their nose to indicate themselves.',
            components: ['drop', 'eye'],
            primitiveAs: 'nose or nostrils'
        },
        {
            frame: 37,
            kanji: '白',
            keyword: 'white',
            strokes: 5,
            lesson: 3,
            story: 'White is a mixture of all primary colors, as seen when a prism breaks up sunlight. A drop of sun = white.',
            components: ['drop', 'sun'],
            primitiveAs: 'white, white bird, or dove'
        },
        {
            frame: 38,
            kanji: '百',
            keyword: 'hundred',
            strokes: 6,
            lesson: 3,
            story: 'A person\'s 99th birthday is called a "white year" because white is what remains when you subtract one from hundred.',
            components: ['one', 'white']
        },
        {
            frame: 39,
            kanji: '中',
            keyword: 'in',
            strokes: 4,
            lesson: 3,
            story: 'A walking stick and a mouth. Getting medicine IN your mouth - imagine using grandfather\'s walking stick to pry open your jaws.',
            components: ['walking stick', 'mouth']
        },
        {
            frame: 40,
            kanji: '千',
            keyword: 'thousand',
            strokes: 3,
            lesson: 3,
            story: 'A drop above and ten below. Squeeze two more zeros out of an eyedropper alongside ten to make a thousand.',
            components: ['drop', 'ten']
        },
        {
            frame: 41,
            kanji: '舌',
            keyword: 'tongue',
            strokes: 6,
            lesson: 3,
            story: 'Mouth + thousand = a thousand mouths sharing a common tongue. A single tongue passed around from mouth to mouth.',
            components: ['thousand', 'mouth']
        },
        {
            frame: 42,
            kanji: '升',
            keyword: 'measuring box',
            strokes: 4,
            lesson: 3,
            story: 'The wooden box for measuring things (and drinking sake). Imagine the outside spiked with a thousand sharp needles - a drinker\'s nightmare!',
            components: ['thousand']
        },
        {
            frame: 43,
            kanji: '昇',
            keyword: 'rise up',
            strokes: 8,
            lesson: 3,
            story: 'A sun and a measuring box. The sun rising up out of a Japanese measuring box - "the measuring box of the rising-up sun."',
            components: ['sun', 'measuring box']
        },
        {
            frame: 44,
            kanji: '丸',
            keyword: 'round',
            strokes: 3,
            lesson: 3,
            story: 'Adding a tiny drop to nine gives you a round number (10).',
            components: ['nine', 'drop'],
            primitiveAs: 'fat man (a round baseball player getting hit by pitches)'
        },
        {
            frame: 45,
            kanji: '寸',
            keyword: 'measurement',
            strokes: 3,
            lesson: 3,
            story: 'An old measurement unit (about an inch). A drop of a ten with a hook.',
            components: ['drop', 'ten'],
            primitiveAs: 'glue or glued to'
        },
        {
            frame: 46,
            kanji: '専',
            keyword: 'specialty',
            strokes: 9,
            lesson: 3,
            story: 'Ten rice fields glued together. A specialty is your special "field" - few remain content with one, so they extend to other fields.',
            components: ['ten', 'rice field', 'glue']
        },
        {
            frame: 47,
            kanji: '博',
            keyword: 'Dr.',
            strokes: 12,
            lesson: 3,
            story: 'Needle + specialty + extra drop. A Dr. who is a specialist with a needle (acupuncturist). The drop represents the period at the end of Dr.',
            components: ['needle', 'specialty', 'drop'],
            primitiveAs: 'acupuncturist'
        }
    ],

    // Get kanji by frame number
    getByFrame(frameNumber) {
        return this.kanji.find(k => k.frame === frameNumber);
    },

    // Get all kanji in a lesson
    getLesson(lessonNumber) {
        return this.kanji.filter(k => k.lesson === lessonNumber);
    },

    // Get kanji by character
    getByKanji(char) {
        return this.kanji.find(k => k.kanji === char);
    },

    // Get total kanji count
    getTotalCount() {
        return this.kanji.length;
    },

    // Get lessons list
    getLessons() {
        const lessons = {};
        this.kanji.forEach(k => {
            if (!lessons[k.lesson]) {
                lessons[k.lesson] = [];
            }
            lessons[k.lesson].push(k);
        });
        return lessons;
    },

    // Search kanji by keyword
    searchByKeyword(query) {
        const q = query.toLowerCase();
        return this.kanji.filter(k =>
            k.keyword.toLowerCase().includes(q) ||
            k.story.toLowerCase().includes(q)
        );
    }
};

// Make available globally
window.HEISIG_DATA = HEISIG_DATA;
