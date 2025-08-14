<template>
  <div class="users-with-roles-table">
    <div class="card">
      <div class="card-header">
        <h5 class="mb-0">
          <Users class="icon me-2" />
          Пользователи системы
        </h5>
      </div>
      <div class="card-body">
        <div v-if="loading" class="text-center">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Загрузка...</span>
          </div>
        </div>
        
        <div v-else-if="users.length > 0" class="table-responsive">
          <table class="table table-hover">
            <thead>
              <tr>
                <th>Пользователь</th>
                <th>Email</th>
                <th>Роль</th>
                <th>Статус</th>
                <th>Дата регистрации</th>
                 <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in users" :key="user.id">
                <td>
                  <div class="user-info">
                    <div class="user-avatar">
                      <User class="icon-sm" />
                    </div>
                    <div class="user-details">
                      <div class="user-name">
                        {{ getUserFullName(user) }}
                      </div>
                      <small class="text-muted">@{{ user.username }}</small>
                    </div>
                  </div>
                </td>
                <td>
                  <span class="email">{{ user.email || '—' }}</span>
                </td>
                <td>
                  <div class="role-info">
                    <span 
                      class="badge"
                      :class="getRoleBadgeClass(user.role_name)"
                    >
                      {{ user.role_name }}
                    </span>
                  </div>
                </td>
                <td>
                  <span 
                    class="badge"
                    :class="user.is_active ? 'bg-success' : 'bg-danger'"
                  >
                    {{ user.is_active ? 'Активен' : 'Неактивен' }}
                  </span>
                </td>
                <td>
                  <span class="date">{{ formatDate(user.date_joined) }}</span>
                </td>
                <td>
                  <div class="btn-group btn-group-sm">
                    <button 
                      class="btn btn-outline-primary" 
                      @click="viewUser(user)"
                      title="Просмотреть"
                    >
                      <Eye class="icon" />
                    </button>
                    <button 
                      class="btn btn-outline-secondary" 
                      @click="openEditUser(user)"
                      title="Редактировать"
                    >
                      <Edit class="icon" />
                    </button>
                    <button 
                      class="btn btn-outline-warning" 
                      @click="toggleUserStatus(user)"
                      :title="user.is_active ? 'Деактивировать' : 'Активировать'"
                    >
                      <component :is="user.is_active ? UserX : UserCheck" class="icon" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div v-else class="text-center text-muted">
          <Users class="icon-lg mb-3" />
          <p>Пользователи не найдены</p>
        </div>
      </div>
    </div>

    <!-- Модальное окно просмотра пользователя -->
    <div class="modal fade" :class="{ show: showUserModal }" 
         :style="{ display: showUserModal ? 'block' : 'none' }">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Информация о пользователе</h5>
            <button type="button" class="btn-close" @click="closeUserModal"></button>
          </div>
          <div class="modal-body" v-if="selectedUser">
            <div class="row">
              <div class="col-md-6">
                <div class="mb-3">
                  <label class="form-label fw-bold">Имя пользователя:</label>
                  <p>{{ selectedUser.username }}</p>
                </div>
                
                <div class="mb-3">
                  <label class="form-label fw-bold">Email:</label>
                  <p>{{ selectedUser.email || 'Не указан' }}</p>
                </div>
                
                <div class="mb-3">
                  <label class="form-label fw-bold">Имя:</label>
                  <p>{{ selectedUser.first_name || 'Не указано' }}</p>
                </div>
                
                <div class="mb-3">
                  <label class="form-label fw-bold">Фамилия:</label>
                  <p>{{ selectedUser.last_name || 'Не указано' }}</p>
                </div>
              </div>
              
              <div class="col-md-6">
                <div class="mb-3">
                  <label class="form-label fw-bold">Роль:</label>
                  <div>
                    <span 
                      class="badge fs-6"
                      :class="getRoleBadgeClass(selectedUser.role_name)"
                    >
                      {{ selectedUser.role_name }}
                    </span>
                  </div>
                </div>
                
                <div class="mb-3">
                  <label class="form-label fw-bold">Статус:</label>
                  <div>
                    <span 
                      class="badge"
                      :class="selectedUser.is_active ? 'bg-success' : 'bg-danger'"
                    >
                      {{ selectedUser.is_active ? 'Активен' : 'Неактивен' }}
                    </span>
                  </div>
                </div>
                
                <div class="mb-3">
                  <label class="form-label fw-bold">Дата регистрации:</label>
                  <p>{{ formatDate(selectedUser.date_joined) }}</p>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="closeUserModal">
              Закрыть
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Модальное окно редактирования пользователя -->
    <div class="modal fade" :class="{ show: showEditModal }" :style="{ display: showEditModal ? 'block' : 'none' }">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Редактирование пользователя</h5>
            <button type="button" class="btn-close" @click="closeEditModal"></button>
          </div>
          <div class="modal-body" v-if="editForm">
            <div class="mb-3">
              <label class="form-label">Email</label>
              <input type="email" class="form-control" v-model="editForm.email" />
            </div>
            <div class="row">
              <div class="col-md-6">
                <div class="mb-3">
                  <label class="form-label">Имя</label>
                  <input type="text" class="form-control" v-model="editForm.first_name" />
                </div>
              </div>
              <div class="col-md-6">
                <div class="mb-3">
                  <label class="form-label">Фамилия</label>
                  <input type="text" class="form-control" v-model="editForm.last_name" />
                </div>
              </div>
            </div>
            <div class="mb-3">
              <label class="form-label">Роль</label>
              <select class="form-select" v-model="editForm.role">
                <option v-for="role in roles" :key="role.id" :value="role.id">{{ role.name }}</option>
              </select>
            </div>
            <div class="form-check form-switch mb-3">
              <input class="form-check-input" type="checkbox" id="isActiveSwitch" v-model="editForm.is_active">
              <label class="form-check-label" for="isActiveSwitch">Активен</label>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="closeEditModal">Отмена</button>
            <button type="button" class="btn btn-primary" @click="saveEdit" :disabled="saving">
              {{ saving ? 'Сохранение...' : 'Сохранить' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Оверлей для модальных окон -->
    <div 
      v-if="showUserModal || showEditModal" 
      class="modal-backdrop fade show"
      @click="showUserModal ? closeUserModal() : closeEditModal()"
    ></div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { 
  Users, 
  User, 
  Eye, 
  Edit, 
  UserX, 
  UserCheck 
} from 'lucide-vue-next'
import { useToast } from 'vue-toastification'
import apiService from '@/js/apiService'

export default {
  name: 'UsersWithRolesTable',
  components: {
    Users,
    User,
    Eye,
    Edit,
    UserX,
    UserCheck
  },
  setup() {
    const toast = useToast()
    const users = ref([])
    const loading = ref(true)
    const showUserModal = ref(false)
    const selectedUser = ref(null)
    const showEditModal = ref(false)
    const editForm = ref(null)
    const saving = ref(false)
    const roles = ref([])

    const loadUsers = async () => {
      try {
        const response = await apiService.get('/api/cms/user-profiles/users_with_roles/')
        users.value = response.data
      } catch (error) {
        console.error('Ошибка загрузки пользователей:', error)
        toast.error('Не удалось загрузить список пользователей')
      } finally {
        loading.value = false
      }
    }

    const getUserFullName = (user) => {
      const firstName = user.first_name || ''
      const lastName = user.last_name || ''
      
      if (firstName && lastName) {
        return `${firstName} ${lastName}`
      } else if (firstName) {
        return firstName
      } else if (lastName) {
        return lastName
      } else {
        return user.username
      }
    }

    const getRoleBadgeClass = (roleName) => {
      const roleClasses = {
        'Администратор': 'bg-danger',
        'Гость': 'bg-secondary',
        'Модератор': 'bg-warning',
        'Пользователь': 'bg-info'
      }
      
      return roleClasses[roleName] || 'bg-secondary'
    }

    const formatDate = (dateString) => {
      if (!dateString) return '—'
      return new Date(dateString).toLocaleDateString('ru-RU', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    }

    const viewUser = (user) => {
      selectedUser.value = user
      showUserModal.value = true
    }

    const openEditUser = async (user) => {
      try {
        // Загрузим список ролей для выбора
        const rolesResp = await apiService.get('/api/cms/user-roles/')
        roles.value = rolesResp.data

        editForm.value = {
          profile_id: user.profile_id,
          user_id: user.id,
          email: user.email || '',
          first_name: user.first_name || '',
          last_name: user.last_name || '',
          role: user.role_id || null,
          is_active: !!user.is_active,
        }
        showEditModal.value = true
      } catch (e) {
        console.error(e)
        toast.error('Не удалось открыть форму редактирования')
      }
    }

    const toggleUserStatus = async (user) => {
      const action = user.is_active ? 'деактивировать' : 'активировать'
      if (!confirm(`Вы уверены, что хотите ${action} пользователя "${user.username}"?`)) return
      try {
        if (!user.profile_id) throw new Error('profile_id missing')
        await apiService.patch(`/api/cms/user-profiles/${user.profile_id}/`, { is_active: !user.is_active })
        user.is_active = !user.is_active
        toast.success(`Пользователь ${user.username} успешно ${action === 'деактивировать' ? 'деактивирован' : 'активирован'}`)
      } catch (error) {
        console.error('Ошибка изменения статуса пользователя:', error)
        toast.error('Не удалось изменить статус пользователя')
      }
    }

    const closeUserModal = () => {
      showUserModal.value = false
      selectedUser.value = null
    }

    const closeEditModal = () => {
      showEditModal.value = false
      editForm.value = null
    }

    const saveEdit = async () => {
      if (!editForm.value?.profile_id) {
        toast.error('Профиль пользователя не найден')
        return
      }
      try {
        saving.value = true
        // partial update профиля: роль и базовые поля
        await apiService.patch(`/api/cms/user-profiles/${editForm.value.profile_id}/`, {
          role: editForm.value.role,
          email: editForm.value.email,
          first_name: editForm.value.first_name,
          last_name: editForm.value.last_name,
          is_active: editForm.value.is_active,
        })
        toast.success('Пользователь обновлен')
        closeEditModal()
        await loadUsers()
      } catch (e) {
        console.error(e)
        toast.error('Не удалось сохранить изменения')
      } finally {
        saving.value = false
      }
    }

    onMounted(() => {
      loadUsers()
    })

    return {
      users,
      loading,
      showUserModal,
      selectedUser,
      showEditModal,
      editForm,
      roles,
      saving,
      getUserFullName,
      getRoleBadgeClass,
      formatDate,
      viewUser,
      openEditUser,
      toggleUserStatus,
      closeUserModal,
      closeEditModal,
      saveEdit
    }
  }
}
</script>

<style scoped>
.users-with-roles-table {
  margin-bottom: 20px;
}

.icon {
  width: 16px;
  height: 16px;
  vertical-align: middle;
}

.icon-sm {
  width: 14px;
  height: 14px;
  vertical-align: middle;
}

.icon-lg {
  width: 48px;
  height: 48px;
  vertical-align: middle;
}

.user-info {
  display: flex;
  align-items: center;
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: #e9ecef;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  color: #6c757d;
}

.user-details {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-weight: 500;
  color: #212529;
}

.email {
  color: #6c757d;
}

.role-info {
  display: flex;
  align-items: center;
}

.date {
  color: #6c757d;
  font-size: 0.875rem;
}

.card-header {
  background-color: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
}

.card-header h5 {
  color: #495057;
  font-weight: 600;
}

.modal.show {
  background-color: rgba(0, 0, 0, 0.5);
}

.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1040;
}

.modal {
  z-index: 1050;
}

.badge {
  font-size: 0.75rem;
  padding: 6px 10px;
}

.badge.fs-6 {
  font-size: 0.875rem !important;
  padding: 8px 12px;
}
</style>

