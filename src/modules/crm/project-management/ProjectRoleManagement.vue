<template>
  <div class="card p-4 mb-4">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h3 class="mb-0 text-primary">
        <Users :size="22" class="me-2" style="vertical-align: middle;" /> Управление ролями команды
      </h3>
      <button class="btn btn-primary" @click="openRoleModal()">
        <Plus :size="18" class="me-2" style="vertical-align: middle;" /> Добавить роль
      </button>
    </div>
    <div class="table-responsive">
      <table class="table table-hover align-middle">
        <thead>
          <tr>
            <th>Название</th>
            <th>Код</th>
            <th>Описание</th>
            <th>Активна</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="role in roles" :key="role.id">
            <td>{{ role.name }}</td>
            <td>{{ role.code }}</td>
            <td>{{ role.description }}</td>
            <td>
              <span class="badge" :class="role.is_active ? 'bg-success' : 'bg-secondary'">
                {{ role.is_active ? 'Да' : 'Нет' }}
              </span>
            </td>
            <td>
              <button class="btn btn-sm btn-outline-primary me-2" @click="openRoleModal(role)"><Edit :size="16" /></button>
              <button class="btn btn-sm btn-outline-danger" @click="confirmDeleteRole(role)"><Trash2 :size="16" /></button>
            </td>
          </tr>
          <tr v-if="roles.length === 0">
            <td colspan="5" class="text-center text-muted">Нет ролей</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Модальное окно создания/редактирования роли -->
    <div class="modal fade" id="roleModal" tabindex="-1" aria-labelledby="roleModalLabel" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="roleModalLabel">{{ editingRole ? 'Редактировать роль' : 'Добавить роль' }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Закрыть"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="saveRole">
              <div class="mb-3">
                <label class="form-label">Название *</label>
                <input type="text" class="form-control" v-model="roleForm.name" required />
              </div>
              <div class="mb-3">
                <label class="form-label">Код *</label>
                <input type="text" class="form-control" v-model="roleForm.code" required />
              </div>
              <div class="mb-3">
                <label class="form-label">Описание</label>
                <textarea class="form-control" v-model="roleForm.description" rows="2"></textarea>
              </div>
              <div class="form-check mb-3">
                <input class="form-check-input" type="checkbox" v-model="roleForm.is_active" id="isActiveCheck" />
                <label class="form-check-label" for="isActiveCheck">Активна</label>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Отмена</button>
            <button type="button" class="btn btn-primary" @click="saveRole" :disabled="!roleForm.name || !roleForm.code">
              {{ editingRole ? 'Сохранить' : 'Добавить' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Modal } from 'bootstrap'
import { Plus, Edit, Trash2, Users } from 'lucide-vue-next'
import projectManagementApi from './js/projectManagementApi.js'
import { useToast } from 'vue-toastification'
const toast = useToast()

const roles = ref([])
const editingRole = ref(null)
const roleForm = ref({ name: '', code: '', description: '', is_active: true })

const loadRoles = async () => {
  try {
    const res = await projectManagementApi.getProjectRoles()
    roles.value = res.data
  } catch (e) {
    roles.value = []
    toast.error('Ошибка загрузки ролей')
  }
}

const openRoleModal = (role = null) => {
  editingRole.value = role
  if (role) {
    roleForm.value = { ...role }
  } else {
    roleForm.value = { name: '', code: '', description: '', is_active: true }
  }
  const modal = new Modal(document.getElementById('roleModal'))
  modal.show()
}

const saveRole = async () => {
  try {
    if (editingRole.value) {
      await projectManagementApi.updateProjectRole(editingRole.value.id, roleForm.value)
      toast.success('Роль обновлена')
    } else {
      await projectManagementApi.createProjectRole(roleForm.value)
      toast.success('Роль добавлена')
    }
    await loadRoles()
    Modal.getInstance(document.getElementById('roleModal')).hide()
  } catch (e) {
    toast.error('Ошибка сохранения роли')
  }
}

const confirmDeleteRole = (role) => {
  if (confirm(`Удалить роль "${role.name}"?`)) {
    deleteRole(role)
  }
}

const deleteRole = async (role) => {
  try {
    await projectManagementApi.deleteProjectRole(role.id)
    toast.success('Роль удалена')
    await loadRoles()
  } catch (e) {
    toast.error('Ошибка удаления роли')
  }
}

onMounted(loadRoles)
</script>

<script>
export default {}
</script> 