// Main App Component

const { useState, useEffect, useCallback } = React;

const App = () => {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [studyMode, setStudyMode] = useState(null); // null, 'study', 'quiz', 'smart'
    const [progress, setProgress] = useState({});
    const [settings, setSettings] = useState(DEFAULT_SETTINGS);
    const [stats, setStats] = useState({});

    // Load vocabulary from global
    const vocabulary = typeof VOCABULARY_DATA !== 'undefined' ? VOCABULARY_DATA : [];

    // Load data on mount and run migration
    useEffect(() => {
        // Run migration if needed
        Storage.migrateToUnifiedProgress();

        setProgress(Storage.getWordProgress());
        setSettings(Storage.getSettings());
        setStats(Storage.getStats());
    }, []);

    // Refresh progress data
    const refreshProgress = useCallback(() => {
        setProgress(Storage.getWordProgress());
        setStats(Storage.getStats());
    }, []);

    // Exit session handler
    const handleExitSession = useCallback(() => {
        setStudyMode(null);
        setProgress(Storage.getWordProgress());
        setStats(Storage.getStats());
    }, []);

    // ESC key to exit study/quiz mode
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                handleExitSession();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleExitSession]);

    // Handle settings change
    const handleSaveSettings = (newSettings) => {
        Storage.saveSettings(newSettings);
        setSettings(newSettings);
    };

    // Start smart study mode (unified session)
    const handleStartSmartStudy = () => {
        setStudyMode('smart');
    };

    // Start classic study mode (for backward compatibility)
    const handleStartStudy = () => {
        setStudyMode('study');
    };

    // Start quiz mode
    const handleStartQuiz = () => {
        setStudyMode('quiz');
    };

    // Complete session
    const handleCompleteSession = () => {
        setStudyMode(null);
        refreshProgress();
    };

    // Navigate to library with specific stack filter
    const handleNavigateToLibrary = (stack) => {
        setActiveTab('library');
        sessionStorage.setItem('libraryInitialStack', stack);
    };

    // Handle resource navigation from dropdown
    const handleResourceNavigate = (resourceId) => {
        setActiveTab(resourceId);
    };

    // Check if current tab is a resource (for dropdown)
    const isResourceTab = ['kana', 'radicals', 'grammar', 'library', 'kanji', 'heisig'].includes(activeTab);

    // Render smart study session
    if (studyMode === 'smart') {
        return (
            <div className="app-container app-container-full">
                <header className="app-header session-active">
                    <div className="app-logo" onClick={handleExitSession} style={{ cursor: 'pointer' }}>
                        <span className="app-logo-kanji japanese">日本語</span>
                    </div>
                    <nav className="nav-tabs nav-muted">
                        <button className="nav-tab" onClick={handleExitSession}>Home</button>
                        <button className="nav-tab nav-tab-action active">Study</button>
                        <button className="nav-tab nav-tab-action" onClick={() => { handleExitSession(); setTimeout(() => handleStartQuiz(), 0); }}>Quiz</button>
                        <button className="nav-tab" onClick={() => { handleExitSession(); setActiveTab('progress'); }}>Progress</button>
                        <ResourceDropdown activeTab="" onNavigate={(id) => { handleExitSession(); setActiveTab(id); }} />
                        <button className="nav-tab" onClick={() => { handleExitSession(); setActiveTab('settings'); }}>Settings</button>
                    </nav>
                </header>
                <SmartStudySession
                    vocabulary={vocabulary}
                    progress={progress}
                    settings={settings}
                    onComplete={handleCompleteSession}
                    onExit={handleExitSession}
                />
            </div>
        );
    }

    // Render classic study mode (backward compatibility)
    if (studyMode === 'study') {
        return (
            <div className="app-container app-container-full">
                <header className="app-header session-active">
                    <div className="app-logo" onClick={handleExitSession} style={{ cursor: 'pointer' }}>
                        <span className="app-logo-kanji japanese">日本語</span>
                    </div>
                    <nav className="nav-tabs nav-muted">
                        <button className="nav-tab" onClick={handleExitSession}>Home</button>
                        <button className="nav-tab nav-tab-action active">Study</button>
                        <button className="nav-tab nav-tab-action" onClick={() => { handleExitSession(); setTimeout(() => handleStartQuiz(), 0); }}>Quiz</button>
                        <button className="nav-tab" onClick={() => { handleExitSession(); setActiveTab('progress'); }}>Progress</button>
                        <ResourceDropdown activeTab="" onNavigate={(id) => { handleExitSession(); setActiveTab(id); }} />
                        <button className="nav-tab" onClick={() => { handleExitSession(); setActiveTab('settings'); }}>Settings</button>
                    </nav>
                </header>
                <StudyMode
                    vocabulary={vocabulary}
                    progress={progress}
                    settings={settings}
                    onComplete={handleCompleteSession}
                    onExit={handleExitSession}
                />
            </div>
        );
    }

    // Render quiz mode
    if (studyMode === 'quiz') {
        return (
            <div className="app-container app-container-full">
                <header className="app-header session-active">
                    <div className="app-logo" onClick={handleExitSession} style={{ cursor: 'pointer' }}>
                        <span className="app-logo-kanji japanese">日本語</span>
                    </div>
                    <nav className="nav-tabs nav-muted">
                        <button className="nav-tab" onClick={handleExitSession}>Home</button>
                        <button className="nav-tab nav-tab-action" onClick={() => { handleExitSession(); setTimeout(() => handleStartSmartStudy(), 0); }}>Study</button>
                        <button className="nav-tab nav-tab-action active">Quiz</button>
                        <button className="nav-tab" onClick={() => { handleExitSession(); setActiveTab('progress'); }}>Progress</button>
                        <ResourceDropdown activeTab="" onNavigate={(id) => { handleExitSession(); setActiveTab(id); }} />
                        <button className="nav-tab" onClick={() => { handleExitSession(); setActiveTab('settings'); }}>Settings</button>
                    </nav>
                </header>
                <StudySession
                    vocabulary={vocabulary}
                    progress={progress}
                    settings={settings}
                    onComplete={handleCompleteSession}
                    onExit={handleExitSession}
                />
            </div>
        );
    }

    return (
        <div className="app-container">
            {/* Header with new navigation */}
            <header className="app-header">
                <div className="app-logo" onClick={() => setActiveTab('dashboard')} style={{ cursor: 'pointer' }}>
                    <span className="app-logo-kanji japanese">日本語</span>
                </div>
                <nav className="nav-tabs">
                    <button
                        className={`nav-tab ${activeTab === 'dashboard' ? 'active' : ''}`}
                        onClick={() => setActiveTab('dashboard')}
                    >
                        Home
                    </button>
                    <button
                        className="nav-tab nav-tab-action"
                        onClick={handleStartSmartStudy}
                    >
                        Study
                    </button>
                    <button
                        className="nav-tab nav-tab-action"
                        onClick={handleStartQuiz}
                    >
                        Quiz
                    </button>
                    <button
                        className={`nav-tab ${activeTab === 'progress' ? 'active' : ''}`}
                        onClick={() => setActiveTab('progress')}
                    >
                        Progress
                    </button>
                    <ResourceDropdown
                        activeTab={activeTab}
                        onNavigate={handleResourceNavigate}
                    />
                    <button
                        className={`nav-tab ${activeTab === 'settings' ? 'active' : ''}`}
                        onClick={() => setActiveTab('settings')}
                    >
                        Settings
                    </button>
                </nav>
            </header>

            {/* Main Content */}
            <main>
                {activeTab === 'dashboard' && (
                    <Dashboard
                        vocabulary={vocabulary}
                        progress={progress}
                        settings={settings}
                        stats={stats}
                        onStartStudy={handleStartSmartStudy}
                        onStartQuiz={handleStartQuiz}
                        onRefresh={refreshProgress}
                        onNavigateToLibrary={handleNavigateToLibrary}
                    />
                )}

                {activeTab === 'progress' && (
                    <Progress
                        vocabulary={vocabulary}
                        progress={progress}
                        stats={stats}
                    />
                )}

                {activeTab === 'library' && (
                    <WordLibrary
                        vocabulary={vocabulary}
                        progress={progress}
                        onUpdateProgress={refreshProgress}
                    />
                )}

                {activeTab === 'kana' && (
                    <KanaTables />
                )}

                {activeTab === 'kanji' && (
                    <Kanji vocabulary={vocabulary} progress={progress} />
                )}

                {activeTab === 'heisig' && (
                    <HeisigStudy onNavigateToKana={() => setActiveTab('kana')} />
                )}

                {activeTab === 'grammar' && (
                    <Grammar />
                )}

                {activeTab === 'radicals' && (
                    <RadicalLibrary vocabulary={vocabulary} progress={progress} />
                )}

                {activeTab === 'settings' && (
                    <Settings
                        settings={settings}
                        onSaveSettings={handleSaveSettings}
                        stats={stats}
                    />
                )}
            </main>

            {/* Footer */}
            <footer style={{
                marginTop: 'auto',
                paddingTop: 'var(--space-xl)',
                textAlign: 'center',
                fontSize: '0.8125rem',
                color: 'var(--color-text-muted)'
            }}>
                <p style={{ marginBottom: 'var(--space-xs)' }}>{vocabulary.length} words available</p>
                <p>&copy; whoislewis 2025</p>
            </footer>
        </div>
    );
};

