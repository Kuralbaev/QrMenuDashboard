# Вопросы и ответы по Vue.js для Middle и Senior разработчиков

## Middle уровень

### 1. Объясните разницу между shallowRef и ref. Когда использовать каждый?

**ref** - создает глубоко реактивную ссылку:
```javascript
import { ref } from 'vue'

const state = ref({
  user: {
    name: 'John',
    address: {
      city: 'Moscow'
    }
  }
})

// Все вложенные изменения отслеживаются
state.value.user.address.city = 'SPB' // Реактивно
```

**shallowRef** - создает поверхностно реактивную ссылку:
```javascript
import { shallowRef } from 'vue'

const state = shallowRef({
  user: {
    name: 'John',
    address: {
      city: 'Moscow'
    }
  }
})

// Только изменения самого объекта отслеживаются
state.value = { user: { name: 'Jane' } } // Реактивно
state.value.user.address.city = 'SPB' // НЕ реактивно!
```

**Когда использовать shallowRef:**
- Большие объекты, где нужна производительность
- Работа с внешними библиотеками (например, D3.js, Three.js)
- Когда глубокое отслеживание не нужно

```javascript
import { shallowRef } from 'vue'
import * as d3 from 'd3'

const chart = shallowRef(null)

onMounted(() => {
  // D3 создает множество внутренних свойств
  chart.value = d3.select('#chart')
    .append('svg')
    // ... много операций
  // Не нужно отслеживать все внутренние изменения D3
})
```

### 2. Что такое watchEffect и чем он отличается от watch?

**watch** - отслеживает конкретные источники:
```javascript
import { watch, ref } from 'vue'

const count = ref(0)
const name = ref('John')

// Отслеживает только count
watch(count, (newVal, oldVal) => {
  console.log(`Count changed: ${oldVal} -> ${newVal}`)
})

// Отслеживает несколько источников
watch([count, name], ([newCount, newName], [oldCount, oldName]) => {
  console.log('Both changed')
})
```

**watchEffect** - автоматически отслеживает все используемые реактивные зависимости:
```javascript
import { watchEffect, ref } from 'vue'

const count = ref(0)
const name = ref('John')

// Автоматически отслеживает count и name
watchEffect(() => {
  console.log(`Count: ${count.value}, Name: ${name.value}`)
  // Если внутри используется count.value, он будет отслеживаться
})
```

**Ключевые различия:**

1. **Отслеживание зависимостей:**
```javascript
// watch - явное указание
watch(count, callback)

// watchEffect - автоматическое
watchEffect(() => {
  // Все используемые реактивные значения отслеживаются автоматически
  console.log(count.value, name.value)
})
```

2. **Доступ к старым значениям:**
```javascript
// watch - есть доступ к старому значению
watch(count, (newVal, oldVal) => {
  console.log(oldVal) // Доступно
})

// watchEffect - нет доступа к старому значению
watchEffect(() => {
  console.log(count.value) // Только текущее значение
})
```

3. **Ленивое выполнение:**
```javascript
// watch - по умолчанию ленивый (не выполняется сразу)
watch(count, callback) // Не выполнится при создании

// watchEffect - выполняется сразу
watchEffect(() => {
  console.log('Выполнится сразу!')
})
```

**Пример использования watchEffect:**
```javascript
import { watchEffect, ref } from 'vue'

const searchQuery = ref('')
const results = ref([])

// Автоматически перезапускается при изменении searchQuery
watchEffect(async () => {
  if (searchQuery.value.length < 2) {
    results.value = []
    return
  }
  
  const response = await fetch(`/api/search?q=${searchQuery.value}`)
  results.value = await response.json()
})
```

### 3. Как работает provide/inject и когда его использовать вместо props?

**provide/inject** - способ передачи данных через несколько уровней компонентов без prop drilling.

**Пример проблемы с props:**
```vue
<!-- App.vue -->
<GrandParent>
  <Parent :theme="theme">
    <Child :theme="theme">
      <GrandChild :theme="theme">
        <!-- Нужно прокидывать theme через все уровни -->
      </GrandChild>
    </Child>
  </Parent>
</GrandParent>
```

**Решение с provide/inject:**
```vue
<!-- App.vue (предок) -->
<script setup>
import { provide, ref } from 'vue'

const theme = ref('dark')

provide('theme', theme)
provide('toggleTheme', () => {
  theme.value = theme.value === 'dark' ? 'light' : 'dark'
})
</script>

<!-- GrandChild.vue (потомок, глубоко вложенный) -->
<script setup>
import { inject } from 'vue'

const theme = inject('theme')
const toggleTheme = inject('toggleTheme')

// Можно использовать theme и toggleTheme без прокидывания через props
</script>
```

**С значениями по умолчанию:**
```javascript
const theme = inject('theme', 'light') // 'light' - значение по умолчанию
```

**С проверкой типов (TypeScript):**
```typescript
import { inject } from 'vue'

interface Theme {
  mode: 'dark' | 'light'
  colors: {
    primary: string
    secondary: string
  }
}

const theme = inject<Theme>('theme', {
  mode: 'light',
  colors: {
    primary: '#000',
    secondary: '#fff'
  }
})
```

**Когда использовать:**
- ✅ Передача темы, локали, конфигурации
- ✅ Передача функций (например, модальные окна)
- ✅ Передача данных через много уровней
- ❌ НЕ использовать для простой передачи между родителем и ребенком (используйте props)

### 4. Объясните концепцию Teleport в Vue 3

**Teleport** - позволяет рендерить содержимое компонента в другом месте DOM.

**Проблема без Teleport:**
```vue
<!-- Modal.vue -->
<template>
  <div class="modal-overlay">
    <div class="modal-content">
      <!-- Модальное окно рендерится внутри родительского компонента -->
      <!-- Может быть проблема с z-index, overflow и т.д. -->
    </div>
  </div>
</template>
```

**Решение с Teleport:**
```vue
<!-- Modal.vue -->
<template>
  <Teleport to="body">
    <div class="modal-overlay">
      <div class="modal-content">
        <slot></slot>
      </div>
    </div>
  </Teleport>
</template>
```

