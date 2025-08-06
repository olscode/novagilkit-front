import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FiBarChart2, FiLogOut, FiUsers } from 'react-icons/fi';
import { useNavigate } from 'react-router';
import { AnalyticsDashboard } from '../../components/AnalyticsDashboard';
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
  const [allUsersData, setAllUsersData] = useState<GetAllUsersResponse | null>(
    null
  );
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState<string | null>(null);
  const [usersPage, setUsersPage] = useState(1);
  const [usersLimit] = useState(20);
  const [userFilterCompanyId, setUserFilterCompanyId] = useState('');
  const [userFilterRole, setUserFilterRole] = useState('');
  const [userFilterStatus, setUserFilterStatus] = useState('');
  const [userFilterSearch, setUserFilterSearch] = useState('');
  const [filtersApplied, setFiltersApplied] = useState(false);
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
  const handleUserFilter = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    console.log('🔍 [handleUserFilter] Iniciando filtrado manual');
    console.log('🔍 [handleUserFilter] Filtros actuales:', {
      search: userFilterSearch,
      companyId: userFilterCompanyId,
      role: userFilterRole,
      status: userFilterStatus,
    });

    // Si solo hay filtro de búsqueda y ya tenemos datos cargados, filtrar localmente
    const hasApiFilters =
      userFilterCompanyId || userFilterRole || userFilterStatus;
    const hasSearchFilter = userFilterSearch.trim();

    if (hasSearchFilter && !hasApiFilters && allUsersData) {
      console.log(
        '🔍 [handleUserFilter] Aplicando solo filtro de búsqueda local'
      );
      const searchTerm = userFilterSearch.trim().toLowerCase();

      const filteredUsers = allUsersData.data.users.filter(
        (user: CompanyUser) => {
          const searchInName = user.firstName
            ?.toLowerCase()
            .includes(searchTerm);
          const searchInLastName = user.lastName
            ?.toLowerCase()
            .includes(searchTerm);
          const searchInEmail = user.email?.toLowerCase().includes(searchTerm);
          return searchInName || searchInLastName || searchInEmail;
        }
      );

      console.log(
        `🔍 [handleUserFilter] Filtro local: ${filteredUsers.length} de ${allUsersData.data.users.length} usuarios`
      );

      // Crear respuesta con usuarios filtrados localmente
      const filteredData: GetAllUsersResponse = {
        ...allUsersData,
        data: {
          ...allUsersData.data,
          users: filteredUsers,
          total: filteredUsers.length,
          page: 1, // Resetear a página 1 en filtrado local
        },
      };

      setUsersData(filteredData);
      setUsersPage(1);
      setFiltersApplied(true);
    } else {
      console.log(
        '🔍 [handleUserFilter] Hay filtros de API activos, llamando al backend'
      );
      // Resetear a página 1 y aplicar filtros (incluyendo búsqueda local después)
      setUsersPage(1);
      await fetchUsers(1);
    }

    setFiltersApplied(true); // Marcar que se han aplicado filtros manualmente
  };

  // Función para limpiar filtros
  const handleClearFilters = async () => {
    console.log('🔄 [handleClearFilters] Limpiando todos los filtros');

    // Limpiar todos los filtros de forma síncrona
    setUserFilterSearch('');
    setUserFilterCompanyId('');
    setUserFilterRole('');
    setUserFilterStatus('');
    setUsersPage(1);
    setFiltersApplied(false); // Resetear el estado de filtros aplicados

    // Hacer fetch con filtros completamente vacíos para obtener todos los usuarios
    // Usar ignoreSearch=true y useCustomFiltersOnly=true para ignorar estados antiguos
    await fetchUsers(
      1,
      {
        companyId: undefined,
        role: undefined,
        status: undefined,
      },
      true, // ignoreSearch = true
      true // useCustomFiltersOnly = true
    );

    console.log('✅ [handleClearFilters] Filtros limpiados y datos recargados');
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
  const fetchUsers = async (
    page = 1,
    customFilters: Partial<{
      companyId: string | undefined;
      role: string | undefined;
      status: string | undefined;
    }> = {},
    ignoreSearch = false,
    useCustomFiltersOnly = false // Nuevo parámetro para usar solo customFilters
  ) => {
    setUsersLoading(true);
    setUsersError(null);
    try {
      // Solo enviamos a la API los filtros que el backend soporta (NO search)
      const apiFilters: any = {
        page,
        limit: usersLimit,
        // Si useCustomFiltersOnly=true, solo usar customFilters, sino hacer fallback a estados
        companyId: useCustomFiltersOnly
          ? customFilters.companyId
          : customFilters.companyId !== undefined
            ? customFilters.companyId
            : userFilterCompanyId || undefined,
        role: useCustomFiltersOnly
          ? customFilters.role
          : customFilters.role !== undefined
            ? customFilters.role
            : userFilterRole || undefined,
        status: useCustomFiltersOnly
          ? customFilters.status
          : customFilters.status !== undefined
            ? customFilters.status
            : userFilterStatus || undefined,
      };

      // Remover filtros undefined para limpiar la query
      Object.keys(apiFilters).forEach((key) => {
        if (apiFilters[key] === undefined) {
          delete apiFilters[key];
        }
      });

      console.log(
        '🔍 [fetchUsers] Llamando a API con filtros (SIN search):',
        apiFilters
      );

      const data = await SuperAdminService.getAllUsers(apiFilters);

      console.log('📊 [fetchUsers] Respuesta del backend:', {
        total: data.data.total,
        usersCount: data.data.users.length,
        page: data.data.page,
      });

      // Guardar datos originales sin filtrar localmente
      setAllUsersData(data);

      // Aplicar filtro de búsqueda local si existe Y no se está ignorando
      const searchTerm = !ignoreSearch
        ? userFilterSearch.trim().toLowerCase()
        : '';
      if (searchTerm) {
        console.log(
          '🔍 [fetchUsers] Aplicando filtro de búsqueda local para:',
          searchTerm
        );

        const filteredUsers = data.data.users.filter((user: CompanyUser) => {
          const searchInName = user.firstName
            ?.toLowerCase()
            .includes(searchTerm);
          const searchInLastName = user.lastName
            ?.toLowerCase()
            .includes(searchTerm);
          const searchInEmail = user.email?.toLowerCase().includes(searchTerm);
          return searchInName || searchInLastName || searchInEmail;
        });

        console.log(
          `🔍 [fetchUsers] Filtro local aplicado: ${filteredUsers.length} de ${data.data.users.length} usuarios coinciden`
        );

        // Crear respuesta con usuarios filtrados localmente
        const filteredData: GetAllUsersResponse = {
          ...data,
          data: {
            ...data.data,
            users: filteredUsers,
            total: filteredUsers.length, // Actualizar total con los resultados filtrados
          },
        };

        setUsersData(filteredData);
      } else {
        // Sin búsqueda, mostrar todos los datos de la API
        setUsersData(data);
      }

      console.log('✅ [fetchUsers] Proceso completado exitosamente');
    } catch (e: any) {
      console.error('❌ [fetchUsers] Error:', e);
      setUsersError(e.message || 'Error al cargar usuarios');
    } finally {
      setUsersLoading(false);
    }
  };

  useEffect(() => {
    // Solo hacer fetch cuando cambie la página si no tenemos filtros locales activos
    const hasLocalSearchFilter =
      userFilterSearch.trim() &&
      !(userFilterCompanyId || userFilterRole || userFilterStatus);

    if (!hasLocalSearchFilter) {
      // Sin filtros locales, cargar usuarios normalmente desde la API
      fetchUsers(usersPage);
    } else {
      // Con filtros locales activos, re-aplicar el filtro sobre los datos existentes
      console.log(
        '🔍 [useEffect] Filtro local activo, manteniendo filtrado local'
      );
      if (allUsersData) {
        handleUserFilter(); // Re-aplicar filtro local
      }
    }
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
              <div className="admin-dashboard__table-container">
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
                                  background: 'var(--card-bg)',
                                  padding: 16,
                                  borderRadius: 8,
                                  border: '1px solid var(--border-color)',
                                }}
                              >
                                <div
                                  style={{
                                    display: 'flex',
                                    flexWrap: 'wrap',
                                    gap: 12,
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
                                    style={{ flex: 1, minWidth: 200 }}
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
                                    style={{ flex: 1, minWidth: 150 }}
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
                                    style={{ flex: 1, minWidth: 200 }}
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
                                    style={{ flex: 1, minWidth: 200 }}
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
                                    style={{ flex: 1, minWidth: 150 }}
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
                                    style={{ flex: 1, minWidth: 130 }}
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
                                    style={{ flex: 1, minWidth: 150 }}
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
                                    style={{ flex: 1, minWidth: 150 }}
                                  />
                                  <select
                                    value={editCompanyForm.status}
                                    onChange={(e) =>
                                      setEditCompanyForm((f) => ({
                                        ...f,
                                        status: e.target.value as CompanyStatus,
                                      }))
                                    }
                                    style={{ flex: 1, minWidth: 120 }}
                                  >
                                    <option value="active">Activa</option>
                                    <option value="suspended">
                                      Suspendida
                                    </option>
                                    <option value="trial">Prueba</option>
                                    <option value="inactive">Inactiva</option>
                                  </select>
                                </div>
                                <div
                                  className="admin-dashboard__table-actions"
                                  style={{ marginTop: 12 }}
                                >
                                  <button
                                    type="submit"
                                    className="admin-dashboard__table-button"
                                    disabled={loading}
                                  >
                                    Guardar cambios
                                  </button>
                                  <button
                                    type="button"
                                    className="admin-dashboard__table-button"
                                    style={{
                                      background: 'var(--secondary-bg)',
                                      color: 'var(--text-color)',
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
                            <td>
                              <strong>{c.name}</strong>
                            </td>
                            <td>
                              <code
                                style={{
                                  background: 'var(--secondary-bg)',
                                  padding: '2px 6px',
                                  borderRadius: '4px',
                                  fontSize: '0.85em',
                                }}
                              >
                                {c.slug || '-'}
                              </code>
                            </td>
                            <td
                              style={{
                                maxWidth: 200,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                              }}
                            >
                              {c.description || '-'}
                            </td>
                            <td>{c.adminEmail || '-'}</td>
                            <td>
                              {c.website ? (
                                <a
                                  href={c.website}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{
                                    color: 'var(--primary-color)',
                                    textDecoration: 'none',
                                  }}
                                >
                                  {c.website.length > 20
                                    ? `${c.website.substring(0, 20)}...`
                                    : c.website}
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
                                    maxWidth: 32,
                                    maxHeight: 32,
                                    borderRadius: 6,
                                  }}
                                />
                              ) : (
                                '-'
                              )}
                            </td>
                            <td
                              style={{
                                maxWidth: 150,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                              }}
                            >
                              {c.address || '-'}
                            </td>
                            <td>
                              <span
                                className={`admin-dashboard__status-badge admin-dashboard__status-badge--${c.status || 'inactive'}`}
                              >
                                {c.status || 'inactive'}
                              </span>
                            </td>
                            <td>
                              <div className="admin-dashboard__table-actions">
                                <button
                                  className="admin-dashboard__table-button admin-dashboard__table-button--edit"
                                  onClick={() => startEditCompany(c)}
                                >
                                  Editar
                                </button>
                              </div>
                            </td>
                          </tr>
                        )}
                        <tr>
                          <td colSpan={10}>
                            {/* Licencia UI restored */}
                            {editingLicense[c.id] ? (
                              <div className="admin-dashboard__license-form">
                                <div className="admin-dashboard__license-form-header">
                                  <h4>
                                    {c.license
                                      ? '✏️ Editar Licencia'
                                      : '➕ Crear Nueva Licencia'}
                                  </h4>
                                  <button
                                    type="button"
                                    className="admin-dashboard__close-button"
                                    onClick={() => cancelEditLicense(c.id)}
                                  >
                                    ✕
                                  </button>
                                </div>
                                <form
                                  onSubmit={(e) => {
                                    e.preventDefault();
                                    if (c.license) {
                                      handleUpdateLicense(c.id);
                                    } else {
                                      handleCreateLicense(c.id);
                                    }
                                  }}
                                >
                                  <div className="admin-dashboard__license-grid">
                                    <div className="admin-dashboard__form-group">
                                      <label>Tipo de Plan</label>
                                      <select
                                        value={
                                          licenseForms[c.id]?.planType || 'free'
                                        }
                                        onChange={(e) =>
                                          handleLicenseInputChange(
                                            c.id,
                                            'planType',
                                            e.target.value
                                          )
                                        }
                                      >
                                        <option value="free">Gratuito</option>
                                        <option value="starter">
                                          Iniciador
                                        </option>
                                        <option value="professional">
                                          Profesional
                                        </option>
                                        <option value="enterprise">
                                          Empresarial
                                        </option>
                                        <option value="custom">
                                          Personalizado
                                        </option>
                                      </select>
                                    </div>
                                    <div className="admin-dashboard__form-group">
                                      <label>Máximo Usuarios</label>
                                      <input
                                        type="number"
                                        min="1"
                                        value={
                                          licenseForms[c.id]?.maxUsers || ''
                                        }
                                        onChange={(e) =>
                                          handleLicenseInputChange(
                                            c.id,
                                            'maxUsers',
                                            Number(e.target.value)
                                          )
                                        }
                                      />
                                    </div>
                                    <div className="admin-dashboard__form-group">
                                      <label>Máximo Proyectos</label>
                                      <input
                                        type="number"
                                        min="1"
                                        value={
                                          licenseForms[c.id]?.maxProjects || ''
                                        }
                                        onChange={(e) =>
                                          handleLicenseInputChange(
                                            c.id,
                                            'maxProjects',
                                            Number(e.target.value)
                                          )
                                        }
                                      />
                                    </div>
                                    <div className="admin-dashboard__form-group">
                                      <label>Almacenamiento (MB)</label>
                                      <input
                                        type="number"
                                        min="0"
                                        value={
                                          licenseForms[c.id]?.maxStorageMB || ''
                                        }
                                        onChange={(e) =>
                                          handleLicenseInputChange(
                                            c.id,
                                            'maxStorageMB',
                                            Number(e.target.value)
                                          )
                                        }
                                      />
                                    </div>
                                    <div className="admin-dashboard__form-group">
                                      <label>Fecha de Inicio</label>
                                      <input
                                        type="date"
                                        value={
                                          licenseForms[c.id]?.startDate || ''
                                        }
                                        onChange={(e) =>
                                          handleLicenseInputChange(
                                            c.id,
                                            'startDate',
                                            e.target.value
                                          )
                                        }
                                      />
                                    </div>
                                    <div className="admin-dashboard__form-group">
                                      <label>Fecha de Fin</label>
                                      <input
                                        type="date"
                                        value={
                                          licenseForms[c.id]?.endDate || ''
                                        }
                                        onChange={(e) =>
                                          handleLicenseInputChange(
                                            c.id,
                                            'endDate',
                                            e.target.value
                                          )
                                        }
                                      />
                                    </div>
                                    <div className="admin-dashboard__form-group">
                                      <label>Precio Mensual ($)</label>
                                      <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={
                                          licenseForms[c.id]?.monthlyPrice || ''
                                        }
                                        onChange={(e) =>
                                          handleLicenseInputChange(
                                            c.id,
                                            'monthlyPrice',
                                            Number(e.target.value)
                                          )
                                        }
                                      />
                                    </div>
                                    <div className="admin-dashboard__form-group">
                                      <label>Precio Anual ($)</label>
                                      <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={
                                          licenseForms[c.id]?.yearlyPrice || ''
                                        }
                                        onChange={(e) =>
                                          handleLicenseInputChange(
                                            c.id,
                                            'yearlyPrice',
                                            Number(e.target.value)
                                          )
                                        }
                                      />
                                    </div>
                                  </div>
                                  <div className="admin-dashboard__checkbox-group">
                                    <label className="admin-dashboard__checkbox-label">
                                      <input
                                        type="checkbox"
                                        checked={
                                          !!licenseForms[c.id]?.customBranding
                                        }
                                        onChange={(e) =>
                                          handleLicenseInputChange(
                                            c.id,
                                            'customBranding',
                                            e.target.checked
                                          )
                                        }
                                      />
                                      <span>🎨 Branding Personalizado</span>
                                    </label>
                                  </div>
                                  <div className="admin-dashboard__form-actions">
                                    <button
                                      type="submit"
                                      className="admin-dashboard__button admin-dashboard__button--success"
                                      disabled={licenseLoading[c.id]}
                                    >
                                      {licenseLoading[c.id]
                                        ? '⏳ Guardando...'
                                        : c.license
                                          ? '💾 Actualizar Licencia'
                                          : '➕ Crear Licencia'}
                                    </button>
                                    <button
                                      type="button"
                                      className="admin-dashboard__button admin-dashboard__button--secondary"
                                      onClick={() => cancelEditLicense(c.id)}
                                    >
                                      ✕ Cancelar
                                    </button>
                                  </div>
                                </form>
                              </div>
                            ) : (
                              <div className="admin-dashboard__license-info-container">
                                {c.license ? (
                                  <div>
                                    <div className="admin-dashboard__license-info-header">
                                      <h5>📋 Información de Licencia</h5>
                                      <button
                                        className="admin-dashboard__table-button admin-dashboard__table-button--edit"
                                        onClick={() => startEditLicense(c)}
                                      >
                                        ✏️ Editar
                                      </button>
                                    </div>
                                    <div className="admin-dashboard__license-info">
                                      <div className="admin-dashboard__license-item">
                                        <span className="admin-dashboard__license-label">
                                          📦 Plan:
                                        </span>
                                        <span
                                          className={`admin-dashboard__status-badge admin-dashboard__status-badge--${c.license.planType === 'enterprise' || c.license.planType === 'professional' ? 'active' : c.license.planType === 'starter' ? 'trial' : 'inactive'}`}
                                        >
                                          {c.license.planType || '-'}
                                        </span>
                                      </div>
                                      <div className="admin-dashboard__license-item">
                                        <span className="admin-dashboard__license-label">
                                          👥 Máx. Usuarios:
                                        </span>
                                        <span>{c.license.maxUsers || '-'}</span>
                                      </div>
                                      <div className="admin-dashboard__license-item">
                                        <span className="admin-dashboard__license-label">
                                          📁 Proyectos:
                                        </span>
                                        <span>
                                          {c.license.maxProjects || '-'}
                                        </span>
                                      </div>
                                      <div className="admin-dashboard__license-item">
                                        <span className="admin-dashboard__license-label">
                                          💾 Almacenamiento:
                                        </span>
                                        <span>
                                          {c.license.maxStorageMB
                                            ? `${c.license.maxStorageMB} MB`
                                            : '-'}
                                        </span>
                                      </div>
                                      <div className="admin-dashboard__license-item">
                                        <span className="admin-dashboard__license-label">
                                          🎨 Custom Branding:
                                        </span>
                                        <span
                                          className={`admin-dashboard__status-badge admin-dashboard__status-badge--${c.license.customBranding ? 'active' : 'inactive'}`}
                                        >
                                          {c.license.customBranding
                                            ? 'Activado'
                                            : 'Desactivado'}
                                        </span>
                                      </div>
                                      <div className="admin-dashboard__license-item">
                                        <span className="admin-dashboard__license-label">
                                          📅 Vigencia:
                                        </span>
                                        <span>
                                          {c.license.startDate &&
                                          c.license.endDate
                                            ? `${c.license.startDate} → ${c.license.endDate}`
                                            : '-'}
                                        </span>
                                      </div>
                                      <div className="admin-dashboard__license-item">
                                        <span className="admin-dashboard__license-label">
                                          💰 Precios:
                                        </span>
                                        <span>
                                          {c.license.monthlyPrice
                                            ? `$${c.license.monthlyPrice}/mes`
                                            : ''}
                                          {c.license.monthlyPrice &&
                                          c.license.yearlyPrice
                                            ? ' • '
                                            : ''}
                                          {c.license.yearlyPrice
                                            ? `$${c.license.yearlyPrice}/año`
                                            : ''}
                                          {!c.license.monthlyPrice &&
                                          !c.license.yearlyPrice
                                            ? '-'
                                            : ''}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="admin-dashboard__empty-license">
                                    <div className="admin-dashboard__empty-license-icon">
                                      📄
                                    </div>
                                    <p>Sin licencia asignada</p>
                                    <button
                                      className="admin-dashboard__button admin-dashboard__button--primary"
                                      onClick={() => startEditLicense(c)}
                                    >
                                      ➕ Crear licencia
                                    </button>
                                  </div>
                                )}
                              </div>
                            )}
                          </td>
                        </tr>
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* Sección: Listado de Usuarios */}
          <section className="admin-dashboard__section">
            <div className="admin-dashboard__section-title">
              Usuarios registrados
            </div>
            {/* Filtros de usuarios */}
            <div className="admin-dashboard__filters">
              <div className="admin-dashboard__filters-title">
                🔍 Filtros de búsqueda
              </div>
              <form
                className={`admin-dashboard__filters-form ${usersLoading ? 'loading' : ''}`}
                onSubmit={handleUserFilter}
              >
                <div className="admin-dashboard__form-group">
                  <label>🔎 Buscar</label>
                  <input
                    type="text"
                    placeholder="Buscar por nombre, apellido o email..."
                    value={userFilterSearch}
                    onChange={(e) => {
                      setUserFilterSearch(e.target.value);
                      setFiltersApplied(false); // Resetear estado cuando se cambia búsqueda
                    }}
                  />
                  {userFilterSearch && !filtersApplied && (
                    <small
                      style={{
                        color: 'var(--warning-color, #ff9800)',
                        fontSize: '0.8rem',
                        marginTop: '0.25rem',
                        display: 'block',
                      }}
                    >
                      💡 Presiona "Filtrar" para aplicar la búsqueda
                    </small>
                  )}
                </div>
                <div className="admin-dashboard__form-group">
                  <label>🏢 Empresa</label>
                  <select
                    value={userFilterCompanyId}
                    onChange={(e) => {
                      setUserFilterCompanyId(e.target.value);
                      setFiltersApplied(false); // Resetear estado cuando se cambia filtro
                    }}
                  >
                    <option value="">Todas las empresas</option>
                    {companiesData.data.companies.map((c: Company) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="admin-dashboard__form-group">
                  <label>👤 Rol</label>
                  <select
                    value={userFilterRole}
                    onChange={(e) => {
                      setUserFilterRole(e.target.value);
                      setFiltersApplied(false); // Resetear estado cuando se cambia filtro
                    }}
                  >
                    <option value="">Todos los roles</option>
                    <option value="user">Usuario</option>
                    <option value="manager">Manager</option>
                    <option value="company_admin">Admin empresa</option>
                    <option value="viewer">Solo lectura</option>
                  </select>
                </div>
                <div className="admin-dashboard__form-group">
                  <label>📊 Estado</label>
                  <select
                    value={userFilterStatus}
                    onChange={(e) => {
                      setUserFilterStatus(e.target.value);
                      setFiltersApplied(false); // Resetear estado cuando se cambia filtro
                    }}
                  >
                    <option value="">Todos los estados</option>
                    <option value="active">Activo</option>
                    <option value="inactive">Inactivo</option>
                    <option value="suspended">Suspendido</option>
                    <option value="pending">Pendiente</option>
                  </select>
                </div>
                <div className="admin-dashboard__filters-actions">
                  <button
                    type="submit"
                    className="admin-dashboard__button admin-dashboard__button--primary"
                    disabled={usersLoading}
                  >
                    {usersLoading ? '⏳ Filtrando...' : '🔍 Filtrar'}
                  </button>
                  <button
                    type="button"
                    className="admin-dashboard__button admin-dashboard__button--secondary"
                    onClick={handleClearFilters}
                    disabled={usersLoading}
                  >
                    {usersLoading ? '⏳ Limpiando...' : '🔄 Limpiar'}
                  </button>
                </div>
              </form>
            </div>
            {/* Botón exportar CSV */}
            <button
              className="admin-dashboard__table-button"
              style={{
                marginBottom: 16,
                background: 'var(--success-color, #28a745)',
                color: 'white',
              }}
              onClick={exportUsersToCSV}
              disabled={!usersData || !usersData.data.users.length}
            >
              📊 Exportar CSV
            </button>
            {usersLoading ? (
              <div
                style={{
                  textAlign: 'center',
                  padding: '2rem',
                  color: 'var(--text-secondary)',
                }}
              >
                ⏳ Cargando usuarios...
              </div>
            ) : usersError ? (
              <div className="admin-dashboard__error">{usersError}</div>
            ) : usersData && usersData.data.users.length > 0 ? (
              <>
                {/* Mostrar información de filtros aplicados solo después de filtrar manualmente */}
                {filtersApplied &&
                  (userFilterSearch ||
                    userFilterCompanyId ||
                    userFilterRole ||
                    userFilterStatus) && (
                    <div
                      style={{
                        background: 'var(--info-bg, #e3f2fd)',
                        border: '1px solid var(--info-color, #2196f3)',
                        borderRadius: '8px',
                        padding: '0.75rem',
                        marginBottom: '1rem',
                        fontSize: '0.9rem',
                        color: 'var(--info-text, #1976d2)',
                      }}
                    >
                      🔍 <strong>Filtros aplicados:</strong>{' '}
                      {userFilterSearch && (
                        <span>
                          Búsqueda: "{userFilterSearch}" (filtro local){' '}
                        </span>
                      )}
                      {userFilterCompanyId && (
                        <span>
                          Empresa:{' '}
                          {
                            companiesData.data.companies.find(
                              (c) => c.id === userFilterCompanyId
                            )?.name
                          }{' '}
                        </span>
                      )}
                      {userFilterRole && <span>Rol: {userFilterRole} </span>}
                      {userFilterStatus && (
                        <span>Estado: {userFilterStatus} </span>
                      )}
                      <span>
                        • {usersData?.data.total || 0} resultado(s)
                        encontrado(s)
                      </span>
                    </div>
                  )}
                <div className="admin-dashboard__table-container">
                  <table
                    className={`admin-dashboard__table ${usersLoading ? 'loading' : ''}`}
                  >
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
                          <td>
                            <strong>{u.firstName}</strong>
                          </td>
                          <td>{u.lastName}</td>
                          <td>
                            <a
                              href={`mailto:${u.email}`}
                              style={{
                                color: 'var(--primary-color)',
                                textDecoration: 'none',
                              }}
                            >
                              {u.email}
                            </a>
                          </td>
                          <td>
                            <code
                              style={{
                                background: 'var(--secondary-bg)',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                fontSize: '0.85em',
                              }}
                            >
                              {u.role}
                            </code>
                          </td>
                          <td>
                            <span
                              className={`admin-dashboard__status-badge admin-dashboard__status-badge--${u.status === 'active' ? 'active' : 'inactive'}`}
                            >
                              {u.status}
                            </span>
                          </td>
                          <td>{u.company?.name ?? '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="admin-dashboard__pagination">
                  <div className="admin-dashboard__pagination-info">
                    <span className="admin-dashboard__pagination-text">
                      Mostrando{' '}
                      <strong>
                        {(usersData.data.page - 1) * usersData.data.limit + 1}
                      </strong>{' '}
                      a{' '}
                      <strong>
                        {Math.min(
                          usersData.data.page * usersData.data.limit,
                          usersData.data.total
                        )}
                      </strong>{' '}
                      de <strong>{usersData.data.total}</strong> usuarios
                    </span>
                  </div>
                  <div className="admin-dashboard__pagination-controls">
                    <button
                      className="admin-dashboard__pagination-button admin-dashboard__pagination-button--prev"
                      disabled={usersPage === 1}
                      onClick={() => setUsersPage((p) => Math.max(1, p - 1))}
                      title="Página anterior"
                    >
                      <span className="admin-dashboard__pagination-icon">
                        ‹
                      </span>
                      <span className="admin-dashboard__pagination-label">
                        Anterior
                      </span>
                    </button>
                    <div className="admin-dashboard__pagination-pages">
                      {(() => {
                        const totalPages = Math.ceil(
                          usersData.data.total / usersData.data.limit
                        );
                        const currentPage = usersData.data.page;
                        const pages = [];

                        // Mostrar páginas alrededor de la actual
                        const startPage = Math.max(1, currentPage - 2);
                        const endPage = Math.min(totalPages, currentPage + 2);

                        // Primera página
                        if (startPage > 1) {
                          pages.push(
                            <button
                              key={1}
                              className="admin-dashboard__pagination-number"
                              onClick={() => setUsersPage(1)}
                            >
                              1
                            </button>
                          );
                          if (startPage > 2) {
                            pages.push(
                              <span
                                key="dots1"
                                className="admin-dashboard__pagination-dots"
                              >
                                ...
                              </span>
                            );
                          }
                        }

                        // Páginas del rango
                        for (let i = startPage; i <= endPage; i++) {
                          pages.push(
                            <button
                              key={i}
                              className={`admin-dashboard__pagination-number ${
                                i === currentPage
                                  ? 'admin-dashboard__pagination-number--active'
                                  : ''
                              }`}
                              onClick={() => setUsersPage(i)}
                            >
                              {i}
                            </button>
                          );
                        }

                        // Última página
                        if (endPage < totalPages) {
                          if (endPage < totalPages - 1) {
                            pages.push(
                              <span
                                key="dots2"
                                className="admin-dashboard__pagination-dots"
                              >
                                ...
                              </span>
                            );
                          }
                          pages.push(
                            <button
                              key={totalPages}
                              className="admin-dashboard__pagination-number"
                              onClick={() => setUsersPage(totalPages)}
                            >
                              {totalPages}
                            </button>
                          );
                        }

                        return pages;
                      })()}
                    </div>
                    <button
                      className="admin-dashboard__pagination-button admin-dashboard__pagination-button--next"
                      disabled={
                        usersData.data.page * usersData.data.limit >=
                        usersData.data.total
                      }
                      onClick={() => setUsersPage((p) => p + 1)}
                      title="Página siguiente"
                    >
                      <span className="admin-dashboard__pagination-label">
                        Siguiente
                      </span>
                      <span className="admin-dashboard__pagination-icon">
                        ›
                      </span>
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div
                style={{
                  textAlign: 'center',
                  padding: '2rem',
                  color: 'var(--text-secondary)',
                  fontStyle: 'italic',
                }}
              >
                No hay usuarios registrados.
              </div>
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

      {activeTab === 'stats' && <AnalyticsDashboard />}
    </Tabs>
  );
}
