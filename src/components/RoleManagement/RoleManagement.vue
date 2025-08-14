<template>
  <div class="role-management">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2 class="mb-0">Управление ролями</h2>
      <button 
        class="btn btn-primary" 
        @click="showCreateModal = true"
        v-if="canCreateRoles"
      >
        <Plus class="icon" />
        Добавить роль
      </button>
    </div>

    <!-- Список ролей -->
    <div class="card">
      <div class="card-body">
        <div class="table-responsive">
          <table class="table table-hover">
            <thead>
              <tr>
                <th>Название</th>
                <th>Описание</th>
                <th>Модули</th>
                <th>Дата создания</th>
                <th>Дата изменения</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="role in roles" :key="role.id">
                <td>
                  <strong>{{ role.name }}</strong>
                  <span v-if="role.is_system" class="badge bg-info ms-2">Системная</span>
                </td>
                <td>{{ role.description || '—' }}</td>
                <td>
                  <span class="badge bg-secondary me-1">{{ role.modules_count }}</span>
                  <small class="text-muted">модулей</small>
                </td>
                <td>{{ formatDate(role.created_at) }}</td>
                <td>{{ formatDate(role.updated_at) }}</td>
                <td>
                  <div class="btn-group btn-group-sm">
                    <button 
                      class="btn btn-outline-primary" 
                      @click="editRole(role)"
                      :disabled="!role.is_editable"
                      title="Редактировать"
                    >
                      <Edit class="icon" />
                    </button>
                    <button 
                      class="btn btn-outline-danger" 
                      @click="deleteRole(role)"
                      :disabled="!role.is_deletable"
                      title="Удалить"
                    >
                      <Trash2 class="icon" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Модальное окно создания/редактирования роли -->
    <div class="modal fade" :class="{ show: showCreateModal || showEditModal }" 
         :style="{ display: (showCreateModal || showEditModal) ? 'block' : 'none' }">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              {{ isEditing ? 'Редактировать роль' : 'Создать роль' }}
            </h5>
            <button type="button" class="btn-close" @click="closeModal"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="saveRole">
              <div class="mb-3">
                <label class="form-label">Название роли *</label>
                <input 
                  type="text" 
                  class="form-control" 
                  v-model="roleForm.name"
                  :disabled="isEditing && !currentRole?.is_editable"
                  required
                />
              </div>
              
              <div class="mb-3">
                <label class="form-label">Описание</label>
                <textarea 
                  class="form-control" 
                  rows="3"
                  v-model="roleForm.description"
                  :disabled="isEditing && !currentRole?.is_editable"
                ></textarea>
              </div>
              
              <div class="mb-3">
                <label class="form-label">Доступные модули</label>
                <div class="module-tree">
                  <div 
                    v-for="module in availableModules" 
                    :key="module.id"
                    class="module-item"
                    :style="{ marginLeft: module.parent_module ? '20px' : '0' }"
                  >
                    <div class="form-check">
                      <input 
                        class="form-check-input" 
                        type="checkbox" 
                        :value="module.id"
                        v-model="roleForm.module_ids"
                        :disabled="isEditing && !currentRole?.is_editable"
                        :id="'module-' + module.id"
                      />
                      <label class="form-check-label" :for="'module-' + module.id">
                        {{ module.name }}
                        <small class="text-muted d-block">{{ module.description }}</small>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="closeModal">
              Отмена
            </button>
            <button 
              type="button" 
              class="btn btn-primary" 
              @click="saveRole"
              :disabled="!roleForm.name || loading"
            >
              <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
              {{ isEditing ? 'Сохранить' : 'Создать' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Оверлей для модального окна -->
    <div 
      v-if="showCreateModal || showEditModal" 
      class="modal-backdrop fade show"
      @click="closeModal"
    ></div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { Plus, Edit, Trash2 } from 'lucide-vue-next'
import { useToast } from 'vue-toastification'
import apiService from '@/js/apiService'

export default {
  name: 'RoleManagement',
  components: {
    Plus,
    Edit,
    Trash2
  },
  setup() {
    const toast = useToast()
    const roles = ref([])
    const availableModules = ref([])
    const showCreateModal = ref(false)
    const showEditModal = ref(false)
    const loading = ref(false)
    const currentRole = ref(null)
    
    const roleForm = ref({
      name: '',
      description: '',
      module_ids: []
    })

    const isEditing = computed(() => showEditModal.value)

    const canCreateRoles = computed(() => {
      // Проверяем, может ли текущий пользователь создавать роли
      // В реальном приложении это должно проверяться на бэкенде
      return true
    })

    const loadRoles = async () => {
      try {
        const response = await apiService.get('/api/cms/user-roles/')
        roles.value = response.data
      } catch (error) {
        console.error('Ошибка загрузки ролей:', error)
        toast.error('Не удалось загрузить роли')
      }
    }

    const loadModules = async () => {
      try {
        const response = await apiService.get('/api/cms/system-modules/')
        availableModules.value = response.data
      } catch (error) {
        console.error('Ошибка загрузки модулей:', error)
        toast.error('Не удалось загрузить модули')
      }
    }

    const editRole = (role) => {
      currentRole.value = role
      roleForm.value = {
        name: role.name,
        description: role.description || '',
        module_ids: role.modules_access.map(ma => ma.module)
      }
      showEditModal.value = true
    }

    const deleteRole = async (role) => {
      if (!confirm(`Вы уверены, что хотите удалить роль "${role.name}"?`)) {
        return
      }

      try {
        await apiService.delete(`/api/cms/user-roles/${role.id}/`)
        toast.success('Роль успешно удалена')
        await loadRoles()
      } catch (error) {
        console.error('Ошибка удаления роли:', error)
        toast.error('Не удалось удалить роль')
      }
    }

    const saveRole = async () => {
      if (!roleForm.value.name.trim()) {
        toast.error('Введите название роли')
        return
      }

      loading.value = true
      try {
        if (isEditing.value) {
          await apiService.put(`/api/cms/user-roles/${currentRole.value.id}/`, roleForm.value)
          toast.success('Роль успешно обновлена')
        } else {
          await apiService.post('/api/cms/user-roles/', roleForm.value)
          toast.success('Роль успешно создана')
        }
        
        closeModal()
        await loadRoles()
      } catch (error) {
        console.error('Ошибка сохранения роли:', error)
        toast.error('Не удалось сохранить роль')
      } finally {
        loading.value = false
      }
    }

    const closeModal = () => {
      showCreateModal.value = false
      showEditModal.value = false
      currentRole.value = null
      roleForm.value = {
        name: '',
        description: '',
        module_ids: []
      }
    }

    const formatDate = (dateString) => {
      if (!dateString) return '—'
      return new Date(dateString).toLocaleDateString('ru-RU')
    }

    onMounted(() => {
      loadRoles()
      loadModules()
    })

    return {
      roles,
      availableModules,
      showCreateModal,
      showEditModal,
      loading,
      currentRole,
      roleForm,
      isEditing,
      canCreateRoles,
      editRole,
      deleteRole,
      saveRole,
      closeModal,
      formatDate
    }
  }
}
</script>

<style scoped>
.role-management {
  padding: 20px;
}

.icon {
  width: 16px;
  height: 16px;
  vertical-align: middle;
}

.module-tree {
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid #dee2e6;
  border-radius: 0.375rem;
  padding: 15px;
}

.module-item {
  margin-bottom: 10px;
}

.module-item:last-child {
  margin-bottom: 0;
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
</style>

