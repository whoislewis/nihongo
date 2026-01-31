// Word Library Component

const { useState, useMemo, useEffect } = React;

const WordLibrary = ({ vocabulary, progress, onUpdateProgress }) => {
    const [activeStack, setActiveStack] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedWord, setSelectedWord] = useState(null);
    const [mnemonic, setMnemonic] = useState('');
    const [kanjiNotes, setKanjiNotes] = useState('');
    const [displayLimit, setDisplayLimit] = useState(100);

    // Check for initial stack from navigation
    useEffect(() => {
        const initialStack = sessionStorage.getItem('libraryInitialStack');
        if (initialStack) {
            setActiveStack(initialStack);
            sessionStorage.removeItem('libraryInitialStack');
        }
    }, []);

    const stackCounts = SRS.getStackCounts(vocabulary, progress);

    // Filter words based on stack and search
    const filteredWords = useMemo(() => {
        let words = vocabulary.map(word => ({
            ...word,
            progress: progress[word.id] || { stack: 'unlearned' }
        }));

        // Filter by stack
        if (activeStack !== 'all') {
            words = words.filter(w => {
                if (activeStack === 'unlearned') {
                    return !w.progress.stack || w.progress.stack === 'unlearned';
                }
                return w.progress.stack === activeStack;
            });
        }

        // Filter by search
        if (searchQuery.trim()) {
            const query = searchQuery.trim().toLowerCase();
            words = words.filter(w =>
                w.word.toLowerCase().includes(query) ||
                w.reading.toLowerCase().includes(query) ||
                w.meaning.toLowerCase().includes(query)
            );
        }

        return words;
    }, [vocabulary, progress, activeStack, searchQuery]);

    // Reset display limit when filters change
    const handleStackChange = (stack) => {
        setActiveStack(stack);
        setDisplayLimit(100);
    };

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
        setDisplayLimit(100);
    };

    // Open word detail
    const openWordDetail = (word) => {
        setSelectedWord(word);
        setMnemonic(Storage.getMnemonic(word.id));
        setKanjiNotes(Storage.getKanjiNotes(word.id));
    };

    // Close word detail
    const closeWordDetail = () => {
        setSelectedWord(null);
        setMnemonic('');
        setKanjiNotes('');
    };

    // Save mnemonic
    const handleSaveMnemonic = (value) => {
        setMnemonic(value);
        if (selectedWord) {
            Storage.saveMnemonic(selectedWord.id, value);
        }
    };

    // Save kanji notes
    const handleSaveKanjiNotes = (value) => {
        setKanjiNotes(value);
        if (selectedWord) {
            Storage.saveKanjiNotes(selectedWord.id, value);
        }
    };

    // Move word to different stack
    const moveToStack = (wordId, newStack) => {
        Storage.updateWordData(wordId, {
            stack: newStack,
            ...(newStack === 'learning' ? { nextReview: new Date().toISOString() } : {})
        });
        onUpdateProgress();
        closeWordDetail();
    };

    // Play audio
    const playAudio = (word, e) => {
        if (e) e.stopPropagation();
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(word);
            utterance.lang = 'ja-JP';
            utterance.rate = 0.8;
            speechSynthesis.speak(utterance);
        }
    };

    // Load more words
    const handleLoadMore = () => {
        setDisplayLimit(prev => prev + 100);
    };

    const stackBadgeClass = (stack) => {
        if (!stack || stack === 'unlearned') return 'unlearned';
        return stack;
    };

    // Extract kanji for breakdown
    const getKanjiList = (word) => {
        if (!word) return [];
        const kanjiRegex = /[\u4e00-\u9faf]/g;
        const matches = word.match(kanjiRegex);
        return matches ? [...new Set(matches)] : [];
    };

    const displayedWords = filteredWords.slice(0, displayLimit);
    const hasMore = filteredWords.length > displayLimit;

    return (
        <div className="word-library">
            {/* Stack Tabs */}
            <div className="stack-tabs">
                <button
                    className={`stack-tab ${activeStack === 'all' ? 'active' : ''}`}
                    onClick={() => handleStackChange('all')}
                >
                    <div className="stack-tab-count">{stackCounts.total}</div>
                    <div className="stack-tab-label">All</div>
                </button>
                <button
                    className={`stack-tab ${activeStack === 'unlearned' ? 'active' : ''}`}
                    onClick={() => handleStackChange('unlearned')}
                >
                    <div className="stack-tab-count">{stackCounts.unlearned}</div>
                    <div className="stack-tab-label">Unlearned</div>
                </button>
                <button
                    className={`stack-tab ${activeStack === 'learning' ? 'active' : ''}`}
                    onClick={() => handleStackChange('learning')}
                >
                    <div className="stack-tab-count">{stackCounts.learning}</div>
                    <div className="stack-tab-label">Learning</div>
                </button>
                <button
                    className={`stack-tab ${activeStack === 'known' ? 'active' : ''}`}
                    onClick={() => handleStackChange('known')}
                >
                    <div className="stack-tab-count">{stackCounts.known}</div>
                    <div className="stack-tab-label">Known</div>
                </button>
            </div>

            {/* Search */}
            <div className="search-bar">
                <span className="search-icon">🔍</span>
                <input
                    type="text"
                    className="search-input"
                    placeholder="Search words..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                />
            </div>

            {/* Word List */}
            <div className="word-list">
                {filteredWords.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state-icon">📝</div>
                        <p>No words found</p>
                    </div>
                ) : (
                    <>
                        {displayedWords.map(word => (
                            <div
                                key={word.id}
                                className="word-item"
                                onClick={() => openWordDetail(word)}
                            >
                                <button
                                    className="word-item-audio"
                                    onClick={(e) => playAudio(word.word, e)}
                                    title="Play pronunciation"
                                >
                                    🔊
                                </button>
                                <div className="word-item-kanji">{word.word}</div>
                                <div style={{ flex: 1 }}>
                                    <div className="word-item-reading">{word.reading}</div>
                                    <div className="word-item-meaning">{word.meaning}</div>
                                </div>
                                <span className={`word-item-badge ${stackBadgeClass(word.progress.stack)}`}>
                                    {word.progress.stack || 'unlearned'}
                                </span>
                            </div>
                        ))}

                        {/* Load More Button */}
                        {hasMore && (
                            <div className="load-more-section">
                                <button className="btn btn-secondary" onClick={handleLoadMore}>
                                    Show +100 More ({filteredWords.length - displayLimit} remaining)
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Word Detail Modal */}
            {selectedWord && (
                <div className="modal-overlay" onClick={closeWordDetail}>
                    <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
                        <div className="word-detail">
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-md)' }}>
                                <div className="word-detail-kanji">{selectedWord.word}</div>
                                <button
                                    className="btn-audio"
                                    onClick={() => playAudio(selectedWord.word)}
                                    title="Play pronunciation"
                                >
                                    🔊
                                </button>
                            </div>
                            <div className="word-detail-reading">{selectedWord.reading}</div>
                            <div className="word-detail-meaning">{selectedWord.meaning}</div>

                            {/* Kanji Breakdown */}
                            {getKanjiList(selectedWord.word).length > 0 && (
                                <div style={{ marginBottom: 'var(--space-lg)', padding: 'var(--space-md)', background: 'var(--color-bg-warm)', borderRadius: 'var(--radius-sm)', textAlign: 'left' }}>
                                    <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', marginBottom: 'var(--space-sm)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                        Kanji Breakdown
                                    </div>
                                    <div style={{ display: 'flex', gap: 'var(--space-md)', flexWrap: 'wrap', marginBottom: 'var(--space-md)' }}>
                                        {getKanjiList(selectedWord.word).map((k, i) => (
                                            <div key={i} style={{ padding: 'var(--space-sm)', background: 'var(--color-bg-card)', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
                                                <div style={{ fontFamily: 'var(--font-japanese)', fontSize: '1.5rem' }}>{k}</div>
                                            </div>
                                        ))}
                                    </div>
                                    <textarea
                                        className="mnemonic-input"
                                        value={kanjiNotes}
                                        onChange={(e) => handleSaveKanjiNotes(e.target.value)}
                                        placeholder="Add kanji breakdown, radicals, primitives, Heisig keywords..."
                                        style={{ minHeight: '60px' }}
                                    />
                                </div>
                            )}

                            {/* Example sentence */}
                            {selectedWord.sentence && (
                                <div style={{ marginBottom: 'var(--space-lg)' }}>
                                    <div className="word-detail-sentence">{selectedWord.sentence}</div>
                                    {selectedWord.sentenceMeaning && (
                                        <div className="word-detail-sentence-meaning">{selectedWord.sentenceMeaning}</div>
                                    )}
                                </div>
                            )}

                            {/* Notes */}
                            {selectedWord.notes && (
                                <div style={{ marginBottom: 'var(--space-lg)', textAlign: 'left', fontSize: '0.9375rem', color: 'var(--color-text-secondary)' }}>
                                    <strong>Notes:</strong> {selectedWord.notes}
                                </div>
                            )}

                            {/* Progress info */}
                            <div style={{ marginBottom: 'var(--space-lg)', padding: 'var(--space-md)', background: 'var(--color-bg-warm)', borderRadius: 'var(--radius-sm)', textAlign: 'left' }}>
                                <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', marginBottom: 'var(--space-sm)' }}>
                                    Progress
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-md)', textAlign: 'center' }}>
                                    <div>
                                        <div style={{ fontWeight: '600' }}>{selectedWord.progress.successCount || 0}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Correct</div>
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: '600' }}>{selectedWord.progress.failCount || 0}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Incorrect</div>
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: '600' }}>{selectedWord.progress.interval || 0}d</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Interval</div>
                                    </div>
                                </div>
                            </div>

                            {/* Mnemonic */}
                            <div className="mnemonic-section" style={{ borderTop: 'none', paddingTop: 0 }}>
                                <div className="mnemonic-label">Your mnemonic</div>
                                <textarea
                                    className="mnemonic-input"
                                    value={mnemonic}
                                    onChange={(e) => handleSaveMnemonic(e.target.value)}
                                    placeholder="Add your own memory trick or story..."
                                />
                            </div>

                            {/* Actions */}
                            <div style={{ display: 'flex', gap: 'var(--space-sm)', flexWrap: 'wrap', marginTop: 'var(--space-lg)' }}>
                                {selectedWord.progress.stack !== 'learning' && (
                                    <button
                                        className="btn btn-secondary"
                                        onClick={() => moveToStack(selectedWord.id, 'learning')}
                                    >
                                        Move to Learning
                                    </button>
                                )}
                                {selectedWord.progress.stack !== 'known' && (
                                    <button
                                        className="btn btn-success"
                                        onClick={() => moveToStack(selectedWord.id, 'known')}
                                    >
                                        Mark as Known
                                    </button>
                                )}
                                {selectedWord.progress.stack !== 'unlearned' && (
                                    <button
                                        className="btn btn-ghost"
                                        onClick={() => moveToStack(selectedWord.id, 'unlearned')}
                                    >
                                        Reset Progress
                                    </button>
                                )}
                            </div>
                        </div>

                        <button
                            className="btn btn-ghost"
                            onClick={closeWordDetail}
                            style={{ marginTop: 'var(--space-lg)', width: '100%' }}
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

window.WordLibrary = WordLibrary;
