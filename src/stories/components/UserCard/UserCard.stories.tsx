import type { Meta, StoryObj } from '@storybook/react-vite';
import '../../../components/Room/Room.scss'; // Importamos estilos del Room para el contexto
import UserCard from '../../../components/UserCard/UserCard';

// Componente decorador para simular el entorno visual usando variables CSS
const RoomEnvironment = (Story: any) => (
  <div
    style={{
      background: 'var(--background-color)',
      padding: '40px',
      minHeight: '400px',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: '8px',
    }}
  >
    <Story />
  </div>
);

const meta = {
  title: 'Component/User Card',
  component: UserCard,
  decorators: [RoomEnvironment], // Aplicamos el decorador a todas las stories
  argTypes: {
    username: String,
    voteNumber: String,
    isCurrentUser: Boolean,
  },
  parameters: {
    backgrounds: {
      disable: true, // Usamos nuestro sistema de temas en lugar de backgrounds fijos
    },
  },
} satisfies Meta<typeof UserCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const UserCardRamon: Story = {
  args: {
    username: 'Ramon',
    voteNumber: '20',
  },
};

// Variante con usuario actual
export const CurrentUser: Story = {
  args: {
    username: 'Ana',
    voteNumber: '13',
    isCurrentUser: true,
  },
};

// Variante con voto pendiente
export const PendingVote: Story = {
  args: {
    username: 'Carlos',
    voteNumber: '',
  },
};

// Variante con nombre largo
export const LongUsername: Story = {
  args: {
    username: 'Aleksandrzejewskivonhauserheimer',
    voteNumber: '8',
  },
};

// Variante con nombre largo y es usuario actual
export const LongUsernameCurrentUser: Story = {
  args: {
    username: 'Aleksandrzejewskivonhauserheimer',
    voteNumber: '8',
    isCurrentUser: true,
  },
};
