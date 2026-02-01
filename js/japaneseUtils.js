// Japanese Text Utilities - Romaji conversion and tooltips

const JapaneseUtils = {
    // Hiragana to romaji mapping
    hiraganaToRomaji: {
        'あ': 'a', 'い': 'i', 'う': 'u', 'え': 'e', 'お': 'o',
        'か': 'ka', 'き': 'ki', 'く': 'ku', 'け': 'ke', 'こ': 'ko',
        'さ': 'sa', 'し': 'shi', 'す': 'su', 'せ': 'se', 'そ': 'so',
        'た': 'ta', 'ち': 'chi', 'つ': 'tsu', 'て': 'te', 'と': 'to',
        'な': 'na', 'に': 'ni', 'ぬ': 'nu', 'ね': 'ne', 'の': 'no',
        'は': 'ha', 'ひ': 'hi', 'ふ': 'fu', 'へ': 'he', 'ほ': 'ho',
        'ま': 'ma', 'み': 'mi', 'む': 'mu', 'め': 'me', 'も': 'mo',
        'や': 'ya', 'ゆ': 'yu', 'よ': 'yo',
        'ら': 'ra', 'り': 'ri', 'る': 'ru', 'れ': 're', 'ろ': 'ro',
        'わ': 'wa', 'を': 'wo', 'ん': 'n',
        // Dakuten
        'が': 'ga', 'ぎ': 'gi', 'ぐ': 'gu', 'げ': 'ge', 'ご': 'go',
        'ざ': 'za', 'じ': 'ji', 'ず': 'zu', 'ぜ': 'ze', 'ぞ': 'zo',
        'だ': 'da', 'ぢ': 'ji', 'づ': 'zu', 'で': 'de', 'ど': 'do',
        'ば': 'ba', 'び': 'bi', 'ぶ': 'bu', 'べ': 'be', 'ぼ': 'bo',
        'ぱ': 'pa', 'ぴ': 'pi', 'ぷ': 'pu', 'ぺ': 'pe', 'ぽ': 'po',
        // Combo (small y)
        'きゃ': 'kya', 'きゅ': 'kyu', 'きょ': 'kyo',
        'しゃ': 'sha', 'しゅ': 'shu', 'しょ': 'sho',
        'ちゃ': 'cha', 'ちゅ': 'chu', 'ちょ': 'cho',
        'にゃ': 'nya', 'にゅ': 'nyu', 'にょ': 'nyo',
        'ひゃ': 'hya', 'ひゅ': 'hyu', 'ひょ': 'hyo',
        'みゃ': 'mya', 'みゅ': 'myu', 'みょ': 'myo',
        'りゃ': 'rya', 'りゅ': 'ryu', 'りょ': 'ryo',
        'ぎゃ': 'gya', 'ぎゅ': 'gyu', 'ぎょ': 'gyo',
        'じゃ': 'ja', 'じゅ': 'ju', 'じょ': 'jo',
        'びゃ': 'bya', 'びゅ': 'byu', 'びょ': 'byo',
        'ぴゃ': 'pya', 'ぴゅ': 'pyu', 'ぴょ': 'pyo',
        // Small kana
        'っ': '(small tsu)',
        'ゃ': '(small ya)', 'ゅ': '(small yu)', 'ょ': '(small yo)',
        'ぁ': '(small a)', 'ぃ': '(small i)', 'ぅ': '(small u)', 'ぇ': '(small e)', 'ぉ': '(small o)',
    },

    // Katakana to romaji mapping
    katakanaToRomaji: {
        'ア': 'a', 'イ': 'i', 'ウ': 'u', 'エ': 'e', 'オ': 'o',
        'カ': 'ka', 'キ': 'ki', 'ク': 'ku', 'ケ': 'ke', 'コ': 'ko',
        'サ': 'sa', 'シ': 'shi', 'ス': 'su', 'セ': 'se', 'ソ': 'so',
        'タ': 'ta', 'チ': 'chi', 'ツ': 'tsu', 'テ': 'te', 'ト': 'to',
        'ナ': 'na', 'ニ': 'ni', 'ヌ': 'nu', 'ネ': 'ne', 'ノ': 'no',
        'ハ': 'ha', 'ヒ': 'hi', 'フ': 'fu', 'ヘ': 'he', 'ホ': 'ho',
        'マ': 'ma', 'ミ': 'mi', 'ム': 'mu', 'メ': 'me', 'モ': 'mo',
        'ヤ': 'ya', 'ユ': 'yu', 'ヨ': 'yo',
        'ラ': 'ra', 'リ': 'ri', 'ル': 'ru', 'レ': 're', 'ロ': 'ro',
        'ワ': 'wa', 'ヲ': 'wo', 'ン': 'n',
        // Dakuten
        'ガ': 'ga', 'ギ': 'gi', 'グ': 'gu', 'ゲ': 'ge', 'ゴ': 'go',
        'ザ': 'za', 'ジ': 'ji', 'ズ': 'zu', 'ゼ': 'ze', 'ゾ': 'zo',
        'ダ': 'da', 'ヂ': 'ji', 'ヅ': 'zu', 'デ': 'de', 'ド': 'do',
        'バ': 'ba', 'ビ': 'bi', 'ブ': 'bu', 'ベ': 'be', 'ボ': 'bo',
        'パ': 'pa', 'ピ': 'pi', 'プ': 'pu', 'ペ': 'pe', 'ポ': 'po',
        // Combo
        'キャ': 'kya', 'キュ': 'kyu', 'キョ': 'kyo',
        'シャ': 'sha', 'シュ': 'shu', 'ショ': 'sho',
        'チャ': 'cha', 'チュ': 'chu', 'チョ': 'cho',
        'ニャ': 'nya', 'ニュ': 'nyu', 'ニョ': 'nyo',
        'ヒャ': 'hya', 'ヒュ': 'hyu', 'ヒョ': 'hyo',
        'ミャ': 'mya', 'ミュ': 'myu', 'ミョ': 'myo',
        'リャ': 'rya', 'リュ': 'ryu', 'リョ': 'ryo',
        'ギャ': 'gya', 'ギュ': 'gyu', 'ギョ': 'gyo',
        'ジャ': 'ja', 'ジュ': 'ju', 'ジョ': 'jo',
        'ビャ': 'bya', 'ビュ': 'byu', 'ビョ': 'byo',
        'ピャ': 'pya', 'ピュ': 'pyu', 'ピョ': 'pyo',
        // Extended katakana
        'ファ': 'fa', 'フィ': 'fi', 'フェ': 'fe', 'フォ': 'fo',
        'ヴァ': 'va', 'ヴィ': 'vi', 'ヴ': 'vu', 'ヴェ': 've', 'ヴォ': 'vo',
        'ティ': 'ti', 'ディ': 'di',
        'ウィ': 'wi', 'ウェ': 'we', 'ウォ': 'wo',
        // Small kana
        'ッ': '(small tsu)',
        'ャ': '(small ya)', 'ュ': '(small yu)', 'ョ': '(small yo)',
        'ァ': '(small a)', 'ィ': '(small i)', 'ゥ': '(small u)', 'ェ': '(small e)', 'ォ': '(small o)',
        'ー': '(long vowel)',
    },

    // Check if character is hiragana
    isHiragana(char) {
        const code = char.charCodeAt(0);
        return code >= 0x3040 && code <= 0x309F;
    },

    // Check if character is katakana
    isKatakana(char) {
        const code = char.charCodeAt(0);
        return code >= 0x30A0 && code <= 0x30FF;
    },

    // Check if character is kanji
    isKanji(char) {
        const code = char.charCodeAt(0);
        return (code >= 0x4E00 && code <= 0x9FFF) || // CJK Unified Ideographs
               (code >= 0x3400 && code <= 0x4DBF);   // CJK Extension A
    },

    // Get romaji for a kana character
    getRomaji(char) {
        return this.hiraganaToRomaji[char] || this.katakanaToRomaji[char] || null;
    },

    // Convert kana string to romaji
    toRomaji(text) {
        let result = '';
        let i = 0;
        while (i < text.length) {
            // Check for 2-character combinations first
            if (i + 1 < text.length) {
                const twoChar = text.substring(i, i + 2);
                const romaji = this.getRomaji(twoChar);
                if (romaji) {
                    result += romaji;
                    i += 2;
                    continue;
                }
            }
            // Single character
            const char = text[i];
            const romaji = this.getRomaji(char);
            result += romaji || char;
            i++;
        }
        return result;
    },

    // Get tooltip text for a character
    getTooltip(char, reading) {
        if (this.isHiragana(char) || this.isKatakana(char)) {
            const romaji = this.getRomaji(char);
            return romaji ? romaji : null;
        }
        if (this.isKanji(char) && reading) {
            return reading;
        }
        return null;
    },

    // Check if kana mastery is complete (both hiragana AND katakana at 100%)
    isKanaMasteryComplete() {
        const foundationProgress = Storage.getFoundationProgress();
        const hiraganaScore = foundationProgress?.kana?.hiraganaScore || 0;
        const katakanaScore = foundationProgress?.kana?.katakanaScore || 0;
        return hiraganaScore >= 100 && katakanaScore >= 100;
    },

    // Check if user needs furigana (kana not mastered yet)
    needsFurigana() {
        return !this.isKanaMasteryComplete();
    },

    // Add furigana to text with kanji
    // Returns array of segments: { text: string, reading?: string, isKanji: boolean }
    addFuriganaToWord(word, reading) {
        if (!word || !reading) return [{ text: word || '', isKanji: false }];

        const segments = [];
        let wordIdx = 0;
        let readingIdx = 0;

        while (wordIdx < word.length) {
            const char = word[wordIdx];

            if (this.isKanji(char)) {
                // Find all consecutive kanji
                let kanjiRun = char;
                let kanjiEnd = wordIdx + 1;
                while (kanjiEnd < word.length && this.isKanji(word[kanjiEnd])) {
                    kanjiRun += word[kanjiEnd];
                    kanjiEnd++;
                }

                // Find the reading for this kanji run
                // Look for the next kana in the word to know where reading ends
                let nextKana = '';
                if (kanjiEnd < word.length) {
                    nextKana = word[kanjiEnd];
                }

                // Find where this kana appears in the remaining reading
                let kanjiReading = '';
                if (nextKana) {
                    const nextKanaIdx = reading.indexOf(nextKana, readingIdx);
                    if (nextKanaIdx > readingIdx) {
                        kanjiReading = reading.substring(readingIdx, nextKanaIdx);
                        readingIdx = nextKanaIdx;
                    } else {
                        kanjiReading = reading.substring(readingIdx);
                        readingIdx = reading.length;
                    }
                } else {
                    kanjiReading = reading.substring(readingIdx);
                    readingIdx = reading.length;
                }

                segments.push({ text: kanjiRun, reading: kanjiReading, isKanji: true });
                wordIdx = kanjiEnd;
            } else {
                // Kana or other character - just add it
                segments.push({ text: char, isKanji: false });
                wordIdx++;
                // Skip corresponding character in reading
                if (readingIdx < reading.length &&
                    (reading[readingIdx] === char ||
                     this.isHiragana(reading[readingIdx]) ||
                     this.isKatakana(reading[readingIdx]))) {
                    readingIdx++;
                }
            }
        }

        return segments;
    }
};

// Make available globally
window.JapaneseUtils = JapaneseUtils;
