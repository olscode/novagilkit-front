import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { FaFlag, FaProjectDiagram } from 'react-icons/fa';
import { SiJira } from 'react-icons/si';
import Dropdown, {
  DropdownOption,
} from '../../../components/Dropdown/Dropdown';
import Modal from '../../../components/Modal/Modal';

const meta: Meta = {
  title: 'Component/Dropdown/Integration',
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Ejemplos de integración del componente Dropdown en contextos reales como modales y formularios.',
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj;

// Datos de ejemplo
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
];

// Modal con dropdowns como el de Jira Export
export const JiraExportModal: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);
    const [project, setProject] = useState('');
    const [epic, setEpic] = useState('');
    const [createNewEpic, setCreateNewEpic] = useState(false);
    const [newEpicSummary, setNewEpicSummary] = useState('');

    const handleOpen = () => setIsOpen(true);
    const handleClose = () => {
      setIsOpen(false);
      setProject('');
      setEpic('');
      setCreateNewEpic(false);
      setNewEpicSummary('');
    };

    return (
      <>
        <button
          onClick={handleOpen}
          style={{
            padding: '12px 24px',
            background: 'var(--primary-button-bg)',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '14px',
            fontWeight: '500',
          }}
        >
          <SiJira />
          Exportar a Jira
        </button>

        <Modal isOpen={isOpen} onClose={handleClose} title="Exportar a Jira">
          <div className="jira-export-step">
            <div className="step-header" style={{ marginBottom: '24px' }}>
              <div
                className="step-icon"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '48px',
                  height: '48px',
                  background: 'var(--primary-color)',
                  borderRadius: '50%',
                  color: 'white',
                  fontSize: '20px',
                  margin: '0 auto 16px',
                }}
              >
                <FaProjectDiagram />
              </div>
              <h3
                style={{
                  textAlign: 'center',
                  margin: '0 0 8px',
                  color: 'var(--text-color)',
                }}
              >
                Seleccionar proyecto y épica
              </h3>
              <p
                style={{
                  textAlign: 'center',
                  margin: 0,
                  color: 'var(--text-secondary)',
                  fontSize: '14px',
                }}
              >
                Elige el proyecto y épica donde exportar las tareas estimadas.
              </p>
            </div>

            <div
              className="step-content"
              style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
            >
              <div className="form-group">
                <label
                  style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: 'var(--text-color)',
                  }}
                >
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

              {project && (
                <div
                  className="epic-selection"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px',
                  }}
                >
                  <div className="form-group">
                    <label
                      style={{
                        display: 'block',
                        marginBottom: '12px',
                        fontSize: '14px',
                        fontWeight: '500',
                        color: 'var(--text-color)',
                      }}
                    >
                      Opciones de épica
                    </label>
                    <div
                      className="radio-group"
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px',
                      }}
                    >
                      <div
                        className="radio-option"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                        }}
                      >
                        <input
                          type="radio"
                          id="create-new-epic"
                          checked={createNewEpic}
                          onChange={() => {
                            setCreateNewEpic(true);
                            setEpic('');
                          }}
                          style={{ margin: 0 }}
                        />
                        <label
                          htmlFor="create-new-epic"
                          style={{ margin: 0, cursor: 'pointer' }}
                        >
                          Crear nueva épica
                        </label>
                      </div>
                      <div
                        className="radio-option"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                        }}
                      >
                        <input
                          type="radio"
                          id="use-existing-epic"
                          checked={!createNewEpic}
                          onChange={() => setCreateNewEpic(false)}
                          style={{ margin: 0 }}
                        />
                        <label
                          htmlFor="use-existing-epic"
                          style={{ margin: 0, cursor: 'pointer' }}
                        >
                          Usar épica existente
                        </label>
                      </div>
                    </div>
                  </div>

                  {createNewEpic ? (
                    <div className="form-group">
                      <label
                        style={{
                          display: 'block',
                          marginBottom: '8px',
                          fontSize: '14px',
                          fontWeight: '500',
                          color: 'var(--text-color)',
                        }}
                      >
                        Nombre de la nueva épica
                      </label>
                      <input
                        type="text"
                        value={newEpicSummary}
                        onChange={(e) => setNewEpicSummary(e.target.value)}
                        placeholder="Ej: Sprint Planning - Funcionalidades Q1"
                        style={{
                          width: '100%',
                          padding: '10px 16px',
                          background: 'var(--input-bg)',
                          border: '1px solid var(--input-border)',
                          borderRadius: '6px',
                          color: 'var(--input-text)',
                          fontSize: '14px',
                          boxSizing: 'border-box',
                        }}
                      />
                    </div>
                  ) : (
                    <div className="form-group">
                      <label
                        style={{
                          display: 'block',
                          marginBottom: '8px',
                          fontSize: '14px',
                          fontWeight: '500',
                          color: 'var(--text-color)',
                        }}
                      >
                        Épica existente
                      </label>
                      <Dropdown
                        options={epicOptions}
                        value={epic}
                        onChange={setEpic}
                        placeholder="Selecciona una épica..."
                        searchable
                        clearable
                        size="medium"
                      />
                    </div>
                  )}
                </div>
              )}

              <div
                className="step-actions"
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginTop: '24px',
                  gap: '12px',
                }}
              >
                <button
                  onClick={handleClose}
                  style={{
                    padding: '10px 20px',
                    background: 'var(--secondary-button-bg)',
                    color: 'var(--secondary-button-text)',
                    border: '1px solid var(--secondary-button-border)',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px',
                  }}
                >
                  Cancelar
                </button>
                <button
                  disabled={
                    !project ||
                    (!createNewEpic && !epic) ||
                    (createNewEpic && !newEpicSummary.trim())
                  }
                  style={{
                    padding: '10px 20px',
                    background: 'var(--primary-button-bg)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    opacity:
                      !project ||
                      (!createNewEpic && !epic) ||
                      (createNewEpic && !newEpicSummary.trim())
                        ? 0.5
                        : 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <FaFlag />
                  Continuar
                </button>
              </div>
            </div>
          </div>
        </Modal>
      </>
    );
  },
};