**Использование:**
```vue
<!-- App.vue -->
<template>
  <div id="app">
    <Modal>
      <p>Содержимое модального окна</p>
    </Modal>
  </div>
</template>

<!-- Результат в DOM: -->
<!-- <div id="app">...</div> -->
<!-- <body> -->
<!--   <div class="modal-overlay">...</div> -->
<!-- </body> -->
```

**Условный Teleport:**
```vue
<Teleport to="body" :disabled="!isOpen">
  <div class="modal">...</div>
</Teleport>
```

**Несколько Teleport в один target:**
```vue
<!-- Оба будут добавлены в body в порядке появления -->
<Teleport to="body">
  <div>Первое</div>
</Teleport>
<Teleport to="body">
  <div>Второе</div>
</Teleport>
```

**Практический пример:**
```vue
<!-- Notification.vue -->
<template>
  <Teleport to="#notifications">
    <Transition name="slide">
      <div v-if="visible" class="notification">
        {{ message }}
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  message: String
})

const visible = ref(true)

setTimeout(() => {
  visible.value = false
}, 3000)
</script>

<!-- index.html -->
<body>
  <div id="app"></div>
  <div id="notifications"></div> <!-- Для уведомлений -->
</body>
```

### 5. Что такое Suspense и как его использовать?

**Suspense** - компонент для обработки асинхронных зависимостей в дереве компонентов.

**Базовое использование:**
```vue
<template>
  <Suspense>
    <template #default>
      <AsyncComponent />
    </template>
    <template #fallback>
      <div>Загрузка...</div>
    </template>
  </Suspense>
</template>

<script setup>
import { defineAsyncComponent } from 'vue'

const AsyncComponent = defineAsyncComponent(() => 
  import('./AsyncComponent.vue')
)
</script>
```

**С async setup:**
```vue
<!-- AsyncComponent.vue -->
<script setup>
const data = await fetch('/api/data').then(r => r.json())
</script>

<template>
  <div>{{ data.message }}</div>
</template>

<!-- Parent.vue -->
<template>
  <Suspense>
    <AsyncComponent />
    <template #fallback>
      <div>Загрузка данных...</div>
    </template>
  </Suspense>
</template>
```

**Обработка ошибок:**
```vue
<template>
  <Suspense @resolve="onResolve" @reject="onReject">
    <AsyncComponent />
    <template #fallback>
      <div>Загрузка...</div>
    </template>
  </Suspense>
</template>

<script setup>
import { ref } from 'vue'

const error = ref(null)

const onReject = (err) => {
  error.value = err
  console.error('Ошибка загрузки:', err)
}

const onResolve = () => {
  console.log('Компонент загружен')
}
</script>
```

**Вложенные Suspense:**
```vue
<Suspense>
  <template #default>
    <AsyncParent>
      <Suspense>
        <AsyncChild />
        <template #fallback>
          Загрузка дочернего компонента...
        </template>
      </Suspense>
    </AsyncParent>
  </template>
  <template #fallback>
    Загрузка родительского компонента...
  </template>
</Suspense>
```

**Практический пример:**
```vue
<!-- UserProfile.vue -->
<script setup>
import { ref } from 'vue'

const userId = defineProps(['id'])

// Асинхронная загрузка данных
const user = await fetch(`/api/users/${userId}`).then(r => r.json())
const posts = await fetch(`/api/users/${userId}/posts`).then(r => r.json())
</script>

<template>
  <div>
    <h1>{{ user.name }}</h1>
    <div v-for="post in posts" :key="post.id">
      {{ post.title }}
    </div>
  </div>
</template>

<!-- App.vue -->
<template>
  <Suspense>
    <UserProfile :id="1" />
    <template #fallback>
      <div class="loading">
        <Spinner />
        <p>Загрузка профиля...</p>
      </div>
    </template>
  </Suspense>
</template>
```

### 6. Как оптимизировать производительность больших списков в Vue?

**Проблема:**
```vue
<!-- Медленно при большом количестве элементов -->
<div v-for="item in items" :key="item.id">
  <ExpensiveComponent :data="item" />
</div>
```

**Решения:**

**1. Виртуализация (vue-virtual-scroller):**
```vue
<template>
  <RecycleScroller
    class="scroller"
    :items="items"
    :item-size="100"
    key-field="id"
    v-slot="{ item }"
  >
    <ExpensiveComponent :data="item" />
  </RecycleScroller>
</template>
```

**2. Пагинация:**
```vue
<script setup>
import { ref, computed } from 'vue'

const items = ref([...]) // 10000 элементов
const page = ref(1)
const pageSize = ref(50)

const paginatedItems = computed(() => {
  const start = (page.value - 1) * pageSize.value
  const end = start + pageSize.value
  return items.value.slice(start, end)
})
</script>

<template>
  <div v-for="item in paginatedItems" :key="item.id">
    <ItemComponent :data="item" />
  </div>
  <Pagination 
    :current="page" 
    :total="items.length" 
    :page-size="pageSize"
    @change="page = $event"
  />
</template>
```

**3. Ленивая загрузка (Intersection Observer):**
```vue
<script setup>
import { ref, onMounted } from 'vue'

const items = ref([])
const loading = ref(false)
const observer = ref(null)

const loadMore = async () => {
  if (loading.value) return
  loading.value = true
  const newItems = await fetchMoreItems()
  items.value.push(...newItems)
  loading.value = false
}

onMounted(() => {
  const sentinel = document.getElementById('sentinel')
  observer.value = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      loadMore()
    }
  })
  observer.value.observe(sentinel)
})
</script>

<template>
  <div v-for="item in items" :key="item.id">
    <ItemComponent :data="item" />
  </div>
  <div id="sentinel"></div>
  <div v-if="loading">Загрузка...</div>
</template>
```

**4. Мемоизация вычислений:**
```vue
<script setup>
import { computed, ref } from 'vue'

const items = ref([...])
const filter = ref('')

// Дорогое вычисление кэшируется
const filteredItems = computed(() => {
  return items.value.filter(item => 
    item.name.toLowerCase().includes(filter.value.toLowerCase())
  )
})
</script>
```

