// Heisig Kanji Study Component
// Follows the "Remembering the Kanji" method in exact book order

const { useState, useEffect, useMemo } = React;

const HeisigStudy = ({ onNavigateToKana }) => {
    const [currentFrame, setCurrentFrame] = useState(1);
    const [heisigProgress, setHeisigProgress] = useState({});
    const [viewMode, setViewMode] = useState('study'); // 'study', 'review', 'list'
    const [showAnswer, setShowAnswer] = useState(false);
    const [personalMnemonic, setPersonalMnemonic] = useState('');
    const [editingMnemonic, setEditingMnemonic] = useState(false);

    // Load progress from storage
    useEffect(() => {
        const saved = Storage.get('nihongo_heisig_progress', {});
        setHeisigProgress(saved);

        // Find the first unlearned kanji to start from
        if (Object.keys(saved).length > 0) {
            const lastLearned = Math.max(...Object.keys(saved).map(k => parseInt(k)));
            if (lastLearned < HEISIG_DATA.getTotalCount()) {
                setCurrentFrame(lastLearned + 1);
            }
        }
    }, []);

    // Get current kanji data
    const currentKanji = useMemo(() => {
        return HEISIG_DATA?.getByFrame(currentFrame);
    }, [currentFrame]);

    // Get lesson kanji
    const lessonKanji = useMemo(() => {
        if (!currentKanji) return [];
        return HEISIG_DATA?.getLesson(currentKanji.lesson) || [];
    }, [currentKanji]);

    // Load personal mnemonic when frame changes
    useEffect(() => {
        const saved = heisigProgress[currentFrame]?.personalMnemonic || '';
        setPersonalMnemonic(saved);
        setShowAnswer(false);
        setEditingMnemonic(false);
    }, [currentFrame, heisigProgress]);

    // Save progress
    const saveProgress = (frame, data) => {
        const newProgress = {
            ...heisigProgress,
            [frame]: {
                ...heisigProgress[frame],
                ...data,
                lastStudied: new Date().toISOString()
            }
        };
        setHeisigProgress(newProgress);
        Storage.set('nihongo_heisig_progress', newProgress);
    };

    // Mark as learned
    const markLearned = () => {
        saveProgress(currentFrame, {
            learned: true,
            personalMnemonic
        });

        // Move to next kanji
        if (currentFrame < HEISIG_DATA.getTotalCount()) {
            setCurrentFrame(currentFrame + 1);
        }
    };

    // Save personal mnemonic
    const saveMnemonic = () => {
        saveProgress(currentFrame, { personalMnemonic });
        setEditingMnemonic(false);
    };

    // Navigation
    const goToFrame = (frame) => {
        if (frame >= 1 && frame <= HEISIG_DATA.getTotalCount()) {
            setCurrentFrame(frame);
        }
    };

    // Play audio
    const playAudio = (text) => {
        if ('speechSynthesis' in window) {
            speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'ja-JP';
            utterance.rate = 0.7;
            speechSynthesis.speak(utterance);
        }
    };

    // Calculate stats
    const stats = useMemo(() => {
        const learned = Object.values(heisigProgress).filter(p => p.learned).length;
        const total = HEISIG_DATA?.getTotalCount() || 0;
        return { learned, total, percentage: total > 0 ? Math.round((learned / total) * 100) : 0 };
    }, [heisigProgress]);

    // Render study card
    const renderStudyCard = () => {
        if (!currentKanji) {
            return (
                <div className="heisig-empty">
                    <p>No Heisig data available. Please ensure the data file is loaded.</p>
                </div>
            );
        }

        const isLearned = heisigProgress[currentFrame]?.learned;

        return (
            <div className="heisig-study-card">
                {/* Progress indicator */}
                <div className="heisig-progress-bar">
                    <div className="heisig-progress-info">
                        <span>Lesson {currentKanji.lesson}</span>
                        <span>Frame {currentFrame} of {stats.total}</span>
                    </div>
                    <div className="progress-bar">
                        <div
                            className="progress-bar-fill"
                            style={{ width: `${(currentFrame / stats.total) * 100}%` }}
                        />
                    </div>
                </div>

                {/* Main kanji display */}
                <div className="heisig-kanji-display">
                    <div className="heisig-kanji-large japanese" onClick={() => playAudio(currentKanji.kanji)}>
                        {currentKanji.kanji}
                    </div>
                    <button className="btn-audio-large" onClick={() => playAudio(currentKanji.kanji)}>
                        🔊
                    </button>
                    {isLearned && <div className="learned-indicator">✓ Learned</div>}
                </div>

                {/* Keyword */}
                <div className="heisig-keyword">
                    <h2>{currentKanji.keyword.toUpperCase()}</h2>
                    <p className="heisig-frame-number">#{currentKanji.frame}</p>
                </div>

                {/* Reveal button or content */}
                {!showAnswer ? (
                    <button
                        className="btn btn-primary btn-large heisig-reveal-btn"
                        onClick={() => setShowAnswer(true)}
                    >
                        Show Story & Components
                    </button>
                ) : (
                    <div className="heisig-answer-section">
                        {/* Components breakdown */}
                        {currentKanji.components && currentKanji.components.length > 0 && (
                            <div className="heisig-components">
                                <h4>Components</h4>
                                <div className="components-breakdown">
                                    <span className="breakdown-kanji japanese">{currentKanji.kanji}</span>
                                    <span className="breakdown-equals">=</span>
                                    <div className="breakdown-parts">
                                        {currentKanji.components.map((comp, idx) => (
                                            <span key={idx} className="breakdown-part">
                                                {comp}
                                                {idx < currentKanji.components.length - 1 && ' + '}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Heisig story */}
                        <div className="heisig-story">
                            <h4>Heisig Story</h4>
                            <p>{currentKanji.story}</p>
                        </div>

                        {/* Primitive meaning if applicable */}
                        {currentKanji.primitiveAs && (
                            <div className="heisig-primitive">
                                <h4>As a Primitive Element</h4>
                                <p>When used in other kanji, this means: <strong>{currentKanji.primitiveAs}</strong></p>
                            </div>
                        )}

                        {/* Personal mnemonic */}
                        <div className="heisig-personal-mnemonic">
                            <h4>Your Personal Mnemonic</h4>
                            {editingMnemonic ? (
                                <div className="mnemonic-edit">
                                    <textarea
                                        value={personalMnemonic}
                                        onChange={(e) => setPersonalMnemonic(e.target.value)}
                                        placeholder="Write your own memory trick here..."
                                        rows={3}
                                    />
                                    <div className="mnemonic-actions">
                                        <button className="btn btn-sm btn-success" onClick={saveMnemonic}>
                                            Save
                                        </button>
                                        <button className="btn btn-sm" onClick={() => setEditingMnemonic(false)}>
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="mnemonic-display" onClick={() => setEditingMnemonic(true)}>
                                    {personalMnemonic || (
                                        <span className="mnemonic-placeholder">
                                            Click to add your own mnemonic...
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Stroke info */}
                        <div className="heisig-strokes">
                            <span className="stroke-count">{currentKanji.strokes} strokes</span>
                            <div className="stroke-order-hint">
                                Write: top→bottom, left→right
                            </div>
                        </div>

                        {/* Action buttons */}
                        <div className="heisig-actions">
                            {!isLearned && (
                                <button className="btn btn-success btn-large" onClick={markLearned}>
                                    ✓ I've Got It - Next Kanji
                                </button>
                            )}
                            {isLearned && currentFrame < stats.total && (
                                <button className="btn btn-primary btn-large" onClick={() => goToFrame(currentFrame + 1)}>
                                    Next Kanji →
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {/* Navigation */}
                <div className="heisig-navigation">
                    <button
                        className="btn btn-sm"
                        onClick={() => goToFrame(currentFrame - 1)}
                        disabled={currentFrame <= 1}
                    >
                        ← Previous
                    </button>
                    <input
                        type="number"
                        className="heisig-frame-input"
                        value={currentFrame}
                        onChange={(e) => goToFrame(parseInt(e.target.value) || 1)}
                        min={1}
                        max={stats.total}
                    />
                    <button
                        className="btn btn-sm"
                        onClick={() => goToFrame(currentFrame + 1)}
                        disabled={currentFrame >= stats.total}
                    >
                        Next →
                    </button>
                </div>
            </div>
        );
    };

    // Render lesson list view
    const renderListView = () => {
        const lessons = HEISIG_DATA?.getLessons() || {};

        return (
            <div className="heisig-list-view">
                {Object.entries(lessons).map(([lessonNum, kanji]) => (
                    <div key={lessonNum} className="heisig-lesson-section">
                        <h3>Lesson {lessonNum}</h3>
                        <div className="heisig-kanji-grid">
                            {kanji.map(k => {
                                const isLearned = heisigProgress[k.frame]?.learned;
                                return (
                                    <div
                                        key={k.frame}
                                        className={`heisig-grid-item ${isLearned ? 'learned' : ''}`}
                                        onClick={() => {
                                            setCurrentFrame(k.frame);
                                            setViewMode('study');
                                        }}
                                    >
                                        <span className="grid-kanji japanese">{k.kanji}</span>
                                        <span className="grid-keyword">{k.keyword}</span>
                                        <span className="grid-frame">#{k.frame}</span>
                                        {isLearned && <span className="grid-check">✓</span>}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="heisig-study-section">
            {/* Header */}
            <div className="heisig-header">
                <div className="heisig-title">
                    <h2>Heisig Kanji Study</h2>
                    <p className="heisig-subtitle">Remembering the Kanji - Learn by meaning first</p>
                </div>
                <div className="heisig-stats">
                    <div className="stat-item">
                        <span className="stat-number">{stats.learned}</span>
                        <span className="stat-label">Learned</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-number">{stats.total}</span>
                        <span className="stat-label">Total</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-number">{stats.percentage}%</span>
                        <span className="stat-label">Complete</span>
                    </div>
                </div>
            </div>

            {/* View mode tabs */}
            <div className="heisig-tabs">
                <button
                    className={`heisig-tab ${viewMode === 'study' ? 'active' : ''}`}
                    onClick={() => setViewMode('study')}
                >
                    📖 Study
                </button>
                <button
                    className={`heisig-tab ${viewMode === 'list' ? 'active' : ''}`}
                    onClick={() => setViewMode('list')}
                >
                    📋 All Kanji
                </button>
            </div>

            {/* Content */}
            <div className="heisig-content">
                {viewMode === 'study' && renderStudyCard()}
                {viewMode === 'list' && renderListView()}
            </div>

            {/* Learning path reminder */}
            <div className="heisig-learning-path-note">
                <div className="path-note-content">
                    <h4>Your Learning Path</h4>
                    <div className="path-stages">
                        <div className="path-stage completed">
                            <span className="stage-icon">✓</span>
                            <span>Hiragana & Katakana</span>
                        </div>
                        <span className="path-arrow">→</span>
                        <div className="path-stage active">
                            <span className="stage-icon">📖</span>
                            <span>Heisig Kanji (#{currentFrame})</span>
                        </div>
                        <span className="path-arrow">→</span>
                        <div className="path-stage">
                            <span className="stage-icon">📚</span>
                            <span>Vocabulary (after ~300 kanji)</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Heisig Kanji Card Component (for use in radical cards)
const HeisigKanjiExample = ({ kanji, radicalChar, radicalMeaning }) => {
    // Find Heisig data for this kanji
    const heisigData = HEISIG_DATA?.getByKanji(kanji);

    if (!heisigData) {
        return null;
    }

    const playAudio = (text) => {
        if ('speechSynthesis' in window) {
            speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'ja-JP';
            utterance.rate = 0.7;
            speechSynthesis.speak(utterance);
        }
    };

    return (
        <div className="heisig-example-card">
            <div className="example-main">
                <span className="example-kanji japanese">{kanji}</span>
                <button className="btn-audio-sm" onClick={() => playAudio(kanji)}>🔊</button>
                <span className="example-keyword">- {heisigData.keyword}</span>
            </div>
            <div className="example-breakdown">
                <span className="breakdown-label">Breakdown:</span>
                <span className="breakdown-formula">
                    {kanji} = {heisigData.components.length > 0
                        ? heisigData.components.join(' + ')
                        : 'pictograph'}
                </span>
            </div>
            <div className="example-story">
                <span className="story-label">Story:</span>
                <span className="story-text">"{heisigData.story.slice(0, 100)}..."</span>
            </div>
        </div>
    );
};

window.HeisigStudy = HeisigStudy;
window.HeisigKanjiExample = HeisigKanjiExample;
