import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import Tooltip from '../../../components/Tooltip/Tooltip';

const meta: Meta<typeof Tooltip> = {
  title: 'Component/Tooltip',
  component: Tooltip,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    content: { control: 'text' },
    position: {
      control: 'select',
      options: ['top', 'bottom', 'left', 'right'],
    },
    delay: { control: 'number' },
    children: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof Tooltip>;

// Basic tooltip
export const Default: Story = {
  args: {
    content: 'This is a tooltip',
    children: 'Hover me!',
  },
};

// Different positions
export const TopPosition: Story = {
  args: {
    content: 'Tooltip on top',
    position: 'top',
    children: 'Hover me (top)',
  },
};

export const BottomPosition: Story = {
  args: {
    content: 'Tooltip on bottom',
    position: 'bottom',
    children: 'Hover me (bottom)',
  },
};

export const LeftPosition: Story = {
  args: {
    content: 'Tooltip on left',
    position: 'left',
    children: 'Hover me (left)',
  },
};

export const RightPosition: Story = {
  args: {
    content: 'Tooltip on right',
    position: 'right',
    children: 'Hover me (right)',
  },
};

// With custom delay
export const WithDelay: Story = {
  args: {
    content: 'This tooltip appears after 500ms',
    delay: 500,
    children: 'Hover me (delayed)',
  },
};

// Long text
export const LongText: Story = {
  args: {
    content:
      'This is a very long tooltip text that should wrap properly and demonstrate how the tooltip handles longer content without breaking the layout.',
    children: 'Hover me (long text)',
  },
};

// Statistics examples (real use cases)
export const AverageStatistic: Story = {
  args: {
    content:
      'The arithmetic mean of all votes. Calculated by adding all vote values and dividing by the number of votes.',
    children: 'Average: 5.2',
  },
};

export const MedianStatistic: Story = {
  args: {
    content:
      'The middle value when all votes are arranged in order. Less affected by outliers than the average.',
    children: 'Median: 5',
  },
};

export const MinStatistic: Story = {
  args: {
    content: 'The lowest vote value submitted by any team member.',
    children: 'Min: 1',
  },
};

export const MaxStatistic: Story = {
  args: {
    content: 'The highest vote value submitted by any team member.',
    children: 'Max: 13',
  },
};

// Interactive demo with all positions
const InteractiveDemo = () => {
  const [position, setPosition] = useState<'top' | 'bottom' | 'left' | 'right'>(
    'top'
  );

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '20px',
        padding: '40px',
      }}
    >
      <div>
        <label htmlFor="position-select">Position: </label>
        <select
          id="position-select"
          value={position}
          onChange={(e) => setPosition(e.target.value as any)}
          style={{ marginLeft: '8px' }}
        >
          <option value="top">Top</option>
          <option value="bottom">Bottom</option>
          <option value="left">Left</option>
          <option value="right">Right</option>
        </select>
      </div>

      <Tooltip
        content={`This tooltip is positioned ${position}`}
        position={position}
      >
        <button
          style={{
            padding: '12px 24px',
            backgroundColor: '#007acc',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Hover me!
        </button>
      </Tooltip>

      <div style={{ fontSize: '14px', color: '#666' }}>
        Change the position and hover the button to see the tooltip
      </div>
    </div>
  );
};

export const Interactive: Story = {
  render: () => <InteractiveDemo />,
};

// Real-world statistics layout
const StatisticsDemo = () => {
  return (
    <div
      style={{
        display: 'flex',
        gap: '20px',
        padding: '20px',
        backgroundColor: '#f5f5f5',
        borderRadius: '8px',
        margin: '40px 20px',
      }}
    >
      <Tooltip
        content="The arithmetic mean of all votes. Calculated by adding all vote values and dividing by the number of votes."
        position="bottom"
      >
        <div
          style={{
            padding: '8px 12px',
            backgroundColor: 'white',
            borderRadius: '4px',
            border: '1px solid #ddd',
            cursor: 'help',
            borderBottom: '1px dotted #999',
          }}
        >
          <strong>Average:</strong> 5.2
        </div>
      </Tooltip>

      <Tooltip
        content="The middle value when all votes are arranged in order. Less affected by outliers than the average."
        position="bottom"
      >
        <div
          style={{
            padding: '8px 12px',
            backgroundColor: 'white',
            borderRadius: '4px',
            border: '1px solid #ddd',
            cursor: 'help',
            borderBottom: '1px dotted #999',
          }}
        >
          <strong>Median:</strong> 5
        </div>
      </Tooltip>

      <Tooltip
        content="The lowest vote value submitted by any team member."
        position="bottom"
      >
        <div
          style={{
            padding: '8px 12px',
            backgroundColor: 'white',
            borderRadius: '4px',
            border: '1px solid #ddd',
            cursor: 'help',
            borderBottom: '1px dotted #999',
          }}
        >
          <strong>Min:</strong> 1
        </div>
      </Tooltip>

      <Tooltip
        content="The highest vote value submitted by any team member."
        position="bottom"
      >
        <div
          style={{
            padding: '8px 12px',
            backgroundColor: 'white',
            borderRadius: '4px',
            border: '1px solid #ddd',
            cursor: 'help',
            borderBottom: '1px dotted #999',
          }}
        >
          <strong>Max:</strong> 13
        </div>
      </Tooltip>
    </div>
  );
};

export const StatisticsExample: Story = {
  render: () => <StatisticsDemo />,
  parameters: {
    docs: {
      description: {
        story:
          'Example of how tooltips would look in the real Room statistics section.',
      },
    },
  },
};
