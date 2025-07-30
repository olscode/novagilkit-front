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
  return (
    <div className={`modern-tabs ${className}`} style={style}>
      <div className="modern-tabs__bar">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            className={`modern-tabs__tab${tab.key === activeKey ? ' active' : ''}${tab.disabled ? ' disabled' : ''}`}
            onClick={() => !tab.disabled && onChange(tab.key)}
            disabled={tab.disabled}
            type="button"
            tabIndex={tab.disabled ? -1 : 0}
            aria-selected={tab.key === activeKey}
            aria-disabled={tab.disabled}
          >
            {tab.icon && <span className="modern-tabs__icon">{tab.icon}</span>}
            <span>{tab.label}</span>
          </button>
        ))}
        {tabBarExtraContent && (
          <div className="modern-tabs__extra">{tabBarExtraContent}</div>
        )}
      </div>
      <div className="modern-tabs__content">{children}</div>
    </div>
  );
};

export default Tabs;
