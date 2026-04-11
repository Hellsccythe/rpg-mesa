<template>
  <div>
    <div ref="rootRef" class="hamburger-shell">
      <button
        @click.stop="toggleMenu"
        :aria-label="ariaLabel"
        class="mobile-menu"
        :class="{ active: isOpen }"
      >
        <span class="menu-line line1" />
        <span class="menu-line line2" />
        <span class="menu-line line3" />
      </button>
    </div>

    <Teleport to="body">
      <div v-if="isOpen" class="menu-overlay" :style="{ top: topOffset }" @click="closeMenu" />

      <div
        ref="dropdownRef"
        class="menu-dropdown"
        :class="{ active: isOpen }"
        :style="{ top: topOffset }"
      >
        <div class="menu-list">
          <button
            v-for="(item, index) in items"
            :key="item.id"
            class="menu-item"
            :class="{
              'menu-item-danger': item.danger,
              'menu-item-active': activeItemId === item.id,
            }"
            :style="{ '--i': index }"
            @click="selectItem(item.id)"
          >
            {{ item.label }}
          </button>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'

interface DrawerMenuItem {
  id: string
  label: string
  danger?: boolean
}

withDefaults(
  defineProps<{
    items: DrawerMenuItem[]
    topOffset?: string
    ariaLabel?: string
    activeItemId?: string | null
  }>(),
  {
    topOffset: '4rem',
    ariaLabel: 'Abrir menu',
    activeItemId: null,
  },
)

const emit = defineEmits<{
  (e: 'select', itemId: string): void
}>()

const isOpen = ref(false)
const rootRef = ref<HTMLElement | null>(null)
const dropdownRef = ref<HTMLElement | null>(null)

function toggleMenu() {
  isOpen.value = !isOpen.value
}

function closeMenu() {
  isOpen.value = false
}

function selectItem(itemId: string) {
  closeMenu()
  emit('select', itemId)
}

function handleClickOutside(event: MouseEvent) {
  if (!isOpen.value || !rootRef.value) return
  const target = event.target as Node | null
  if (!target) return

  const clickedTrigger = rootRef.value.contains(target)
  const clickedDropdown = dropdownRef.value?.contains(target) ?? false

  if (!clickedTrigger && !clickedDropdown) {
    closeMenu()
  }
}

function handleEscape(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    closeMenu()
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  document.addEventListener('keydown', handleEscape)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
  document.removeEventListener('keydown', handleEscape)
})
</script>

<style scoped>
.hamburger-shell {
  position: relative;
  z-index: 4100;
}

.mobile-menu {
  position: relative;
  display: flex;
  height: 2.5rem;
  width: 2.5rem;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.28rem;
  border-radius: 0.95rem;
  border: 1px solid rgb(148 163 184 / 0.35);
  background: var(--bg-soft);
  box-shadow: 0 4px 12px rgb(15 23 42 / 0.08);
  transition: background-color 0.3s ease;
}

@media (max-width: 640px) {
  .mobile-menu {
    height: 2.75rem;
    width: 2.75rem;
    border-radius: 1rem;
    gap: 0.3rem;
  }

  .menu-line {
    width: 1.2rem;
    height: 2px;
  }

  .menu-dropdown {
    width: min(78vw, 300px);
    padding: 1rem 0.8rem;
  }

  .menu-item {
    padding: 0.78rem 0.85rem;
    font-size: 0.82rem;
  }
}

.mobile-menu:hover {
  background: color-mix(in srgb, var(--accent-soft) 70%, var(--bg-card) 30%);
}

:global(html.theme-light) .mobile-menu {
  border-color: rgb(255 255 255 / 0.28);
  background: rgb(15 23 42 / 0.14);
  box-shadow: none;
}

:global(html.theme-light) .mobile-menu:hover {
  background: rgb(15 23 42 / 0.22);
}

:global(html.theme-light) .menu-line {
  background: #c7d2fe;
}

.menu-line {
  display: block;
  width: 1.1rem;
  height: 2px;
  border-radius: 999px;
  background: var(--menu-line);
  transition:
    transform 0.3s ease,
    opacity 0.3s ease;
}

.mobile-menu.active .line1 {
  transform: rotate(-45deg) translate(-5px, 5px);
}

.mobile-menu.active .line2 {
  opacity: 0;
}

.mobile-menu.active .line3 {
  transform: rotate(45deg) translate(-4px, -4px);
}

.menu-overlay {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 4000;
  background: rgb(0 0 0 / 0.18);
}

.menu-dropdown {
  position: fixed;
  left: 0;
  z-index: 4200;
  width: min(70vw, 260px);
  height: calc(100vh - 4rem);
  border-right: 1px solid var(--border-soft);
  background: var(--menu-bg);
  transform: translateX(calc(-100% - 1.5rem));
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
  transition:
    transform 0.3s ease-in,
    opacity 0.2s ease-in,
    visibility 0s linear 0.3s;
  padding: 1rem 0.7rem;
  overflow-y: auto;
}

.menu-dropdown.active {
  transform: translateX(0);
  opacity: 1;
  visibility: visible;
  pointer-events: auto;
  transition:
    transform 0.3s ease-in,
    opacity 0.2s ease-in,
    visibility 0s linear 0s;
}

.menu-list {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.menu-item {
  display: block;
  width: 100%;
  border-radius: 0.65rem;
  padding: 0.72rem 0.8rem;
  text-align: left;
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--menu-text);
  transition:
    background-color 0.2s ease,
    color 0.2s ease;
  opacity: 1;
  transform: translateX(0);
}

.menu-item:hover {
  background: var(--accent-soft);
  opacity: 0.82;
}

.menu-item-active {
  background: var(--accent-soft);
  color: var(--brand-primary);
  opacity: 1;
}

.menu-item-danger {
  color: #b91c1c;
}

.menu-item-danger:hover {
  background: rgb(248 113 113 / 0.18);
  opacity: 1;
}

.menu-dropdown.active .menu-item {
  animation: navLinkFade 0.24s ease-out both;
  animation-delay: calc((var(--i) * 0.045s) + 0.02s);
}

@keyframes navLinkFade {
  from {
    opacity: 0;
    transform: translateX(14px);
  }

  to {
    opacity: 1;
    transform: translateX(0);
  }
}
</style>
