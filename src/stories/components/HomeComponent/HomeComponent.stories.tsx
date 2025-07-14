import type { Meta, StoryObj } from '@storybook/react-vite';
import { BrowserRouter } from 'react-router';
import HomeComponent from '../../../components/HomeComponent/Home';
const meta: Meta<typeof HomeComponent> = {
  title: 'Component/Home Component',
  component: HomeComponent,
  decorators: [
    (Story) => (
      <BrowserRouter>
        <Story />
      </BrowserRouter>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const HomeComponentDefault: Story = {};
