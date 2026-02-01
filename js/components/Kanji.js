// Kanji Learning System Component

const { useState, useEffect, useMemo } = React;

const Kanji = ({ vocabulary, progress }) => {
    const [activeTab, setActiveTab] = useState('intro');
    const [selectedRadical, setSelectedRadical] = useState(null);
    const [selectedRadicalIndex, setSelectedRadicalIndex] = useState(0);
    const [selectedKanji, setSelectedKanji] = useState(null);
    const [radicalProgress, setRadicalProgress] = useState({});
    const [kanjiProgress, setKanjiProgress] = useState({});
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [introCardIndex, setIntroCardIndex] = useState(0);
    const [showAllWords, setShowAllWords] = useState(false);

    // Load progress from storage
    useEffect(() => {
        const savedRadicalProgress = Storage.get('nihongo_radical_progress', {});
        const savedKanjiProgress = Storage.get('nihongo_kanji_progress', {});
        setRadicalProgress(savedRadicalProgress);
        setKanjiProgress(savedKanjiProgress);
    }, []);

    // Play audio for any Japanese text
    const playAudio = (text) => {
        if ('speechSynthesis' in window) {
            speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'ja-JP';
            utterance.rate = 0.7;
            speechSynthesis.speak(utterance);
        }
    };

    // ESC key handler for closing modals
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                if (selectedRadical) setSelectedRadical(null);
                if (selectedKanji) setSelectedKanji(null);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedRadical, selectedKanji]);

    // Extract kanji from vocabulary
    const extractedKanji = useMemo(() => {
        return KanjiUtils.extractKanjiFromVocabulary(vocabulary);
    }, [vocabulary]);

    // Generate radical learning path
    const radicalPath = useMemo(() => {
        if (!RADICALS_DATA) return [];
        return KanjiUtils.generateRadicalLearningPath(vocabulary, RADICALS_DATA);
    }, [vocabulary]);

    // Mark radical as learned
    const markRadicalLearned = (radicalChar) => {
        const newProgress = {
            ...radicalProgress,
            [radicalChar]: {
                learned: true,
                learnedAt: new Date().toISOString()
            }
        };
        setRadicalProgress(newProgress);
        Storage.set('nihongo_radical_progress', newProgress);
    };

    // Mark kanji as learned
    const markKanjiLearned = (kanji, status) => {
        const newProgress = {
            ...kanjiProgress,
            [kanji]: {
                status, // 'seen', 'learning', 'mastered'
                updatedAt: new Date().toISOString()
            }
        };
        setKanjiProgress(newProgress);
        Storage.set('nihongo_kanji_progress', newProgress);
    };

    // Introduction card content
    const introCards = [
        // Card 1: Kanji Are Like LEGO
        {
            title: "Kanji Are Like LEGO",
            content: (
                <>
                    <p className="intro-text">
                        Every kanji is built from smaller pieces called <strong>radicals</strong>.
                        Once you learn these building blocks, you can decode any kanji you encounter.
                    </p>
                    <div className="kanji-example-breakdown">
                        <div className="example-kanji">
                            <span className="big-kanji japanese">休</span>
                            <button className="btn-audio-inline" onClick={() => playAudio('やすむ')} title="Play: yasumu">🔊</button>
                            <span className="kanji-meaning">REST</span>
                        </div>
                        <span className="equals">=</span>
                        <div className="example-parts">
                            <div className="part">
                                <span className="part-char japanese">亻</span>
                                <span className="part-meaning">person</span>
                            </div>
                            <span className="plus">+</span>
                            <div className="part">
                                <span className="part-char japanese">木</span>
                                <span className="part-meaning">tree</span>
                            </div>
                        </div>
                    </div>
                    <p className="example-story">
                        A <strong>person</strong> leaning against a <strong>tree</strong> to take a <strong>REST</strong>.
                    </p>
                </>
            )
        },
        // Card 2: Reading Radicals
        {
            title: "Reading Radicals & Their Meanings",
            content: (
                <>
                    <p className="intro-text">
                        Each radical has a <strong>meaning</strong> and often a <strong>name</strong>.
                        Learning these helps you understand and remember kanji much faster.
                    </p>
                    <div className="radicals-showcase">
                        <div className="radical-showcase-item">
                            <span className="showcase-char japanese">氵</span>
                            <button className="btn-audio-sm" onClick={() => playAudio('さんずい')} title="Play: sanzui">🔊</button>
                            <div className="showcase-info">
                                <span className="showcase-meaning">water</span>
                                <span className="showcase-name">"sanzui"</span>
                            </div>
                            <div className="showcase-examples">
                                <span className="japanese" onClick={() => playAudio('うみ')}>海</span>
                                <span className="japanese" onClick={() => playAudio('いけ')}>池</span>
                                <span className="japanese" onClick={() => playAudio('なみ')}>波</span>
                            </div>
                        </div>
                        <div className="radical-showcase-item">
                            <span className="showcase-char japanese">心</span>
                            <button className="btn-audio-sm" onClick={() => playAudio('こころ')} title="Play: kokoro">🔊</button>
                            <div className="showcase-info">
                                <span className="showcase-meaning">heart/mind</span>
                                <span className="showcase-name">"kokoro"</span>
                            </div>
                            <div className="showcase-examples">
                                <span className="japanese" onClick={() => playAudio('おもう')}>思</span>
                                <span className="japanese" onClick={() => playAudio('かんじる')}>感</span>
                                <span className="japanese" onClick={() => playAudio('あい')}>愛</span>
                            </div>
                        </div>
                        <div className="radical-showcase-item">
                            <span className="showcase-char japanese">木</span>
                            <button className="btn-audio-sm" onClick={() => playAudio('き')} title="Play: ki">🔊</button>
                            <div className="showcase-info">
                                <span className="showcase-meaning">tree/wood</span>
                                <span className="showcase-name">"ki"</span>
                            </div>
                            <div className="showcase-examples">
                                <span className="japanese" onClick={() => playAudio('はやし')}>林</span>
                                <span className="japanese" onClick={() => playAudio('もり')}>森</span>
                                <span className="japanese" onClick={() => playAudio('ほん')}>本</span>
                            </div>
                        </div>
                    </div>
                    <p className="intro-hint">
                        Notice how kanji with 氵 often relate to water, and kanji with 心 relate to feelings!
                    </p>
                </>
            )
        },
        // Card 3: How Radicals Combine
        {
            title: "How Radicals Combine",
            content: (
                <>
                    <p className="intro-text">
                        Radicals combine in logical ways. The <strong>position</strong> of a radical often changes its shape,
                        but the meaning stays the same.
                    </p>
                    <div className="combination-examples">
                        <div className="combination-item">
                            <div className="combo-formula">
                                <div className="combo-part-group">
                                    <span className="combo-part japanese">日</span>
                                    <span className="combo-label">sun</span>
                                </div>
                                <span className="combo-operator">+</span>
                                <div className="combo-part-group">
                                    <span className="combo-part japanese">月</span>
                                    <span className="combo-label">moon</span>
                                </div>
                                <span className="combo-operator">=</span>
                                <div className="combo-result-group">
                                    <span className="combo-result japanese">明</span>
                                    <button className="btn-audio-xs" onClick={() => playAudio('あかるい')}>🔊</button>
                                    <span className="combo-label">bright</span>
                                </div>
                            </div>
                            <p className="combo-story">Sun and moon together = <strong>bright</strong></p>
                        </div>
                        <div className="combination-item">
                            <div className="combo-formula">
                                <div className="combo-part-group">
                                    <span className="combo-part japanese">女</span>
                                    <span className="combo-label">woman</span>
                                </div>
                                <span className="combo-operator">+</span>
                                <div className="combo-part-group">
                                    <span className="combo-part japanese">子</span>
                                    <span className="combo-label">child</span>
                                </div>
                                <span className="combo-operator">=</span>
                                <div className="combo-result-group">
                                    <span className="combo-result japanese">好</span>
                                    <button className="btn-audio-xs" onClick={() => playAudio('すき')}>🔊</button>
                                    <span className="combo-label">like/love</span>
                                </div>
                            </div>
                            <p className="combo-story">A woman with her child = <strong>love</strong></p>
                        </div>
                        <div className="combination-item">
                            <div className="combo-formula">
                                <div className="combo-part-group">
                                    <span className="combo-part japanese">木</span>
                                    <span className="combo-label">tree</span>
                                </div>
                                <span className="combo-operator">×3</span>
                                <span className="combo-operator">=</span>
                                <div className="combo-result-group">
                                    <span className="combo-result japanese">森</span>
                                    <button className="btn-audio-xs" onClick={() => playAudio('もり')}>🔊</button>
                                    <span className="combo-label">forest</span>
                                </div>
                            </div>
                            <p className="combo-story">Three trees together = <strong>forest</strong></p>
                        </div>
                    </div>
                </>
            )
        },
        // Card 4: Practice Identifying
        {
            title: "Practice: Spot the Radicals",
            content: (
                <>
                    <p className="intro-text">
                        Can you identify the radicals in these kanji? Look for familiar patterns!
                    </p>
                    <div className="practice-grid-intro">
                        <div className="practice-item-intro">
                            <div className="practice-kanji-box">
                                <span className="practice-kanji japanese">話</span>
                                <button className="btn-audio-xs" onClick={() => playAudio('はなす')}>🔊</button>
                            </div>
                            <div className="practice-breakdown">
                                <span className="practice-radical japanese">言</span>
                                <span className="practice-op">+</span>
                                <span className="practice-radical japanese">舌</span>
                            </div>
                            <span className="practice-hint">(speech + tongue = talk)</span>
                        </div>
                        <div className="practice-item-intro">
                            <div className="practice-kanji-box">
                                <span className="practice-kanji japanese">聞</span>
                                <button className="btn-audio-xs" onClick={() => playAudio('きく')}>🔊</button>
                            </div>
                            <div className="practice-breakdown">
                                <span className="practice-radical japanese">門</span>
                                <span className="practice-op">+</span>
                                <span className="practice-radical japanese">耳</span>
                            </div>
                            <span className="practice-hint">(gate + ear = hear)</span>
                        </div>
                        <div className="practice-item-intro">
                            <div className="practice-kanji-box">
                                <span className="practice-kanji japanese">語</span>
                                <button className="btn-audio-xs" onClick={() => playAudio('ご')}>🔊</button>
                            </div>
                            <div className="practice-breakdown">
                                <span className="practice-radical japanese">言</span>
                                <span className="practice-op">+</span>
                                <span className="practice-radical japanese">吾</span>
                            </div>
                            <span className="practice-hint">(speech + I/self = language)</span>
                        </div>
                    </div>
                    <p className="intro-hint">
                        The more radicals you recognize, the easier kanji become!
                    </p>
                </>
            )
        },
        // Card 5: Three Types of Kanji
        {
            title: "Three Types of Kanji",
            content: (
                <>
                    <p className="intro-text">
                        Understanding the origin of kanji helps you remember them. There are three main types:
                    </p>
                    <div className="kanji-types-grid">
                        <div className="type-card">
                            <div className="type-icon">🖼️</div>
                            <h4>Pictographs</h4>
                            <p>Simplified pictures of real things</p>
                            <div className="type-examples japanese">山 日 月 木</div>
                            <div className="type-hint">mountain, sun, moon, tree</div>
                        </div>
                        <div className="type-card">
                            <div className="type-icon">💡</div>
                            <h4>Ideographs</h4>
                            <p>Abstract concepts made visual</p>
                            <div className="type-examples japanese">上 下 中 一</div>
                            <div className="type-hint">up, down, middle, one</div>
                        </div>
                        <div className="type-card">
                            <div className="type-icon">🧩</div>
                            <h4>Compounds</h4>
                            <p>Radicals combined for meaning</p>
                            <div className="type-examples japanese">明 休 好 森</div>
                            <div className="type-hint">bright, rest, like, forest</div>
                        </div>
                    </div>
                    <p className="intro-hint">
                        Most kanji you'll learn are compounds - that's why radicals are so important!
                    </p>
                </>
            )
        },
        // Card 6: Your Learning Path
        {
            title: "Your Learning Path Forward",
            content: (
                <>
                    <p className="intro-text">
                        Follow this proven approach to master kanji efficiently:
                    </p>
                    <div className="learning-path-preview">
                        <div className="path-step">
                            <div className="step-number">1</div>
                            <div className="step-content">
                                <h4>Learn Radicals</h4>
                                <p>Master the {RADICALS_DATA?.radicals.length || 60}+ building blocks</p>
                            </div>
                        </div>
                        <div className="path-arrow">→</div>
                        <div className="path-step">
                            <div className="step-number">2</div>
                            <div className="step-content">
                                <h4>Build Kanji</h4>
                                <p>Learn kanji from your vocabulary</p>
                            </div>
                        </div>
                        <div className="path-arrow">→</div>
                        <div className="path-step">
                            <div className="step-number">3</div>
                            <div className="step-content">
                                <h4>Connect Words</h4>
                                <p>See kanji in context</p>
                            </div>
                        </div>
                    </div>
                    <div className="intro-stats">
                        <div className="stat-item">
                            <span className="stat-number">{extractedKanji.length}</span>
                            <span className="stat-label">Kanji in your vocabulary</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-number">{radicalPath.length}</span>
                            <span className="stat-label">Radicals to learn</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-number">{Object.keys(radicalProgress).filter(k => radicalProgress[k]?.learned).length}</span>
                            <span className="stat-label">Radicals mastered</span>
                        </div>
                    </div>
                    <button className="btn btn-primary btn-large" onClick={() => setActiveTab('radicals')}>
                        Start with Radicals →
                    </button>
                </>
            )
        }
    ];

    const totalIntroCards = introCards.length;

    // Render introduction tab with card stack
    const renderIntro = () => (
        <div className="kanji-intro">
            <div className="intro-hero">
                <h2>Understanding Kanji</h2>
                <p className="intro-subtitle">The Building Blocks of Japanese Writing</p>
            </div>

            <div className="intro-card-wrapper">
                {/* Left Arrow */}
                <button
                    className="side-nav-arrow side-nav-left"
                    onClick={() => setIntroCardIndex(Math.max(0, introCardIndex - 1))}
                    disabled={introCardIndex === 0}
                    title="Previous"
                >
                    ‹
                </button>

                <div className="intro-card-stack">
                    <div className="intro-card">
                        <h3>{introCards[introCardIndex].title}</h3>
                        <div className="intro-card-content">
                            {introCards[introCardIndex].content}
                        </div>
                    </div>

                    {/* Progress dots */}
                    <div className="intro-card-progress">
                        <span className="progress-text">{introCardIndex + 1} of {totalIntroCards}</span>
                        <div className="progress-dots">
                            {introCards.map((_, idx) => (
                                <span
                                    key={idx}
                                    className={`progress-dot ${idx === introCardIndex ? 'active' : ''} ${idx < introCardIndex ? 'completed' : ''}`}
                                    onClick={() => setIntroCardIndex(idx)}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Arrow */}
                <button
                    className="side-nav-arrow side-nav-right"
                    onClick={() => setIntroCardIndex(Math.min(totalIntroCards - 1, introCardIndex + 1))}
                    disabled={introCardIndex === totalIntroCards - 1}
                    title="Next"
                >
                    ›
                </button>
            </div>
        </div>
    );

    // Render radicals library
    const renderRadicals = () => {
        const categories = RADICALS_DATA?.categories || [];
        const radicals = RADICALS_DATA?.radicals || [];

        const filteredRadicals = selectedCategory === 'all'
            ? radicals
            : radicals.filter(r => r.category === selectedCategory);

        const searchedRadicals = searchQuery
            ? filteredRadicals.filter(r =>
                r.char.includes(searchQuery) ||
                r.meaning.toLowerCase().includes(searchQuery.toLowerCase()) ||
                r.name.toLowerCase().includes(searchQuery.toLowerCase())
              )
            : filteredRadicals;

        return (
            <div className="radicals-library">
                <div className="library-header">
                    <h2>Radical Library</h2>
                    <p>The building blocks of all kanji</p>
                </div>

                {/* Search */}
                <div className="search-bar">
                    <span className="search-icon">🔍</span>
                    <input
                        type="text"
                        className="search-input"
                        placeholder="Search radicals..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                {/* Category filters */}
                <div className="category-filters">
                    <button
                        className={`category-btn ${selectedCategory === 'all' ? 'active' : ''}`}
                        onClick={() => setSelectedCategory('all')}
                    >
                        All
                    </button>
                    {categories.map(cat => (
                        <button
                            key={cat.id}
                            className={`category-btn ${selectedCategory === cat.id ? 'active' : ''}`}
                            onClick={() => setSelectedCategory(cat.id)}
                            style={{ '--cat-color': cat.color }}
                        >
                            <span>{cat.icon}</span>
                            <span>{cat.name}</span>
                        </button>
                    ))}
                </div>

                {/* Progress bar */}
                <div className="radicals-progress">
                    <div className="progress-info">
                        <span>{Object.keys(radicalProgress).filter(k => radicalProgress[k]?.learned).length} / {radicals.length} learned</span>
                    </div>
                    <div className="progress-bar">
                        <div
                            className="progress-bar-fill"
                            style={{
                                width: `${(Object.keys(radicalProgress).filter(k => radicalProgress[k]?.learned).length / radicals.length) * 100}%`
                            }}
                        />
                    </div>
                </div>

                {/* Radicals grid */}
                <div className="radicals-grid">
                    {searchedRadicals.map((radical, idx) => {
                        const isLearned = radicalProgress[radical.char]?.learned;
                        const category = categories.find(c => c.id === radical.category);

                        return (
                            <div
                                key={idx}
                                className={`radical-card ${isLearned ? 'learned' : ''}`}
                                onClick={() => setSelectedRadical(radical)}
                                style={{ '--cat-color': category?.color || '#6B7280' }}
                            >
                                <div className="radical-char japanese">{radical.char}</div>
                                <div className="radical-meaning">{radical.meaning}</div>
                                <div className="radical-strokes">{radical.strokes} strokes</div>
                                {isLearned && <div className="learned-badge">✓</div>}
                            </div>
                        );
                    })}
                </div>

                {/* Radical detail modal */}
                {selectedRadical && (
                    <RadicalDetailModal
                        radical={selectedRadical}
                        radicalIndex={searchedRadicals.findIndex(r => r.char === selectedRadical.char)}
                        totalRadicals={searchedRadicals.length}
                        categories={categories}
                        radicalProgress={radicalProgress}
                        extractedKanji={extractedKanji}
                        vocabulary={vocabulary}
                        onClose={() => setSelectedRadical(null)}
                        onPrev={() => {
                            const currentIdx = searchedRadicals.findIndex(r => r.char === selectedRadical.char);
                            if (currentIdx > 0) setSelectedRadical(searchedRadicals[currentIdx - 1]);
                        }}
                        onNext={() => {
                            const currentIdx = searchedRadicals.findIndex(r => r.char === selectedRadical.char);
                            if (currentIdx < searchedRadicals.length - 1) setSelectedRadical(searchedRadicals[currentIdx + 1]);
                        }}
                        onMarkLearned={() => {
                            markRadicalLearned(selectedRadical.char);
                        }}
                        onSelectKanji={(kanjiData) => {
                            setSelectedRadical(null);
                            setSelectedKanji(kanjiData);
                            setActiveTab('kanji');
                        }}
                    />
                )}
            </div>
        );
    };

    // Render kanji list
    const renderKanjiList = () => {
        const searchedKanji = searchQuery
            ? extractedKanji.filter(k =>
                k.kanji.includes(searchQuery) ||
                k.words.some(w =>
                    w.meaning.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    w.reading.includes(searchQuery)
                )
              )
            : extractedKanji;

        return (
            <div className="kanji-list-section">
                <div className="library-header">
                    <h2>Kanji from Your Vocabulary</h2>
                    <p>{extractedKanji.length} unique kanji found in {vocabulary.length} words</p>
                </div>

                {/* Search */}
                <div className="search-bar">
                    <span className="search-icon">🔍</span>
                    <input
                        type="text"
                        className="search-input"
                        placeholder="Search kanji, meaning, or reading..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                {/* Kanji grid */}
                <div className="kanji-grid">
                    {searchedKanji.slice(0, 100).map((k, idx) => {
                        const status = kanjiProgress[k.kanji]?.status;

                        return (
                            <div
                                key={idx}
                                className={`kanji-card ${status || ''}`}
                                onClick={() => setSelectedKanji(k)}
                            >
                                <div className="kanji-card-char japanese">{k.kanji}</div>
                                <div className="kanji-card-info">
                                    <span className="kanji-card-count">{k.count}x</span>
                                    {status && (
                                        <span className={`status-dot ${status}`}></span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {extractedKanji.length > 100 && (
                    <p className="load-more-hint">Showing first 100 kanji. Use search to find more.</p>
                )}

                {/* Kanji detail modal */}
                {selectedKanji && (
                    <KanjiDetailModal
                        kanji={selectedKanji}
                        vocabulary={vocabulary}
                        radicals={RADICALS_DATA}
                        onClose={() => setSelectedKanji(null)}
                        onMarkStatus={(status) => {
                            markKanjiLearned(selectedKanji.kanji, status);
                        }}
                        currentStatus={kanjiProgress[selectedKanji.kanji]?.status}
                    />
                )}
            </div>
        );
    };

    return (
        <div className="kanji-section">
            {/* Tab navigation */}
            <div className="kanji-tabs">
                <button
                    className={`kanji-tab ${activeTab === 'intro' ? 'active' : ''}`}
                    onClick={() => setActiveTab('intro')}
                >
                    <span>📖</span>
                    <span>Introduction</span>
                </button>
                <button
                    className={`kanji-tab ${activeTab === 'radicals' ? 'active' : ''}`}
                    onClick={() => setActiveTab('radicals')}
                >
                    <span>🧱</span>
                    <span>Radicals</span>
                </button>
                <button
                    className={`kanji-tab ${activeTab === 'kanji' ? 'active' : ''}`}
                    onClick={() => setActiveTab('kanji')}
                >
                    <span className="japanese">漢</span>
                    <span>Kanji</span>
                </button>
            </div>

            {/* Content */}
            <div className="kanji-content">
                {activeTab === 'intro' && renderIntro()}
                {activeTab === 'radicals' && renderRadicals()}
                {activeTab === 'kanji' && renderKanjiList()}
            </div>
        </div>
    );
};

// Radical Detail Modal Component - Enhanced with more educational content
const RadicalDetailModal = ({
    radical,
    radicalIndex,
    totalRadicals,
    categories,
    radicalProgress,
    extractedKanji,
    vocabulary,
    onClose,
    onPrev,
    onNext,
    onMarkLearned,
    onSelectKanji
}) => {
    const [isAnimating, setIsAnimating] = useState(false);

    // Play audio for radical name
    const playAudio = (text) => {
        if ('speechSynthesis' in window) {
            speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'ja-JP';
            utterance.rate = 0.7;
            speechSynthesis.speak(utterance);
        }
    };

    // ESC key and arrow key handler
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') onClose();
            if (e.key === 'ArrowLeft' && radicalIndex > 0) onPrev();
            if (e.key === 'ArrowRight' && radicalIndex < totalRadicals - 1) onNext();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [radicalIndex, totalRadicals]);

    // Get category info
    const category = categories.find(c => c.id === radical.category);

    // Find vocabulary words that use kanji containing this radical
    const getExampleWord = () => {
        if (!radical.examples || radical.examples.length === 0) return null;

        for (const exampleKanji of radical.examples) {
            const word = vocabulary.find(w => w.word.includes(exampleKanji));
            if (word) {
                return { kanji: exampleKanji, word };
            }
        }
        return null;
    };

    const exampleWord = getExampleWord();

    // Extended mnemonics based on radical meaning
    const getExtendedMnemonics = () => {
        const tips = [radical.mnemonic];

        // Add contextual tips based on category
        const categoryTips = {
            'people': 'Radicals about people often appear in kanji related to actions, relationships, or body parts.',
            'nature': 'Nature radicals frequently combine to describe weather, plants, landscapes, and natural phenomena.',
            'water': 'Water and fire radicals indicate elements, temperature, or states of matter.',
            'animals': 'Animal radicals can indicate actual animals or borrowed meanings from animal characteristics.',
            'objects': 'Object radicals often appear in kanji for tools, materials, or everyday items.',
            'actions': 'Action radicals usually indicate movement, speech, or dynamic activities.',
            'enclosures': 'Enclosure radicals wrap around other elements, often suggesting containment or boundaries.',
            'abstract': 'Abstract radicals represent numbers, directions, or concepts that can\'t be drawn directly.'
        };

        if (categoryTips[radical.category]) {
            tips.push(categoryTips[radical.category]);
        }

        // Add position tip if it's a variant radical
        if (radical.name.includes('ben') || radical.name.includes('hen')) {
            tips.push('This radical typically appears on the left side of kanji.');
        } else if (radical.name.includes('kanmuri') || radical.name.includes('kashira')) {
            tips.push('This radical typically appears on top of kanji.');
        } else if (radical.name.includes('ashi') || radical.name.includes('shita')) {
            tips.push('This radical typically appears at the bottom of kanji.');
        }

        return tips;
    };

    const extendedMnemonics = getExtendedMnemonics();

    // Simulate stroke order animation
    const animateStrokes = () => {
        setIsAnimating(true);
        setTimeout(() => setIsAnimating(false), 2000);
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            {/* Left navigation arrow */}
            <button
                className="modal-nav-arrow modal-nav-left"
                onClick={(e) => { e.stopPropagation(); onPrev(); }}
                disabled={radicalIndex === 0}
                title="Previous radical (←)"
            >
                ‹
            </button>

            <div className="modal modal-radical-detail" onClick={e => e.stopPropagation()}>
                <button className="modal-close-btn" onClick={onClose}>✕</button>

                {/* Progress indicator */}
                <div className="modal-progress-indicator">
                    {radicalIndex + 1} / {totalRadicals}
                </div>

                <div className="radical-detail">
                    {/* Header with large character and audio */}
                    <div className="radical-detail-header">
                        <div className="radical-char-container">
                            <span
                                className="radical-detail-char japanese"
                                style={{ color: category?.color }}
                            >
                                {radical.char}
                            </span>
                            <button
                                className="btn-audio-large"
                                onClick={() => playAudio(radical.name)}
                                title="Listen to pronunciation"
                            >
                                🔊
                            </button>
                        </div>
                        <div className="radical-detail-info">
                            <h3>{radical.meaning}</h3>
                            <p className="radical-name">
                                Japanese name: <strong>"{radical.name}"</strong>
                            </p>
                            <p className="radical-strokes">{radical.strokes} strokes</p>
                            <div className="radical-category-badge" style={{ backgroundColor: category?.color }}>
                                {category?.icon} {category?.name}
                            </div>
                        </div>
                    </div>

                    {/* Stroke Order Section */}
                    <div className="radical-stroke-section">
                        <h4>Stroke Order</h4>
                        <div className="stroke-order-display">
                            <div className={`stroke-demo-area ${isAnimating ? 'animating' : ''}`}>
                                <span className="stroke-demo-char japanese">{radical.char}</span>
                            </div>
                            <div className="stroke-controls">
                                <button className="btn btn-sm" onClick={animateStrokes}>
                                    ▶ Animate
                                </button>
                                <span className="stroke-count">{radical.strokes} strokes</span>
                            </div>
                        </div>
                        <p className="stroke-hint">
                            Practice writing: Top to bottom, left to right, horizontal before vertical.
                        </p>
                    </div>

                    {/* Memory Tips Section - Enhanced */}
                    <div className="radical-mnemonic-section">
                        <h4>Memory Tips</h4>
                        <div className="mnemonic-list">
                            {extendedMnemonics.map((tip, i) => (
                                <div key={i} className="mnemonic-item">
                                    <span className="mnemonic-bullet">{i === 0 ? '💡' : '📝'}</span>
                                    <p>{tip}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Example Word in Context */}
                    {exampleWord && (
                        <div className="radical-example-word-section">
                            <h4>Example in Context</h4>
                            <div className="example-word-card">
                                <div className="example-word-main">
                                    <span className="example-word-kanji japanese">{exampleWord.word.word}</span>
                                    <button
                                        className="btn-audio"
                                        onClick={() => playAudio(exampleWord.word.word)}
                                    >
                                        🔊
                                    </button>
                                </div>
                                <div className="example-word-details">
                                    <span className="example-word-reading japanese">{exampleWord.word.reading}</span>
                                    <span className="example-word-meaning">{exampleWord.word.meaning}</span>
                                </div>
                                <p className="example-word-highlight">
                                    Contains <span className="highlight-char japanese" style={{ color: category?.color }}>{exampleWord.kanji}</span> which uses the <strong>{radical.meaning}</strong> radical
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Kanji Examples with Heisig-style breakdown */}
                    {radical.examples && radical.examples.length > 0 && (
                        <div className="radical-examples-section">
                            <h4>Kanji using this radical</h4>
                            <div className="examples-detailed-list">
                                {/* First show detailedExamples if available */}
                                {radical.detailedExamples && radical.detailedExamples.map((detail, i) => (
                                    <div key={`detail-${i}`} className="example-detailed-card featured">
                                        <div className="example-header">
                                            <span className="example-kanji-large japanese">{detail.kanji}</span>
                                            <button
                                                className="btn-audio-sm"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    playAudio(detail.word);
                                                }}
                                            >
                                                🔊
                                            </button>
                                        </div>

                                        {/* Word with reading and meaning - REQUIRED FORMAT */}
                                        <div className="example-vocab-line">
                                            <span className="japanese">{detail.word}</span>
                                            <span className="reading japanese">({detail.reading})</span>
                                            <span className="meaning">- {detail.meaning}</span>
                                        </div>

                                        {/* Breakdown - REQUIRED FORMAT */}
                                        <div className="example-breakdown-line">
                                            <span className="breakdown-label">Breakdown:</span>
                                            <span className="breakdown-components">{detail.breakdown}</span>
                                        </div>

                                        {/* Story - REQUIRED FORMAT */}
                                        <div className="example-story-line">
                                            <span className="story-label">Story:</span>
                                            <span className="story-text">"{detail.story}"</span>
                                        </div>
                                    </div>
                                ))}

                                {/* Then show remaining examples without detailed info */}
                                {radical.examples
                                    .filter(ex => !radical.detailedExamples?.some(d => d.kanji === ex))
                                    .slice(0, Math.max(0, 5 - (radical.detailedExamples?.length || 0)))
                                    .map((ex, i) => {
                                        const heisigData = typeof HEISIG_DATA !== 'undefined' ? HEISIG_DATA.getByKanji(ex) : null;
                                        const vocabWord = vocabulary.find(w => w.word.includes(ex));

                                        return (
                                            <div key={`ex-${i}`} className="example-detailed-card">
                                                <div className="example-header">
                                                    <span className="example-kanji-large japanese">{ex}</span>
                                                    <button
                                                        className="btn-audio-sm"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            playAudio(vocabWord?.word || ex);
                                                        }}
                                                    >
                                                        🔊
                                                    </button>
                                                    {heisigData && (
                                                        <span className="example-keyword">- {heisigData.keyword}</span>
                                                    )}
                                                </div>

                                                {vocabWord && (
                                                    <div className="example-vocab-line">
                                                        <span className="japanese">{vocabWord.word}</span>
                                                        <span className="reading japanese">({vocabWord.reading})</span>
                                                        <span className="meaning">- {vocabWord.meaning}</span>
                                                    </div>
                                                )}

                                                <div className="example-breakdown-line">
                                                    <span className="breakdown-label">Breakdown:</span>
                                                    <span className="breakdown-formula japanese">{ex}</span>
                                                    <span className="breakdown-equals">=</span>
                                                    {heisigData && heisigData.components.length > 0 ? (
                                                        <span className="breakdown-components">
                                                            {heisigData.components.join(' + ')}
                                                        </span>
                                                    ) : (
                                                        <span className="breakdown-components">
                                                            {radical.char} ({radical.meaning}) + ...
                                                        </span>
                                                    )}
                                                </div>

                                                {heisigData && (
                                                    <div className="example-story-line">
                                                        <span className="story-label">Story:</span>
                                                        <span className="story-text">"{heisigData.story.slice(0, 80)}..."</span>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                            </div>
                            {radical.examples.length > 5 && (
                                <p className="more-examples">+{radical.examples.length - 5} more kanji using this radical</p>
                            )}
                        </div>
                    )}

                    {/* Writing Practice Placeholder */}
                    <div className="radical-practice-section">
                        <h4>Practice Area</h4>
                        <div className="practice-canvas-placeholder">
                            <div className="practice-grid">
                                <span className="practice-ghost japanese">{radical.char}</span>
                            </div>
                            <p className="practice-hint">Trace or write the radical here (coming soon)</p>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="radical-modal-actions">
                        {!radicalProgress[radical.char]?.learned ? (
                            <button className="btn btn-success btn-large" onClick={onMarkLearned}>
                                ✓ Mark as Learned
                            </button>
                        ) : (
                            <div className="already-learned-badge">
                                ✓ Already Learned
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Right navigation arrow */}
            <button
                className="modal-nav-arrow modal-nav-right"
                onClick={(e) => { e.stopPropagation(); onNext(); }}
                disabled={radicalIndex >= totalRadicals - 1}
                title="Next radical (→)"
            >
                ›
            </button>
        </div>
    );
};

// Kanji Detail Modal Component
const KanjiDetailModal = ({ kanji, vocabulary, radicals, onClose, onMarkStatus, currentStatus }) => {
    const [kanjiData, setKanjiData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [strokeSvg, setStrokeSvg] = useState(null);
    const [animating, setAnimating] = useState(false);
    const [showAllWords, setShowAllWords] = useState(false);

    // ESC key handler
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    useEffect(() => {
        loadKanjiData();
    }, [kanji.kanji]);

    const loadKanjiData = async () => {
        setLoading(true);
        try {
            // Fetch from kanjiapi.dev
            const response = await fetch(`https://kanjiapi.dev/v1/kanji/${encodeURIComponent(kanji.kanji)}`);
            if (response.ok) {
                const data = await response.json();
                setKanjiData(data);
            }

            // Try to load stroke order SVG from KanjiVG
            const unicode = kanji.kanji.charCodeAt(0).toString(16).padStart(5, '0');
            // Note: In production, you'd host these SVGs or use kanjivg-js
            // For now, we'll generate a placeholder animation

        } catch (error) {
            console.error('Error loading kanji data:', error);
        }
        setLoading(false);
    };

    // Find radicals used in this kanji
    const usedRadicals = radicals?.radicals.filter(r =>
        r.examples && r.examples.includes(kanji.kanji)
    ) || [];

    // Find similar kanji
    const similarKanji = KanjiUtils.getSimilarKanji(kanji.kanji, []);

    // Generate mnemonic based on radicals
    const generateMnemonic = () => {
        if (usedRadicals.length === 0) return null;
        const parts = usedRadicals.map(r => r.meaning).join(' and ');
        return `Think of ${parts} coming together to create this meaning.`;
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

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal kanji-detail-modal" onClick={e => e.stopPropagation()}>
                {loading ? (
                    <div className="loading-state">Loading kanji data...</div>
                ) : (
                    <>
                        <div className="kanji-detail-header">
                            <div className="kanji-main-display">
                                <span className="kanji-huge japanese">{kanji.kanji}</span>
                                <button className="btn-audio" onClick={() => playAudio(kanji.kanji)}>
                                    🔊
                                </button>
                            </div>

                            {kanjiData && (
                                <div className="kanji-basic-info">
                                    <div className="info-row">
                                        <span className="info-label">Meanings:</span>
                                        <span>{kanjiData.meanings?.join(', ')}</span>
                                    </div>
                                    <div className="info-row">
                                        <span className="info-label">Strokes:</span>
                                        <span>{kanjiData.stroke_count}</span>
                                    </div>
                                    {kanjiData.grade && (
                                        <div className="info-row">
                                            <span className="info-label">Grade:</span>
                                            <span>{kanjiData.grade}</span>
                                        </div>
                                    )}
                                    {kanjiData.jlpt && (
                                        <div className="info-row">
                                            <span className="info-label">JLPT:</span>
                                            <span>N{kanjiData.jlpt}</span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Stroke Order Placeholder */}
                        <div className="stroke-order-section">
                            <h4>Stroke Order</h4>
                            <div className="stroke-display">
                                <div className="stroke-placeholder">
                                    <span className="kanji-stroke-demo japanese">{kanji.kanji}</span>
                                    <p className="stroke-hint">
                                        {kanjiData?.stroke_count} strokes
                                        <br />
                                        <small>(Animated stroke order coming soon with kanjivg-js)</small>
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Readings */}
                        {kanjiData && (
                            <div className="readings-section">
                                <h4>Readings</h4>
                                <div className="readings-grid">
                                    {kanjiData.on_readings && kanjiData.on_readings.length > 0 && (
                                        <div className="reading-group">
                                            <span className="reading-type">On'yomi (Chinese)</span>
                                            <div className="reading-list">
                                                {kanjiData.on_readings.map((r, i) => (
                                                    <span
                                                        key={i}
                                                        className="reading-chip on japanese"
                                                        onClick={() => playAudio(r)}
                                                    >
                                                        {r}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    {kanjiData.kun_readings && kanjiData.kun_readings.length > 0 && (
                                        <div className="reading-group">
                                            <span className="reading-type">Kun'yomi (Japanese)</span>
                                            <div className="reading-list">
                                                {kanjiData.kun_readings.map((r, i) => (
                                                    <span
                                                        key={i}
                                                        className="reading-chip kun japanese"
                                                        onClick={() => playAudio(r.replace(/\./g, ''))}
                                                    >
                                                        {r}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Radical Breakdown */}
                        {usedRadicals.length > 0 && (
                            <div className="radical-breakdown-section">
                                <h4>Radical Components</h4>
                                <div className="radical-breakdown">
                                    {usedRadicals.map((r, i) => (
                                        <div key={i} className="breakdown-part">
                                            <span className="breakdown-char japanese">{r.char}</span>
                                            <span className="breakdown-meaning">{r.meaning}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="mnemonic-suggestion">
                                    <strong>Memory tip:</strong> {generateMnemonic()}
                                </div>
                            </div>
                        )}

                        {/* Words from vocabulary */}
                        <div className="vocab-words-section">
                            <h4>Words in Your Vocabulary ({kanji.words.length})</h4>
                            <div className="vocab-words-list">
                                {(showAllWords ? kanji.words : kanji.words.slice(0, 5)).map((word, i) => (
                                    <div key={i} className="vocab-word-item">
                                        <span className="vocab-word japanese">{word.word}</span>
                                        <button className="btn-audio-xs" onClick={() => playAudio(word.word)}>🔊</button>
                                        <span className="vocab-reading japanese">{word.reading}</span>
                                        <span className="vocab-meaning">{word.meaning}</span>
                                    </div>
                                ))}
                                {kanji.words.length > 5 && !showAllWords && (
                                    <button
                                        className="more-words-btn"
                                        onClick={() => setShowAllWords(true)}
                                    >
                                        Show +{kanji.words.length - 5} more words
                                    </button>
                                )}
                                {showAllWords && kanji.words.length > 5 && (
                                    <button
                                        className="more-words-btn"
                                        onClick={() => setShowAllWords(false)}
                                    >
                                        Show less
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Similar Kanji Warning */}
                        {similarKanji.length > 0 && (
                            <div className="similar-kanji-section">
                                <h4>⚠️ Similar Looking Kanji</h4>
                                <div className="similar-kanji-list">
                                    {similarKanji.map((sk, i) => (
                                        <span key={i} className="similar-kanji-chip japanese">{sk}</span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Status buttons */}
                        <div className="kanji-status-actions">
                            <span className="status-label">Mark as:</span>
                            <div className="status-buttons">
                                <button
                                    className={`status-btn ${currentStatus === 'seen' ? 'active' : ''}`}
                                    onClick={() => onMarkStatus('seen')}
                                >
                                    👁️ Seen
                                </button>
                                <button
                                    className={`status-btn ${currentStatus === 'learning' ? 'active' : ''}`}
                                    onClick={() => onMarkStatus('learning')}
                                >
                                    📖 Learning
                                </button>
                                <button
                                    className={`status-btn ${currentStatus === 'mastered' ? 'active' : ''}`}
                                    onClick={() => onMarkStatus('mastered')}
                                >
                                    ✅ Mastered
                                </button>
                            </div>
                        </div>

                        <button className="btn btn-secondary close-btn" onClick={onClose}>
                            Close
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

window.Kanji = Kanji;
