// Learning Path Component
// Visual tree showing stage progress with single "Start Daily Study" button

const { useState, useEffect, useMemo } = React;

const LearningPath = ({ onStartStudy, vocabulary, progress, settings }) => {
    const [stagesData, setStagesData] = useState([]);
    const [currentStage, setCurrentStage] = useState(null);
    const [nextMilestone, setNextMilestone] = useState(null);

    // Load stage data
    useEffect(() => {
        const summary = StageManager.getDashboardSummary();
        setStagesData(summary.allStages);
        setCurrentStage(summary.currentStage);
        setNextMilestone(summary.nextMilestone);
    }, [progress]);

    // Get status icon
    const getStatusIcon = (status, complete) => {
        if (complete) return '✅';
        if (status === 'locked') return '🔒';
        if (status === 'active') return '⏳';
        return '○';
    };

    // Get status color class
    const getStatusClass = (status, complete) => {
        if (complete) return 'stage-complete';
        if (status === 'locked') return 'stage-locked';
        if (status === 'active') return 'stage-active';
        return '';
    };

    // Format progress text
    const formatProgress = (stage) => {
        const prog = stage.progress;
        if (stage.complete) return '100%';
        if (stage.status === 'locked') return 'Locked';

        if (stage.id === 'foundations') {
            return `${prog.percent}%`;
        }
        if (stage.id === 'core_radicals') {
            return `${prog.current}/${prog.target}`;
        }
        if (stage.id === 'vocabulary_kanji') {
            return `${prog.current} words`;
        }
        return `${prog.percent}%`;
    };

    // Render stage details
    const renderStageDetails = (stage) => {
        if (stage.status === 'locked') return null;

        const prog = stage.progress;

        if (stage.id === 'foundations' && prog.details) {
            return (
                <div className="stage-details">
                    <div className={`stage-detail-item ${prog.details.kana.complete ? 'complete' : ''}`}>
                        {prog.details.kana.complete ? '✓' : '○'} Kana Mastery
                        {!prog.details.kana.complete && (
                            <span className="detail-progress">({prog.details.kana.score}%)</span>
                        )}
                    </div>
                    <div className={`stage-detail-item ${prog.details.grammar.complete ? 'complete' : ''}`}>
                        {prog.details.grammar.complete ? '✓' : '○'} Grammar Introduction
                        {!prog.details.grammar.complete && (
                            <span className="detail-progress">({prog.details.grammar.viewed}/6)</span>
                        )}
                    </div>
                    <div className={`stage-detail-item ${prog.details.kanjiIntro.complete ? 'complete' : ''}`}>
                        {prog.details.kanjiIntro.complete ? '✓' : '○'} Kanji Introduction
                        {!prog.details.kanjiIntro.complete && (
                            <span className="detail-progress">({prog.details.kanjiIntro.viewed}/6)</span>
                        )}
                    </div>
                </div>
            );
        }

        if (stage.id === 'core_radicals' && stage.status === 'active') {
            return (
                <div className="stage-details">
                    <div className="stage-detail-item">
                        {prog.current} radicals learned
                    </div>
                    <div className="stage-detail-item muted">
                        {prog.details.remaining} remaining
                    </div>
                </div>
            );
        }

        if (stage.id === 'vocabulary_kanji' && stage.status === 'active') {
            return (
                <div className="stage-details">
                    <div className="stage-detail-item">
                        {prog.details?.known || 0} known, {prog.details?.learning || 0} learning
                    </div>
                </div>
            );
        }

        return null;
    };

    return (
        <div className="learning-path">
            <div className="learning-path-header">
                <h2 className="learning-path-title">Your Learning Path</h2>
                {nextMilestone && (
                    <div className="next-milestone">
                        <span className="milestone-label">Next:</span>
                        <span className="milestone-text">{nextMilestone.text}</span>
                    </div>
                )}
            </div>

            <div className="learning-path-tree">
                {stagesData.map((stage, index) => (
                    <div
                        key={stage.id}
                        className={`stage-node ${getStatusClass(stage.status, stage.complete)}`}
                    >
                        {/* Connector line */}
                        {index > 0 && (
                            <div className={`stage-connector ${stagesData[index - 1].complete ? 'complete' : ''}`} />
                        )}

                        {/* Stage card */}
                        <div className="stage-card">
                            <div className="stage-header">
                                <span className="stage-icon">{stage.icon}</span>
                                <span className="stage-status-icon">
                                    {getStatusIcon(stage.status, stage.complete)}
                                </span>
                            </div>

                            <div className="stage-content">
                                <h3 className="stage-name">
                                    Stage {stage.order}: {stage.name}
                                </h3>
                                <p className="stage-description">{stage.description}</p>

                                {/* Progress bar for active stages */}
                                {stage.status === 'active' && !stage.complete && (
                                    <div className="stage-progress-bar">
                                        <div
                                            className="stage-progress-fill"
                                            style={{ width: `${stage.progress.percent}%` }}
                                        />
                                    </div>
                                )}

                                {/* Progress text */}
                                <div className="stage-progress-text">
                                    {formatProgress(stage)}
                                </div>

                                {/* Stage details */}
                                {renderStageDetails(stage)}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Main action button */}
            <div className="learning-path-action">
                <button
                    className="btn btn-primary btn-large start-study-btn"
                    onClick={onStartStudy}
                >
                    <span className="btn-icon">📚</span>
                    <span className="btn-text">Start Daily Study</span>
                </button>
                {currentStage && (
                    <p className="action-hint">
                        Currently working on: <strong>{currentStage.name}</strong>
                    </p>
                )}
            </div>
        </div>
    );
};

// Compact version for sidebar/widget use
const LearningPathCompact = ({ onStartStudy }) => {
    const [stagesData, setStagesData] = useState([]);

    useEffect(() => {
        const summary = StageManager.getDashboardSummary();
        setStagesData(summary.allStages);
    }, []);

    return (
        <div className="learning-path-compact">
            <div className="compact-stages">
                {stagesData.map((stage, index) => (
                    <div
                        key={stage.id}
                        className={`compact-stage ${stage.complete ? 'complete' : ''} ${stage.status === 'active' ? 'active' : ''}`}
                        title={`${stage.name}: ${stage.progress.percent}%`}
                    >
                        <span className="compact-icon">{stage.icon}</span>
                        {index < stagesData.length - 1 && (
                            <span className={`compact-connector ${stage.complete ? 'complete' : ''}`}>→</span>
                        )}
                    </div>
                ))}
            </div>
            <button className="btn btn-primary btn-small" onClick={onStartStudy}>
                Study
            </button>
        </div>
    );
};

// Make available globally
window.LearningPath = LearningPath;
window.LearningPathCompact = LearningPathCompact;
