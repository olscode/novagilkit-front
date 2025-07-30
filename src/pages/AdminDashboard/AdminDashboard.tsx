import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FiBarChart2, FiLogOut, FiUsers } from 'react-icons/fi';
import { useNavigate } from 'react-router';
import Tabs, { Tab } from '../../components/Tabs/Tabs';
import { logoutAdmin } from '../../services/AdminDashboardService';
import SuperAdminService, {
  CompanyUser,
  GetAllUsersResponse,
  LicenseData,
} from '../../services/SuperAdminService';
import './AdminDashboard.scss';

// Type definitions

type Company = {
  id: string;
  name: string;
  slug?: string;
  description?: string;
  address?: string;
  phone?: string;
  adminEmail?: string;
  website?: string;
  logo?: string;
  status?: string;
  settings?: any;
  createdAt?: string;
  updatedAt?: string;
  licenseId?: string;
  license?: LicenseData;
};

type CompaniesResponse = {
  data: {
    companies: Company[];
    total?: number;
    page?: number;
    pages?: number;
    [key: string]: any;
  };
  success: boolean;
};

type UserForm = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: 'user' | 'manager' | 'company_admin' | 'viewer';
  companyId: string;
};

type CompanyStatus = 'active' | 'suspended' | 'trial' | 'inactive';

const initialCompanyForm: {
  name: string;
  slug: string;
  description: string;
  adminEmail: string;
  website: string;
  phone: string;
  logo: string;
  address: string;
  status: CompanyStatus;
} = {
  name: '',
  slug: '',
  description: '',
  adminEmail: '',
  website: '',
  phone: '',
  logo: '',
  address: '',
  status: 'active',
};

const initialUserForm: UserForm = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  role: 'user',
  companyId: '',
};