**5. v-once для статического контента:**
```vue
<div v-for="item in items" :key="item.id">
  <div v-once>{{ item.staticContent }}</div>
  <DynamicComponent :data="item" />
</div>
```

**6. Использование v-show вместо v-if для частых переключений:**
```vue
<!-- Если элементы часто показываются/скрываются -->
<div v-for="item in items" :key="item.id">
  <ExpensiveComponent v-show="item.visible" :data="item" />
</div>
```

### 7. Как работает реактивность в Vue 3? Объясните Proxy-based реактивность

**Vue 2 (Object.defineProperty):**
```javascript
// Ограничения:
// - Не работает с индексами массива
// - Не работает с добавлением новых свойств
// - Требует обход всех свойств при инициализации

const obj = {}
Object.defineProperty(obj, 'count', {
  get() {
    return this._count
  },
  set(value) {
    this._count = value
    // Уведомление об изменении
  }
})
```

**Vue 3 (Proxy):**
```javascript
import { reactive } from 'vue'

const state = reactive({
  count: 0,
  user: {
    name: 'John'
  }
})

// Proxy перехватывает все операции:
// - Чтение свойств (get)
// - Запись свойств (set)
// - Удаление свойств (deleteProperty)
// - Проверку наличия (has)
// - Итерацию (ownKeys)
```

**Как это работает:**
```javascript
// Vue создает Proxy
const reactive = new Proxy(original, {
  get(target, key, receiver) {
    // Отслеживание зависимостей
    track(target, key)
    return Reflect.get(target, key, receiver)
  },
  set(target, key, value, receiver) {
    const result = Reflect.set(target, key, value, receiver)
    // Уведомление об изменениях
    trigger(target, key)
    return result
  }
})
```

**Преимущества Proxy:**
```javascript
const state = reactive({
  items: []
})

// ✅ Работает с индексами массива
state.items[0] = 'new' // Реактивно

// ✅ Работает с добавлением свойств
state.newProperty = 'value' // Реактивно

// ✅ Работает с удалением
delete state.property // Реактивно

// ✅ Работает с вложенными объектами
state.user.address.city = 'SPB' // Реактивно
```

**Ограничения:**
```javascript
// ❌ Не работает с примитивами
const count = reactive(0) // Ошибка!

// ✅ Используйте ref для примитивов
const count = ref(0)

// ❌ Не работает с заменой всего объекта
const state = reactive({ count: 0 })
state = { count: 1 } // Не реактивно!

// ✅ Изменяйте свойства
state.count = 1 // Реактивно
```

### 8. Что такое custom renderer в Vue 3 и зачем он нужен?

**Custom renderer** - позволяет использовать Vue с другими платформами (не только DOM).

**Пример для Canvas:**
```javascript
import { createRenderer } from 'vue'

const { createApp } = createRenderer({
  createElement(type) {
    // Создание элемента Canvas
    if (type === 'circle') {
      return { type: 'circle', x: 0, y: 0, radius: 0 }
    }
  },
  insert(el, parent) {
    // Вставка в Canvas
    const ctx = parent.getContext('2d')
    ctx.beginPath()
    ctx.arc(el.x, el.y, el.radius, 0, Math.PI * 2)
    ctx.fill()
  },
  patchProp(el, key, prevValue, nextValue) {
    // Обновление свойств
    if (key === 'x') el.x = nextValue
    if (key === 'y') el.y = nextValue
    if (key === 'radius') el.radius = nextValue
  },
  remove(el) {
    // Удаление элемента
  },
  createText(text) {
    return { type: 'text', content: text }
  },
  parentNode(node) {
    return node.parent
  },
  nextSibling(node) {
    return node.next
  }
})

// Использование
const app = createApp({
  data() {
    return {
      x: 100,
      y: 100,
      radius: 50
    }
  },
  template: `
    <circle :x="x" :y="y" :radius="radius" />
  `
})
```

**Пример для терминала (ink-vue):**
```javascript
// Использование Vue для создания CLI приложений
import { createRenderer } from 'vue'
import { render, Box, Text } from 'ink'

const { createApp } = createRenderer({
  // Реализация для терминала
  createElement: (type) => {
    if (type === 'Box') return Box
    if (type === 'Text') return Text
  },
  // ... другие методы
})
```

**Практическое применение:**
- **Canvas/SVG** - графики, игры
- **Мобильные приложения** - NativeScript-Vue
- **Терминал** - CLI приложения
- **WebGL** - 3D графика

### 9. Как реализовать паттерн Observer/Pub-Sub во Vue 3?

**События компонентов (ограниченно):**
```vue
<!-- Child.vue -->
<script setup>
const emit = defineEmits(['update'])

function notify() {
  emit('update', { data: 'value' })
}
</script>

<!-- Parent.vue -->
<Child @update="handleUpdate" />
```

**Event Bus (Composition API):**
```javascript
// eventBus.js
import { ref } from 'vue'

class EventBus {
  constructor() {
    this.events = {}
  }
  
  on(event, callback) {
    if (!this.events[event]) {
      this.events[event] = []
    }
    this.events[event].push(callback)
  }
  
  off(event, callback) {
    if (!this.events[event]) return
    this.events[event] = this.events[event].filter(cb => cb !== callback)
  }
  
  emit(event, data) {
    if (!this.events[event]) return
    this.events[event].forEach(callback => callback(data))
  }
}

export const eventBus = new EventBus()

// Использование
// Component1.vue
import { eventBus } from '@/utils/eventBus'

eventBus.emit('user-updated', { id: 1, name: 'John' })

// Component2.vue
import { eventBus } from '@/utils/eventBus'
import { onMounted, onBeforeUnmount } from 'vue'

const handleUserUpdate = (data) => {
  console.log('User updated:', data)
}

onMounted(() => {
  eventBus.on('user-updated', handleUserUpdate)
})

onBeforeUnmount(() => {
  eventBus.off('user-updated', handleUserUpdate)
})
```

