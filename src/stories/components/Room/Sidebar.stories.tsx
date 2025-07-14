import { configureStore } from '@reduxjs/toolkit';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { I18nextProvider } from 'react-i18next';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router';
import Sidebar from '../../../components/Room/Sidebar';
import i18n from '../../../i18n/i18n';

// Mock Redux store for Storybook
const mockStore = configureStore({
  reducer: {
    room: (
      state = {
        users: [
          {
            userId: '1',
            username: 'Alice Johnson',
            active: true,
          },
          {
            userId: '2',
            username: 'Bob Smith',
            active: true,
          },
          {
            userId: '3',
            username: 'Charlie Brown',
            active: true,
          },
        ],
        tasks: [
          {
            id: 'task-1',
            description: 'Implement user authentication system',
            voting: {
              status: 'not_started',
              votes: {},
            },
          },
          {
            id: 'task-2',
            description: 'Design responsive navigation component',
            voting: {
              status: 'in_progress',
              votes: {
                '1': 5,
                '2': 8,
              },
            },
          },
          {
            id: 'task-3',
            description: 'Setup CI/CD pipeline',
            voting: {
              status: 'finished',
              votes: {
                '1': 13,
                '2': 8,
                '3': 13,
              },
            },
          },
        ],
        creatorId: '1',
        currentTaskId: 'task-2',
        roomId: 'test-room-123',
      }
    ) => state,
  },
});

// Wrapper component with all necessary providers using CSS variables
const SidebarWrapper = () => {
  return (
    <div
      style={{
        height: '100vh',
        background: 'var(--background-color)',
        position: 'relative',
        overflow: 'hidden',
        minWidth: '800px', // Ensure desktop width
      }}
    >
      <Sidebar />
      {/* Mock content to show sidebar interaction */}
      <div
        style={{
          marginLeft: '22rem',
          padding: '2rem',
          color: 'var(--text-color)',
          fontSize: '1.2rem',
        }}
      >
        <h1>Room Content</h1>
        <p>This shows how the sidebar interacts with the main content.</p>
        <p>
          The sidebar is positioned on the left side and can be
          collapsed/expanded.
        </p>
      </div>
    </div>
  );
};

const meta: Meta<typeof Sidebar> = {
  title: 'Component/Room/Sidebar',
  component: Sidebar,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
The Sidebar component displays room information including participants and tasks. 
It features:
- Responsive design with hamburger menu on mobile
- Desktop collapse/expand functionality  
- Real-time participant status indicators
- Task list with current task highlighting
- Room ID copying functionality

**To see mobile responsive behavior:**
- Use the viewport selector in Storybook toolbar and choose "Mobile" 
- Or resize your browser window to less than 768px width
- The hamburger menu (☰) will appear and the sidebar will become an overlay
        `,
      },
    },
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <Provider store={mockStore}>
        <I18nextProvider i18n={i18n}>
          <MemoryRouter initialEntries={['/room/test-room-123']}>
            <div
              style={{
                height: '100vh',
                background: 'var(--background-color)',
                position: 'relative',
                minWidth: '800px', // Ensure desktop width for desktop stories
              }}
            >
              <Story />
            </div>
          </MemoryRouter>
        </I18nextProvider>
      </Provider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Sidebar>;

export const Default: Story = {
  name: 'Desktop - Expanded',
  parameters: {
    docs: {
      description: {
        story:
          'Default desktop view with sidebar expanded showing all room details.',
      },
    },
  },
};

export const WithContent: Story = {
  render: () => <SidebarWrapper />,
  name: 'Desktop - With Main Content',
  parameters: {
    docs: {
      description: {
        story:
          'Shows how the sidebar interacts with main content, including proper spacing and layout. To test mobile responsive behavior, use the viewport selector in Storybook toolbar or resize your browser window to less than 768px.',
      },
    },
  },
};

// Story with different room states
export const EmptyRoom: Story = {
  decorators: [
    (Story) => {
      const emptyRoomStore = configureStore({
        reducer: {
          room: (
            state = {
              users: [],
              tasks: [],
              creatorId: null,
              currentTaskId: null,
            }
          ) => state,
        },
      });

      return (
        <Provider store={emptyRoomStore}>
          <I18nextProvider i18n={i18n}>
            <div
              style={{
                height: '100vh',
                background: 'var(--background-color)',
                position: 'relative',
                minWidth: '800px', // Ensure desktop width
              }}
            >
              <Story />
            </div>
          </I18nextProvider>
        </Provider>
      );
    },
  ],
  name: 'Empty Room State',
  parameters: {
    docs: {
      description: {
        story: 'Sidebar state when the room has no participants or tasks yet.',
      },
    },
  },
};

export const LargeRoom: Story = {
  decorators: [
    (Story) => {
      const largeRoomStore = configureStore({
        reducer: {
          room: (
            state = {
              users: Array.from({ length: 8 }, (_, i) => ({
                userId: `user-${i + 1}`,
                username: `User ${i + 1}`,
                active: true,
              })),
              tasks: Array.from({ length: 10 }, (_, i) => ({
                id: `task-${i + 1}`,
                description: `Task ${i + 1}: Lorem ipsum dolor sit amet consectetur`,
                voting: {
                  status:
                    i % 3 === 0
                      ? 'finished'
                      : i % 3 === 1
                        ? 'in_progress'
                        : 'not_started',
                  votes: {},
                },
              })),
              creatorId: 'user-1',
              currentTaskId: 'task-3',
            }
          ) => state,
        },
      });

      return (
        <Provider store={largeRoomStore}>
          <I18nextProvider i18n={i18n}>
            <div
              style={{
                height: '100vh',
                background: 'var(--background-color)',
                position: 'relative',
                minWidth: '800px', // Ensure desktop width
              }}
            >
              <Story />
            </div>
          </I18nextProvider>
        </Provider>
      );
    },
  ],
  name: 'Large Room - Many Participants',
  parameters: {
    docs: {
      description: {
        story:
          'Sidebar with many participants and tasks to test scrolling and layout with larger datasets.',
      },
    },
  },
};
