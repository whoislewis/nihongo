// Progress Page Component
// Shows visual learning path, detailed statistics, study history, and achievements

const { useState, useEffect, useMemo } = React;

const Progress = ({ vocabulary, progress, stats }) => {
    const [stagesData, setStagesData] = useState([]);
    const [activeView, setActiveView] = useState('overview'); // 'overview', 'stats', 'achievements'

    // Load stage data and listen for progress updates
    useEffect(() => {
        const refreshData = () => {
            const summary = StageManager.getDashboardSummary();
            setStagesData(summary.allStages);
        };

        refreshData();

        // Listen for progress updates from study/quiz sessions
        const handleProgressUpdate = () => {
            refreshData();
        };
        window.addEventListener('nihongo-progress-update', handleProgressUpdate);

        // Also listen for storage changes
        const handleStorageChange = (e) => {
            if (e.key && e.key.includes('nihongo')) {
                refreshData();
            }
        };
        window.addEventListener('storage', handleStorageChange);

        // Refresh on focus
        const handleFocus = () => refreshData();
        window.addEventListener('focus', handleFocus);

        return () => {
            window.removeEventListener('nihongo-progress-update', handleProgressUpdate);
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('focus', handleFocus);
        };
    }, [progress]);

    // Calculate detailed stats
    const detailedStats = useMemo(() => {
        const wordProgress = Storage.getWordProgress();
        const unifiedProgress = Storage.getUnifiedProgress();
        const stackCounts = SRS.getStackCounts(vocabulary, wordProgress);

        // Calculate review stats
        let dueNow = 0;
        let dueLater = 0;
        const now = new Date();

        Object.values(wordProgress).forEach(wp => {
            if (wp.stack === 'learning') {
                if (wp.nextReview && new Date(wp.nextReview) <= now) {
                    dueNow++;
                } else {
                    dueLater++;
                }
            }
        });

        // Radical stats
        const radicalStats = SRS.getUnifiedStackCounts('radical');

        // Calculate accuracy (if we have review data)
        let totalCorrect = 0;
        let totalReviews = 0;
        Object.values(wordProgress).forEach(wp => {
            totalCorrect += wp.successCount || 0;
            totalReviews += (wp.successCount || 0) + (wp.failCount || 0);
        });
        const accuracy = totalReviews > 0 ? Math.round((totalCorrect / totalReviews) * 100) : 0;

        return {
            vocabulary: stackCounts,
            radicals: radicalStats,
            reviews: { dueNow, dueLater },
            accuracy,
            totalReviews: stats.totalReviews || 0,
            streak: stats.streak || 0
        };
    }, [vocabulary, progress, stats]);

    // Calculate achievements
    const achievements = useMemo(() => {
        const earned = [];
        const available = [
            { id: 'first_word', name: 'First Steps', description: 'Learn your first word', icon: '🌱', condition: () => detailedStats.vocabulary.known + detailedStats.vocabulary.learning > 0 },
            { id: 'ten_words', name: 'Getting Started', description: 'Learn 10 words', icon: '📚', condition: () => detailedStats.vocabulary.known >= 10 },
            { id: 'fifty_words', name: 'Vocabulary Builder', description: 'Learn 50 words', icon: '📖', condition: () => detailedStats.vocabulary.known >= 50 },
            { id: 'hundred_words', name: 'Century Club', description: 'Know 100 words', icon: '💯', condition: () => detailedStats.vocabulary.known >= 100 },
            { id: 'five_hundred', name: 'Word Master', description: 'Know 500 words', icon: '🏆', condition: () => detailedStats.vocabulary.known >= 500 },
            { id: 'thousand', name: 'Scholar', description: 'Know 1000 words', icon: '🎓', condition: () => detailedStats.vocabulary.known >= 1000 },
            { id: 'all_words', name: 'Complete!', description: 'Master all 1500 words', icon: '👑', condition: () => detailedStats.vocabulary.known >= 1500 },
            { id: 'week_streak', name: 'Consistent', description: '7-day study streak', icon: '🔥', condition: () => detailedStats.streak >= 7 },
            { id: 'month_streak', name: 'Dedicated', description: '30-day study streak', icon: '⚡', condition: () => detailedStats.streak >= 30 },
            { id: 'first_radical', name: 'Radical Beginner', description: 'Learn your first radical', icon: '部', condition: () => detailedStats.radicals.learning + detailedStats.radicals.known > 0 },
            { id: 'all_radicals', name: 'Radical Master', description: 'Learn all 50 core radicals', icon: '🧱', condition: () => detailedStats.radicals.known >= 50 },
            { id: 'kana_mastery', name: 'Kana Master', description: 'Master all hiragana and katakana', icon: 'あ', condition: () => stagesData.find(s => s.id === 'kana_mastery')?.complete },
            { id: 'accuracy_90', name: 'Sharp Mind', description: '90%+ review accuracy', icon: '🎯', condition: () => detailedStats.accuracy >= 90 && detailedStats.totalReviews >= 50 },
        ];

        available.forEach(achievement => {
            if (achievement.condition()) {
                earned.push(achievement);
            }
        });

        return { earned, available };
    }, [detailedStats, stagesData]);

    // Render learning path tree
    const renderLearningPath = () => (
        <div className="progress-learning-path">
            <h3>Learning Path</h3>
            <div className="progress-stages">
                {stagesData.map((stage, index) => (
                    <div key={stage.id} className={`progress-stage ${stage.complete ? 'complete' : ''} ${stage.status === 'active' ? 'active' : ''}`}>
                        <div className="progress-stage-icon">
                            {stage.complete ? '✅' : stage.status === 'locked' ? '🔒' : stage.icon}
                        </div>
                        <div className="progress-stage-info">
                            <div className="progress-stage-name">{stage.name}</div>
                            <div className="progress-stage-progress">
                                {stage.complete ? 'Complete' : `${stage.progress.percent}%`}
                            </div>
                        </div>
                        {!stage.complete && stage.status === 'active' && (
                            <div className="progress-stage-bar">
                                <div className="progress-stage-fill" style={{ width: `${stage.progress.percent}%` }} />
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );

    // Render vocabulary stats
    const renderVocabStats = () => (
        <div className="progress-vocab-stats">
            <h3>Vocabulary Progress</h3>
            <div className="vocab-stats-grid">
                <div className="vocab-stat-card">
                    <div className="vocab-stat-value">{detailedStats.vocabulary.known}</div>
                    <div className="vocab-stat-label">Known</div>
                </div>
                <div className="vocab-stat-card">
                    <div className="vocab-stat-value">{detailedStats.vocabulary.learning}</div>
                    <div className="vocab-stat-label">Learning</div>
                </div>
                <div className="vocab-stat-card">
                    <div className="vocab-stat-value">{detailedStats.vocabulary.unlearned}</div>
                    <div className="vocab-stat-label">Remaining</div>
                </div>
                <div className="vocab-stat-card">
                    <div className="vocab-stat-value">{detailedStats.reviews.dueNow}</div>
                    <div className="vocab-stat-label">Due Now</div>
                </div>
            </div>

            {/* Progress to 1500 */}
            <div className="vocab-progress-section">
                <div className="vocab-progress-header">
                    <span>Progress to 1500 words</span>
                    <span>{Math.round((detailedStats.vocabulary.known / 1500) * 100)}%</span>
                </div>
                <div className="vocab-progress-bar">
                    <div
                        className="vocab-progress-fill known"
                        style={{ width: `${(detailedStats.vocabulary.known / 1500) * 100}%` }}
                    />
                    <div
                        className="vocab-progress-fill learning"
                        style={{
                            width: `${(detailedStats.vocabulary.learning / 1500) * 100}%`,
                            left: `${(detailedStats.vocabulary.known / 1500) * 100}%`
                        }}
                    />
                </div>
                <div className="vocab-progress-legend">
                    <span className="legend-item known">■ Known ({detailedStats.vocabulary.known})</span>
                    <span className="legend-item learning">■ Learning ({detailedStats.vocabulary.learning})</span>
                </div>
            </div>
        </div>
    );

    // Render radical stats
    const renderRadicalStats = () => (
        <div className="progress-radical-stats">
            <h3>Radical Progress</h3>
            <div className="radical-stats-grid">
                <div className="radical-stat-card">
                    <div className="radical-stat-value">{detailedStats.radicals.known || 0}</div>
                    <div className="radical-stat-label">Mastered</div>
                </div>
                <div className="radical-stat-card">
                    <div className="radical-stat-value">{detailedStats.radicals.learning || 0}</div>
                    <div className="radical-stat-label">Learning</div>
                </div>
                <div className="radical-stat-card">
                    <div className="radical-stat-value">{Math.max(0, 50 - (detailedStats.radicals.known || 0) - (detailedStats.radicals.learning || 0))}</div>
                    <div className="radical-stat-label">Remaining</div>
                </div>
            </div>

            {/* Radical progress bar */}
            <div className="radical-progress-section">
                <div className="radical-progress-header">
                    <span>Core Radicals (50)</span>
                    <span>{Math.round(((detailedStats.radicals.known || 0) / 50) * 100)}%</span>
                </div>
                <div className="radical-progress-bar">
                    <div
                        className="radical-progress-fill"
                        style={{ width: `${((detailedStats.radicals.known || 0) / 50) * 100}%` }}
                    />
                </div>
            </div>
        </div>
    );

    // Render study stats
    const renderStudyStats = () => (
        <div className="progress-study-stats">
            <h3>Study Statistics</h3>
            <div className="study-stats-grid">
                <div className="study-stat-card">
                    <div className="study-stat-icon">🔥</div>
                    <div className="study-stat-value">{detailedStats.streak}</div>
                    <div className="study-stat-label">Day Streak</div>
                </div>
                <div className="study-stat-card">
                    <div className="study-stat-icon">📝</div>
                    <div className="study-stat-value">{detailedStats.totalReviews}</div>
                    <div className="study-stat-label">Total Reviews</div>
                </div>
                <div className="study-stat-card">
                    <div className="study-stat-icon">🎯</div>
                    <div className="study-stat-value">{detailedStats.accuracy}%</div>
                    <div className="study-stat-label">Accuracy</div>
                </div>
                <div className="study-stat-card">
                    <div className="study-stat-icon">📅</div>
                    <div className="study-stat-value">{stats.todayReviews || 0}</div>
                    <div className="study-stat-label">Today</div>
                </div>
            </div>
        </div>
    );

    // Render achievements
    const renderAchievements = () => (
        <div className="progress-achievements">
            <h3>Achievements ({achievements.earned.length}/{achievements.available.length})</h3>
            <div className="achievements-grid">
                {achievements.available.map(achievement => {
                    const isEarned = achievements.earned.some(e => e.id === achievement.id);
                    return (
                        <div
                            key={achievement.id}
                            className={`achievement-card ${isEarned ? 'earned' : 'locked'}`}
                            title={achievement.description}
                        >
                            <div className="achievement-icon">{achievement.icon}</div>
                            <div className="achievement-name">{achievement.name}</div>
                            {!isEarned && <div className="achievement-lock">🔒</div>}
                        </div>
                    );
                })}
            </div>
        </div>
    );

    return (
        <div className="progress-page">
            {/* View tabs */}
            <div className="progress-tabs">
                <button
                    className={`progress-tab ${activeView === 'overview' ? 'active' : ''}`}
                    onClick={() => setActiveView('overview')}
                >
                    Overview
                </button>
                <button
                    className={`progress-tab ${activeView === 'stats' ? 'active' : ''}`}
                    onClick={() => setActiveView('stats')}
                >
                    Statistics
                </button>
                <button
                    className={`progress-tab ${activeView === 'achievements' ? 'active' : ''}`}
                    onClick={() => setActiveView('achievements')}
                >
                    Achievements
                </button>
            </div>

            {/* Content */}
            <div className="progress-content">
                {activeView === 'overview' && (
                    <>
                        {renderLearningPath()}
                        {renderVocabStats()}
                    </>
                )}

                {activeView === 'stats' && (
                    <>
                        {renderStudyStats()}
                        {renderVocabStats()}
                        {renderRadicalStats()}
                    </>
                )}

                {activeView === 'achievements' && (
                    <>
                        {renderAchievements()}
                    </>
                )}
            </div>
        </div>
    );
};

// Make available globally
window.Progress = Progress;