**Composable для событий:**
```javascript
// composables/useEventBus.js
import { onMounted, onBeforeUnmount } from 'vue'

export function useEventBus(event, callback) {
  onMounted(() => {
    eventBus.on(event, callback)
  })
  
  onBeforeUnmount(() => {
    eventBus.off(event, callback)
  })
}

// Использование
import { useEventBus } from '@/composables/useEventBus'

useEventBus('user-updated', (data) => {
  console.log('User updated:', data)
})
```

**С использованием mitt (библиотека):**
```javascript
// eventBus.js
import mitt from 'mitt'

export const eventBus = mitt()

// Использование
import { eventBus } from '@/utils/eventBus'

// Подписка
eventBus.on('user-updated', (data) => {
  console.log(data)
})

// Отправка
eventBus.emit('user-updated', { id: 1 })
```

### 10. Как реализовать паттерн Factory для создания компонентов?

**Базовый Factory:**
```javascript
// factories/componentFactory.js
export function createButtonComponent(config) {
  return {
    name: 'DynamicButton',
    props: {
      variant: {
        type: String,
        default: config.defaultVariant || 'primary'
      },
      size: {
        type: String,
        default: config.defaultSize || 'medium'
      }
    },
    template: `
      <button 
        :class="['btn', \`btn-\${variant}\`, \`btn-\${size}\`]"
        @click="$emit('click', $event)"
      >
        <slot></slot>
      </button>
    `
  }
}

// Использование
import { createButtonComponent } from '@/factories/componentFactory'

const PrimaryButton = createButtonComponent({
  defaultVariant: 'primary',
  defaultSize: 'large'
})
```

**Factory с Composition API:**
```javascript
// factories/formFieldFactory.js
import { defineComponent, ref } from 'vue'

export function createFormField(type, config = {}) {
  return defineComponent({
    name: `FormField${type}`,
    props: {
      modelValue: {
        type: String,
        default: ''
      },
      label: String,
      placeholder: String,
      required: Boolean
    },
    emits: ['update:modelValue'],
    setup(props, { emit }) {
      const value = ref(props.modelValue)
      
      const updateValue = (newValue) => {
        value.value = newValue
        emit('update:modelValue', newValue)
      }
      
      return {
        value,
        updateValue
      }
    },
    template: `
      <div class="form-field">
        <label v-if="label">
          {{ label }}
          <span v-if="required">*</span>
        </label>
        <input
          v-if="type === 'text'"
          :value="value"
          @input="updateValue($event.target.value)"
          :placeholder="placeholder"
        />
        <textarea
          v-else-if="type === 'textarea'"
          :value="value"
          @input="updateValue($event.target.value)"
          :placeholder="placeholder"
        />
      </div>
    `
  })
}

// Использование
import { createFormField } from '@/factories/formFieldFactory'

const TextField = createFormField('text')
const TextareaField = createFormField('textarea')
```

**Динамическая регистрация компонентов:**
```javascript
// factories/dynamicComponentFactory.js
export function createDynamicComponent(componentConfig) {
  return {
    name: componentConfig.name,
    props: componentConfig.props || {},
    setup(props, { slots }) {
      const Component = componentConfig.component
      return () => h(Component, props, slots)
    }
  }
}

// Использование
import Button from '@/components/Button.vue'

const DynamicButton = createDynamicComponent({
  name: 'DynamicButton',
  component: Button,
  props: {
    variant: String
  }
})
```

## Senior уровень

### 1. Как реализовать плагин для Vue 3? Опишите архитектуру плагина

**Базовый плагин:**
```javascript
// plugins/myPlugin.js
export default {
  install(app, options) {
    // Добавление глобального свойства
    app.config.globalProperties.$myPlugin = {
      version: '1.0.0',
      sayHello() {
        console.log('Hello from plugin!')
      }
    }
    
    // Добавление глобального компонента
    app.component('MyComponent', {
      template: '<div>My Component</div>'
    })
    
    // Добавление директивы
    app.directive('focus', {
      mounted(el) {
        el.focus()
      }
    })
    
    // Добавление метода в app
    app.provide('myPlugin', {
      config: options
    })
  }
}

// main.js
import { createApp } from 'vue'
import MyPlugin from './plugins/myPlugin'

const app = createApp(App)
app.use(MyPlugin, {
  option1: 'value1',
  option2: 'value2'
})
app.mount('#app')
```

**Плагин с Composition API:**
```javascript
// plugins/i18n.js
import { ref, provide, inject } from 'vue'

const createI18n = (config) => {
  const locale = ref(config.locale || 'en')
  const messages = ref(config.messages || {})
  
  const t = (key) => {
    return messages.value[locale.value]?.[key] || key
  }
  
  return {
    locale,
    messages,
    t
  }
}

const i18nSymbol = Symbol('i18n')

export default {
  install(app, options) {
    const i18n = createI18n(options)
    app.provide(i18nSymbol, i18n)
    app.config.globalProperties.$t = i18n.t
  }
}

// Composable для использования
export function useI18n() {
  const i18n = inject(i18nSymbol)
  if (!i18n) {
    throw new Error('i18n plugin not installed')
  }
  return i18n
}

// Использование
import { useI18n } from '@/plugins/i18n'

const { t, locale } = useI18n()
```

**Плагин с реактивным состоянием:**
```javascript
// plugins/notification.js
import { ref, provide, inject } from 'vue'

const notifications = ref([])
const notificationSymbol = Symbol('notifications')

export default {
  install(app) {
    const notify = (message, type = 'info') => {
      const id = Date.now()
      notifications.value.push({
        id,
        message,
        type,
        visible: true
      })
      
      setTimeout(() => {
        removeNotification(id)
      }, 3000)
    }
    
    const removeNotification = (id) => {
      const index = notifications.value.findIndex(n => n.id === id)
      if (index > -1) {
        notifications.value.splice(index, 1)
      }
    }
    
    app.provide(notificationSymbol, {
      notifications,
      notify,
      removeNotification
    })
    
    app.config.globalProperties.$notify = notify
  }
}

// Composable
export function useNotifications() {
  return inject(notificationSymbol)
}

// Компонент уведомлений
// NotificationContainer.vue
<template>
  <Teleport to="body">
    <div class="notifications">
      <TransitionGroup name="notification">
        <div
          v-for="notification in notifications"
          :key="notification.id"
          :class="['notification', \`notification-\${notification.type}\`]"
        >
          {{ notification.message }}
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup>
import { useNotifications } from '@/plugins/notification'

const { notifications } = useNotifications()
</script>
```

