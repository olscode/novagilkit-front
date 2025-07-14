import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { FaFlag, FaProjectDiagram, FaTasks } from 'react-icons/fa';
import { SiJira } from 'react-icons/si';
import Dropdown, {
  DropdownOption,
} from '../../../components/Dropdown/Dropdown';

const meta: Meta<typeof Dropdown> = {
  title: 'Component/Dropdown',
  component: Dropdown,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Componente dropdown personalizado con soporte para temas, búsqueda y múltiples opciones de configuración.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['small', 'medium', 'large'],
      description: 'Tamaño del dropdown',
    },
    disabled: {
      control: 'boolean',
      description: 'Deshabilitar el dropdown',
    },
    loading: {
      control: 'boolean',
      description: 'Estado de carga',
    },
    error: {
      control: 'boolean',
      description: 'Estado de error',
    },
    searchable: {
      control: 'boolean',
      description: 'Habilitar búsqueda',
    },
    clearable: {
      control: 'boolean',
      description: 'Permitir limpiar selección',
    },
    placeholder: {
      control: 'text',
      description: 'Texto del placeholder',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Dropdown>;

// Opciones de ejemplo para diferentes casos de uso
const projectOptions: DropdownOption[] = [
  {
    value: 'NOVA',
    label: 'Nova Tools',
    description: 'Herramientas de desarrollo colaborativo',
  },
  {
    value: 'PLAN',
    label: 'Planning Suite',
    description: 'Suite de planificación ágil',
  },
  {
    value: 'TRACK',
    label: 'Issue Tracker',
    description: 'Sistema de seguimiento de issues',
  },
  {
    value: 'DOC',
    label: 'Documentation Hub',
    description: 'Centro de documentación técnica',
  },
  {
    value: 'API',
    label: 'API Gateway',
    description: 'Gateway de servicios API',
    disabled: true,
  },
];

const epicOptions: DropdownOption[] = [
  {
    value: 'EPIC-001',
    label: 'Sprint Planning Q1 2024',
    description: 'Funcionalidades principales del primer trimestre',
  },
  {
    value: 'EPIC-002',
    label: 'User Experience Improvements',
    description: 'Mejoras en la experiencia de usuario',
  },
  {
    value: 'EPIC-003',
    label: 'Performance Optimization',
    description: 'Optimización de rendimiento del sistema',
  },
  {
    value: 'EPIC-004',
    label: 'Security Enhancements',
    description: 'Mejoras de seguridad y autenticación',
  },
  {
    value: 'EPIC-005',
    label: 'Mobile App Development',
    description: 'Desarrollo de aplicación móvil nativa',
  },
];

const teamOptions: DropdownOption[] = [
  { value: 'frontend', label: 'Frontend Team' },
  { value: 'backend', label: 'Backend Team' },
  { value: 'devops', label: 'DevOps Team' },
  { value: 'qa', label: 'QA Team' },
  { value: 'design', label: 'Design Team' },
];

const priorityOptions: DropdownOption[] = [
  {
    value: 'critical',
    label: 'Crítica',
    description: 'Requiere atención inmediata',
  },
  { value: 'high', label: 'Alta', description: 'Importante para el sprint' },
  { value: 'medium', label: 'Media', description: 'Prioridad estándar' },
  { value: 'low', label: 'Baja', description: 'Puede esperar' },
];

// Componente wrapper para manejar el estado
const DropdownWithState = (args: any) => {
  const [value, setValue] = useState(args.value || '');

  return (
    <div style={{ width: '300px' }}>
      <Dropdown {...args} value={value} onChange={setValue} />
    </div>
  );
};

// Historia básica
export const Default: Story = {
  render: DropdownWithState,
  args: {
    options: projectOptions,
    placeholder: 'Selecciona un proyecto...',
    size: 'medium',
  },
};

// Dropdown con valor preseleccionado
export const WithSelectedValue: Story = {
  render: DropdownWithState,
  args: {
    options: projectOptions,
    value: 'NOVA',
    placeholder: 'Selecciona un proyecto...',
    size: 'medium',
  },
};

// Dropdown con búsqueda
export const Searchable: Story = {
  render: DropdownWithState,
  args: {
    options: epicOptions,
    placeholder: 'Buscar épica...',
    searchable: true,
    size: 'medium',
  },
};

// Dropdown con opción de limpiar
export const Clearable: Story = {
  render: DropdownWithState,
  args: {
    options: teamOptions,
    value: 'frontend',
    placeholder: 'Selecciona un equipo...',
    clearable: true,
    size: 'medium',
  },
};

// Diferentes tamaños
export const Sizes: Story = {
  render: () => {
    const [small, setSmall] = useState('');
    const [medium, setMedium] = useState('');
    const [large, setLarge] = useState('');

    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          width: '300px',
        }}
      >
        <div>
          <label
            style={{
              display: 'block',
              marginBottom: '8px',
              fontSize: '14px',
              fontWeight: '500',
            }}
          >
            Pequeño
          </label>
          <Dropdown
            options={teamOptions}
            value={small}
            onChange={setSmall}
            placeholder="Tamaño pequeño..."
            size="small"
          />
        </div>
        <div>
          <label
            style={{
              display: 'block',
              marginBottom: '8px',
              fontSize: '14px',
              fontWeight: '500',
            }}
          >
            Mediano (por defecto)
          </label>
          <Dropdown
            options={teamOptions}
            value={medium}
            onChange={setMedium}
            placeholder="Tamaño mediano..."
            size="medium"
          />
        </div>
        <div>
          <label
            style={{
              display: 'block',
              marginBottom: '8px',
              fontSize: '14px',
              fontWeight: '500',
            }}
          >
            Grande
          </label>
          <Dropdown
            options={teamOptions}
            value={large}
            onChange={setLarge}
            placeholder="Tamaño grande..."
            size="large"
          />
        </div>
      </div>
    );
  },
};

