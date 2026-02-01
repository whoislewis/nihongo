// Smart Study Session Component
// Unified study interface handling vocabulary, radical, kanji, and grammar cards

const { useState, useEffect, useCallback } = React;

const SmartStudySession = ({ vocabulary, progress, settings, onComplete, onExit }) => {
    const [session, setSession] = useState(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [mnemonic, setMnemonic] = useState('');
    const [kanjiData, setKanjiData] = useState([]);
    const [loadingKanji, setLoadingKanji] = useState(false);
    const [selectedRadical, setSelectedRadical] = useState(null);
    const [expandedKanji, setExpandedKanji] = useState(null);
    const [sessionStats, setSessionStats] = useState({ studied: 0, reviews: 0 });
    const [showKanaQuiz, setShowKanaQuiz] = useState(false);

    // Build smart session on mount
    useEffect(() => {
        const stageProgress = Storage.getStageProgress();
        const foundationProgress = Storage.getFoundationProgress();

        const smartSession = SmartQueue.buildSession(
            vocabulary,
            progress,
            settings,
            stageProgress,
            foundationProgress
        );

        setSession(smartSession);
    }, [vocabulary, progress, settings]);

    // Get current item
    const currentItem = session?.items?.[currentIndex];

    // Load data for current item
    useEffect(() => {
        if (!currentItem) return;

        setSelectedRadical(null);
        setExpandedKanji(null);

        // Load mnemonic for vocabulary/radical
        if (currentItem.type.includes('vocabulary') && currentItem.id) {
            setMnemonic(Storage.getMnemonic(currentItem.id));
        } else if (currentItem.type.includes('radical')) {
            setMnemonic('');
        }

        // Load kanji data for vocabulary words
        if (currentItem.type.includes('vocabulary') && currentItem.word) {
            setLoadingKanji(true);
            const kanjiChars = KanjiAPI.extractKanji(currentItem.word);
            Promise.all(
                kanjiChars.map(k => KanjiAPI.getEnhancedKanjiData(k, vocabulary, currentItem.id))
            ).then(data => {
                setKanjiData(data);
                setLoadingKanji(false);
            });
        } else {
            setKanjiData([]);
        }
    }, [currentIndex, currentItem, vocabulary]);

    // Handle "I understand" for new items
    const handleUnderstood = () => {
        if (!currentItem) return;

        if (currentItem.type === 'vocabulary_new') {
            // Mark vocabulary as learning
            Storage.updateWordData(currentItem.id, {
                stack: 'learning',
                successCount: 0,
                failCount: 0,
                interval: 1,
                easeFactor: 2.5,
                nextReview: new Date().toISOString(),
                lastReview: new Date().toISOString()
            });
            Storage.recordStudy(true);
            setSessionStats(prev => ({ ...prev, studied: prev.studied + 1 }));
        } else if (currentItem.type === 'radical_new') {
            // Mark radical as learning
            SRS.processAnswerForType(currentItem.char, 'radical', true, true);
            setSessionStats(prev => ({ ...prev, studied: prev.studied + 1 }));
        } else if (currentItem.type === 'grammar_intro' || currentItem.type === 'kanji_intro') {
            // Mark intro card as viewed
            if (currentItem.type === 'grammar_intro') {
                Storage.viewGrammarIntroCard(currentItem.id);
            } else {
                Storage.viewKanjiIntroCard(currentItem.id);
            }
            setSessionStats(prev => ({ ...prev, studied: prev.studied + 1 }));
        }

        // Check and advance stage
        StageManager.checkAndAdvanceStage();

        moveToNext();
    };

    // Handle next (skip without marking)
    const handleNext = () => {
        moveToNext();
    };

    // Handle previous
    const handlePrevious = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
        }
    };

    // Move to next item
    const moveToNext = () => {
        if (currentIndex + 1 >= session.items.length) {
            onComplete();
            return;
        }
        setCurrentIndex(currentIndex + 1);
    };

    // Save mnemonic
    const handleSaveMnemonic = (value) => {
        setMnemonic(value);
        if (currentItem && currentItem.id) {
            Storage.saveMnemonic(currentItem.id, value);
        }
    };

    // Play audio
    const playAudio = (text) => {
        if (!text || !('speechSynthesis' in window)) return;
        speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'ja-JP';
        utterance.rate = 0.75;
        const voices = speechSynthesis.getVoices();
        const japaneseVoice = voices.find(v => v.lang.includes('ja'));
        if (japaneseVoice) utterance.voice = japaneseVoice;
        speechSynthesis.speak(utterance);
    };

    // Render based on session type
    if (!session) {
        return (
            <div className="study-container">
                <div className="loading-state">Loading session...</div>
            </div>
        );
    }

    if (session.items.length === 0) {
        return (
            <div className="study-container">
                <div className="empty-state">
                    <div className="empty-state-icon">📚</div>
                    <p>No items to study right now!</p>
                    <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginTop: 'var(--space-sm)' }}>
                        You've completed all available items for today.
                    </p>
                    <button className="btn btn-secondary" onClick={onExit} style={{ marginTop: 'var(--space-lg)' }}>
                        Back to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    if (!currentItem) {
        return null;
    }

    // Render different card types
    const renderCard = () => {
        switch (currentItem.type) {
            case 'kana_practice':
                return renderKanaPracticeCard();
            case 'grammar_intro':
            case 'kanji_intro':
                return renderIntroCard();
            case 'radical_new':
            case 'radical_review':
                return renderRadicalCard();
            case 'vocabulary_new':
            case 'vocabulary_review':
                return renderVocabularyCard();
            case 'grammar_contextual':
                return renderGrammarContextCard();
            default:
                return renderVocabularyCard();
        }
    };

    // Kana practice card
    const renderKanaPracticeCard = () => (
        <div className="study-card study-card-large">
            <div className="card-type-badge">Kana Practice</div>
            <div className="kana-practice-content">
                <h3>Master Your Kana</h3>
                <p>Practice recognizing hiragana and katakana characters.</p>
                <p style={{ marginTop: 'var(--space-md)', color: 'var(--color-text-muted)' }}>
                    Score 90% or higher to complete this stage.
                </p>
            </div>
            <div className="study-actions-bottom">
                <button className="btn btn-primary" onClick={() => setShowKanaQuiz(true)}>
                    Start Kana Quiz
                </button>
            </div>
        </div>
    );

    // Intro card (grammar/kanji)
    const renderIntroCard = () => (
        <div className="study-card study-card-large">
            <div className="card-type-badge">
                {currentItem.type === 'grammar_intro' ? 'Grammar Introduction' : 'Kanji Introduction'}
            </div>
            <div className="intro-card-content">
                <h3 className="intro-card-title">{currentItem.title}</h3>
                <p className="intro-card-text">{currentItem.content}</p>
                {currentItem.example && (
                    <div className="intro-card-example">
                        <div className="example-japanese japanese">{currentItem.example}</div>
                        <div className="example-meaning">{currentItem.exampleMeaning}</div>
                    </div>
                )}
            </div>
            <div className="study-actions-bottom">
                <button className="btn btn-primary" onClick={handleUnderstood}>
                    Got it! Next →
                </button>
            </div>
        </div>
    );

    // Radical card
    const renderRadicalCard = () => {
        const fullRadicalData = RADICALS_DATA?.radicals.find(r => r.char === currentItem.char);

        return (
            <div className="study-card study-card-large">
                <div className="card-type-badge">
                    {currentItem.isNew ? 'New Radical' : 'Radical Review'}
                </div>
                <div className="radical-card-content">
                    <div className="radical-main-display">
                        <span className="radical-char-large japanese">{currentItem.char}</span>
                        <button className="btn-audio" onClick={() => playAudio(currentItem.name || currentItem.char)}>
                            🔊
                        </button>
                    </div>
                    <div className="radical-meaning-large">{currentItem.meaning}</div>
                    {currentItem.name && (
                        <div className="radical-name">Japanese name: {currentItem.name}</div>
                    )}
                    {(currentItem.mnemonic || fullRadicalData?.mnemonic) && (
                        <div className="radical-mnemonic-section">
                            <div className="section-label">Memory Story</div>
                            <p className="radical-mnemonic-text">
                                {currentItem.mnemonic || fullRadicalData?.mnemonic}
                            </p>
                        </div>
                    )}
                    {(currentItem.examples || fullRadicalData?.examples) && (
                        <div className="radical-examples-section">
                            <div className="section-label">Found in Kanji</div>
                            <div className="radical-examples">
                                {(currentItem.examples || fullRadicalData?.examples || []).slice(0, 5).map((ex, i) => (
                                    <span key={i} className="radical-example-kanji japanese">{ex}</span>
                                ))}
                            </div>
                        </div>
                    )}
                    {currentItem.category && (
                        <div className="radical-category">
                            Category: {RADICALS_DATA?.categories.find(c => c.id === currentItem.category)?.name || currentItem.category}
                        </div>
                    )}
                </div>
                <div className="study-actions-bottom">
                    <button className="btn btn-primary" onClick={handleNext}>
                        Next →
                    </button>
                    <button className="btn btn-ghost btn-small" onClick={handleUnderstood}>
                        I know this ✓
                    </button>
                </div>
            </div>
        );
    };

    // Vocabulary card with kanji breakdown
    const renderVocabularyCard = () => (
        <div className="study-card study-card-large">
            <div className="card-type-badge">
                {currentItem.isNew ? 'New Vocabulary' : 'Vocabulary Review'}
            </div>

            {/* Main word display */}
            <div className="study-word-section">
                <div className="study-word-main">
                    <span
                        className="kanji-display japanese jp-tooltip"
                        data-tooltip={currentItem.reading ? `${currentItem.reading} (${JapaneseUtils?.toRomaji?.(currentItem.reading) || ''})` : ''}
                    >
                        {currentItem.word}
                    </span>
                    <button className="btn-audio" onClick={() => playAudio(currentItem.word)}>
                        🔊
                    </button>
                </div>
                {currentItem.reading && (
                    <div className="reading-display japanese">{currentItem.reading}</div>
                )}
                <div className="meaning-display">{currentItem.meaning}</div>

                {/* Dependency warning */}
                {currentItem.missingDependencies && currentItem.missingDependencies.radicals?.length > 0 && (
                    <div className="dependency-warning">
                        <span className="warning-icon">⚠️</span>
                        <span>Contains unlearned radicals: </span>
                        <span className="missing-radicals japanese">
                            {currentItem.missingDependencies.radicals.join(', ')}
                        </span>
                    </div>
                )}
            </div>

            {/* Kanji breakdown - auto-expand for new words with unlearned kanji */}
            {kanjiData.length > 0 && (
                <div className="kanji-breakdown-section">
                    <div className="section-label">Kanji Breakdown</div>
                    {loadingKanji ? (
                        <div className="loading-kanji">Loading kanji data...</div>
                    ) : (
                        <div className="kanji-details-grid">
                            {kanjiData.map((k, idx) => (
                                <div key={idx} className={`kanji-detail-card ${expandedKanji === idx || (currentItem.isNew && settings.autoExpandKanji) ? 'expanded' : ''}`}>
                                    <div className="kanji-detail-header" onClick={() => setExpandedKanji(expandedKanji === idx ? null : idx)}>
                                        <div className="kanji-detail-char japanese">{k.character}</div>
                                        <div className="kanji-detail-info">
                                            <div className="kanji-meanings">{k.meanings?.slice(0, 3).join(', ') || 'N/A'}</div>
                                            {k.readings && (
                                                <div className="kanji-readings">
                                                    {k.readings.kunyomi && <span className="reading-kun">kun: {k.readings.kunyomi}</span>}
                                                    {k.readings.onyomi && <span className="reading-on">on: {k.readings.onyomi}</span>}
                                                </div>
                                            )}
                                        </div>
                                        <span className="expand-icon">{expandedKanji === idx || (currentItem.isNew && settings.autoExpandKanji) ? '−' : '+'}</span>
                                    </div>

                                    {(expandedKanji === idx || (currentItem.isNew && settings.autoExpandKanji)) && (
                                        <div className="kanji-detail-expanded">
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
                                                                >
                                                                    <span className="component-char japanese">{comp.char}</span>
                                                                    <span className="component-meaning">{comp.meaning}</span>
                                                                </button>
                                                            </React.Fragment>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                            {k.mnemonics && k.mnemonics.length > 0 && (
                                                <div className="kanji-mnemonic-section">
                                                    <div className="subsection-label">Memory Story</div>
                                                    <div className="kanji-mnemonic-text">{k.mnemonics[0]}</div>
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

            {/* Radical popup */}
            {selectedRadical && (
                <div className="radical-popup-overlay" onClick={() => setSelectedRadical(null)}>
                    <div className="radical-popup" onClick={e => e.stopPropagation()}>
                        <button className="radical-popup-close" onClick={() => setSelectedRadical(null)}>×</button>
                        <div className="radical-popup-char japanese">{selectedRadical.char}</div>
                        <div className="radical-popup-meaning">{selectedRadical.meaning}</div>
                        {selectedRadical.mnemonic && (
                            <div className="radical-popup-mnemonic">{selectedRadical.mnemonic}</div>
                        )}
                    </div>
                </div>
            )}

            {/* Example sentence */}
            {currentItem.sentence && (
                <div className="example-section">
                    <div className="section-label">Example Sentence</div>
                    <div className="sentence-with-audio">
                        <div className="study-sentence japanese">{currentItem.sentence}</div>
                        <button className="btn-audio btn-audio-small" onClick={() => playAudio(currentItem.sentence)}>
                            🔊
                        </button>
                    </div>
                    {currentItem.sentenceMeaning && (
                        <div className="study-sentence-meaning">{currentItem.sentenceMeaning}</div>
                    )}
                </div>
            )}

            {/* Mnemonic */}
            <div className="mnemonic-section">
                <div className="section-label">Your Personal Mnemonic</div>
                <textarea
                    className="mnemonic-input mnemonic-input-large"
                    value={mnemonic}
                    onChange={(e) => handleSaveMnemonic(e.target.value)}
                    placeholder="Add your own memory story..."
                />
            </div>

            <div className="study-actions-bottom">
                <button className="btn btn-primary" onClick={handleNext}>
                    Next →
                </button>
                <button className="btn btn-ghost btn-small" onClick={handleUnderstood}>
                    I understand this ✓
                </button>
            </div>
        </div>
    );

    // Grammar contextual card
    const renderGrammarContextCard = () => (
        <div className="study-card study-card-large grammar-contextual">
            <div className="card-type-badge grammar">Grammar Pattern</div>
            <div className="grammar-card-content">
                <h3 className="grammar-title">{currentItem.title}</h3>
                <p className="grammar-context">
                    You just learned <span className="context-word japanese">{currentItem.contextWord}</span> which uses this pattern!
                </p>
                <div className="grammar-pattern-display">
                    <span className="pattern-name">{currentItem.id}</span>
                </div>
            </div>
            <div className="study-actions-bottom">
                <button className="btn btn-primary" onClick={handleNext}>
                    Got it! Next →
                </button>
            </div>
        </div>
    );

    // Show Kana Quiz if activated
    if (showKanaQuiz) {
        return (
            <KanaQuiz
                onComplete={() => {
                    setShowKanaQuiz(false);
                    // Refresh session after completing kana quiz
                    const stageProgress = Storage.getStageProgress();
                    const foundationProgress = Storage.getFoundationProgress();
                    const smartSession = SmartQueue.buildSession(
                        vocabulary, progress, settings, stageProgress, foundationProgress
                    );
                    setSession(smartSession);
                    setCurrentIndex(0);
                }}
                onExit={() => setShowKanaQuiz(false)}
            />
        );
    }

    return (
        <div className="study-container">
            {/* Progress bar */}
            <div className="study-progress" style={{ width: '100%', maxWidth: '700px', marginBottom: 'var(--space-lg)' }}>
                <div className="study-progress-text">
                    {currentIndex + 1} / {session.items.length} items
                    {sessionStats.studied > 0 && (
                        <span className="session-stats"> | {sessionStats.studied} learned</span>
                    )}
                </div>
                <div className="progress-bar">
                    <div
                        className="progress-bar-fill"
                        style={{ width: `${((currentIndex + 1) / session.items.length) * 100}%` }}
                    />
                </div>
            </div>

            {/* Card with navigation */}
            <div className="study-card-wrapper">
                <button
                    className="nav-arrow nav-arrow-left"
                    onClick={handlePrevious}
                    disabled={currentIndex === 0}
                >
                    ←
                </button>

                {renderCard()}

                <button
                    className="nav-arrow nav-arrow-right"
                    onClick={handleNext}
                >
                    →
                </button>
            </div>
        </div>
    );
};

// Make available globally
window.SmartStudySession = SmartStudySession;