### 2. Как реализовать систему плагинов с возможностью расширения?

**Архитектура плагинной системы:**
```javascript
// core/pluginSystem.js
class PluginSystem {
  constructor() {
    this.plugins = new Map()
    this.hooks = new Map()
  }
  
  register(name, plugin) {
    if (this.plugins.has(name)) {
      throw new Error(`Plugin ${name} already registered`)
    }
    
    this.plugins.set(name, plugin)
    
    // Регистрация хуков плагина
    if (plugin.hooks) {
      Object.keys(plugin.hooks).forEach(hookName => {
        if (!this.hooks.has(hookName)) {
          this.hooks.set(hookName, [])
        }
        this.hooks.get(hookName).push(plugin.hooks[hookName])
      })
    }
  }
  
  callHook(hookName, ...args) {
    const hooks = this.hooks.get(hookName) || []
    return hooks.map(hook => hook(...args))
  }
  
  getPlugin(name) {
    return this.plugins.get(name)
  }
}

export const pluginSystem = new PluginSystem()

// Плагин
// plugins/analytics.js
export default {
  name: 'analytics',
  install(app, options) {
    // Инициализация аналитики
    console.log('Analytics plugin installed', options)
  },
  hooks: {
    'route:before': (to, from) => {
      console.log('Route changed:', to.path)
    },
    'user:login': (user) => {
      console.log('User logged in:', user.email)
    }
  }
}

// Использование
import { pluginSystem } from '@/core/pluginSystem'
import AnalyticsPlugin from '@/plugins/analytics'

pluginSystem.register('analytics', AnalyticsPlugin)

// Вызов хуков
pluginSystem.callHook('route:before', to, from)
pluginSystem.callHook('user:login', user)
```

### 3. Как реализовать систему middleware для Vue Router?

**Базовая реализация:**
```javascript
// router/middleware.js
export function createMiddleware() {
  const middlewares = []
  
  return {
    use(middleware) {
      middlewares.push(middleware)
      return this
    },
    
    async run(context, next) {
      let index = -1
      
      const dispatch = async (i) => {
        if (i <= index) {
          throw new Error('next() called multiple times')
        }
        index = i
        
        if (i === middlewares.length) {
          return next()
        }
        
        const middleware = middlewares[i]
        return middleware(context, () => dispatch(i + 1))
      }
      
      return dispatch(0)
    }
  }
}

// Middleware примеры
// middleware/auth.js
export const authMiddleware = async (context, next) => {
  const { to, from, router } = context
  
  if (to.meta.requiresAuth && !isAuthenticated()) {
    router.push('/login')
    return
  }
  
  return next()
}

// middleware/role.js
export const roleMiddleware = async (context, next) => {
  const { to } = context
  
  if (to.meta.roles && !hasRole(to.meta.roles)) {
    router.push('/forbidden')
    return
  }
  
  return next()
}

// router/index.js
import { createRouter } from 'vue-router'
import { createMiddleware } from './middleware'
import { authMiddleware } from './middleware/auth'
import { roleMiddleware } from './middleware/role'

const router = createRouter({
  // ...
})

const middleware = createMiddleware()
  .use(authMiddleware)
  .use(roleMiddleware)

router.beforeEach(async (to, from, next) => {
  const context = { to, from, router }
  
  await middleware.run(context, () => {
    next()
  })
})
```

**Расширенная версия с мета-данными:**
```javascript
// router/middleware.js
export class MiddlewarePipeline {
  constructor() {
    this.middlewares = []
  }
  
  use(middleware) {
    if (typeof middleware === 'function') {
      this.middlewares.push({ handler: middleware })
    } else if (middleware.handler) {
      this.middlewares.push(middleware)
    }
    return this
  }
  
  async execute(context) {
    let index = -1
    
    const run = async (i) => {
      if (i <= index) {
        throw new Error('next() called multiple times')
      }
      index = i
      
      if (i >= this.middlewares.length) {
        return true
      }
      
      const middleware = this.middlewares[i]
      
      // Проверка условий выполнения
      if (middleware.only && !middleware.only.includes(context.to.name)) {
        return run(i + 1)
      }
      
      if (middleware.except && middleware.except.includes(context.to.name)) {
        return run(i + 1)
      }
      
      const result = await middleware.handler(context, () => run(i + 1))
      return result !== false
    }
    
    return run(0)
  }
}

// Использование
const pipeline = new MiddlewarePipeline()

pipeline
  .use({
    handler: authMiddleware,
    only: ['dashboard', 'profile'] // Только для этих роутов
  })
  .use({
    handler: roleMiddleware,
    except: ['home'] // Кроме этого роута
  })

router.beforeEach(async (to, from, next) => {
  const context = { to, from, router }
  const result = await pipeline.execute(context)
  
  if (result) {
    next()
  }
})
```

### 4. Как реализовать систему кэширования для API запросов?

