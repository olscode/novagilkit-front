import { useState } from 'react';
import { FaChartBar, FaCog, FaUser } from 'react-icons/fa';
import Tabs, { Tab } from '../../../components/Tabs/Tabs';

export default {
  title: 'Components/Tabs',
  component: Tabs,
};

const tabList: Tab[] = [
  { key: 'users', label: 'Usuarios', icon: <FaUser /> },
  { key: 'settings', label: 'Configuración', icon: <FaCog /> },
  { key: 'stats', label: 'Estadísticas', icon: <FaChartBar /> },
  { key: 'disabled', label: 'Deshabilitado', disabled: true },
];

export const Basic = () => {
  const [active, setActive] = useState('users');
  return (
    <Tabs tabs={tabList} activeKey={active} onChange={setActive}>
      <div style={{ minHeight: 80 }}>
        <h3>
          Contenido de la pestaña:{' '}
          {tabList.find((t) => t.key === active)?.label}
        </h3>
        <p>Este es un ejemplo de contenido para la pestaña seleccionada.</p>
      </div>
    </Tabs>
  );
};

export const WithExtraContent = () => {
  const [active, setActive] = useState('users');
  return (
    <Tabs
      tabs={tabList}
      activeKey={active}
      onChange={setActive}
      tabBarExtraContent={<button style={{ marginLeft: 16 }}>Acción</button>}
    >
      <div style={{ minHeight: 80 }}>
        <h3>
          Contenido de la pestaña:{' '}
          {tabList.find((t) => t.key === active)?.label}
        </h3>
        <p>Este es un ejemplo de contenido para la pestaña seleccionada.</p>
      </div>
    </Tabs>
  );
};
