import type { Meta, StoryObj } from '@storybook/react-vite';
import { I18nextProvider } from 'react-i18next';
import '../../../components/Room/Room.scss'; // Importamos estilos del Room
import UserCard from '../../../components/UserCard/UserCard';
import i18n from '../../../i18n/i18n';

interface User {
  username: string;
  voteNumber: string;
  isCurrentUser: boolean;
}

interface UserGridProps {
  users: User[];
}

// Componente Grid para las stories
const UserGrid = ({ users }: UserGridProps) => (
  <div
    style={{
      background: 'var(--background-color)',
      padding: '40px',
      minHeight: '600px',
      width: '100%',
      borderRadius: '8px',
    }}
  >
    <div
      className="users-grid"
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: '2rem',
        width: '100%',
        margin: '2rem 0',
        alignItems: 'start',
        gridAutoRows: '286px',
        minHeight: '240px',
      }}
    >
      {users.map((user, index) => (
        <div className="user-card-container" key={index}>
          <UserCard
            username={user.username}
            voteNumber={user.voteNumber}
            isCurrentUser={user.isCurrentUser}
          />
        </div>
      ))}
    </div>
  </div>
);

const meta: Meta<UserGridProps> = {
  title: 'Component/User Card Grid',
  component: UserGrid,
  argTypes: {
    users: { control: 'object' },
  },
  decorators: [
    (Story) => (
      <I18nextProvider i18n={i18n}>
        <Story />
      </I18nextProvider>
    ),
  ],
  parameters: {
    backgrounds: {
      disable: true, // Usamos nuestro sistema de temas en lugar de backgrounds fijos
    },
  },
} satisfies Meta<UserGridProps>;

type Story = StoryObj<UserGridProps>;

export default meta;

// Historia con usuarios mixtos (nombres largos, cortos, con y sin badge)
export const MixedUsers: Story = {
  args: {
    users: [
      {
        username: 'Ana',
        voteNumber: '5',
        isCurrentUser: false,
      },
      {
        username: 'Carlos',
        voteNumber: '8',
        isCurrentUser: false,
      },
      {
        username: 'María González',
        voteNumber: '13',
        isCurrentUser: true,
      },
      {
        username: 'Aleksandrzejewskivonhauserheimer',
        voteNumber: '20',
        isCurrentUser: false,
      },
      {
        username: 'Juan',
        voteNumber: '',
        isCurrentUser: false,
      },
      {
        username: 'Aleksandrzejewskivonhauserheimer-Schmidt',
        voteNumber: '3',
        isCurrentUser: true,
      },
    ],
  },
};

// Historia con muchos usuarios para probar el layout
export const FullRoom: Story = {
  args: {
    users: [
      { username: 'Ana', voteNumber: '5', isCurrentUser: false },
      { username: 'Carlos', voteNumber: '8', isCurrentUser: false },
      { username: 'María González', voteNumber: '13', isCurrentUser: true },
      {
        username: 'Aleksandrzejewskivonhauserheimer',
        voteNumber: '20',
        isCurrentUser: false,
      },
      { username: 'Juan', voteNumber: '', isCurrentUser: false },
      { username: 'Elena', voteNumber: '3', isCurrentUser: false },
      { username: 'Miguel', voteNumber: '1', isCurrentUser: false },
      { username: 'Roberto', voteNumber: '', isCurrentUser: false },
      { username: 'Sofía', voteNumber: '13', isCurrentUser: false },
      { username: 'Alejandro', voteNumber: '8', isCurrentUser: false },
      { username: 'Patricia', voteNumber: '2', isCurrentUser: false },
      { username: 'Manuel', voteNumber: '', isCurrentUser: false },
    ],
  },
};
