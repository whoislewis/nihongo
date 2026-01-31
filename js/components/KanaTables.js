// Kana Tables Component - Hiragana and Katakana reference

const { useState } = React;

const KanaTables = () => {
    const [activeTable, setActiveTable] = useState('hiragana');
    const [showRomaji, setShowRomaji] = useState(true);

    // Hiragana table data
    const hiragana = {
        basic: [
            { kana: 'あ', romaji: 'a' }, { kana: 'い', romaji: 'i' }, { kana: 'う', romaji: 'u' }, { kana: 'え', romaji: 'e' }, { kana: 'お', romaji: 'o' },
            { kana: 'か', romaji: 'ka' }, { kana: 'き', romaji: 'ki' }, { kana: 'く', romaji: 'ku' }, { kana: 'け', romaji: 'ke' }, { kana: 'こ', romaji: 'ko' },
            { kana: 'さ', romaji: 'sa' }, { kana: 'し', romaji: 'shi' }, { kana: 'す', romaji: 'su' }, { kana: 'せ', romaji: 'se' }, { kana: 'そ', romaji: 'so' },
            { kana: 'た', romaji: 'ta' }, { kana: 'ち', romaji: 'chi' }, { kana: 'つ', romaji: 'tsu' }, { kana: 'て', romaji: 'te' }, { kana: 'と', romaji: 'to' },
            { kana: 'な', romaji: 'na' }, { kana: 'に', romaji: 'ni' }, { kana: 'ぬ', romaji: 'nu' }, { kana: 'ね', romaji: 'ne' }, { kana: 'の', romaji: 'no' },
            { kana: 'は', romaji: 'ha' }, { kana: 'ひ', romaji: 'hi' }, { kana: 'ふ', romaji: 'fu' }, { kana: 'へ', romaji: 'he' }, { kana: 'ほ', romaji: 'ho' },
            { kana: 'ま', romaji: 'ma' }, { kana: 'み', romaji: 'mi' }, { kana: 'む', romaji: 'mu' }, { kana: 'め', romaji: 'me' }, { kana: 'も', romaji: 'mo' },
            { kana: 'や', romaji: 'ya' }, { kana: '', romaji: '' }, { kana: 'ゆ', romaji: 'yu' }, { kana: '', romaji: '' }, { kana: 'よ', romaji: 'yo' },
            { kana: 'ら', romaji: 'ra' }, { kana: 'り', romaji: 'ri' }, { kana: 'る', romaji: 'ru' }, { kana: 'れ', romaji: 're' }, { kana: 'ろ', romaji: 'ro' },
            { kana: 'わ', romaji: 'wa' }, { kana: '', romaji: '' }, { kana: '', romaji: '' }, { kana: '', romaji: '' }, { kana: 'を', romaji: 'wo' },
            { kana: 'ん', romaji: 'n' }, { kana: '', romaji: '' }, { kana: '', romaji: '' }, { kana: '', romaji: '' }, { kana: '', romaji: '' },
        ],
        dakuten: [
            { kana: 'が', romaji: 'ga' }, { kana: 'ぎ', romaji: 'gi' }, { kana: 'ぐ', romaji: 'gu' }, { kana: 'げ', romaji: 'ge' }, { kana: 'ご', romaji: 'go' },
            { kana: 'ざ', romaji: 'za' }, { kana: 'じ', romaji: 'ji' }, { kana: 'ず', romaji: 'zu' }, { kana: 'ぜ', romaji: 'ze' }, { kana: 'ぞ', romaji: 'zo' },
            { kana: 'だ', romaji: 'da' }, { kana: 'ぢ', romaji: 'ji' }, { kana: 'づ', romaji: 'zu' }, { kana: 'で', romaji: 'de' }, { kana: 'ど', romaji: 'do' },
            { kana: 'ば', romaji: 'ba' }, { kana: 'び', romaji: 'bi' }, { kana: 'ぶ', romaji: 'bu' }, { kana: 'べ', romaji: 'be' }, { kana: 'ぼ', romaji: 'bo' },
            { kana: 'ぱ', romaji: 'pa' }, { kana: 'ぴ', romaji: 'pi' }, { kana: 'ぷ', romaji: 'pu' }, { kana: 'ぺ', romaji: 'pe' }, { kana: 'ぽ', romaji: 'po' },
        ],
        combo: [
            { kana: 'きゃ', romaji: 'kya' }, { kana: 'きゅ', romaji: 'kyu' }, { kana: 'きょ', romaji: 'kyo' },
            { kana: 'しゃ', romaji: 'sha' }, { kana: 'しゅ', romaji: 'shu' }, { kana: 'しょ', romaji: 'sho' },
            { kana: 'ちゃ', romaji: 'cha' }, { kana: 'ちゅ', romaji: 'chu' }, { kana: 'ちょ', romaji: 'cho' },
            { kana: 'にゃ', romaji: 'nya' }, { kana: 'にゅ', romaji: 'nyu' }, { kana: 'にょ', romaji: 'nyo' },
            { kana: 'ひゃ', romaji: 'hya' }, { kana: 'ひゅ', romaji: 'hyu' }, { kana: 'ひょ', romaji: 'hyo' },
            { kana: 'みゃ', romaji: 'mya' }, { kana: 'みゅ', romaji: 'myu' }, { kana: 'みょ', romaji: 'myo' },
            { kana: 'りゃ', romaji: 'rya' }, { kana: 'りゅ', romaji: 'ryu' }, { kana: 'りょ', romaji: 'ryo' },
            { kana: 'ぎゃ', romaji: 'gya' }, { kana: 'ぎゅ', romaji: 'gyu' }, { kana: 'ぎょ', romaji: 'gyo' },
            { kana: 'じゃ', romaji: 'ja' }, { kana: 'じゅ', romaji: 'ju' }, { kana: 'じょ', romaji: 'jo' },
            { kana: 'びゃ', romaji: 'bya' }, { kana: 'びゅ', romaji: 'byu' }, { kana: 'びょ', romaji: 'byo' },
            { kana: 'ぴゃ', romaji: 'pya' }, { kana: 'ぴゅ', romaji: 'pyu' }, { kana: 'ぴょ', romaji: 'pyo' },
        ]
    };

    // Katakana table data
    const katakana = {
        basic: [
            { kana: 'ア', romaji: 'a' }, { kana: 'イ', romaji: 'i' }, { kana: 'ウ', romaji: 'u' }, { kana: 'エ', romaji: 'e' }, { kana: 'オ', romaji: 'o' },
            { kana: 'カ', romaji: 'ka' }, { kana: 'キ', romaji: 'ki' }, { kana: 'ク', romaji: 'ku' }, { kana: 'ケ', romaji: 'ke' }, { kana: 'コ', romaji: 'ko' },
            { kana: 'サ', romaji: 'sa' }, { kana: 'シ', romaji: 'shi' }, { kana: 'ス', romaji: 'su' }, { kana: 'セ', romaji: 'se' }, { kana: 'ソ', romaji: 'so' },
            { kana: 'タ', romaji: 'ta' }, { kana: 'チ', romaji: 'chi' }, { kana: 'ツ', romaji: 'tsu' }, { kana: 'テ', romaji: 'te' }, { kana: 'ト', romaji: 'to' },
            { kana: 'ナ', romaji: 'na' }, { kana: 'ニ', romaji: 'ni' }, { kana: 'ヌ', romaji: 'nu' }, { kana: 'ネ', romaji: 'ne' }, { kana: 'ノ', romaji: 'no' },
            { kana: 'ハ', romaji: 'ha' }, { kana: 'ヒ', romaji: 'hi' }, { kana: 'フ', romaji: 'fu' }, { kana: 'ヘ', romaji: 'he' }, { kana: 'ホ', romaji: 'ho' },
            { kana: 'マ', romaji: 'ma' }, { kana: 'ミ', romaji: 'mi' }, { kana: 'ム', romaji: 'mu' }, { kana: 'メ', romaji: 'me' }, { kana: 'モ', romaji: 'mo' },
            { kana: 'ヤ', romaji: 'ya' }, { kana: '', romaji: '' }, { kana: 'ユ', romaji: 'yu' }, { kana: '', romaji: '' }, { kana: 'ヨ', romaji: 'yo' },
            { kana: 'ラ', romaji: 'ra' }, { kana: 'リ', romaji: 'ri' }, { kana: 'ル', romaji: 'ru' }, { kana: 'レ', romaji: 're' }, { kana: 'ロ', romaji: 'ro' },
            { kana: 'ワ', romaji: 'wa' }, { kana: '', romaji: '' }, { kana: '', romaji: '' }, { kana: '', romaji: '' }, { kana: 'ヲ', romaji: 'wo' },
            { kana: 'ン', romaji: 'n' }, { kana: '', romaji: '' }, { kana: '', romaji: '' }, { kana: '', romaji: '' }, { kana: '', romaji: '' },
        ],
        dakuten: [
            { kana: 'ガ', romaji: 'ga' }, { kana: 'ギ', romaji: 'gi' }, { kana: 'グ', romaji: 'gu' }, { kana: 'ゲ', romaji: 'ge' }, { kana: 'ゴ', romaji: 'go' },
            { kana: 'ザ', romaji: 'za' }, { kana: 'ジ', romaji: 'ji' }, { kana: 'ズ', romaji: 'zu' }, { kana: 'ゼ', romaji: 'ze' }, { kana: 'ゾ', romaji: 'zo' },
            { kana: 'ダ', romaji: 'da' }, { kana: 'ヂ', romaji: 'ji' }, { kana: 'ヅ', romaji: 'zu' }, { kana: 'デ', romaji: 'de' }, { kana: 'ド', romaji: 'do' },
            { kana: 'バ', romaji: 'ba' }, { kana: 'ビ', romaji: 'bi' }, { kana: 'ブ', romaji: 'bu' }, { kana: 'ベ', romaji: 'be' }, { kana: 'ボ', romaji: 'bo' },
            { kana: 'パ', romaji: 'pa' }, { kana: 'ピ', romaji: 'pi' }, { kana: 'プ', romaji: 'pu' }, { kana: 'ペ', romaji: 'pe' }, { kana: 'ポ', romaji: 'po' },
        ],
        combo: [
            { kana: 'キャ', romaji: 'kya' }, { kana: 'キュ', romaji: 'kyu' }, { kana: 'キョ', romaji: 'kyo' },
            { kana: 'シャ', romaji: 'sha' }, { kana: 'シュ', romaji: 'shu' }, { kana: 'ショ', romaji: 'sho' },
            { kana: 'チャ', romaji: 'cha' }, { kana: 'チュ', romaji: 'chu' }, { kana: 'チョ', romaji: 'cho' },
            { kana: 'ニャ', romaji: 'nya' }, { kana: 'ニュ', romaji: 'nyu' }, { kana: 'ニョ', romaji: 'nyo' },
            { kana: 'ヒャ', romaji: 'hya' }, { kana: 'ヒュ', romaji: 'hyu' }, { kana: 'ヒョ', romaji: 'hyo' },
            { kana: 'ミャ', romaji: 'mya' }, { kana: 'ミュ', romaji: 'myu' }, { kana: 'ミョ', romaji: 'myo' },
            { kana: 'リャ', romaji: 'rya' }, { kana: 'リュ', romaji: 'ryu' }, { kana: 'リョ', romaji: 'ryo' },
            { kana: 'ギャ', romaji: 'gya' }, { kana: 'ギュ', romaji: 'gyu' }, { kana: 'ギョ', romaji: 'gyo' },
            { kana: 'ジャ', romaji: 'ja' }, { kana: 'ジュ', romaji: 'ju' }, { kana: 'ジョ', romaji: 'jo' },
            { kana: 'ビャ', romaji: 'bya' }, { kana: 'ビュ', romaji: 'byu' }, { kana: 'ビョ', romaji: 'byo' },
            { kana: 'ピャ', romaji: 'pya' }, { kana: 'ピュ', romaji: 'pyu' }, { kana: 'ピョ', romaji: 'pyo' },
        ],
        // Extended katakana for foreign sounds
        extended: [
            { kana: 'ファ', romaji: 'fa' }, { kana: 'フィ', romaji: 'fi' }, { kana: 'フェ', romaji: 'fe' }, { kana: 'フォ', romaji: 'fo' },
            { kana: 'ヴァ', romaji: 'va' }, { kana: 'ヴィ', romaji: 'vi' }, { kana: 'ヴ', romaji: 'vu' }, { kana: 'ヴェ', romaji: 've' }, { kana: 'ヴォ', romaji: 'vo' },
            { kana: 'ティ', romaji: 'ti' }, { kana: 'ディ', romaji: 'di' },
            { kana: 'ウィ', romaji: 'wi' }, { kana: 'ウェ', romaji: 'we' }, { kana: 'ウォ', romaji: 'wo' },
        ]
    };

    const activeData = activeTable === 'hiragana' ? hiragana : katakana;

    // Play audio for kana
    const playAudio = (kana) => {
        if (!kana || !('speechSynthesis' in window)) return;
        speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(kana);
        utterance.lang = 'ja-JP';
        utterance.rate = 0.8;
        const voices = speechSynthesis.getVoices();
        const japaneseVoice = voices.find(v => v.lang.includes('ja'));
        if (japaneseVoice) utterance.voice = japaneseVoice;
        speechSynthesis.speak(utterance);
    };

    const renderTable = (data, columns = 5) => (
        <div className="kana-grid" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
            {data.map((item, i) => (
                <div
                    key={i}
                    className={`kana-cell ${!item.kana ? 'empty' : ''} ${item.romaji ? 'jp-tooltip' : ''}`}
                    onClick={() => playAudio(item.kana)}
                    data-tooltip={item.romaji || ''}
                >
                    {item.kana && (
                        <>
                            <span className="kana-char japanese">{item.kana}</span>
                            {showRomaji && <span className="kana-romaji">{item.romaji}</span>}
                        </>
                    )}
                </div>
            ))}
        </div>
    );

    return (
        <div className="kana-tables">
            {/* Tab Selection */}
            <div className="kana-tabs">
                <button
                    className={`kana-tab ${activeTable === 'hiragana' ? 'active' : ''}`}
                    onClick={() => setActiveTable('hiragana')}
                >
                    <span className="japanese">ひらがな</span>
                    <span>Hiragana</span>
                </button>
                <button
                    className={`kana-tab ${activeTable === 'katakana' ? 'active' : ''}`}
                    onClick={() => setActiveTable('katakana')}
                >
                    <span className="japanese">カタカナ</span>
                    <span>Katakana</span>
                </button>
            </div>

            {/* Toggle Romaji */}
            <div className="kana-toggle">
                <label className="toggle-label">
                    <input
                        type="checkbox"
                        checked={showRomaji}
                        onChange={(e) => setShowRomaji(e.target.checked)}
                    />
                    <span>Show Romaji</span>
                </label>
                <span className="kana-hint">Click any character to hear pronunciation</span>
            </div>

            {/* Basic Table */}
            <div className="kana-section">
                <h3 className="kana-section-title">Basic Characters (Gojūon)</h3>
                {renderTable(activeData.basic, 5)}
            </div>

            {/* Dakuten/Handakuten */}
            <div className="kana-section">
                <h3 className="kana-section-title">Voiced & Semi-voiced (Dakuten・Handakuten)</h3>
                {renderTable(activeData.dakuten, 5)}
            </div>

            {/* Combination Characters */}
            <div className="kana-section">
                <h3 className="kana-section-title">Combination Characters (Yōon)</h3>
                {renderTable(activeData.combo, 3)}
            </div>

            {/* Extended Katakana (only for katakana) */}
            {activeTable === 'katakana' && (
                <div className="kana-section">
                    <h3 className="kana-section-title">Extended (Foreign Sounds)</h3>
                    {renderTable(activeData.extended, 4)}
                </div>
            )}

            {/* Learning Tips */}
            <div className="kana-tips">
                <h3>Learning Tips</h3>
                <ul>
                    <li><strong>Hiragana (ひらがな)</strong> - Used for native Japanese words and grammatical elements</li>
                    <li><strong>Katakana (カタカナ)</strong> - Used for foreign words, onomatopoeia, and emphasis</li>
                    <li><strong>Dakuten (゛)</strong> - The two dots that voice consonants (か→が)</li>
                    <li><strong>Handakuten (゜)</strong> - The circle that makes は-row into p-sounds (は→ぱ)</li>
                    <li><strong>Small っ/ッ</strong> - Doubles the following consonant (きって = kitte)</li>
                    <li><strong>Long vowels</strong> - In hiragana: add ー or repeat the vowel. In katakana: use ー</li>
                </ul>
            </div>
        </div>
    );
};

window.KanaTables = KanaTables;
