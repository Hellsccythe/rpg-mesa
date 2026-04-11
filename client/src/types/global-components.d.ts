declare module 'vue' {
  export interface GlobalComponents {
    VSelect: (typeof import('@/components/VSelect.vue'))['default']
    'v-select': (typeof import('@/components/VSelect.vue'))['default']
  }
}

export {}