// Formulario completo con múltiples dropdowns
export const CompleteForm: Story = {
  render: () => {
    const [formData, setFormData] = useState({
      project: '',
      epic: '',
      assignee: '',
      priority: '',
      estimationType: '',
    });

    const assigneeOptions: DropdownOption[] = [
      { value: 'john', label: 'John Doe', description: 'Frontend Developer' },
      { value: 'jane', label: 'Jane Smith', description: 'Backend Developer' },
      {
        value: 'mike',
        label: 'Mike Johnson',
        description: 'Full Stack Developer',
      },
      { value: 'sarah', label: 'Sarah Wilson', description: 'UI/UX Designer' },
    ];

    const priorityOptions: DropdownOption[] = [
      {
        value: 'critical',
        label: 'Crítica',
        description: 'Requiere atención inmediata',
      },
      {
        value: 'high',
        label: 'Alta',
        description: 'Importante para el sprint',
      },
      { value: 'medium', label: 'Media', description: 'Prioridad estándar' },
      { value: 'low', label: 'Baja', description: 'Puede esperar' },
    ];

    const estimationOptions: DropdownOption[] = [
      {
        value: 'fibonacci',
        label: 'Fibonacci',
        description: '1, 2, 3, 5, 8, 13, 21...',
      },
      {
        value: 'tshirt',
        label: 'T-Shirt Sizes',
        description: 'XS, S, M, L, XL, XXL',
      },
      { value: 'hours', label: 'Horas', description: 'Estimación en horas' },
      {
        value: 'points',
        label: 'Story Points',
        description: 'Puntos de historia lineales',
      },
    ];

    const handleChange = (field: string) => (value: string) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
    };

    return (
      <div
        style={{
          width: '500px',
          padding: '24px',
          background: 'var(--card-bg)',
          borderRadius: '8px',
          border: '1px solid var(--border-color)',
        }}
      >
        <h2
          style={{
            margin: '0 0 24px',
            color: 'var(--text-color)',
            textAlign: 'center',
          }}
        >
          Configuración del Proyecto
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="form-group">
            <label
              style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '14px',
                fontWeight: '500',
                color: 'var(--text-color)',
              }}
            >
              Proyecto
            </label>
            <Dropdown
              options={projectOptions}
              value={formData.project}
              onChange={handleChange('project')}
              placeholder="Selecciona un proyecto..."
              searchable
              size="medium"
            />
          </div>

          <div className="form-group">
            <label
              style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '14px',
                fontWeight: '500',
                color: 'var(--text-color)',
              }}
            >
              Épica
            </label>
            <Dropdown
              options={epicOptions}
              value={formData.epic}
              onChange={handleChange('epic')}
              placeholder="Selecciona una épica..."
              searchable
              clearable
              disabled={!formData.project}
              size="medium"
            />
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '20px',
            }}
          >
            <div className="form-group">
              <label
                style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: 'var(--text-color)',
                }}
              >
                Asignado
              </label>
              <Dropdown
                options={assigneeOptions}
                value={formData.assignee}
                onChange={handleChange('assignee')}
                placeholder="Asignar a..."
                searchable
                clearable
                size="medium"
              />
            </div>

            <div className="form-group">
              <label
                style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: 'var(--text-color)',
                }}
              >
                Prioridad
              </label>
              <Dropdown
                options={priorityOptions}
                value={formData.priority}
                onChange={handleChange('priority')}
                placeholder="Seleccionar..."
                size="medium"
              />
            </div>
          </div>

          <div className="form-group">
            <label
              style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '14px',
                fontWeight: '500',
                color: 'var(--text-color)',
              }}
            >
              Tipo de Estimación
            </label>
            <Dropdown
              options={estimationOptions}
              value={formData.estimationType}
              onChange={handleChange('estimationType')}
              placeholder="Elige el tipo de estimación..."
              size="medium"
            />
          </div>

          <div
            style={{
              padding: '16px',
              background: 'var(--secondary-bg-alt)',
              borderRadius: '6px',
              border: '1px solid var(--border-color)',
              marginTop: '20px',
            }}
          >
            <h4
              style={{
                margin: '0 0 12px',
                color: 'var(--text-color)',
                fontSize: '14px',
              }}
            >
              Resumen de configuración:
            </h4>
            <pre
              style={{
                margin: 0,
                fontSize: '12px',
                color: 'var(--text-secondary)',
                whiteSpace: 'pre-wrap',
              }}
            >
              {JSON.stringify(formData, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    );
  },
};
