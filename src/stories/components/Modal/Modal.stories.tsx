import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import Modal from '../../../components/Modal/Modal';

const meta: Meta<typeof Modal> = {
  title: 'Component/Modal',
  component: Modal,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    isOpen: { control: 'boolean' },
    title: { control: 'text' },
    children: { control: 'text' }, // Keep as text for simple storybook editing
    onClose: { action: 'closed' },
    closeOnBackdropClick: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof Modal>;

// Define a type for the arguments that ModalWithHooks expects, ensuring all required ModalPropsI are present or handled.
type ModalStoryArgs = Story['args'];

const ModalWithHooks = (args: ModalStoryArgs = {}) => {
  const [isOpen, setIsOpen] = useState(args.isOpen || false);

  const handleOpen = () => setIsOpen(true);
  const handleClose = () => {
    setIsOpen(false);
    args.onClose?.(); // Call the action if provided by Storybook
  };

  return (
    <>
      <button onClick={handleOpen}>Open Modal</button>
      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        title={args.title!}
        closeOnBackdropClick={args.closeOnBackdropClick}
      >
        {args.children || 'This is the modal content.'}
      </Modal>
    </>
  );
};

export const Default: Story = {
  args: {
    isOpen: false,
    title: 'Default Modal',
    children:
      'Click the button above to open this modal. It closes on backdrop click by default.',
    closeOnBackdropClick: true,
  },
  render: ModalWithHooks,
};

export const NoBackdropClose: Story = {
  args: {
    isOpen: false,
    title: 'No Backdrop Close Modal',
    children:
      "This modal will not close when you click the backdrop. Use the 'X' button.",
    closeOnBackdropClick: false,
  },
  render: ModalWithHooks,
};

export const InitiallyOpen: Story = {
  args: {
    isOpen: true,
    title: 'Initially Open Modal',
    children: 'This modal starts open. It closes on backdrop click.',
    closeOnBackdropClick: true,
    onClose: () => console.log('InitiallyOpen modal closed'),
  },
  render: (args: ModalStoryArgs = {}) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [isOpen, setIsOpen] = useState(args.isOpen || false);
    return (
      <Modal
        isOpen={isOpen}
        onClose={() => {
          setIsOpen(false);
          args.onClose?.();
        }}
        title={args.title!}
        closeOnBackdropClick={args.closeOnBackdropClick}
      >
        {args.children}
      </Modal>
    );
  },
};