**Базовый кэш:**
```javascript
// utils/apiCache.js
class ApiCache {
  constructor(options = {}) {
    this.cache = new Map()
    this.ttl = options.ttl || 5 * 60 * 1000 // 5 минут по умолчанию
  }
  
  get(key) {
    const item = this.cache.get(key)
    
    if (!item) {
      return null
    }
    
    if (Date.now() > item.expiresAt) {
      this.cache.delete(key)
      return null
    }
    
    return item.data
  }
  
  set(key, data, ttl = this.ttl) {
    this.cache.set(key, {
      data,
      expiresAt: Date.now() + ttl
    })
  }
  
  delete(key) {
    this.cache.delete(key)
  }
  
  clear() {
    this.cache.clear()
  }
  
  generateKey(url, params) {
    return `${url}:${JSON.stringify(params)}`
  }
}

export const apiCache = new ApiCache()

// Composable для использования
// composables/useCachedApi.js
import { ref } from 'vue'
import { apiCache } from '@/utils/apiCache'
import axios from 'axios'

export function useCachedApi(url, options = {}) {
  const data = ref(null)
  const loading = ref(false)
  const error = ref(null)
  
  const fetch = async (params = {}) => {
    const cacheKey = apiCache.generateKey(url, params)
    const cached = apiCache.get(cacheKey)
    
    if (cached && !options.forceRefresh) {
      data.value = cached
      return cached
    }
    
    loading.value = true
    error.value = null
    
    try {
      const response = await axios.get(url, { params })
      const result = response.data
      
      apiCache.set(cacheKey, result, options.ttl)
      data.value = result
      
      return result
    } catch (err) {
      error.value = err
      throw err
    } finally {
      loading.value = false
    }
  }
  
  return {
    data,
    loading,
    error,
    fetch
  }
}

// Использование
import { useCachedApi } from '@/composables/useCachedApi'

const { data, loading, fetch } = useCachedApi('/api/products', {
  ttl: 10 * 60 * 1000 // 10 минут
})

await fetch({ category: 'electronics' })
```

**Кэш с инвалидацией:**
```javascript
// utils/smartCache.js
class SmartCache {
  constructor() {
    this.cache = new Map()
    this.tags = new Map() // Теги для группировки кэша
  }
  
  set(key, data, options = {}) {
    this.cache.set(key, {
      data,
      expiresAt: options.ttl ? Date.now() + options.ttl : null,
      tags: options.tags || []
    })
    
    // Индексация по тегам
    if (options.tags) {
      options.tags.forEach(tag => {
        if (!this.tags.has(tag)) {
          this.tags.set(tag, new Set())
        }
        this.tags.get(tag).add(key)
      })
    }
  }
  
  invalidateTag(tag) {
    const keys = this.tags.get(tag)
    if (keys) {
      keys.forEach(key => this.cache.delete(key))
      this.tags.delete(tag)
    }
  }
  
  invalidatePattern(pattern) {
    const regex = new RegExp(pattern)
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key)
      }
    }
  }
}

export const smartCache = new SmartCache()

// Использование
smartCache.set('user:1', userData, { tags: ['user', 'user:1'] })
smartCache.set('user:2', userData2, { tags: ['user', 'user:2'] })

// Инвалидация всех пользователей
smartCache.invalidateTag('user')

// Инвалидация по паттерну
smartCache.invalidatePattern('^user:')
```

### 5. Как реализовать систему состояний машины (State Machine) во Vue?

**Простая реализация:**
```javascript
// utils/stateMachine.js
class StateMachine {
  constructor(initialState, transitions) {
    this.state = initialState
    this.transitions = transitions
    this.listeners = []
  }
  
  canTransition(event) {
    const transition = this.transitions[this.state]?.[event]
    return !!transition
  }
  
  transition(event, data) {
    if (!this.canTransition(event)) {
      throw new Error(
        `Cannot transition from ${this.state} with event ${event}`
      )
    }
    
    const transition = this.transitions[this.state][event]
    const oldState = this.state
    this.state = transition.to
    
    this.notifyListeners({
      event,
      from: oldState,
      to: this.state,
      data
    })
    
    if (transition.action) {
      transition.action(data)
    }
  }
  
  onTransition(callback) {
    this.listeners.push(callback)
  }
  
  notifyListeners(transition) {
    this.listeners.forEach(listener => listener(transition))
  }
}

// Использование
const orderMachine = new StateMachine('pending', {
  pending: {
    confirm: {
      to: 'confirmed',
      action: (data) => {
        console.log('Order confirmed', data)
      }
    },
    cancel: {
      to: 'cancelled'
    }
  },
  confirmed: {
    ship: {
      to: 'shipped'
    },
    cancel: {
      to: 'cancelled'
    }
  },
  shipped: {
    deliver: {
      to: 'delivered'
    }
  },
  cancelled: {},
  delivered: {}
})

// Composable
// composables/useStateMachine.js
import { ref, computed } from 'vue'

export function useStateMachine(machine) {
  const state = ref(machine.state)
  
  machine.onTransition((transition) => {
    state.value = transition.to
  })
  
  const canTransition = (event) => {
    return machine.canTransition(event)
  }
  
  const transition = (event, data) => {
    machine.transition(event, data)
  }
  
  return {
    state,
    canTransition,
    transition
  }
}

// Использование в компоненте
import { useStateMachine } from '@/composables/useStateMachine'

const { state, canTransition, transition } = useStateMachine(orderMachine)

// В шаблоне
<button 
  :disabled="!canTransition('confirm')"
  @click="transition('confirm', { orderId: 123 })"
>
  Confirm Order
</button>
```

### 6. Как реализовать систему прав доступа (RBAC) во Vue приложении?

