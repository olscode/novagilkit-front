import React from 'react';
import './Tabs.scss';

export interface Tab {
  label: string;
  key: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

interface TabsProps extends React.PropsWithChildren<{}> {
  tabs: Tab[];
  activeKey: string;
  onChange: (key: string) => void;
  className?: string;
  style?: React.CSSProperties;
  tabBarExtraContent?: React.ReactNode;
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeKey,
  onChange,
  className = '',
  style = {},
  tabBarExtraContent,
  children,
}) => {
  const handleKeyDown = (e: React.KeyboardEvent, tabKey: string) => {
    const currentIndex = tabs.findIndex((tab) => tab.key === activeKey);
    let nextIndex = currentIndex;

    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault();
        nextIndex = currentIndex > 0 ? currentIndex - 1 : tabs.length - 1;
        break;
      case 'ArrowRight':
        e.preventDefault();
        nextIndex = currentIndex < tabs.length - 1 ? currentIndex + 1 : 0;
        break;
      case 'Home':
        e.preventDefault();
        nextIndex = 0;
        break;
      case 'End':
        e.preventDefault();
        nextIndex = tabs.length - 1;
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (!tabs.find((tab) => tab.key === tabKey)?.disabled) {
          onChange(tabKey);
        }
        return;
      default:
        return;
    }

    const nextTab = tabs[nextIndex];
    if (nextTab && !nextTab.disabled) {
      onChange(nextTab.key);
    }
  };

  return (
    <div className={`modern-tabs ${className}`} style={style}>
      <div
        className="modern-tabs__bar"
        role="tablist"
        aria-label="Navigation tabs"
      >
        {tabs.map((tab) => (
          <button
            key={tab.key}
            className={`modern-tabs__tab${tab.key === activeKey ? ' active' : ''}${tab.disabled ? ' disabled' : ''}`}
            onClick={() => !tab.disabled && onChange(tab.key)}
            onKeyDown={(e) => handleKeyDown(e, tab.key)}
            disabled={tab.disabled}
            type="button"
            role="tab"
            tabIndex={tab.key === activeKey ? 0 : -1}
            aria-selected={tab.key === activeKey}
            aria-disabled={tab.disabled}
            aria-controls={`tabpanel-${tab.key}`}
            id={`tab-${tab.key}`}
          >
            {tab.icon && <span className="modern-tabs__icon">{tab.icon}</span>}
            <span>{tab.label}</span>
          </button>
        ))}
        {tabBarExtraContent && (
          <div className="modern-tabs__extra">{tabBarExtraContent}</div>
        )}
      </div>
      <div
        className="modern-tabs__content"
        role="tabpanel"
        id={`tabpanel-${activeKey}`}
        aria-labelledby={`tab-${activeKey}`}
      >
        {children}
      </div>
    </div>
  );
};

export default Tabs;
