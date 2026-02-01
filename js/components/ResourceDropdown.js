// Resource Dropdown Component
// Navigation dropdown for resources: Kana Tables, Radical Library, Grammar Reference, Vocabulary Library

const { useState, useEffect, useRef } = React;

const ResourceDropdown = ({ activeTab, onNavigate }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Resource items
    const resources = [
        {
            id: 'kana',
            label: 'Kana Tables',
            icon: 'あ',
            description: 'Hiragana & Katakana charts'
        },
        {
            id: 'heisig',
            label: 'Heisig Kanji',
            icon: '憶',
            description: 'Learn kanji by meaning (RTK method)'
        },
        {
            id: 'radicals',
            label: 'Radical Library',
            icon: '部',
            description: 'Browse 214 Kangxi radicals'
        },
        {
            id: 'grammar',
            label: 'Grammar Reference',
            icon: '文',
            description: 'Grammar patterns & lessons'
        },
        {
            id: 'library',
            label: 'Vocabulary Library',
            icon: '語',
            description: 'Browse all vocabulary'
        },
        {
            id: 'kanji',
            label: 'Kanji Explorer',
            icon: '漢',
            description: 'Interactive kanji lookup'
        }
    ];

    // Check if current tab is a resource
    const isResourceActive = resources.some(r => r.id === activeTab);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Close dropdown on escape key
    useEffect(() => {
        const handleEscape = (event) => {
            if (event.key === 'Escape') {
                setIsOpen(false);
            }
        };

        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, []);

    const handleItemClick = (resourceId) => {
        onNavigate(resourceId);
        setIsOpen(false);
    };

    const toggleDropdown = () => {
        setIsOpen(!isOpen);
    };

    // Get active resource label for button
    const getActiveLabel = () => {
        if (isResourceActive) {
            const activeResource = resources.find(r => r.id === activeTab);
            return activeResource?.label || 'Resources';
        }
        return 'Resources';
    };

    return (
        <div className="resource-dropdown" ref={dropdownRef}>
            <button
                className={`nav-tab resource-dropdown-trigger ${isResourceActive ? 'active' : ''}`}
                onClick={toggleDropdown}
                aria-expanded={isOpen}
                aria-haspopup="true"
            >
                <span className="dropdown-label">{getActiveLabel()}</span>
                <span className={`dropdown-arrow ${isOpen ? 'open' : ''}`}>▾</span>
            </button>

            {isOpen && (
                <div className="resource-dropdown-menu">
                    {resources.map(resource => (
                        <button
                            key={resource.id}
                            className={`resource-dropdown-item ${activeTab === resource.id ? 'active' : ''}`}
                            onClick={() => handleItemClick(resource.id)}
                        >
                            <span className="resource-icon japanese">{resource.icon}</span>
                            <div className="resource-info">
                                <span className="resource-label">{resource.label}</span>
                                <span className="resource-description">{resource.description}</span>
                            </div>
                            {activeTab === resource.id && (
                                <span className="resource-active-indicator">✓</span>
                            )}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

// Make available globally
window.ResourceDropdown = ResourceDropdown;