**Базовая реализация:**
```javascript
// utils/permissions.js
class PermissionManager {
  constructor() {
    this.user = null
    this.roles = []
    this.permissions = []
  }
  
  setUser(user) {
    this.user = user
    this.roles = user.roles || []
    this.permissions = user.permissions || []
  }
  
  hasRole(role) {
    return this.roles.includes(role)
  }
  
  hasAnyRole(roles) {
    return roles.some(role => this.hasRole(role))
  }
  
  hasAllRoles(roles) {
    return roles.every(role => this.hasRole(role))
  }
  
  hasPermission(permission) {
    return this.permissions.includes(permission)
  }
  
  hasAnyPermission(permissions) {
    return permissions.some(perm => this.hasPermission(perm))
  }
  
  can(permission) {
    return this.hasPermission(permission)
  }
}

export const permissionManager = new PermissionManager()

// Директива
// directives/permission.js
import { permissionManager } from '@/utils/permissions'

export default {
  mounted(el, binding) {
    const { value } = binding
    
    if (typeof value === 'string') {
      if (!permissionManager.hasPermission(value)) {
        el.remove()
      }
    } else if (Array.isArray(value)) {
      if (!permissionManager.hasAnyPermission(value)) {
        el.remove()
      }
    } else if (typeof value === 'object') {
      const { permission, role } = value
      
      if (permission && !permissionManager.hasPermission(permission)) {
        el.remove()
        return
      }
      
      if (role && !permissionManager.hasRole(role)) {
        el.remove()
        return
      }
    }
  }
}

// Компонент
// components/Permission.vue
<template>
  <slot v-if="hasAccess" />
</template>

<script setup>
import { computed } from 'vue'
import { permissionManager } from '@/utils/permissions'

const props = defineProps({
  permission: String,
  role: String,
  anyPermission: Array,
  anyRole: Array
})

const hasAccess = computed(() => {
  if (props.permission && !permissionManager.hasPermission(props.permission)) {
    return false
  }
  
  if (props.role && !permissionManager.hasRole(props.role)) {
    return false
  }
  
  if (props.anyPermission && !permissionManager.hasAnyPermission(props.anyPermission)) {
    return false
  }
  
  if (props.anyRole && !permissionManager.hasAnyRole(props.anyRole)) {
    return false
  }
  
  return true
})
</script>

// Использование
<template>
  <!-- Директива -->
  <button v-permission="'users:create'">Create User</button>
  
  <!-- Компонент -->
  <Permission permission="users:delete">
    <button>Delete User</button>
  </Permission>
  
  <Permission :any-role="['admin', 'moderator']">
    <AdminPanel />
  </Permission>
</template>
```

### 7. Как оптимизировать bundle size Vue приложения?

**Анализ bundle:**
```javascript
// vite.config.js
import { visualizer } from 'rollup-plugin-visualizer'

export default {
  plugins: [
    visualizer({
      open: true,
      filename: 'dist/stats.html'
    })
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['vue', 'vue-router', 'pinia'],
          'ui': ['element-plus'],
          'utils': ['lodash-es', 'date-fns']
        }
      }
    }
  }
}
```

**Tree-shaking:**
```javascript
// ❌ Плохо - импортирует всю библиотеку
import _ from 'lodash'

// ✅ Хорошо - импортирует только нужное
import { debounce } from 'lodash-es'

// ❌ Плохо
import * as utils from './utils'

// ✅ Хорошо
import { formatDate } from './utils'
```

**Ленивая загрузка:**
```javascript
// router/index.js
const routes = [
  {
    path: '/dashboard',
    component: () => import('@/views/Dashboard.vue') // Code splitting
  }
]

// Динамический импорт компонентов
const HeavyComponent = defineAsyncComponent(() => 
  import('@/components/HeavyComponent.vue')
)
```

**Оптимизация зависимостей:**
```javascript
// package.json
{
  "dependencies": {
    "lodash-es": "^4.17.21" // ES модули для tree-shaking
  },
  "devDependencies": {
    "lodash": "^4.17.21" // Только для типов
  }
}
```

**Исключение ненужного кода:**
```javascript
// vite.config.js
export default {
  build: {
    terserOptions: {
      compress: {
        drop_console: true, // Удалить console.log
        drop_debugger: true
      }
    }
  }
}
```

### 8. Как реализовать систему темизации с поддержкой темной/светлой темы?

**CSS переменные:**
```css
/* styles/themes.css */
:root {
  --color-primary: #007bff;
  --color-background: #ffffff;
  --color-text: #000000;
}

[data-theme="dark"] {
  --color-primary: #0d6efd;
  --color-background: #1a1a1a;
  --color-text: #ffffff;
}
```

**Composable:**
```javascript
// composables/useTheme.js
import { ref, watch, onMounted } from 'vue'

const theme = ref(localStorage.getItem('theme') || 'light')

export function useTheme() {
  const setTheme = (newTheme) => {
    theme.value = newTheme
    document.documentElement.setAttribute('data-theme', newTheme)
    localStorage.setItem('theme', newTheme)
  }
  
  const toggleTheme = () => {
    setTheme(theme.value === 'light' ? 'dark' : 'light')
  }
  
  onMounted(() => {
    setTheme(theme.value)
    
    // Отслеживание системной темы
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = (e) => {
      if (localStorage.getItem('theme') === 'auto') {
        setTheme(e.matches ? 'dark' : 'light')
      }
    }
    
    mediaQuery.addEventListener('change', handleChange)
    
    return () => {
      mediaQuery.removeEventListener('change', handleChange)
    }
  })
  
  watch(theme, (newTheme) => {
    setTheme(newTheme)
  })
  
  return {
    theme,
    setTheme,
    toggleTheme
  }
}
```

**Расширенная система тем:**
```javascript
// themes/index.js
export const themes = {
  light: {
    name: 'light',
    colors: {
      primary: '#007bff',
      secondary: '#6c757d',
      background: '#ffffff',
      surface: '#f8f9fa',
      text: '#000000',
      textSecondary: '#6c757d'
    }
  },
  dark: {
    name: 'dark',
    colors: {
      primary: '#0d6efd',
      secondary: '#6c757d',
      background: '#1a1a1a',
      surface: '#2d2d2d',
      text: '#ffffff',
      textSecondary: '#b0b0b0'
    }
  },
  custom: {
    name: 'custom',
    colors: {
      primary: '#ff6b6b',
      secondary: '#4ecdc4',
      background: '#f7f7f7',
      surface: '#ffffff',
      text: '#333333',
      textSecondary: '#666666'
    }
  }
}

// composables/useAdvancedTheme.js
import { ref, watch } from 'vue'
import { themes } from '@/themes'

const currentTheme = ref('light')

export function useAdvancedTheme() {
  const applyTheme = (themeName) => {
    const theme = themes[themeName]
    if (!theme) return
    
    Object.entries(theme.colors).forEach(([key, value]) => {
      document.documentElement.style.setProperty(
        `--color-${key}`,
        value
      )
    })
    
    currentTheme.value = themeName
    localStorage.setItem('theme', themeName)
  }
  
  const createCustomTheme = (colors) => {
    const customTheme = {
      name: 'custom',
      colors: {
        ...themes.light.colors,
        ...colors
      }
    }
    
    themes.custom = customTheme
    applyTheme('custom')
  }
  
  return {
    currentTheme,
    themes,
    applyTheme,
    createCustomTheme
  }
}
```

