import Spinner from '../../../components/Spinner/Spinner';

export default {
  title: 'Components/Spinner',
  component: Spinner,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Un spinner animado moderno para indicar carga o espera. Se usa en modales y pantallas de espera.',
      },
    },
  },
};

export const Default = () => <Spinner />;
Default.storyName = 'Spinner por defecto';

export const OverlayExample = () => (
  <div
    style={{
      position: 'relative',
      height: 200,
      background: '#f6f6fa',
      borderRadius: 12,
      overflow: 'hidden',
    }}
  >
    <Spinner />
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#333',
        fontSize: 18,
      }}
    >
      <span>Simulando carga de contenido...</span>
    </div>
  </div>
);
OverlayExample.storyName = 'Spinner sobre fondo de contenido';