const initialLicenseForm: LicenseData = {
  planType: 'free',
  maxUsers: undefined,
  maxProjects: undefined,
  maxStorageMB: undefined,
  customBranding: false,
  features: {},
  startDate: '',
  endDate: '',
  monthlyPrice: undefined,
  yearlyPrice: undefined,
  id: '',
  companyId: '',
  createdAt: new Date(),
  updatedAt: new Date(),
  externalSubscriptionId: '',
  paymentMethod: '',
  status: 'active',
  trialEndDate: '',
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  // State declarations
  const [companiesData, setCompaniesData] = useState<CompaniesResponse>({
    data: { companies: [] },
    success: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [companyForm, setCompanyForm] = useState(initialCompanyForm);
  const [userForm, setUserForm] = useState(initialUserForm);
  const [creatingCompany, setCreatingCompany] = useState(false);
  const [registeringUser, setRegisteringUser] = useState(false);
  const [licenseForms, setLicenseForms] = useState<Record<string, LicenseData>>(
    {}
  );
  const [editingLicense, setEditingLicense] = useState<Record<string, boolean>>(
    {}
  );
  const [licenseLoading, setLicenseLoading] = useState<Record<string, boolean>>(
    {}
  );
  const [usersData, setUsersData] = useState<GetAllUsersResponse | null>(null);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState<string | null>(null);
  const [usersPage, setUsersPage] = useState(1);
  const [usersLimit] = useState(20);
  const [userFilterCompanyId, setUserFilterCompanyId] = useState('');
  const [userFilterRole, setUserFilterRole] = useState('');
  const [userFilterStatus, setUserFilterStatus] = useState('');
  const [userFilterSearch, setUserFilterSearch] = useState('');
  const [editingCompanyId, setEditingCompanyId] = useState<string | null>(null);
  const [editCompanyForm, setEditCompanyForm] = useState(initialCompanyForm);

  const [activeTab, setActiveTab] = useState('users');

  const tabs: Tab[] = [
    {
      key: 'users',
      label: t('adminDashboard.usersTab', 'Gestión de usuarios'),
      icon: <FiUsers />,
    },
    {
      key: 'stats',
      label: t('adminDashboard.statsTab', 'Estadísticas'),
      icon: <FiBarChart2 />,
    },
  ];

  // Handlers
  const handleLogout = async () => {
    try {
      await logoutAdmin();
      navigate('/admin/login');
    } catch (e) {
      setError('Error al cerrar sesión');
    }
  };

  const startEditCompany = (company: Company) => {
    setEditingCompanyId(company.id);
    setEditCompanyForm({
      name: company.name || '',
      slug: company.slug || '',
      description: company.description || '',
      adminEmail: company.adminEmail || '',
      website: company.website || '',
      phone: company.phone || '',
      logo: company.logo || '',
      address: company.address || '',
      status: (company.status as CompanyStatus) || 'active',
    });
  };

  const cancelEditCompany = () => {
    setEditingCompanyId(null);
    setEditCompanyForm(initialCompanyForm);
  };

  const handleUpdateCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCompanyId) return;
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await SuperAdminService.updateCompany(editingCompanyId, editCompanyForm);
      setSuccess('Empresa actualizada correctamente.');
      cancelEditCompany();
      fetchCompanies();
    } catch (e: any) {
      setError(e.message || t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  // Cargar empresas

  const fetchCompanies = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await SuperAdminService.getCompanies({ page: 1, limit: 50 });
      // Si la respuesta es { companies: [...] }
      if (res && res.data && Array.isArray(res.data.companies)) {
        setCompaniesData(res);
      } else if (res && res.companies) {
        setCompaniesData({ data: { companies: res.companies }, success: true });
      } else if (res && res.docs) {
        setCompaniesData({ data: { companies: res.docs }, success: true });
      } else if (Array.isArray(res)) {
        setCompaniesData({ data: { companies: res }, success: true });
      } else {
        setCompaniesData({ data: { companies: [] }, success: false });
      }
    } catch (e: any) {
      setError(e.message || t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  // Crear empresa
  const handleCreateCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingCompany(true);
    setError(null);
    setSuccess(null);
    try {
      await SuperAdminService.createCompany(companyForm);
      setSuccess(
        t('adminDashboard.companyCreated', 'Empresa creada correctamente.')
      );
      setCompanyForm(initialCompanyForm);
      fetchCompanies();
    } catch (e: any) {
      setError(e.message || t('common.error'));
    } finally {
      setCreatingCompany(false);
    }
  };

  // Registrar usuario
  const handleRegisterUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisteringUser(true);
    setError(null);
    setSuccess(null);
    try {
      await SuperAdminService.createUserAsSuperAdmin(userForm);
      setSuccess(
        t('adminDashboard.userCreated', 'Usuario registrado correctamente.')
      );
      setUserForm(initialUserForm);
      fetchUsers(usersPage); // <-- Añade esta línea para refrescar la tabla
    } catch (e: any) {
      setError(e.message || t('common.error'));
    } finally {
      setRegisteringUser(false);
    }
  };

  // Manejar cambios en el formulario de licencia
  const handleLicenseInputChange = (
    companyId: string,
    field: keyof LicenseData,
    value: any
  ) => {
    setLicenseForms((prev) => ({
      ...prev,
      [companyId]: {
        ...prev[companyId],
        [field]: value,
      },
    }));
  };

  // Crear licencia
  const handleCreateLicense = async (companyId: string) => {
    setLicenseLoading((prev) => ({ ...prev, [companyId]: true }));
    setError(null);
    setSuccess(null);
    try {
      await SuperAdminService.createCompanyLicense(
        companyId,
        licenseForms[companyId]
      );
      setSuccess('Licencia creada correctamente.');
      setEditingLicense((prev) => ({ ...prev, [companyId]: false }));
      fetchCompanies();
    } catch (e: any) {
      setError(e.message || t('common.error'));
    } finally {
      setLicenseLoading((prev) => ({ ...prev, [companyId]: false }));
    }
  };

  // Editar licencia existente
  const handleUpdateLicense = async (companyId: string) => {
    setLicenseLoading((prev) => ({ ...prev, [companyId]: true }));
    setError(null);
    setSuccess(null);
    try {
      await SuperAdminService.updateCompanyLicense(
        companyId,
        licenseForms[companyId]
      );
      setSuccess('Licencia actualizada correctamente.');
      setEditingLicense((prev) => ({ ...prev, [companyId]: false }));
      fetchCompanies();
    } catch (e: any) {
      setError(e.message || t('common.error'));
    } finally {
      setLicenseLoading((prev) => ({ ...prev, [companyId]: false }));
    }
  };

  // Inicializar formulario de licencia al editar/crear
  const startEditLicense = (company: Company) => {
    setEditingLicense((prev) => ({
      ...prev,
      [company.id]: true,
    }));
    setLicenseForms((prev) => ({
      ...prev,
      [company.id]: company.license
        ? {
            id: company.license.id || '',
            companyId: company.id,
            planType: company.license.planType || 'free',
            maxUsers: company.license.maxUsers,
            maxProjects: company.license.maxProjects,
            maxStorageMB: company.license.maxStorageMB,
            customBranding: company.license.customBranding || false,
            features: company.license.features || {},
            startDate: company.license.startDate || null,
            endDate: company.license.endDate || null,
            monthlyPrice: company.license.monthlyPrice,
            yearlyPrice: company.license.yearlyPrice,
            createdAt: company.license.createdAt || null,
            updatedAt: company.license.updatedAt || new Date(),
            externalSubscriptionId:
              company.license.externalSubscriptionId || '',
            paymentMethod: company.license.paymentMethod || '',
            status: company.license.status || 'active',
            trialEndDate: company.license.trialEndDate || null,
          }
        : { ...initialLicenseForm, companyId: company.id, id: '' },
    }));
  };

  // Cancelar edición/creación de licencia
  const cancelEditLicense = (companyId: string) => {
    setEditingLicense((prev) => ({ ...prev, [companyId]: false }));
    setLicenseForms((prev) => {
      const copy = { ...prev };
      delete copy[companyId];
      return copy;
    });
  };

  // Actualizar usuarios con filtros
  const handleUserFilter = () => {
    setUsersPage(1);
    fetchUsers(1);
  };

  // Modificar fetchUsers para usar filtros y búsqueda

  // Exportar usuarios a CSV
  const exportUsersToCSV = () => {
    if (!usersData || !usersData.data.users.length) return;
    // Agregamos teléfono y fecha de registro
    const headers = [
      'Nombre',
      'Apellido',
      'Email',
      'Rol',
      'Estado',
      'Empresa',
      'Fecha de registro',
    ];
    const rows = usersData.data.users.map((u) => [
      (u.firstName ?? '').replace(/\r?\n|\r/g, ' '),
      (u.lastName ?? '').replace(/\r?\n|\r/g, ' '),
      (u.email ?? '').replace(/\r?\n|\r/g, ' '),
      (u.role ?? '').replace(/\r?\n|\r/g, ' '),
      (u.status ?? '').replace(/\r?\n|\r/g, ' '),
      (u.company?.name ?? '-').replace(/\r?\n|\r/g, ' '),
      u.createdAt
        ? new Date(u.createdAt).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
          })
        : '-',
    ]);
    // BOM para compatibilidad con Excel
    let csvContent = '\uFEFF';
    csvContent += headers.join(';') + '\r\n';
    rows.forEach((row) => {
      csvContent +=
        row
          .map((val) => {
            // Si el valor contiene punto y coma, comillas o salto de línea, lo envolvemos entre comillas
            const v = String(val);
            if (/[;"\n\r]/.test(v)) {
              return '"' + v.replace(/"/g, '""') + '"';
            }
            return v;
          })
          .join(';') + '\r\n';
    });
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'usuarios.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  const fetchUsers = async (page = 1) => {
    setUsersLoading(true);
    setUsersError(null);
    try {
      const data = await SuperAdminService.getAllUsers({
        page,
        limit: usersLimit,
        companyId: userFilterCompanyId || undefined,
        role: userFilterRole || undefined,
        status: userFilterStatus || undefined,
        search: userFilterSearch || undefined,
      });
      setUsersData(data);
    } catch (e: any) {
      setUsersError(e.message || 'Error al cargar usuarios');
    } finally {
      setUsersLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(usersPage);
  }, [usersPage]);

  return (
    <Tabs tabs={tabs} activeKey={activeTab} onChange={setActiveTab}>
      {activeTab === 'users' && (
        <div className="admin-dashboard">
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <h1 className="admin-dashboard__header">
              {t('adminDashboard.title', 'Super Admin Dashboard')}
            </h1>
            <button
              onClick={handleLogout}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: 22,
                marginLeft: 16,
                color: '#444',
                display: 'flex',
                alignItems: 'center',
              }}
              title="Cerrar sesión"
            >
              <FiLogOut />
            </button>
          </div>

          {error && <div className="admin-dashboard__error">{error}</div>}
          {success && <div className="admin-dashboard__success">{success}</div>}

          {/* Sección: Crear Empresa */}
          <section className="admin-dashboard__section">
            <div className="admin-dashboard__section-title">
              {t('adminDashboard.createCompany', 'Crear nueva empresa')}
            </div>
            <form
              className="admin-dashboard__form"
              onSubmit={handleCreateCompany}
            >
              <div className="admin-dashboard__form-group">
                <label>{t('adminDashboard.companyName', 'Nombre')}</label>
                <input
                  required
                  value={companyForm.name}
                  onChange={(e) =>
                    setCompanyForm((f) => ({ ...f, name: e.target.value }))
                  }
                />
              </div>
              <div className="admin-dashboard__form-group">
                <label>{t('adminDashboard.slug', 'Slug')}</label>
                <input
                  value={companyForm.slug}
                  onChange={(e) =>
                    setCompanyForm((f) => ({ ...f, slug: e.target.value }))
                  }
                />
              </div>
              <div className="admin-dashboard__form-group">
                <label>{t('adminDashboard.description', 'Descripción')}</label>
                <textarea
                  className="admin-dashboard__input"
                  style={{ resize: 'vertical', minHeight: 40, maxHeight: 120 }}
                  value={companyForm.description}
                  onChange={(e) =>
                    setCompanyForm((f) => ({
                      ...f,
                      description: e.target.value,
                    }))
                  }
                  rows={3}
                />
              </div>
              <div className="admin-dashboard__form-group">
                <label>
                  {t('adminDashboard.adminEmail', 'Email administrador')}
                </label>
                <input
                  required
                  type="email"
                  value={companyForm.adminEmail}
                  onChange={(e) =>
                    setCompanyForm((f) => ({
                      ...f,
                      adminEmail: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="admin-dashboard__form-group">
                <label>{t('adminDashboard.website', 'Sitio web')}</label>
                <input
                  value={companyForm.website}
                  onChange={(e) =>
                    setCompanyForm((f) => ({ ...f, website: e.target.value }))
                  }
                />
              </div>
              <div className="admin-dashboard__form-group">
                <label>{t('adminDashboard.phone', 'Teléfono')}</label>
                <input
                  value={companyForm.phone}
                  onChange={(e) =>
                    setCompanyForm((f) => ({ ...f, phone: e.target.value }))
                  }
                />
              </div>
              <div className="admin-dashboard__form-group">
                <label>{t('adminDashboard.logo', 'Logo (URL)')}</label>
                <input
                  value={companyForm.logo}
                  onChange={(e) =>
                    setCompanyForm((f) => ({ ...f, logo: e.target.value }))
                  }
                />
              </div>
              <div className="admin-dashboard__form-group">
                <label>{t('adminDashboard.companyAddress', 'Dirección')}</label>
                <input
                  value={companyForm.address}
                  onChange={(e) =>
                    setCompanyForm((f) => ({ ...f, address: e.target.value }))
                  }
                />
              </div>
              <div className="admin-dashboard__form-group">
                <label>{t('adminDashboard.status', 'Estado')}</label>
                <select
                  value={companyForm.status}
                  onChange={(e) =>
                    setCompanyForm((f) => ({
                      ...f,
                      status: e.target.value as CompanyStatus,
                    }))
                  }
                >
                  <option value="active">
                    {t('adminDashboard.statusActive', 'Activa')}
                  </option>
                  <option value="suspended">
                    {t('adminDashboard.statusSuspended', 'Suspendida')}
                  </option>
                  <option value="trial">
                    {t('adminDashboard.statusTrial', 'Prueba')}
                  </option>
                  <option value="inactive">
                    {t('adminDashboard.statusInactive', 'Inactiva')}
                  </option>
                </select>
              </div>
              <button
                className="admin-dashboard__button"
                type="submit"
                disabled={creatingCompany}
              >
                {creatingCompany
                  ? t('common.loading')
                  : t('adminDashboard.createCompanyBtn', 'Crear empresa')}
              </button>
            </form>
          </section>

          {/* Sección: Listado de Empresas */}
          <section className="admin-dashboard__section">
            <div className="admin-dashboard__section-title">
              {t('adminDashboard.companyList', 'Empresas registradas')}
            </div>
            {loading ? (
              <div>{t('common.loading')}</div>
            ) : (
              <table className="admin-dashboard__table">
                <thead>
                  <tr>
                    <th>{t('adminDashboard.companyName', 'Nombre')}</th>
                    <th>{t('adminDashboard.slug', 'Slug')}</th>
                    <th>{t('adminDashboard.description', 'Descripción')}</th>
                    <th>
                      {t('adminDashboard.adminEmail', 'Email administrador')}
                    </th>
                    <th>{t('adminDashboard.website', 'Sitio web')}</th>
                    <th>{t('adminDashboard.phone', 'Teléfono')}</th>
                    <th>{t('adminDashboard.logo', 'Logo')}</th>
                    <th>{t('adminDashboard.companyAddress', 'Dirección')}</th>
                    <th>{t('adminDashboard.status', 'Estado')}</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {companiesData.data.companies.map((c: Company) => (
                    <React.Fragment key={c.id}>
                      {editingCompanyId === c.id ? (
                        <tr>
                          <td colSpan={10}>
                            <form
                              className="admin-dashboard__form"
                              onSubmit={handleUpdateCompany}
                              style={{
                                background: '#f8f8f8',
                                padding: 10,
                                borderRadius: 6,
                              }}
                            >
                              <div
                                style={{
                                  display: 'flex',
                                  flexWrap: 'wrap',
                                  gap: 10,
                                }}
                              >
                                {/* ...company edit inputs... */}
                                <input
                                  required
                                  placeholder="Nombre"
                                  value={editCompanyForm.name}
                                  onChange={(e) =>
                                    setEditCompanyForm((f) => ({
                                      ...f,
                                      name: e.target.value,
                                    }))
                                  }
                                  style={{ flex: 1 }}
                                />
                                <input
                                  placeholder="Slug"
                                  value={editCompanyForm.slug}
                                  onChange={(e) =>
                                    setEditCompanyForm((f) => ({
                                      ...f,
                                      slug: e.target.value,
                                    }))
                                  }
                                  style={{ flex: 1 }}
                                />
                                <input
                                  placeholder="Descripción"
                                  value={editCompanyForm.description}
                                  onChange={(e) =>
                                    setEditCompanyForm((f) => ({
                                      ...f,
                                      description: e.target.value,
                                    }))
                                  }
                                  style={{ flex: 1 }}
                                />
                                <input
                                  type="email"
                                  placeholder="Email administrador"
                                  value={editCompanyForm.adminEmail}
                                  onChange={(e) =>
                                    setEditCompanyForm((f) => ({
                                      ...f,
                                      adminEmail: e.target.value,
                                    }))
                                  }
                                  style={{ flex: 1 }}
                                />
                                <input
                                  placeholder="Sitio web"
                                  value={editCompanyForm.website}
                                  onChange={(e) =>
                                    setEditCompanyForm((f) => ({
                                      ...f,
                                      website: e.target.value,
                                    }))
                                  }
                                  style={{ flex: 1 }}
                                />
                                <input
                                  placeholder="Teléfono"
                                  value={editCompanyForm.phone}
                                  onChange={(e) =>
                                    setEditCompanyForm((f) => ({
                                      ...f,
                                      phone: e.target.value,
                                    }))
                                  }
                                  style={{ flex: 1 }}
                                />
                                <input
                                  placeholder="Logo (URL)"
                                  value={editCompanyForm.logo}
                                  onChange={(e) =>
                                    setEditCompanyForm((f) => ({
                                      ...f,
                                      logo: e.target.value,
                                    }))
                                  }
                                  style={{ flex: 1 }}
                                />
                                <input
                                  placeholder="Dirección"
                                  value={editCompanyForm.address}
                                  onChange={(e) =>
                                    setEditCompanyForm((f) => ({
                                      ...f,
                                      address: e.target.value,
                                    }))
                                  }
                                  style={{ flex: 1 }}
                                />
                                <select
                                  value={editCompanyForm.status}
                                  onChange={(e) =>
                                    setEditCompanyForm((f) => ({
                                      ...f,
                                      status: e.target.value as CompanyStatus,
                                    }))
                                  }
                                  style={{ flex: 1 }}
                                >
                                  <option value="active">Activa</option>
                                  <option value="suspended">Suspendida</option>
                                  <option value="trial">Prueba</option>
                                  <option value="inactive">Inactiva</option>
                                </select>
                              </div>
                              <div style={{ marginTop: 10 }}>
                                <button
                                  type="submit"
                                  className="admin-dashboard__button"
                                  disabled={loading}
                                >
                                  Guardar cambios
                                </button>
                                <button
                                  type="button"
                                  className="admin-dashboard__button"
                                  style={{
                                    marginLeft: 8,
                                    background: '#ccc',
                                    color: '#222',
                                  }}
                                  onClick={cancelEditCompany}
                                >
                                  Cancelar
                                </button>
                              </div>
                            </form>
                          </td>
                        </tr>
                      ) : (
                        <tr>
                          <td>{c.name}</td>
                          <td>{c.slug || '-'}</td>
                          <td>{c.description || '-'}</td>
                          <td>{c.adminEmail || '-'}</td>
                          <td>
                            {c.website ? (
                              <a
                                href={c.website}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                {c.website}
                              </a>
                            ) : (
                              '-'
                            )}
                          </td>
                          <td>{c.phone || '-'}</td>
                          <td>
                            {c.logo ? (
                              <img
                                src={c.logo}
                                alt="logo"
                                style={{
                                  maxWidth: 40,
                                  maxHeight: 40,
                                  borderRadius: '50%',
                                }}
                              />
                            ) : (
                              '-'
                            )}
                          </td>
                          <td>{c.address || '-'}</td>
                          <td>{c.status || '-'}</td>
                          <td>
                            <button
                              className="admin-dashboard__button"
                              style={{ fontSize: 13, padding: '2px 8px' }}
                              onClick={() => startEditCompany(c)}
                            >
                              Editar
                            </button>
                          </td>
                        </tr>
                      )}
                      <tr>
                        <td colSpan={10}>
                          {/* Licencia UI restored */}
                          {editingLicense[c.id] ? (
                            <form
                              className="admin-dashboard__form admin-dashboard__license-form"
                              style={{
                                marginTop: 10,
                                marginBottom: 10,
                                background: '#f8f8f8',
                                padding: 10,
                                borderRadius: 6,
                              }}
                              onSubmit={(e) => {
                                e.preventDefault();
                                if (c.license) {
                                  handleUpdateLicense(c.id);
                                } else {
                                  handleCreateLicense(c.id);
                                }
                              }}
                            >
                              <div
                                style={{
                                  display: 'flex',
                                  flexWrap: 'wrap',
                                  gap: 10,
                                }}
                              >
                                <input
                                  placeholder="Plan Type"
                                  value={licenseForms[c.id]?.planType || ''}
                                  onChange={(e) =>
                                    handleLicenseInputChange(
                                      c.id,
                                      'planType',
                                      e.target.value
                                    )
                                  }
                                  style={{ flex: 1 }}
                                />
                                <input
                                  type="number"
                                  placeholder="Max Users"
                                  value={licenseForms[c.id]?.maxUsers || ''}
                                  onChange={(e) =>
                                    handleLicenseInputChange(
                                      c.id,
                                      'maxUsers',
                                      Number(e.target.value)
                                    )
                                  }
                                  style={{ flex: 1 }}
                                />
                                <input
                                  type="number"
                                  placeholder="Max Projects"
                                  value={licenseForms[c.id]?.maxProjects || ''}
                                  onChange={(e) =>
                                    handleLicenseInputChange(
                                      c.id,
                                      'maxProjects',
                                      Number(e.target.value)
                                    )
                                  }
                                  style={{ flex: 1 }}
                                />
                                <input
                                  type="number"
                                  placeholder="Max Storage MB"
                                  value={licenseForms[c.id]?.maxStorageMB || ''}
                                  onChange={(e) =>
                                    handleLicenseInputChange(
                                      c.id,
                                      'maxStorageMB',
                                      Number(e.target.value)
                                    )
                                  }
                                  style={{ flex: 1 }}
                                />
                                <input
                                  type="checkbox"
                                  checked={!!licenseForms[c.id]?.customBranding}
                                  onChange={(e) =>
                                    handleLicenseInputChange(
                                      c.id,
                                      'customBranding',
                                      e.target.checked
                                    )
                                  }
                                  style={{ marginTop: 8 }}
                                />{' '}
                                Custom Branding
                                <input
                                  placeholder="Start Date (YYYY-MM-DD)"
                                  value={licenseForms[c.id]?.startDate || ''}
                                  onChange={(e) =>
                                    handleLicenseInputChange(
                                      c.id,
                                      'startDate',
                                      e.target.value
                                    )
                                  }
                                  style={{ flex: 1 }}
                                />
                                <input
                                  placeholder="End Date (YYYY-MM-DD)"
                                  value={licenseForms[c.id]?.endDate || ''}
                                  onChange={(e) =>
                                    handleLicenseInputChange(
                                      c.id,
                                      'endDate',
                                      e.target.value
                                    )
                                  }
                                  style={{ flex: 1 }}
                                />
                                <input
                                  type="number"
                                  placeholder="Monthly Price"
                                  value={licenseForms[c.id]?.monthlyPrice || ''}
                                  onChange={(e) =>
                                    handleLicenseInputChange(
                                      c.id,
                                      'monthlyPrice',
                                      Number(e.target.value)
                                    )
                                  }
                                  style={{ flex: 1 }}
                                />
                                <input
                                  type="number"
                                  placeholder="Yearly Price"
                                  value={licenseForms[c.id]?.yearlyPrice || ''}
                                  onChange={(e) =>
                                    handleLicenseInputChange(
                                      c.id,
                                      'yearlyPrice',
                                      Number(e.target.value)
                                    )
                                  }
                                  style={{ flex: 1 }}
                                />
                              </div>
                              <div style={{ marginTop: 10 }}>
                                <button
                                  type="submit"
                                  className="admin-dashboard__button"
                                  disabled={licenseLoading[c.id]}
                                >
                                  {licenseLoading[c.id]
                                    ? t('common.loading')
                                    : c.license
                                      ? 'Actualizar licencia'
                                      : 'Crear licencia'}
                                </button>
                                <button
                                  type="button"
                                  className="admin-dashboard__button"
                                  style={{
                                    marginLeft: 8,
                                    background: '#ccc',
                                    color: '#222',
                                  }}
                                  onClick={() => cancelEditLicense(c.id)}
                                >
                                  Cancelar
                                </button>
                              </div>
                            </form>
                          ) : (
                            <div style={{ marginTop: 10 }}>
                              {c.license ? (
                                <>
                                  <div>
                                    <b>Plan:</b> {c.license.planType || '-'}
                                  </div>
                                  <div>
                                    <b>Número máximo usuarios:</b>{' '}
                                    {c.license.maxUsers || '-'}
                                  </div>
                                  <div>
                                    <b>Proyectos:</b>{' '}
                                    {c.license.maxProjects || '-'}
                                  </div>
                                  <div>
                                    <b>Almacenamiento:</b>{' '}
                                    {c.license.maxStorageMB || '-'}
                                  </div>
                                  <div>
                                    <b>Custom Branding:</b>{' '}
                                    {c.license.customBranding ? 'Sí' : 'No'}
                                  </div>
                                  <div>
                                    <b>Inicio:</b> {c.license.startDate || '-'}
                                  </div>
                                  <div>
                                    <b>Fin:</b> {c.license.endDate || '-'}
                                  </div>
                                  <div>
                                    <b>Mensual:</b>{' '}
                                    {c.license.monthlyPrice || '-'}
                                  </div>
                                  <div>
                                    <b>Anual:</b> {c.license.yearlyPrice || '-'}
                                  </div>
                                  <button
                                    className="admin-dashboard__button"
                                    style={{ marginTop: 8 }}
                                    onClick={() => startEditLicense(c)}
                                  >
                                    Editar licencia
                                  </button>
                                </>
                              ) : (
                                <button
                                  className="admin-dashboard__button"
                                  style={{ marginTop: 8 }}
                                  onClick={() => startEditLicense(c)}
                                >
                                  Crear licencia
                                </button>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            )}
          </section>

          {/* Sección: Listado de Usuarios */}
          <section className="admin-dashboard__section">
            <div className="admin-dashboard__section-title">
              Usuarios registrados
            </div>
            {/* Filtros de usuarios */}
            <form
              style={{
                display: 'flex',
                gap: 12,
                marginBottom: 16,
                flexWrap: 'wrap',
              }}
              onSubmit={(e) => {
                e.preventDefault();
                handleUserFilter();
              }}
            >
              <input
                type="text"
                placeholder="Buscar por nombre o email"
                value={userFilterSearch}
                onChange={(e) => setUserFilterSearch(e.target.value)}
                style={{ minWidth: 180 }}
              />
              <select
                value={userFilterCompanyId}
                onChange={(e) => setUserFilterCompanyId(e.target.value)}
                style={{ minWidth: 160 }}
              >
                <option value="">Todas las empresas</option>
                {companiesData.data.companies.map((c: Company) => (
                  <React.Fragment key={c.id}>
                    {editingCompanyId === c.id ? (
                      <tr>
                        <td colSpan={10}>
                          <form
                            className="admin-dashboard__form"
                            onSubmit={handleUpdateCompany}
                            style={{
                              background: '#f8f8f8',
                              padding: 10,
                              borderRadius: 6,
                            }}
                          >
                            <div
                              style={{
                                display: 'flex',
                                flexWrap: 'wrap',
                                gap: 10,
                              }}
                            >
                              <input
                                required
                                placeholder="Nombre"
                                value={editCompanyForm.name}
                                onChange={(e) =>
                                  setEditCompanyForm((f) => ({
                                    ...f,
                                    name: e.target.value,
                                  }))
                                }
                                style={{ flex: 1 }}
                              />
                              <input
                                placeholder="Slug"
                                value={editCompanyForm.slug}
                                onChange={(e) =>
                                  setEditCompanyForm((f) => ({
                                    ...f,
                                    slug: e.target.value,
                                  }))
                                }
                                style={{ flex: 1 }}
                              />
                              <input
                                placeholder="Descripción"
                                value={editCompanyForm.description}
                                onChange={(e) =>
                                  setEditCompanyForm((f) => ({
                                    ...f,
                                    description: e.target.value,
                                  }))
                                }
                                style={{ flex: 1 }}
                              />
                              <input
                                type="email"
                                placeholder="Email administrador"
                                value={editCompanyForm.adminEmail}
                                onChange={(e) =>
                                  setEditCompanyForm((f) => ({
                                    ...f,
                                    adminEmail: e.target.value,
                                  }))
                                }
                                style={{ flex: 1 }}
                              />
                              <input
                                placeholder="Sitio web"
                                value={editCompanyForm.website}
                                onChange={(e) =>
                                  setEditCompanyForm((f) => ({
                                    ...f,
                                    website: e.target.value,
                                  }))
                                }
                                style={{ flex: 1 }}
                              />
                              <input
                                placeholder="Teléfono"
                                value={editCompanyForm.phone}
                                onChange={(e) =>
                                  setEditCompanyForm((f) => ({
                                    ...f,
                                    phone: e.target.value,
                                  }))
                                }
                                style={{ flex: 1 }}
                              />
                              <input
                                placeholder="Logo (URL)"
                                value={editCompanyForm.logo}
                                onChange={(e) =>
                                  setEditCompanyForm((f) => ({
                                    ...f,
                                    logo: e.target.value,
                                  }))
                                }
                                style={{ flex: 1 }}
                              />
                              <input
                                placeholder="Dirección"
                                value={editCompanyForm.address}
                                onChange={(e) =>
                                  setEditCompanyForm((f) => ({
                                    ...f,
                                    address: e.target.value,
                                  }))
                                }
                                style={{ flex: 1 }}
                              />
                              <select
                                value={editCompanyForm.status}
                                onChange={(e) =>
                                  setEditCompanyForm((f) => ({
                                    ...f,
                                    status: e.target.value as CompanyStatus,
                                  }))
                                }
                                style={{ flex: 1 }}
                              >
                                <option value="active">Activa</option>
                                <option value="suspended">Suspendida</option>
                                <option value="trial">Prueba</option>
                                <option value="inactive">Inactiva</option>
                              </select>
                            </div>
                            <div style={{ marginTop: 10 }}>
                              <button
                                type="submit"
                                className="admin-dashboard__button"
                                disabled={loading}
                              >
                                Guardar cambios
                              </button>
                              <button
                                type="button"
                                className="admin-dashboard__button"
                                style={{
                                  marginLeft: 8,
                                  background: '#ccc',
                                  color: '#222',
                                }}
                                onClick={cancelEditCompany}
                              >
                                Cancelar
                              </button>
                            </div>
                          </form>
                        </td>
                      </tr>
                    ) : (
                      <tr>
                        <td>{c.name}</td>
                        <td>{c.slug || '-'}</td>
                        <td>{c.description || '-'}</td>
                        <td>{c.adminEmail || '-'}</td>
                        <td>
                          {c.website ? (
                            <a
                              href={c.website}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {c.website}
                            </a>
                          ) : (
                            '-'
                          )}
                        </td>
                        <td>{c.phone || '-'}</td>
                        <td>
                          {c.logo ? (
                            <img
                              src={c.logo}
                              alt="logo"
                              style={{
                                maxWidth: 40,
                                maxHeight: 40,
                                borderRadius: '50%',
                              }}
                            />
                          ) : (
                            '-'
                          )}
                        </td>
                        <td>{c.address || '-'}</td>
                        <td>{c.status || '-'}</td>
                        <td>
                          <button
                            className="admin-dashboard__button"
                            style={{ fontSize: 13, padding: '2px 8px' }}
                            onClick={() => startEditCompany(c)}
                          >
                            Editar
                          </button>
                        </td>
                      </tr>
                    )}
                    <tr>
                      <td colSpan={10}>
                        {/* ...licencia y otros controles... */}
                      </td>
                    </tr>
                  </React.Fragment>
                ))}
                <option value="expired">Expirado</option>
                <option value="cancelled">Cancelado</option>
              </select>
              <button className="admin-dashboard__button" type="submit">
                Filtrar
              </button>
            </form>
            {/* Botón exportar CSV */}
            <button
              className="admin-dashboard__button"
              style={{ marginBottom: 12 }}
              onClick={exportUsersToCSV}
              disabled={!usersData || !usersData.data.users.length}
            >
              Exportar CSV
            </button>
            {usersLoading ? (
              <div>Cargando usuarios...</div>
            ) : usersError ? (
              <div className="admin-dashboard__error">{usersError}</div>
            ) : usersData && usersData.data.users.length > 0 ? (
              <>
                <table className="admin-dashboard__table">
                  <thead>
                    <tr>
                      <th>Nombre</th>
                      <th>Apellido</th>
                      <th>Email</th>
                      <th>Rol</th>
                      <th>Estado</th>
                      <th>Empresa</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usersData.data.users.map((u: CompanyUser) => (
                      <tr key={u.id}>
                        <td>{u.firstName}</td>
                        <td>{u.lastName}</td>
                        <td>{u.email}</td>
                        <td>{u.role}</td>
                        <td>{u.status}</td>
                        <td>{u.company?.name ?? '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div style={{ marginTop: 10 }}>
                  <button
                    className="admin-dashboard__button"
                    disabled={usersPage === 1}
                    onClick={() => setUsersPage((p) => Math.max(1, p - 1))}
                  >
                    Anterior
                  </button>
                  <span style={{ margin: '0 12px' }}>
                    Página {usersData.data.page} de{' '}
                    {Math.ceil(usersData.data.total / usersData.data.limit)}
                  </span>
                  <button
                    className="admin-dashboard__button"
                    disabled={
                      usersData.data.page * usersData.data.limit >=
                      usersData.data.total
                    }
                    onClick={() => setUsersPage((p) => p + 1)}
                  >
                    Siguiente
                  </button>
                </div>
              </>
            ) : (
              <div>No hay usuarios registrados.</div>
            )}
          </section>

          {/* Sección: Registrar Usuario */}
          <section className="admin-dashboard__section">
            <div className="admin-dashboard__section-title">
              {t('adminDashboard.createUser', 'Registrar usuario en empresa')}
            </div>
            <form
              className="admin-dashboard__form"
              onSubmit={handleRegisterUser}
            >
              <div className="admin-dashboard__form-group">
                <label>{t('adminDashboard.firstName', 'Nombre')}</label>
                <input
                  required
                  value={userForm.firstName}
                  onChange={(e) =>
                    setUserForm((f) => ({ ...f, firstName: e.target.value }))
                  }
                />
              </div>
              <div className="admin-dashboard__form-group">
                <label>{t('adminDashboard.lastName', 'Apellido')}</label>
                <input
                  required
                  value={userForm.lastName}
                  onChange={(e) =>
                    setUserForm((f) => ({ ...f, lastName: e.target.value }))
                  }
                />
              </div>
              <div className="admin-dashboard__form-group">
                <label>{t('adminDashboard.email', 'Email')}</label>
                <input
                  required
                  type="email"
                  value={userForm.email}
                  onChange={(e) =>
                    setUserForm((f) => ({ ...f, email: e.target.value }))
                  }
                />
              </div>
              <div className="admin-dashboard__form-group">
                <label>{t('adminDashboard.password', 'Contraseña')}</label>
                <input
                  required
                  type="password"
                  value={userForm.password}
                  onChange={(e) =>
                    setUserForm((f) => ({ ...f, password: e.target.value }))
                  }
                />
              </div>
              <div className="admin-dashboard__form-group">
                <label>{t('adminDashboard.role', 'Rol')}</label>
                <select
                  required
                  value={userForm.role}
                  onChange={(e) =>
                    setUserForm((f) => ({
                      ...f,
                      role: e.target.value as UserForm['role'],
                    }))
                  }
                >
                  <option value="user">
                    {t('adminDashboard.roleUser', 'Usuario')}
                  </option>
                  <option value="manager">
                    {t('adminDashboard.roleManager', 'Manager')}
                  </option>
                  <option value="company_admin">
                    {t('adminDashboard.roleCompanyAdmin', 'Admin de empresa')}
                  </option>
                  <option value="viewer">
                    {t('adminDashboard.roleViewer', 'Solo lectura')}
                  </option>
                </select>
              </div>
              <div className="admin-dashboard__form-group">
                <label>{t('adminDashboard.company', 'Empresa')}</label>
                <select
                  required
                  value={userForm.companyId}
                  onChange={(e) =>
                    setUserForm((f) => ({ ...f, companyId: e.target.value }))
                  }
                >
                  <option value="">
                    {t(
                      'adminDashboard.selectCompany',
                      'Selecciona una empresa'
                    )}
                  </option>
                  {companiesData.data.companies.map((c: any) => (
                    <option key={c.id || c._id} value={c.id || c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <button
                className="admin-dashboard__button"
                type="submit"
                disabled={registeringUser}
              >
                {registeringUser
                  ? t('common.loading')
                  : t('adminDashboard.createUserBtn', 'Registrar usuario')}
              </button>
            </form>
          </section>
        </div>
      )}
    </Tabs>
  );
}
