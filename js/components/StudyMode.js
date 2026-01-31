// Study Mode Component - For learning new words with all information visible

const { useState, useEffect } = React;

const StudyMode = ({ vocabulary, progress, settings, onComplete, onExit }) => {
    const [session, setSession] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [mnemonic, setMnemonic] = useState('');
    const [kanjiData, setKanjiData] = useState([]);
    const [loadingKanji, setLoadingKanji] = useState(false);
    const [selectedRadical, setSelectedRadical] = useState(null);
    const [expandedKanji, setExpandedKanji] = useState(null);

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
            setSelectedRadical(null);
            setExpandedKanji(null);

            // Fetch enhanced kanji breakdown data with radicals and related vocab
            setLoadingKanji(true);
            const kanjiChars = KanjiAPI.extractKanji(word.word);
            Promise.all(
                kanjiChars.map(k => KanjiAPI.getEnhancedKanjiData(k, vocabulary, word.id))
            ).then(data => {
                setKanjiData(data);
                setLoadingKanji(false);
            });
        }
    }, [currentIndex, session, vocabulary]);

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

                    {/* Kanji Breakdown Section - Enhanced with clickable radicals */}
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
                                        <div key={idx} className={`kanji-detail-card ${expandedKanji === idx ? 'expanded' : ''}`}>
                                            <div className="kanji-detail-header" onClick={() => setExpandedKanji(expandedKanji === idx ? null : idx)}>
                                                <div className="kanji-detail-char">{k.character}</div>
                                                <div className="kanji-detail-info">
                                                    <div className="kanji-meanings">
                                                        {k.meanings.slice(0, 3).join(', ') || 'N/A'}
                                                    </div>
                                                    {k.readings && (
                                                        <div className="kanji-readings">
                                                            {k.readings.kunyomi && <span className="reading-kun">kun: {k.readings.kunyomi}</span>}
                                                            {k.readings.onyomi && <span className="reading-on">on: {k.readings.onyomi}</span>}
                                                        </div>
                                                    )}
                                                </div>
                                                <span className="expand-icon">{expandedKanji === idx ? '−' : '+'}</span>
                                            </div>

                                            {/* Expanded content */}
                                            {expandedKanji === idx && (
                                                <div className="kanji-detail-expanded">
                                                    {/* Component Breakdown with clickable radicals */}
                                                    {k.componentDetails && k.componentDetails.length > 0 && (
                                                        <div className="kanji-components-section">
                                                            <div className="subsection-label">Components</div>
                                                            <div className="kanji-component-breakdown">
                                                                {k.componentDetails.map((comp, compIdx) => (
                                                                    <React.Fragment key={compIdx}>
                                                                        {compIdx > 0 && <span className="component-plus">+</span>}
                                                                        <button
                                                                            className="component-btn"
                                                                            onClick={() => setSelectedRadical(comp)}
                                                                            title={`${comp.char} - ${comp.meaning}`}
                                                                        >
                                                                            <span className="component-char japanese">{comp.char}</span>
                                                                            <span className="component-meaning">{comp.meaning}</span>
                                                                        </button>
                                                                    </React.Fragment>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Heisig-style Mnemonic */}
                                                    {k.mnemonics && k.mnemonics.length > 0 && (
                                                        <div className="kanji-mnemonic-section">
                                                            <div className="subsection-label">Memory Story</div>
                                                            <div className="kanji-mnemonic-text">{k.mnemonics[0]}</div>
                                                        </div>
                                                    )}

                                                    {/* Stroke Order */}
                                                    {k.strokes && (
                                                        <div className="kanji-strokes-section">
                                                            <div className="subsection-label">Strokes: {k.strokes}</div>
                                                            <a
                                                                href={`https://jisho.org/search/${k.character}%20%23kanji`}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="stroke-order-link"
                                                            >
                                                                View stroke order on Jisho
                                                            </a>
                                                        </div>
                                                    )}

                                                    {/* Related Vocabulary */}
                                                    {k.relatedVocab && k.relatedVocab.length > 0 && (
                                                        <div className="kanji-related-section">
                                                            <div className="subsection-label">Other words with {k.character}</div>
                                                            <div className="related-vocab-list">
                                                                {k.relatedVocab.map((word, wordIdx) => (
                                                                    <div key={wordIdx} className="related-vocab-item">
                                                                        <span className="related-word japanese">{word.word}</span>
                                                                        <span className="related-reading">({word.reading})</span>
                                                                        <span className="related-meaning">{word.meaning}</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Radical Detail Modal */}
                    {selectedRadical && (
                        <div className="radical-popup-overlay" onClick={() => setSelectedRadical(null)}>
                            <div className="radical-popup" onClick={e => e.stopPropagation()}>
                                <button className="radical-popup-close" onClick={() => setSelectedRadical(null)}>×</button>
                                <div className="radical-popup-char japanese">{selectedRadical.char}</div>
                                <div className="radical-popup-meaning">{selectedRadical.meaning}</div>
                                {selectedRadical.mnemonic && (
                                    <div className="radical-popup-mnemonic">{selectedRadical.mnemonic}</div>
                                )}
                                {selectedRadical.category && (
                                    <div className="radical-popup-category">Category: {selectedRadical.category}</div>
                                )}
                            </div>
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
