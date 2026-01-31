// Study Mode Component - For learning new words with all information visible

const { useState, useEffect } = React;

const StudyMode = ({ vocabulary, progress, settings, onComplete, onExit }) => {
    const [session, setSession] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [mnemonic, setMnemonic] = useState('');
    const [kanjiData, setKanjiData] = useState([]);
    const [loadingKanji, setLoadingKanji] = useState(false);

    // Build session with new words only
    useEffect(() => {
        const newWords = SRS.getNewWords(vocabulary, progress, settings);
        setSession(newWords);
    }, [vocabulary, progress, settings]);

    // Load mnemonic and fetch kanji data for current word
    useEffect(() => {
        if (session.length > 0 && currentIndex < session.length) {
            const word = session[currentIndex];
            setMnemonic(Storage.getMnemonic(word.id));

            // Fetch kanji breakdown data
            setLoadingKanji(true);
            KanjiAPI.getWordKanjiData(word.word).then(data => {
                setKanjiData(data);
                setLoadingKanji(false);
            });
        }
    }, [currentIndex, session]);

    const currentWord = session[currentIndex];

    // Mark word as understood and move to next
    const handleUnderstood = () => {
        if (!currentWord) return;

        // Move word to learning stack with initial SRS data
        Storage.updateWordData(currentWord.id, {
            stack: 'learning',
            successCount: 0,
            failCount: 0,
            interval: 1,
            easeFactor: 2.5,
            nextReview: new Date().toISOString(),
            lastReview: new Date().toISOString()
        });

        // Record as new word studied
        Storage.recordStudy(true);

        moveToNextWord();
    };

    // Next word (skip)
    const handleNext = () => {
        moveToNextWord();
    };

    // Previous word
    const handlePrevious = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
        }
    };

    const moveToNextWord = () => {
        if (currentIndex + 1 >= session.length) {
            onComplete();
            return;
        }
        setCurrentIndex(currentIndex + 1);
    };

    // Save mnemonic
    const handleSaveMnemonic = (value) => {
        setMnemonic(value);
        if (currentWord) {
            Storage.saveMnemonic(currentWord.id, value);
        }
    };

    // Play audio with better voice selection
    const playAudio = () => {
        if (!currentWord) return;
        playAudioText(currentWord.word);
    };

    // Play audio for any Japanese text
    const playAudioText = (text) => {
        if (!text || !('speechSynthesis' in window)) return;

        speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'ja-JP';
        utterance.rate = 0.75;

        // Try to find a better Japanese voice
        const voices = speechSynthesis.getVoices();
        const japaneseVoices = voices.filter(v => v.lang.includes('ja'));
        // Prefer voices with "Google" or "Natural" in name
        const preferredVoice = japaneseVoices.find(v =>
            v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Kyoko')
        ) || japaneseVoices[0];

        if (preferredVoice) utterance.voice = preferredVoice;
        speechSynthesis.speak(utterance);
    };

    if (session.length === 0) {
        return (
            <div className="study-container">
                <div className="empty-state">
                    <div className="empty-state-icon">📚</div>
                    <p>No new words to study right now!</p>
                    <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginTop: 'var(--space-sm)' }}>
                        You've reached your daily limit or all words are in your learning queue.
                    </p>
                    <button className="btn btn-secondary" onClick={onExit} style={{ marginTop: 'var(--space-lg)' }}>
                        Back to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    if (!currentWord) {
        return null;
    }

    return (
        <div className="study-container">
            {/* Progress Bar */}
            <div className="study-progress" style={{ width: '100%', maxWidth: '700px', marginBottom: 'var(--space-lg)' }}>
                <div className="study-progress-text">
                    {currentIndex + 1} / {session.length} new words
                </div>
                <div className="progress-bar">
                    <div
                        className="progress-bar-fill"
                        style={{ width: `${((currentIndex + 1) / session.length) * 100}%` }}
                    />
                </div>
            </div>

            {/* Card with Navigation Arrows */}
            <div className="study-card-wrapper">
                {/* Previous Arrow */}
                <button
                    className="nav-arrow nav-arrow-left"
                    onClick={handlePrevious}
                    disabled={currentIndex === 0}
                    title="Previous word"
                >
                    ←
                </button>

                {/* Study Card - All Information Visible */}
                <div className="study-card study-card-large">
                    {/* Main Word Display */}
                    <div className="study-word-section">
                        <div className="study-word-main">
                            <span
                                className="kanji-display japanese jp-tooltip"
                                data-tooltip={`${currentWord.reading} (${JapaneseUtils.toRomaji(currentWord.reading)})`}
                            >
                                {currentWord.word}
                            </span>
                            <button className="btn-audio" onClick={playAudio} title="Play pronunciation">
                                🔊
                            </button>
                        </div>
                        <div
                            className="reading-display jp-tooltip"
                            data-tooltip={JapaneseUtils.toRomaji(currentWord.reading)}
                        >
                            {currentWord.reading}
                        </div>
                        <div className="meaning-display">{currentWord.meaning}</div>
                    </div>

                    {/* Kanji Breakdown Section - Auto-fetched */}
                    {kanjiData.length > 0 && (
                        <div className="kanji-breakdown-section">
                            <div className="section-label">Kanji Breakdown</div>
                            {loadingKanji ? (
                                <div style={{ textAlign: 'center', padding: 'var(--space-md)', color: 'var(--color-text-muted)' }}>
                                    Loading kanji data...
                                </div>
                            ) : (
                                <div className="kanji-details-grid">
                                    {kanjiData.map((k, idx) => (
                                        <div key={idx} className="kanji-detail-card">
                                            <div className="kanji-detail-char">{k.character}</div>
                                            <div className="kanji-detail-info">
                                                <div className="kanji-meanings">
                                                    {k.meanings.slice(0, 3).join(', ') || 'N/A'}
                                                </div>
                                                {k.readings && (
                                                    <div className="kanji-readings">
                                                        {k.readings.kunyomi && <span>kun: {k.readings.kunyomi}</span>}
                                                        {k.readings.onyomi && <span>on: {k.readings.onyomi}</span>}
                                                    </div>
                                                )}
                                                {k.radical && (
                                                    <div className="kanji-radical">
                                                        Radical: {k.radical} ({k.radicalMeaning})
                                                    </div>
                                                )}
                                                {k.components && k.components.length > 1 && (
                                                    <div className="kanji-components-list">
                                                        Parts: {k.components.join(' + ')}
                                                    </div>
                                                )}
                                            </div>
                                            {k.mnemonics && k.mnemonics.length > 0 && (
                                                <div className="kanji-mnemonic">
                                                    <strong>Memory tip:</strong> {k.mnemonics[0]}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Example Sentence */}
                    {currentWord.sentence && (
                        <div className="example-section">
                            <div className="section-label">Example Sentence</div>
                            <div className="sentence-with-audio">
                                <div
                                    className="study-sentence japanese jp-tooltip"
                                    data-tooltip={JapaneseUtils.toRomaji(currentWord.sentence)}
                                >
                                    {currentWord.sentence}
                                </div>
                                <button
                                    className="btn-audio btn-audio-small"
                                    onClick={() => playAudioText(currentWord.sentence)}
                                    title="Play sentence"
                                >
                                    🔊
                                </button>
                            </div>
                            {currentWord.sentenceMeaning && (
                                <div className="study-sentence-meaning">{currentWord.sentenceMeaning}</div>
                            )}
                        </div>
                    )}

                    {/* Notes from Deck */}
                    {currentWord.notes && (
                        <div className="notes-section">
                            <div className="section-label">Notes</div>
                            <div className="deck-notes">{currentWord.notes}</div>
                        </div>
                    )}

                    {/* Mnemonic Section */}
                    <div className="mnemonic-section">
                        <div className="section-label">Your Personal Mnemonic</div>
                        <textarea
                            className="mnemonic-input mnemonic-input-large"
                            value={mnemonic}
                            onChange={(e) => handleSaveMnemonic(e.target.value)}
                            placeholder="Add your own memory story or association..."
                        />
                    </div>

                    {/* Actions */}
                    <div className="study-actions-bottom">
                        <button className="btn btn-primary" onClick={handleNext}>
                            Next Word →
                        </button>
                        <button className="btn btn-ghost btn-small" onClick={handleUnderstood}>
                            I understand this ✓
                        </button>
                    </div>
                </div>

                {/* Next Arrow */}
                <button
                    className="nav-arrow nav-arrow-right"
                    onClick={handleNext}
                    title="Next word"
                >
                    →
                </button>
            </div>
        </div>
    );
};

window.StudyMode = StudyMode;
