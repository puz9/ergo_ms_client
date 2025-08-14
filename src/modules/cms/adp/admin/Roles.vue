<script setup>
import RoleManagement from '@/components/RoleManagement/RoleManagement.vue'
</script>

<template>
  <div class="roles-page">
    <div class="card">
      <div class="card-header">
        <h5 class="mb-0">
          <i class="fas fa-shield-alt me-2"></i>
          Управление ролями пользователей
        </h5>
        <p class="text-muted mb-0 mt-2">
          Создавайте, редактируйте и удаляйте роли пользователей. Настраивайте доступы к модулям системы для каждой роли.
        </p>
      </div>
      <div class="card-body">
        <RoleManagement />
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.roles-page {
  .card-header {
    background-color: #f8f9fa;
    border-bottom: 1px solid #dee2e6;
  }
  
  .card-header h5 {
    color: #495057;
    font-weight: 600;
  }
  
  .text-muted {
    font-size: 0.9rem;
  }
}
</style>