// Radical Library Component (placeholder that shows radicals from the Kanji section)
const RadicalLibrary = ({ vocabulary, progress }) => {
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    const categories = RADICALS_DATA?.categories || [];
    const radicals = RADICALS_DATA?.radicals || [];
    const unifiedProgress = Storage.getUnifiedProgress();

    // Filter radicals
    const filteredRadicals = radicals.filter(radical => {
        const matchesCategory = selectedCategory === 'all' || radical.category === selectedCategory;
        const matchesSearch = !searchTerm ||
            radical.char.includes(searchTerm) ||
            radical.meaning.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (radical.name && radical.name.toLowerCase().includes(searchTerm.toLowerCase()));
        return matchesCategory && matchesSearch;
    });

    // Get radical status
    const getRadicalStatus = (radical) => {
        const prog = unifiedProgress[`radical_${radical.char}`];
        if (!prog) return 'unlearned';
        return prog.stack;
    };

    // Check if priority radical
    const isPriority = (radical) => {
        return PRIORITY_RADICALS?.isPriority(radical.char);
    };

    return (
        <div className="radical-library">
            <div className="radical-library-header">
                <h2>Radical Library</h2>
                <p className="radical-library-subtitle">
                    214 Kangxi radicals - Building blocks of kanji
                </p>
            </div>

            {/* Filters */}
            <div className="radical-library-filters">
                <input
                    type="text"
                    className="radical-search"
                    placeholder="Search radicals..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
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
                            {cat.icon} {cat.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* Radicals grid */}
            <div className="radical-grid">
                {filteredRadicals.map(radical => {
                    const status = getRadicalStatus(radical);
                    const priority = isPriority(radical);

                    return (
                        <div
                            key={radical.char}
                            className={`radical-card ${status} ${priority ? 'priority' : ''}`}
                            title={`${radical.meaning}${radical.name ? ` (${radical.name})` : ''}`}
                        >
                            <div className="radical-card-char japanese">{radical.char}</div>
                            <div className="radical-card-meaning">{radical.meaning}</div>
                            <div className="radical-card-strokes">{radical.strokes} strokes</div>
                            {priority && <div className="priority-badge">Core</div>}
                            {status === 'known' && <div className="status-badge known">✓</div>}
                            {status === 'learning' && <div className="status-badge learning">📖</div>}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

window.RadicalLibrary = RadicalLibrary;

// Render the app
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