### 9. Как реализовать систему логирования и мониторинга ошибок?

**Базовый логгер:**
```javascript
// utils/logger.js
class Logger {
  constructor() {
    this.logs = []
    this.maxLogs = 1000
  }
  
  log(level, message, data = {}) {
    const logEntry = {
      level,
      message,
      data,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    }
    
    this.logs.push(logEntry)
    
    // Ограничение размера
    if (this.logs.length > this.maxLogs) {
      this.logs.shift()
    }
    
    // Отправка на сервер для критических ошибок
    if (level === 'error' || level === 'fatal') {
      this.sendToServer(logEntry)
    }
    
    // Консоль для разработки
    if (import.meta.env.DEV) {
      console[level](message, data)
    }
  }
  
  async sendToServer(logEntry) {
    try {
      await fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(logEntry)
      })
    } catch (error) {
      console.error('Failed to send log to server:', error)
    }
  }
  
  error(message, data) {
    this.log('error', message, data)
  }
  
  warn(message, data) {
    this.log('warn', message, data)
  }
  
  info(message, data) {
    this.log('info', message, data)
  }
  
  debug(message, data) {
    this.log('debug', message, data)
  }
}

export const logger = new Logger()

// Глобальный обработчик ошибок
// main.js
app.config.errorHandler = (err, instance, info) => {
  logger.error('Vue Error', {
    error: err.message,
    stack: err.stack,
    component: instance?.$options.name,
    info
  })
}

// Обработчик необработанных ошибок
window.addEventListener('error', (event) => {
  logger.error('Unhandled Error', {
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
    error: event.error
  })
})

// Обработчик промисов
window.addEventListener('unhandledrejection', (event) => {
  logger.error('Unhandled Promise Rejection', {
    reason: event.reason
  })
})
```

**Composable для логирования:**
```javascript
// composables/useLogger.js
import { logger } from '@/utils/logger'

export function useLogger(componentName) {
  return {
    error: (message, data) => {
      logger.error(`[${componentName}] ${message}`, data)
    },
    warn: (message, data) => {
      logger.warn(`[${componentName}] ${message}`, data)
    },
    info: (message, data) => {
      logger.info(`[${componentName}] ${message}`, data)
    },
    debug: (message, data) => {
      logger.debug(`[${componentName}] ${message}`, data)
    }
  }
}

// Использование
import { useLogger } from '@/composables/useLogger'

const log = useLogger('UserProfile')

try {
  await fetchUser()
} catch (error) {
  log.error('Failed to fetch user', { error, userId })
}
```

### 10. Как реализовать систему A/B тестирования во Vue?

**Базовая реализация:**
```javascript
// utils/abTesting.js
class ABTesting {
  constructor() {
    this.tests = new Map()
    this.variants = new Map()
  }
  
  registerTest(testName, variants, options = {}) {
    this.tests.set(testName, {
      variants,
      options,
      selectedVariant: this.selectVariant(testName, variants)
    })
    
    // Сохранение выбранного варианта
    const storageKey = `ab_test_${testName}`
    localStorage.setItem(storageKey, this.tests.get(testName).selectedVariant)
    
    return this.tests.get(testName).selectedVariant
  }
  
  selectVariant(testName, variants) {
    // Проверка сохраненного варианта
    const storageKey = `ab_test_${testName}`
    const saved = localStorage.getItem(storageKey)
    if (saved && variants.includes(saved)) {
      return saved
    }
    
    // Случайный выбор на основе userId или sessionId
    const userId = this.getUserId()
    const hash = this.hashCode(`${testName}_${userId}`)
    const index = hash % variants.length
    
    return variants[index]
  }
  
  getVariant(testName) {
    const test = this.tests.get(testName)
    if (!test) {
      return null
    }
    
    return test.selectedVariant
  }
  
  trackEvent(testName, eventName, data = {}) {
    const variant = this.getVariant(testName)
    
    // Отправка события в аналитику
    this.sendToAnalytics({
      test: testName,
      variant,
      event: eventName,
      data,
      timestamp: Date.now()
    })
  }
  
  hashCode(str) {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32bit integer
    }
    return Math.abs(hash)
  }
  
  getUserId() {
    // Получение userId из store или генерация
    return localStorage.getItem('userId') || this.generateSessionId()
  }
  
  generateSessionId() {
    return `session_${Date.now()}_${Math.random()}`
  }
  
  async sendToAnalytics(event) {
    // Отправка в аналитическую систему
    try {
      await fetch('/api/analytics/ab-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event)
      })
    } catch (error) {
      console.error('Failed to send AB test event:', error)
    }
  }
}

export const abTesting = new ABTesting()

// Composable
// composables/useABTest.js
import { ref, onMounted } from 'vue'
import { abTesting } from '@/utils/abTesting'

export function useABTest(testName, variants) {
  const variant = ref(null)
  
  onMounted(() => {
    variant.value = abTesting.registerTest(testName, variants)
  })
  
  const trackEvent = (eventName, data) => {
    abTesting.trackEvent(testName, eventName, data)
  }
  
  return {
    variant,
    trackEvent
  }
}

// Использование
<template>
  <div>
    <button 
      v-if="variant === 'A'"
      @click="handleClick"
    >
      Original Button
    </button>
    <button 
      v-else-if="variant === 'B'"
      @click="handleClick"
      class="new-design"
    >
      New Button Design
    </button>
  </div>
</template>

<script setup>
import { useABTest } from '@/composables/useABTest'

const { variant, trackEvent } = useABTest('button-design', ['A', 'B'])

const handleClick = () => {
  trackEvent('button_clicked', { variant: variant.value })
  // Логика клика
}
</script>
```

Эти вопросы и ответы охватывают продвинутые темы для middle и senior разработчиков Vue.js, включая архитектурные паттерны, оптимизацию производительности и сложные системы управления состоянием.