// Estados del dropdown
export const States: Story = {
  render: () => {
    const [normal, setNormal] = useState('');
    const [disabled, setDisabled] = useState('frontend');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState('');

    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          width: '300px',
        }}
      >
        <div>
          <label
            style={{
              display: 'block',
              marginBottom: '8px',
              fontSize: '14px',
              fontWeight: '500',
            }}
          >
            Normal
          </label>
          <Dropdown
            options={teamOptions}
            value={normal}
            onChange={setNormal}
            placeholder="Estado normal..."
          />
        </div>
        <div>
          <label
            style={{
              display: 'block',
              marginBottom: '8px',
              fontSize: '14px',
              fontWeight: '500',
            }}
          >
            Deshabilitado
          </label>
          <Dropdown
            options={teamOptions}
            value={disabled}
            onChange={setDisabled}
            placeholder="Estado deshabilitado..."
            disabled
          />
        </div>
        <div>
          <label
            style={{
              display: 'block',
              marginBottom: '8px',
              fontSize: '14px',
              fontWeight: '500',
            }}
          >
            Con error
          </label>
          <Dropdown
            options={teamOptions}
            value={error}
            onChange={setError}
            placeholder="Estado de error..."
            error
          />
        </div>
        <div>
          <label
            style={{
              display: 'block',
              marginBottom: '8px',
              fontSize: '14px',
              fontWeight: '500',
            }}
          >
            Cargando
          </label>
          <Dropdown
            options={[]}
            value={loading}
            onChange={setLoading}
            placeholder="Cargando opciones..."
            loading
          />
        </div>
      </div>
    );
  },
};

// Dropdown con prioridades (usando colores)
export const PrioritySelector: Story = {
  render: DropdownWithState,
  args: {
    options: priorityOptions,
    placeholder: 'Selecciona prioridad...',
    searchable: true,
    clearable: true,
    size: 'medium',
  },
};

// Caso de uso real: Selector de proyecto Jira
export const JiraProjectSelector: Story = {
  render: () => {
    const [project, setProject] = useState('');
    const [epic, setEpic] = useState('');

    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          width: '400px',
          padding: '20px',
          background: 'var(--card-bg)',
          borderRadius: '8px',
          border: '1px solid var(--border-color)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '10px',
          }}
        >
          <SiJira style={{ color: 'var(--primary-color)', fontSize: '24px' }} />
          <h3 style={{ margin: 0, color: 'var(--text-color)' }}>
            Exportar a Jira
          </h3>
        </div>

        <div>
          <label
            style={{
              display: 'block',
              marginBottom: '8px',
              fontSize: '14px',
              fontWeight: '500',
              color: 'var(--text-color)',
            }}
          >
            <FaProjectDiagram style={{ marginRight: '8px' }} />
            Proyecto
          </label>
          <Dropdown
            options={projectOptions}
            value={project}
            onChange={setProject}
            placeholder="Selecciona un proyecto..."
            searchable
            size="medium"
          />
        </div>

        <div>
          <label
            style={{
              display: 'block',
              marginBottom: '8px',
              fontSize: '14px',
              fontWeight: '500',
              color: 'var(--text-color)',
            }}
          >
            <FaFlag style={{ marginRight: '8px' }} />
            Épica
          </label>
          <Dropdown
            options={epicOptions}
            value={epic}
            onChange={setEpic}
            placeholder="Selecciona una épica..."
            searchable
            clearable
            disabled={!project}
            size="medium"
          />
        </div>

        <div
          style={{
            padding: '12px',
            background: 'var(--secondary-bg-alt)',
            borderRadius: '6px',
            border: '1px solid var(--border-color)',
            marginTop: '10px',
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: '14px',
              color: 'var(--text-secondary)',
              lineHeight: '1.4',
            }}
          >
            <FaTasks style={{ marginRight: '8px' }} />
            Se exportarán 5 tareas con sus estimaciones de story points
          </p>
        </div>
      </div>
    );
  },
};

// Dropdown sin opciones
export const NoOptions: Story = {
  render: DropdownWithState,
  args: {
    options: [],
    placeholder: 'No hay opciones disponibles...',
    size: 'medium',
  },
};

// Dropdown con muchas opciones (scroll)
export const ManyOptions: Story = {
  render: DropdownWithState,
  args: {
    options: Array.from({ length: 50 }, (_, i) => ({
      value: `option-${i + 1}`,
      label: `Opción ${i + 1}`,
      description: `Descripción de la opción número ${i + 1}`,
    })),
    placeholder: 'Selecciona una opción...',
    searchable: true,
    size: 'medium',
  },
};
