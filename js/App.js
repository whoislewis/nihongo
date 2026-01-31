// Main App Component

const { useState, useEffect, useCallback } = React;

const App = () => {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [studyMode, setStudyMode] = useState(null); // null, 'study', or 'quiz'
    const [progress, setProgress] = useState({});
    const [settings, setSettings] = useState(DEFAULT_SETTINGS);
    const [stats, setStats] = useState({});

    // Load vocabulary from global
    const vocabulary = typeof VOCABULARY_DATA !== 'undefined' ? VOCABULARY_DATA : [];

    // Load data on mount
    useEffect(() => {
        setProgress(Storage.getWordProgress());
        setSettings(Storage.getSettings());
        setStats(Storage.getStats());
    }, []);

    // Refresh progress data
    const refreshProgress = useCallback(() => {
        setProgress(Storage.getWordProgress());
        setStats(Storage.getStats());
    }, []);

    // Exit session handler - wrapped in useCallback for ESC key listener
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

    // Start study mode (learning new words)
    const handleStartStudy = () => {
        setStudyMode('study');
    };

    // Start quiz mode (reviewing)
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
        // Store the desired stack in sessionStorage for the Library component
        sessionStorage.setItem('libraryInitialStack', stack);
    };

    // Render study mode
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
                        <button className="nav-tab" onClick={() => { handleExitSession(); setActiveTab('library'); }}>Library</button>
                        <button className="nav-tab" onClick={() => { handleExitSession(); setActiveTab('kana'); }}>Kana</button>
                        <button className="nav-tab" onClick={() => { handleExitSession(); setActiveTab('kanji'); }}><span className="japanese">漢字</span></button>
                        <button className="nav-tab" onClick={() => { handleExitSession(); setActiveTab('grammar'); }}>Grammar</button>
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
                        <button className="nav-tab nav-tab-action" onClick={() => { handleExitSession(); setTimeout(() => handleStartStudy(), 0); }}>Study</button>
                        <button className="nav-tab nav-tab-action active">Quiz</button>
                        <button className="nav-tab" onClick={() => { handleExitSession(); setActiveTab('library'); }}>Library</button>
                        <button className="nav-tab" onClick={() => { handleExitSession(); setActiveTab('kana'); }}>Kana</button>
                        <button className="nav-tab" onClick={() => { handleExitSession(); setActiveTab('kanji'); }}><span className="japanese">漢字</span></button>
                        <button className="nav-tab" onClick={() => { handleExitSession(); setActiveTab('grammar'); }}>Grammar</button>
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
            {/* Header */}
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
                        onClick={handleStartStudy}
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
                        className={`nav-tab ${activeTab === 'library' ? 'active' : ''}`}
                        onClick={() => setActiveTab('library')}
                    >
                        Library
                    </button>
                    <button
                        className={`nav-tab ${activeTab === 'kana' ? 'active' : ''}`}
                        onClick={() => setActiveTab('kana')}
                    >
                        Kana
                    </button>
                    <button
                        className={`nav-tab ${activeTab === 'kanji' ? 'active' : ''}`}
                        onClick={() => setActiveTab('kanji')}
                    >
                        <span className="japanese">漢字</span>
                    </button>
                    <button
                        className={`nav-tab ${activeTab === 'grammar' ? 'active' : ''}`}
                        onClick={() => setActiveTab('grammar')}
                    >
                        Grammar
                    </button>
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
                        onStartStudy={handleStartStudy}
                        onStartQuiz={handleStartQuiz}
                        onRefresh={refreshProgress}
                        onNavigateToLibrary={handleNavigateToLibrary}
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

                {activeTab === 'grammar' && (
                    <Grammar />
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

// Render the app
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
