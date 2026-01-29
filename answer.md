Вопросы junior разработчику

1. Расскажите, как вы работали с REST API в своих проектах.

Работа с REST API включает использование HTTP методов (GET, POST, PUT, DELETE) для взаимодействия с сервером. Обычно использую axios или fetch для выполнения запросов.

Пример с axios:

```javascript
// services/api.js
import axios from 'axios'

const api = axios.create({
  baseURL: 'https://api.example.com',
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// GET запрос
export const getUsers = async () => {
  try {
    const response = await api.get('/users')
    return response.data
  } catch (error) {
    console.error('Ошибка получения пользователей:', error)
    throw error
  }
}

// POST запрос
export const createUser = async (userData) => {
  try {
    const response = await api.post('/users', userData)
    return response.data
  } catch (error) {
    console.error('Ошибка создания пользователя:', error)
    throw error
  }
}

// PUT запрос
export const updateUser = async (id, userData) => {
  try {
    const response = await api.put(`/users/${id}`, userData)
    return response.data
  } catch (error) {
    console.error('Ошибка обновления пользователя:', error)
    throw error
  }
}

// DELETE запрос
export const deleteUser = async (id) => {
  try {
    const response = await api.delete(`/users/${id}`)
    return response.data
  } catch (error) {
    console.error('Ошибка удаления пользователя:', error)
    throw error
  }
}
```

Использование в компоненте:

```vue
<template>
  <div>
    <button @click="fetchUsers">Загрузить пользователей</button>
    <ul>
      <li v-for="user in users" :key="user.id">{{ user.name }}</li>
    </ul>
  </div>
</template>

<script>
import { getUsers } from '@/services/api'

export default {
  data() {
    return {
      users: []
    }
  },
  methods: {
    async fetchUsers() {
      try {
        this.users = await getUsers()
      } catch (error) {
        alert('Не удалось загрузить пользователей')
      }
    }
  }
}
</script>
```

1. Какие технологии вы использовали в своих проектах?

В проектах использовал следующие технологии:

Frontend:

- Vue.js 3 (Composition API, Options API)
- Vue Router для маршрутизации
- Pinia/Vuex для управления состоянием
- Axios для HTTP запросов
- Tailwind CSS / Bootstrap для стилизации
- TypeScript для типизации
- Vite как сборщик

Инструменты разработки:

- Git для контроля версий
- ESLint + Prettier для форматирования кода
- Jest / Vitest для тестирования
- Vue DevTools для отладки

Пример структуры проекта:

```
project/
├── src/
│   ├── components/     # Переиспользуемые компоненты
│   ├── views/         # Страницы приложения
│   ├── router/        # Конфигурация маршрутов
│   ├── store/         # Управление состоянием
│   ├── services/      # API сервисы
│   ├── utils/         # Утилиты
│   └── assets/        # Статические ресурсы
├── tests/             # Тесты
└── package.json
```

1. С какими проблемами и сложностями вы сталкивались при разработке на Vue.js и как вы их решали?

Проблема 1: Реактивность вложенных объектов

```javascript
// Проблема: изменения не отслеживаются
data() {
  return {
    user: {
      name: 'John',
      address: {
        city: 'Moscow'
      }
    }
  }
},
methods: {
  updateCity() {
    this.user.address.city = 'SPB' // Не реактивно!
  }
}
```

Решение:

```javascript
// Использование Vue.set или this.$set
this.$set(this.user.address, 'city', 'SPB')

// Или использование spread оператора
this.user = {
  ...this.user,
  address: {
    ...this.user.address,
    city: 'SPB'
  }
}

// В Vue 3 с Composition API
import { reactive } from 'vue'
const user = reactive({
  name: 'John',
  address: {
    city: 'Moscow'
  }
})
```

Проблема 2: Утечки памяти при использовании событий

```javascript
// Проблема: слушатели не удаляются
mounted() {
  window.addEventListener('resize', this.handleResize)
}
// Забыли удалить в beforeUnmount
```

Решение:

```javascript
mounted() {
  window.addEventListener('resize', this.handleResize)
},
beforeUnmount() {
  window.removeEventListener('resize', this.handleResize)
}
```

Проблема 3: Асинхронные обновления DOM

```javascript
// Проблема: DOM еще не обновлен
this.items.push(newItem)
this.$refs.list.scrollTop = this.$refs.list.scrollHeight
```

Решение:

```javascript
this.items.push(newItem)
this.$nextTick(() => {
  this.$refs.list.scrollTop = this.$refs.list.scrollHeight
})
```

1. Какие инструменты для контроля версий вы использовали?

Использовал Git с различными стратегиями работы:

Основные команды:

```bash
# Инициализация репозитория
git init

# Добавление файлов
git add .
git commit -m "feat: добавлена авторизация"

# Работа с ветками
git checkout -b feature/new-feature
git merge feature/new-feature
git rebase main

# Отправка изменений
git push origin main
git pull origin main
```

Стратегия Git Flow:

```bash
main          # Продакшн код
├── develop   # Разработка
├── feature/  # Новые функции
├── release/  # Подготовка к релизу
└── hotfix/   # Срочные исправления
```

Пример работы:

```bash
# Создание feature ветки
git checkout -b feature/user-authentication

# Коммиты с понятными сообщениями
git commit -m "feat: добавлена форма входа"
git commit -m "fix: исправлена валидация email"
git commit -m "refactor: оптимизирован код авторизации"

# Слияние с develop
git checkout develop
git merge feature/user-authentication
```

1. Расскажите, пожалуйста, о своем опыте работы в команде и взаимодействия с другими разработчиками.

Работа в команде включает:

- Code review для проверки качества кода
- Использование issue tracker (Jira, GitHub Issues)
- Ежедневные stand-up встречи
- Планирование спринтов
- Документирование кода и API

Пример процесса code review:

```javascript
// Плохо: без комментариев, сложная логика
function processData(data) {
  return data.map(x => x.filter(y => y > 0).reduce((a, b) => a + b, 0))
}

// Хорошо: понятные названия, комментарии
/**
 * Вычисляет сумму положительных значений для каждого элемента массива
 * @param {Array<Array<number>>} data - массив массивов чисел
 * @returns {Array<number>} массив сумм
 */
function calculatePositiveSums(data) {
  return data.map(item => {
    const positiveValues = item.filter(value => value > 0)
    return positiveValues.reduce((sum, value) => sum + value, 0)
  })
}
```

1. Приведите пример использования Vuex для управления состоянием приложения.

Vuex - централизованное хранилище состояния для Vue.js приложений.

Пример store:

```javascript
// store/index.js
import { createStore } from 'vuex'

export default createStore({
  state: {
    user: null,
    products: [],
    cart: []
  },
  
  getters: {
    isAuthenticated: state => !!state.user,
    cartTotal: state => {
      return state.cart.reduce((total, item) => {
        return total + (item.price * item.quantity)
      }, 0)
    },
    productById: (state) => (id) => {
      return state.products.find(product => product.id === id)
    }
  },
  
  mutations: {
    SET_USER(state, user) {
      state.user = user
    },
    ADD_PRODUCT(state, product) {
      state.products.push(product)
    },
    ADD_TO_CART(state, item) {
      const existingItem = state.cart.find(i => i.id === item.id)
      if (existingItem) {
        existingItem.quantity += item.quantity
      } else {
        state.cart.push({ ...item })
      }
    },
    REMOVE_FROM_CART(state, itemId) {
      state.cart = state.cart.filter(item => item.id !== itemId)
    }
  },
  
  actions: {
    async login({ commit }, credentials) {
      try {
        const response = await api.post('/login', credentials)
        commit('SET_USER', response.data.user)
        return response.data
      } catch (error) {
        throw error
      }
    },
    
    async fetchProducts({ commit }) {
      try {
        const response = await api.get('/products')
        commit('SET_PRODUCTS', response.data)
      } catch (error) {
        console.error('Ошибка загрузки продуктов:', error)
      }
    },
    
    addToCart({ commit, state }, product) {
      const cartItem = {
        ...product,
        quantity: 1
      }
      commit('ADD_TO_CART', cartItem)
    }
  },
  
  modules: {
    // Модули для больших приложений
  }
})
```

Использование в компоненте:

```vue
<template>
  <div>
    <p v-if="isAuthenticated">Добро пожаловать, {{ user.name }}!</p>
    <p>Итого в корзине: {{ cartTotal }} руб.</p>
    <button @click="addProductToCart">Добавить в корзину</button>
  </div>
</template>

<script>
import { mapState, mapGetters, mapActions } from 'vuex'

export default {
  computed: {
    ...mapState(['user', 'cart']),
    ...mapGetters(['isAuthenticated', 'cartTotal'])
  },
  methods: {
    ...mapActions(['addToCart']),
    addProductToCart() {
      this.addToCart({
        id: 1,
        name: 'Товар',
        price: 100
      })
    }
  }
}
</script>
```

1. Что такое mixins во Vue.js? Какие недостатки у mixins?

Mixins - способ переиспользования логики компонентов.

Пример mixin:

```javascript
// mixins/userMixin.js
export const userMixin = {
  data() {
    return {
      user: null,
      loading: false
    }
  },
  methods: {
    async fetchUser(id) {
      this.loading = true
      try {
        this.user = await api.getUser(id)
      } catch (error) {
        console.error(error)
      } finally {
        this.loading = false
      }
    }
  },
  mounted() {
    console.log('Mixin mounted')
  }
}
```

Использование:

```vue
<script>
import { userMixin } from '@/mixins/userMixin'

export default {
  mixins: [userMixin],
  mounted() {
    this.fetchUser(1)
    console.log('Component mounted') // Оба лога выполнятся
  }
}
</script>
```

Недостатки mixins:

1. Неявные зависимости - сложно отследить откуда приходит свойство
2. Конфликты имен - свойства могут перезаписываться
3. Сложность отладки - непонятно откуда берется логика
4. Не гибкие - нельзя передать параметры

Лучшая альтернатива - Composition API:

```javascript
// composables/useUser.js
import { ref } from 'vue'
import { api } from '@/services/api'

export function useUser() {
  const user = ref(null)
  const loading = ref(false)
  
  const fetchUser = async (id) => {
    loading.value = true
    try {
      user.value = await api.getUser(id)
    } catch (error) {
      console.error(error)
    } finally {
      loading.value = false
    }
  }
  
  return {
    user,
    loading,
    fetchUser
  }
}
```

1. Как используются вычисляемые свойства во Vue.js?

Вычисляемые свойства (computed) кэшируются и пересчитываются только при изменении зависимостей.

Пример:

```vue
<template>
  <div>
    <p>Полное имя: {{ fullName }}</p>
    <p>Обратное имя: {{ reversedName }}</p>
    <p>Отфильтрованные товары: {{ filteredProducts.length }}</p>
  </div>
</template>

<script>
export default {
  data() {
    return {
      firstName: 'Иван',
      lastName: 'Иванов',
      products: [
        { name: 'Товар 1', price: 100, inStock: true },
        { name: 'Товар 2', price: 200, inStock: false },
        { name: 'Товар 3', price: 150, inStock: true }
      ],
      searchQuery: ''
    }
  },
  computed: {
    // Простое вычисляемое свойство
    fullName() {
      return `${this.firstName} ${this.lastName}`
    },
    
    // С геттером и сеттером
    reversedName: {
      get() {
        return this.fullName.split('').reverse().join('')
      },
      set(value) {
        const names = value.split(' ')
        this.firstName = names[0]
        this.lastName = names[1]
      }
    },
    
    // Фильтрация с параметром
    filteredProducts() {
      return this.products.filter(product => {
        const matchesSearch = product.name
          .toLowerCase()
          .includes(this.searchQuery.toLowerCase())
        return matchesSearch && product.inStock
      })
    },
    
    // Сортировка
    sortedProducts() {
      return [...this.products].sort((a, b) => a.price - b.price)
    }
  }
}
</script>
```

Composition API:

```vue
<script setup>
import { computed, ref } from 'vue'

const firstName = ref('Иван')
const lastName = ref('Иванов')

const fullName = computed(() => {
  return `${firstName.value} ${lastName.value}`
})

const reversedName = computed({
  get: () => fullName.value.split('').reverse().join(''),
  set: (value) => {
    const names = value.split(' ')
    firstName.value = names[0]
    lastName.value = names[1]
  }
})
</script>
```

1. В чем разница между v-if и v-show?

v-if - условный рендеринг (элемент создается/удаляется из DOM)
v-show - условное отображение (элемент всегда в DOM, меняется только CSS display)

Пример:

```vue
<template>
  <div>
    <!-- v-if: элемент полностью удаляется из DOM -->
    <div v-if="isVisible">Видимый элемент (v-if)</div>
    
    <!-- v-show: элемент скрыт через display: none -->
    <div v-show="isVisible">Видимый элемент (v-show)</div>
    
    <!-- v-if с else -->
    <div v-if="user">Привет, {{ user.name }}!</div>
    <div v-else>Пожалуйста, войдите</div>
    
    <!-- v-if с else-if -->
    <div v-if="status === 'loading'">Загрузка...</div>
    <div v-else-if="status === 'error'">Ошибка</div>
    <div v-else>Готово</div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      isVisible: true,
      user: null,
      status: 'loading'
    }
  }
}
</script>
```

Когда использовать:

- v-if: когда переключение редкое, тяжелые компоненты, нужна условная логика
- v-show: когда переключение частое, легкие элементы, нужна только видимость

```vue
<!-- v-if лучше для тяжелых компонентов -->
<HeavyComponent v-if="showHeavy" />

<!-- v-show лучше для частых переключений -->
<div v-show="isMenuOpen">Меню</div>
```

1. Что такое Vue CLI? Какие функции предоставляет Vue CLI?

Vue CLI - стандартный инструмент для быстрого создания проектов Vue.js.

Основные команды:

```bash
# Установка
npm install -g @vue/cli

# Создание проекта
vue create my-project

# Запуск dev сервера
vue serve
vue build

# Плагины
vue add router
vue add vuex
vue add typescript
```

Функции:

- Генерация проектов с различными конфигурациями
- Hot Module Replacement (HMR)
- Оптимизация production сборки
- Плагины и пресеты
- Интеграция с TypeScript, PWA, тестированием

Современная альтернатива - Vite:

```bash
# Создание проекта с Vite
npm create vue@latest my-project

# Запуск
npm run dev

# Сборка
npm run build
```

1. Расскажите об опыте работы с Vue.js. Какие основные компоненты вы использовали?

Основные компоненты, которые использовал:

Компоненты UI:

```vue
<!-- Button.vue -->
<template>
  <button 
    :class="buttonClass"
    :disabled="disabled"
    @click="$emit('click', $event)"
  >
    <slot></slot>
  </button>
</template>

<script>
export default {
  name: 'BaseButton',
  props: {
    variant: {
      type: String,
      default: 'primary',
      validator: (value) => ['primary', 'secondary', 'danger'].includes(value)
    },
    disabled: Boolean
  },
  computed: {
    buttonClass() {
      return {
        'btn': true,
        [`btn-${this.variant}`]: true,
        'btn-disabled': this.disabled
      }
    }
  }
}
</script>
```

Модальное окно:

```vue
<!-- Modal.vue -->
<template>
  <Teleport to="body">
    <div v-if="isOpen" class="modal-overlay" @click.self="close">
      <div class="modal-content">
        <header class="modal-header">
          <h2>{{ title }}</h2>
          <button @click="close">×</button>
        </header>
        <div class="modal-body">
          <slot></slot>
        </div>
        <footer class="modal-footer">
          <slot name="footer">
            <button @click="close">Закрыть</button>
          </slot>
        </footer>
      </div>
    </div>
  </Teleport>
</template>

<script>
export default {
  name: 'Modal',
  props: {
    isOpen: Boolean,
    title: String
  },
  emits: ['close'],
  methods: {
    close() {
      this.$emit('close')
    }
  }
}
</script>
```

1. Как бы вы описали процесс разработки приложения с использованием Vue.js?

Процесс разработки:

1. Планирование и проектирование

```javascript
// Определение структуры компонентов
components/
  ├── layout/
  │   ├── Header.vue
  │   ├── Sidebar.vue
  │   └── Footer.vue
  ├── common/
  │   ├── Button.vue
  │   ├── Input.vue
  │   └── Modal.vue
  └── features/
      ├── auth/
      │   ├── LoginForm.vue
      │   └── RegisterForm.vue
      └── products/
          ├── ProductList.vue
          └── ProductCard.vue
```

1. Настройка проекта

```bash
npm create vue@latest
# Выбор опций: Router, Pinia, TypeScript, ESLint
```

1. Разработка компонентов (снизу вверх)

```vue
<!-- Сначала базовые компоненты -->
<BaseButton>Click me</BaseButton>

<!-- Затем композитные -->
<ProductCard :product="product" />

<!-- И наконец страницы -->
<ProductsPage />
```

1. Интеграция с API

```javascript
// services/api.js
export const productService = {
  async getAll() {
    const response = await axios.get('/products')
    return response.data
  }
}
```

1. Управление состоянием

```javascript
// store/products.js
export const useProductStore = defineStore('products', {
  state: () => ({
    items: []
  }),
  actions: {
    async fetchProducts() {
      this.items = await productService.getAll()
    }
  }
})
```

1. Тестирование

```javascript
// tests/Button.spec.js
import { mount } from '@vue/test-utils'
import Button from '@/components/Button.vue'

test('renders button', () => {
  const wrapper = mount(Button, {
    slots: { default: 'Click me' }
  })
  expect(wrapper.text()).toBe('Click me')
})
```

1. Что такое Virtual DOM и как он работает?

Virtual DOM - это JavaScript представление реального DOM в памяти.

Как работает:

```javascript
// 1. Vue создает Virtual DOM дерево
const vnode = {
  tag: 'div',
  props: { class: 'container' },
  children: [
    {
      tag: 'h1',
      children: 'Заголовок'
    }
  ]
}

// 2. При изменении данных создается новое дерево
const newVnode = {
  tag: 'div',
  props: { class: 'container updated' },
  children: [
    {
      tag: 'h1',
      children: 'Новый заголовок'
    }
  ]
}

// 3. Vue сравнивает старое и новое дерево (diff алгоритм)
// 4. Применяются только необходимые изменения к реальному DOM
```

Пример:

```vue
<template>
  <div>
    <p v-for="item in items" :key="item.id">{{ item.name }}</p>
  </div>
</template>

<script>
export default {
  data() {
    return {
      items: [
        { id: 1, name: 'Первый' },
        { id: 2, name: 'Второй' }
      ]
    }
  },
  mounted() {
    // Vue использует key для эффективного обновления
    // Без key Vue пересоздаст все элементы
    // С key Vue обновит только измененные
    setTimeout(() => {
      this.items.push({ id: 3, name: 'Третий' })
    }, 1000)
  }
}
</script>
```

Преимущества:

- Быстрее чем прямое изменение DOM
- Оптимизация обновлений (batch updates)
- Проще работать с состоянием

1. Объясните как вы понимаете реактивность во Vue.js?

Реактивность - автоматическое обновление UI при изменении данных.

Options API:

```vue
<template>
  <div>
    <p>Счетчик: {{ count }}</p>
    <p>Удвоенное значение: {{ doubled }}</p>
    <button @click="increment">Увеличить</button>
  </div>
</template>

<script>
export default {
  data() {
    return {
      count: 0
    }
  },
  computed: {
    doubled() {
      return this.count * 2 // Автоматически пересчитывается
    }
  },
  watch: {
    count(newVal, oldVal) {
      console.log(`Изменено с ${oldVal} на ${newVal}`)
    }
  },
  methods: {
    increment() {
      this.count++ // UI автоматически обновится
    }
  }
}
</script>
```

Composition API:

```vue
<script setup>
import { ref, computed, watch } from 'vue'

const count = ref(0)

const doubled = computed(() => count.value * 2)

watch(count, (newVal, oldVal) => {
  console.log(`Изменено с ${oldVal} на ${newVal}`)
})

function increment() {
  count.value++
}
</script>
```

Как это работает:

```javascript
// Vue 3 использует Proxy для реактивности
const state = reactive({
  count: 0
})

// При изменении Vue отслеживает это
state.count++ // Триггерит обновление компонентов
```

1. Расскажите про жизненный цикл компонентов в Vue.js и как они взаимодействуют друг с другом.

Жизненный цикл компонента:

```vue
<script>
export default {
  // 1. Инициализация (до создания экземпляра)
  beforeCreate() {
    console.log('beforeCreate: данные еще не реактивны')
    // this.count - undefined
  },
  
  // 2. Создание (данные реактивны, но DOM еще нет)
  created() {
    console.log('created: данные реактивны, можно делать API запросы')
    // this.count - доступно
    this.fetchData()
  },
  
  // 3. Монтирование (перед рендерингом DOM)
  beforeMount() {
    console.log('beforeMount: перед первым рендером')
    // this.$el - undefined
  },
  
  // 4. Смонтирован (DOM создан)
  mounted() {
    console.log('mounted: компонент в DOM, можно работать с $refs')
    // this.$el - доступен
    this.initThirdPartyLibrary()
  },
  
  // 5. Обновление (перед обновлением DOM)
  beforeUpdate() {
    console.log('beforeUpdate: данные изменились, DOM еще старый')
  },
  
  // 6. Обновлен (DOM обновлен)
  updated() {
    console.log('updated: DOM обновлен')
    // Осторожно: может вызвать бесконечный цикл
  },
  
  // 7. Размонтирование (перед удалением)
  beforeUnmount() {
    console.log('beforeUnmount: компонент еще существует')
    // Очистка таймеров, слушателей
    clearInterval(this.timer)
    window.removeEventListener('resize', this.handleResize)
  },
  
  // 8. Размонтирован (компонент удален)
  unmounted() {
    console.log('unmounted: компонент удален')
  }
}
</script>
```

Composition API:

```vue
<script setup>
import { onMounted, onBeforeUnmount } from 'vue'

onMounted(() => {
  console.log('Компонент смонтирован')
  // Инициализация
})

onBeforeUnmount(() => {
  console.log('Компонент будет размонтирован')
  // Очистка
})
</script>
```

Взаимодействие компонентов:

```vue
<!-- Родительский компонент -->
<template>
  <ChildComponent 
    :message="parentMessage"
    @child-event="handleChildEvent"
  />
</template>

<script>
export default {
  data() {
    return {
      parentMessage: 'Привет от родителя'
    }
  },
  methods: {
    handleChildEvent(data) {
      console.log('Событие от ребенка:', data)
    }
  }
}
</script>

<!-- Дочерний компонент -->
<template>
  <div>
    <p>{{ message }}</p>
    <button @click="notifyParent">Отправить событие</button>
  </div>
</template>

<script>
export default {
  props: {
    message: String
  },
  emits: ['child-event'],
  methods: {
    notifyParent() {
      this.$emit('child-event', { data: 'test' })
    }
  }
}
</script>
```

1. Какие преимущества дает использование Vue.js для создания веб-приложений по сравнению с другими фреймворками?

Преимущества Vue.js:

1. Простота изучения

```vue
<!-- Минимальный пример -->
<template>
  <div>{{ message }}</div>
</template>

<script>
export default {
  data() {
    return { message: 'Hello Vue!' }
  }
}
</script>
```

1. Гибкость (Options API и Composition API)
2. Производительность (Virtual DOM, оптимизации)
3. Размер бандла (меньше чем Angular)
4. Отличная документация
5. Инкрементальная адаптация (можно использовать частично)

Сравнение:

- Vue vs React: проще синтаксис, встроенная поддержка стилей
- Vue vs Angular: меньше boilerplate, проще кривая обучения

1. Опишите процесс создания форм с использованием компонентов Vue.

Создание форм с валидацией:

```vue
<template>
  <form @submit.prevent="handleSubmit">
    <!-- Текстовое поле -->
    <div class="form-group">
      <label>Имя</label>
      <input 
        v-model.trim="form.name"
        type="text"
        :class="{ 'error': errors.name }"
        @blur="validateField('name')"
      />
      <span v-if="errors.name" class="error-message">
        {{ errors.name }}
      </span>
    </div>
    
    <!-- Email -->
    <div class="form-group">
      <label>Email</label>
      <input 
        v-model.trim="form.email"
        type="email"
        :class="{ 'error': errors.email }"
        @blur="validateField('email')"
      />
      <span v-if="errors.email" class="error-message">
        {{ errors.email }}
      </span>
    </div>
    
    <!-- Select -->
    <div class="form-group">
      <label>Город</label>
      <select v-model="form.city">
        <option value="">Выберите город</option>
        <option value="moscow">Москва</option>
        <option value="spb">Санкт-Петербург</option>
      </select>
    </div>
    
    <!-- Checkbox -->
    <div class="form-group">
      <label>
        <input type="checkbox" v-model="form.agree" />
        Согласен с условиями
      </label>
    </div>
    
    <!-- Radio -->
    <div class="form-group">
      <label>
        <input type="radio" value="male" v-model="form.gender" />
        Мужской
      </label>
      <label>
        <input type="radio" value="female" v-model="form.gender" />
        Женский
      </label>
    </div>
    
    <button type="submit" :disabled="!isValid">
      Отправить
    </button>
  </form>
</template>

<script>
export default {
  data() {
    return {
      form: {
        name: '',
        email: '',
        city: '',
        agree: false,
        gender: ''
      },
      errors: {}
    }
  },
  computed: {
    isValid() {
      return this.form.name && 
             this.form.email && 
             this.form.agree &&
             Object.keys(this.errors).length === 0
    }
  },
  methods: {
    validateField(field) {
      switch (field) {
        case 'name':
          if (!this.form.name) {
            this.errors.name = 'Имя обязательно'
          } else if (this.form.name.length < 2) {
            this.errors.name = 'Имя должно быть минимум 2 символа'
          } else {
            delete this.errors.name
          }
          break
        case 'email':
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
          if (!this.form.email) {
            this.errors.email = 'Email обязателен'
          } else if (!emailRegex.test(this.form.email)) {
            this.errors.email = 'Неверный формат email'
          } else {
            delete this.errors.email
          }
          break
      }
    },
    async handleSubmit() {
      // Валидация всех полей
      Object.keys(this.form).forEach(key => {
        this.validateField(key)
      })
      
      if (!this.isValid) {
        return
      }
      
      try {
        await this.submitForm(this.form)
        alert('Форма отправлена успешно!')
      } catch (error) {
        alert('Ошибка отправки формы')
      }
    },
    async submitForm(data) {
      // API запрос
      return await fetch('/api/submit', {
        method: 'POST',
        body: JSON.stringify(data)
      })
    }
  }
}
</script>
```

1. Назовите хотя бы четыре инструкции во Vue.js и приведите примеры их использования.

Директивы Vue.js:

1. v-if / v-else / v-else-if

```vue
<div v-if="isVisible">Видимый</div>
<div v-else>Скрытый</div>
```

1. v-show

```vue
<div v-show="isMenuOpen">Меню</div>
```

1. v-for

```vue
<ul>
  <li v-for="(item, index) in items" :key="item.id">
    {{ index + 1 }}. {{ item.name }}
  </li>
</ul>

<!-- С объектом -->
<div v-for="(value, key) in object" :key="key">
  {{ key }}: {{ value }}
</div>
```

1. v-model

```vue
<input v-model="message" />
<textarea v-model="text"></textarea>
<select v-model="selected">
  <option value="a">A</option>
</select>
```

1. v-bind (или :)

```vue
<img :src="imageSrc" :alt="imageAlt" />
<div :class="{ active: isActive }"></div>
<button :disabled="isLoading">Отправить</button>
```

1. v-on (или @)

```vue
<button @click="handleClick">Клик</button>
<input @input="handleInput" />
<form @submit.prevent="handleSubmit"></form>
```

1. v-text / v-html

```vue
<p v-text="message"></p>
<div v-html="htmlContent"></div>
```

1. v-once

```vue
<p v-once>{{ message }}</p> <!-- Рендерится только один раз -->
```

1. v-pre

```vue
<div v-pre>{{ это не будет интерпретировано }}</div>
```

1. v-cloak

```vue
<style>
[v-cloak] { display: none; }
</style>
<div v-cloak>{{ message }}</div>
```

Вопросы middle разработчику

1. Что такое Composition API в Vue? В чем преимущества Composition API?

Composition API - новый способ организации логики компонентов.

Пример сравнения:

Options API:

```vue
<script>
export default {
  data() {
    return {
      count: 0,
      name: 'John'
    }
  },
  computed: {
    doubled() {
      return this.count * 2
    }
  },
  methods: {
    increment() {
      this.count++
    }
  },
  mounted() {
    console.log('Mounted')
  }
}
</script>
```

Composition API:

```vue
<script setup>
import { ref, computed, onMounted } from 'vue'

const count = ref(0)
const name = ref('John')

const doubled = computed(() => count.value * 2)

function increment() {
  count.value++
}

onMounted(() => {
  console.log('Mounted')
})
</script>
```

Преимущества:

1. Лучшая организация кода (логика группируется по функциональности)
2. Переиспользование логики (composables)
3. TypeScript поддержка
4. Меньше магии (явные импорты)

Пример composable:

```javascript
// composables/useCounter.js
import { ref, computed } from 'vue'

export function useCounter(initialValue = 0) {
  const count = ref(initialValue)
  
  const doubled = computed(() => count.value * 2)
  
  function increment() {
    count.value++
  }
  
  function decrement() {
    count.value--
  }
  
  function reset() {
    count.value = initialValue
  }
  
  return {
    count,
    doubled,
    increment,
    decrement,
    reset
  }
}
```

Использование:

```vue
<script setup>
import { useCounter } from '@/composables/useCounter'

const { count, doubled, increment } = useCounter(10)
</script>
```

1. Как вы следите за новыми тенденциями и технологиями в области веб-разработки?

Способы отслеживания:

- Официальная документация Vue.js
- GitHub репозитории (Vue, Vite, Pinia)
- Блоги и статьи (Vue Mastery, Vue School)
- Сообщества (Discord, Reddit)
- Конференции и митапы
- Подкасты и YouTube каналы

1. Можете ли вы описать процесс оптимизации производительности вашего кода?

Оптимизации:

1. Ленивая загрузка компонентов

```javascript
// router/index.js
const Home = () => import('@/views/Home.vue')
```

1. Виртуализация списков

```vue
<template>
  <VirtualList
    :data-key="'id'"
    :data-sources="items"
    :data-component="ItemComponent"
  />
</template>
```

1. Мемоизация вычислений

```vue
<script setup>
import { computed } from 'vue'

// Кэшируется автоматически
const expensiveValue = computed(() => {
  return heavyCalculation(props.data)
})
</script>
```

1. Оптимизация рендеринга

```vue
<!-- Используйте key для списков -->
<div v-for="item in items" :key="item.id">

<!-- v-show вместо v-if для частых переключений -->
<div v-show="isVisible">

<!-- v-once для статического контента -->
<div v-once>{{ staticContent }}</div>
```

1. Code splitting

```javascript
// vite.config.js
export default {
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['vue', 'vue-router'],
          'utils': ['./src/utils']
        }
      }
    }
  }
}
```

1. Опишите процесс тестирования вашего кода.

Тестирование с Vitest и Vue Test Utils:

```javascript
// tests/components/Button.spec.js
import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import Button from '@/components/Button.vue'

describe('Button.vue', () => {
  it('renders correctly', () => {
    const wrapper = mount(Button, {
      slots: { default: 'Click me' }
    })
    expect(wrapper.text()).toBe('Click me')
  })
  
  it('emits click event', async () => {
    const wrapper = mount(Button)
    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toBeTruthy()
  })
  
  it('applies variant class', () => {
    const wrapper = mount(Button, {
      props: { variant: 'primary' }
    })
    expect(wrapper.classes()).toContain('btn-primary')
  })
})
```

E2E тестирование с Cypress:

```javascript
// cypress/e2e/login.cy.js
describe('Login', () => {
  it('should login successfully', () => {
    cy.visit('/login')
    cy.get('[data-cy=email]').type('user@example.com')
    cy.get('[data-cy=password]').type('password')
    cy.get('[data-cy=submit]').click()
    cy.url().should('include', '/dashboard')
  })
})
```

1. Расскажите об опыте работы со сторонними библиотеками и фреймворками.

Примеры использования библиотек:

UI библиотеки:

```vue
<!-- Element Plus -->
<el-button type="primary">Кнопка</el-button>

<!-- Vuetify -->
<v-btn color="primary">Кнопка</v-btn>
```

Утилиты:

```javascript
// Lodash
import { debounce } from 'lodash-es'

const debouncedSearch = debounce((query) => {
  search(query)
}, 300)

// Date-fns
import { format, addDays } from 'date-fns'

const formatted = format(new Date(), 'yyyy-MM-dd')
```

1. Как вы организуете свою работу в качестве Vue-разработчика?

Организация работы:

- Структура проекта (папки по функциональности)
- Компонентный подход (переиспользуемые компоненты)
- Code style (ESLint, Prettier)
- Git workflow (feature branches, commits)
- Документация (JSDoc, README)

1. Что такое Vue Router? Какие важные функции предоставляет маршрутизатор? Какие хуки навигации есть у vue-router?

Vue Router - официальный маршрутизатор для Vue.js.

Настройка:

```javascript
// router/index.js
import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/Home.vue')
  },
  {
    path: '/user/:id',
    name: 'User',
    component: () => import('@/views/User.vue'),
    props: true
  },
  {
    path: '/admin',
    component: () => import('@/views/Admin.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: 'dashboard',
        component: () => import('@/views/Dashboard.vue')
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Глобальные хуки
router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth && !isAuthenticated()) {
    next('/login')
  } else {
    next()
  }
})

export default router
```

Хуки навигации:

```javascript
// beforeRouteEnter - до входа в роут
beforeRouteEnter(to, from, next) {
  // Нет доступа к this
  next(vm => {
    // vm - экземпляр компонента
  })
}

// beforeRouteUpdate - при изменении параметров
beforeRouteUpdate(to, from, next) {
  // Есть доступ к this
  this.fetchData(to.params.id)
  next()
}

// beforeRouteLeave - перед выходом
beforeRouteLeave(to, from, next) {
  if (this.hasUnsavedChanges) {
    if (confirm('Есть несохраненные изменения')) {
      next()
    } else {
      next(false)
    }
  } else {
    next()
  }
}
```

1. Как Vue.js обрабатывает ошибки и исключения? Как использовать глобальный обработчик ошибок? Как можно обработать ошибку в асинхронном коде?

Обработка ошибок:

Глобальный обработчик:

```javascript
// main.js
app.config.errorHandler = (err, instance, info) => {
  console.error('Глобальная ошибка:', err)
  console.error('Компонент:', instance)
  console.error('Информация:', info)
  // Отправка в сервис мониторинга
  errorTrackingService.log(err)
}
```

Обработка в компонентах:

```vue
<script>
export default {
  errorCaptured(err, instance, info) {
    console.error('Ошибка перехвачена:', err)
    return false // Предотвращает дальнейшее распространение
  },
  async mounted() {
    try {
      await this.fetchData()
    } catch (error) {
      this.handleError(error)
    }
  },
  methods: {
    handleError(error) {
      // Обработка ошибки
    }
  }
}
</script>
```

Асинхронный код:

```javascript
// С async/await
async function fetchData() {
  try {
    const response = await api.get('/data')
    return response.data
  } catch (error) {
    console.error('Ошибка:', error)
    throw error
  }
}

// С промисами
function fetchData() {
  return api.get('/data')
    .then(response => response.data)
    .catch(error => {
      console.error('Ошибка:', error)
      return Promise.reject(error)
    })
}
```

1. Что такое утечка памяти? Назовите причины утечек и как их можно пресечь?

Утечка памяти - когда память не освобождается после использования.

Причины и решения:

1. Слушатели событий

```javascript
// Плохо
mounted() {
  window.addEventListener('resize', this.handleResize)
}

// Хорошо
mounted() {
  window.addEventListener('resize', this.handleResize)
},
beforeUnmount() {
  window.removeEventListener('resize', this.handleResize)
}
```

1. Таймеры

```javascript
// Плохо
mounted() {
  this.timer = setInterval(() => {
    this.updateData()
  }, 1000)
}

// Хорошо
mounted() {
  this.timer = setInterval(() => {
    this.updateData()
  }, 1000)
},
beforeUnmount() {
  clearInterval(this.timer)
}
```

1. Подписки на события

```javascript
// Плохо
created() {
  eventBus.on('event', this.handler)
}

// Хорошо
created() {
  eventBus.on('event', this.handler)
},
beforeUnmount() {
  eventBus.off('event', this.handler)
}
```

1. Большие объекты в data

```javascript
// Плохо
data() {
  return {
    largeData: new Array(1000000).fill(0)
  }
}

// Хорошо - используйте слабые ссылки или очищайте
beforeUnmount() {
  this.largeData = null
}
```

1. В чем разница между односторонним потоком данных и двусторонней привязкой данных?

Односторонний поток (React):

```javascript
// Данные идут сверху вниз
<ChildComponent value={parentValue} onChange={handleChange} />

// Ребенок не может напрямую изменить props
function ChildComponent({ value, onChange }) {
  return <input value={value} onChange={e => onChange(e.target.value)} />
}
```

Двусторонняя привязка (Vue):

```javascript
<!-- v-model делает двустороннюю привязку -->
<input v-model="message" />

<!-- Эквивалентно -->
<input 
  :value="message"
  @input="message = $event.target.value"
/>
```

1. Что такое Pinia и в каких функциональных сценариях используется?

Pinia - современная замена Vuex для управления состоянием.

Пример:

```javascript
// stores/user.js
import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    user: null,
    token: null
  }),
  
  getters: {
    isAuthenticated: (state) => !!state.token,
    userName: (state) => state.user?.name
  },
  
  actions: {
    async login(credentials) {
      const response = await api.login(credentials)
      this.user = response.user
      this.token = response.token
    },
    
    logout() {
      this.user = null
      this.token = null
    }
  }
})
```

Composition API стиль:

```javascript
export const useUserStore = defineStore('user', () => {
  const user = ref(null)
  const token = ref(null)
  
  const isAuthenticated = computed(() => !!token.value)
  
  function login(credentials) {
    // логика
  }
  
  return { user, token, isAuthenticated, login }
})
```

Использование:

```vue
<script setup>
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

// Доступ к состоянию
console.log(userStore.user)

// Использование геттера
if (userStore.isAuthenticated) {
  // ...
}

// Вызов действия
userStore.login({ email, password })
</script>
```

1. Для чего нужен package-lock.json?

package-lock.json фиксирует точные версии зависимостей.

Зачем нужен:

- Гарантирует одинаковые версии у всех разработчиков
- Ускоряет установку (не нужно разрешать версии)
- Обеспечивает воспроизводимые сборки

1. Что такое однофайловые компоненты (SFC)?

SFC - компоненты в одном файле с расширением .vue

Структура:

```vue
<template>
  <!-- HTML разметка -->
  <div>{{ message }}</div>
</template>

<script>
// JavaScript логика
export default {
  data() {
    return {
      message: 'Hello'
    }
  }
}
</script>

<style scoped>
/* CSS стили */
div {
  color: blue;
}
</style>
```

Преимущества:

- Все в одном месте
- Изоляция стилей (scoped)
- Поддержка препроцессоров (TypeScript, SCSS)

1. Что такое CORS? Для чего нужен CORS?

CORS (Cross-Origin Resource Sharing) - механизм безопасности браузера.

Проблема:

```javascript
// Запрос с localhost:3000 на api.example.com
fetch('https://api.example.com/data')
// Ошибка CORS
```

Решение на сервере:

```javascript
// Express.js
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE')
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  next()
})
```

Решение в разработке (proxy):

```javascript
// vite.config.js
export default {
  server: {
    proxy: {
      '/api': {
        target: 'https://api.example.com',
        changeOrigin: true
      }
    }
  }
}
```

1. Почему во Vue.js data - это функция?

Чтобы каждый экземпляр компонента имел свою копию данных.

Плохо (объект):

```javascript
data: {
  count: 0 // Общий для всех экземпляров!
}
```

Хорошо (функция):

```javascript
data() {
  return {
    count: 0 // Своя копия для каждого экземпляра
  }
}
```

1. Что такое слоты? Как указать слот по умолчанию?

Слоты - способ передачи контента в компоненты.

Базовый слот:

```vue
<!-- Child.vue -->
<template>
  <div>
    <h2>Заголовок</h2>
    <slot></slot> <!-- Контент по умолчанию -->
  </div>
</template>

<!-- Parent.vue -->
<Child>
  <p>Это содержимое слота</p>
</Child>
```

Именованные слоты:

```vue
<!-- Child.vue -->
<template>
  <div>
    <header>
      <slot name="header"></slot>
    </header>
    <main>
      <slot></slot> <!-- Слот по умолчанию -->
    </main>
    <footer>
      <slot name="footer"></slot>
    </footer>
  </div>
</template>

<!-- Parent.vue -->
<Child>
  <template #header>
    <h1>Заголовок</h1>
  </template>
  
  <p>Основной контент</p>
  
  <template #footer>
    <p>Подвал</p>
  </template>
</Child>
```

Scoped slots:

```vue
<!-- Child.vue -->
<template>
  <div>
    <slot :item="item" :index="index"></slot>
  </div>
</template>

<!-- Parent.vue -->
<Child>
  <template #default="{ item, index }">
    <p>{{ index }}: {{ item.name }}</p>
  </template>
</Child>
```

1. В чем разница между локальной и глобальной регистрацией компонента?

Локальная регистрация:

```vue
<script>
import Button from '@/components/Button.vue'

export default {
  components: {
    Button
  }
}
</script>
```

Глобальная регистрация:

```javascript
// main.js
import Button from '@/components/Button.vue'

app.component('Button', Button)

// Теперь доступен везде без импорта
```

Когда использовать:

- Локальная: для большинства случаев (лучше для tree-shaking)
- Глобальная: для базовых компонентов, используемых везде

1. Как данные передаются между компонентами во Vue?

Способы передачи данных:

1. Props (родитель → ребенок)

```vue
<!-- Parent -->
<Child :message="parentMessage" />

<!-- Child -->
<script>
export default {
  props: {
    message: String
  }
}
</script>
```

1. Events (ребенок → родитель)

```vue
<!-- Child -->
<button @click="$emit('update', newValue)">Обновить</button>

<!-- Parent -->
<Child @update="handleUpdate" />
```

1. Provide/Inject (дальние предки)

```vue
<!-- Ancestor -->
<script>
export default {
  provide() {
    return {
      theme: 'dark'
    }
  }
}
</script>

<!-- Descendant -->
<script>
export default {
  inject: ['theme']
}
</script>
```

1. Vuex/Pinia (глобальное состояние)
2. Event Bus (устаревший способ)

Вопросы senior разработчику

1. Проведите ревью кода, сделайте замечания по его архитектуре.

Пример ревью:

Плохой код:

```vue
<template>
  <div>
    <div v-for="item in items">
      <div>{{ item.name }}</div>
      <button @click="deleteItem(item.id)">Удалить</button>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      items: []
    }
  },
  mounted() {
    fetch('/api/items').then(r => r.json()).then(data => {
      this.items = data
    })
  },
  methods: {
    deleteItem(id) {
      fetch(`/api/items/${id}`, { method: 'DELETE' }).then(() => {
        this.items = this.items.filter(i => i.id !== id)
      })
    }
  }
}
</script>
```

Замечания:

1. Нет key в v-for
2. Нет обработки ошибок
3. API логика в компоненте
4. Нет loading состояния
5. Прямое использование fetch вместо сервиса

Улучшенный код:

```vue
<template>
  <div>
    <div v-if="loading">Загрузка...</div>
    <div v-else-if="error">{{ error }}</div>
    <div v-else>
      <ItemCard
        v-for="item in items"
        :key="item.id"
        :item="item"
        @delete="handleDelete"
      />
    </div>
  </div>
</template>

<script>
import { useItems } from '@/composables/useItems'
import ItemCard from '@/components/ItemCard.vue'

export default {
  components: { ItemCard },
  setup() {
    const { items, loading, error, fetchItems, deleteItem } = useItems()
    
    fetchItems()
    
    const handleDelete = async (id) => {
      try {
        await deleteItem(id)
      } catch (err) {
        // Обработка ошибки
      }
    }
    
    return { items, loading, error, handleDelete }
  }
}
</script>
```

1. Расскажите о вашем опыте работы с другими членами команды.

Взаимодействие:

- С дизайнерами: обсуждение компонентов, адаптивность
- С QA: воспроизведение багов, тестовые сценарии
- С менеджерами: оценка задач, планирование спринтов

1. Как вы подходите к решению сложных задач и проблем в проекте?

Подход:

1. Анализ проблемы
2. Исследование решений
3. Прототипирование
4. Реализация
5. Тестирование
6. Рефакторинг

7. Есть проект на старых технологиях, в него необходимо вносить изменения. Как это лучше всего сделать?

Стратегия миграции:

1. Инкрементальная миграция
2. Создание адаптеров
3. Постепенная замена компонентов
4. Сохранение обратной совместимости

5. Какие методологии разработки программного обеспечения вы использовали в своей работе?

Методологии:

- Agile/Scrum
- Kanban
- TDD/BDD
- Code Review
- Pair Programming

1. Рендеринг - важный аспект Vue.js. Как описать роль и значение ключевого атрибута в среде Vue.js при отображении списка атрибутов?

Атрибут key критичен для эффективного обновления списков.

Без key:

```vue
<div v-for="item in items">{{ item.name }}</div>
<!-- Vue пересоздает все элементы при изменении -->
```

С key:

```vue
<div v-for="item in items" :key="item.id">{{ item.name }}</div>
<!-- Vue отслеживает элементы по key и обновляет только измененные -->
```

Правила:

- Уникальный key для каждого элемента
- Стабильный key (не индекс, если порядок может меняться)
- Используйте ID вместо индекса

1. Как обеспечить удобство сопровождения и масштабируемость кода в большой базе кода Vue.js?

Принципы:

- Модульная архитектура
- Переиспользуемые компоненты
- Композиция вместо наследования
- Четкое разделение ответственности
- Документация
- Тестирование

1. Можете ли вы рассказать о своем опыте работы с серверным рендерингом (SSR) Vue.js?

SSR с Nuxt.js:

Преимущества:

- Лучший SEO
- Быстрая первая загрузка
- Социальные сети видят контент

Пример:

```javascript
// nuxt.config.js
export default {
  ssr: true,
  target: 'server'
}
```

1. Опишите свой опыт модульного и комплексного тестирования Vue.js.

Тестирование:

- Unit тесты (Vitest)
- Component тесты (Vue Test Utils)
- E2E тесты (Cypress)
- Покрытие кода

1. Как вы обрабатываете асинхронные операции и запросы API в приложении Vue.js?

Обработка:

- async/await
- Обработка ошибок
- Loading состояния
- Retry логика
- Кэширование

1. Как в приложении Vue.js вы управляете глобальным состоянием?

Управление:

- Pinia для глобального состояния
- Модульная структура stores
- Персистентность данных
- Middleware для логирования

1. Что такое динамические компоненты в Vue.js?

Динамические компоненты:

```vue
<component :is="currentComponent" />
```

Использование:

```vue
<template>
  <component :is="selectedTab" />
</template>

<script>
import Tab1 from './Tab1.vue'
import Tab2 from './Tab2.vue'

export default {
  components: { Tab1, Tab2 },
  data() {
    return {
      selectedTab: 'Tab1'
    }
  }
}
</script>
```

1. Опишите свой опыт работы с Vuex.

Опыт с Vuex:

- Модульная структура
- Actions для асинхронных операций
- Getters для вычисляемых значений
- Middleware для логирования

1. Можете ли вы объяснить концепцию реактивности в Vue.js?

Реактивность:

- Proxy в Vue 3
- Отслеживание зависимостей
- Автоматическое обновление
- Оптимизации

1. В чем разница между логикой с состоянием и логикой без состояния?

Stateful:

```javascript
class Counter {
  constructor() {
    this.count = 0 // Состояние
  }
  increment() {
    this.count++
  }
}
```

Stateless:

```javascript
function add(a, b) {
  return a + b // Нет состояния
}
```

1. Почему стрелочную функцию не следует использовать при написании обработчиков жизненного цикла в экземплярах Vue.js?

Проблема:

```javascript
export default {
  data() {
    return { count: 0 }
  },
  created: () => {
    // this не указывает на экземпляр Vue!
    console.log(this.count) // undefined
  }
}
```

Решение:

```javascript
export default {
  created() {
    // this указывает на экземпляр
    console.log(this.count) // 0
  }
}
```

1. Что такое TDD (Test Driven Development) / BDD (Behavior Driven Development)?

TDD:

1. Написать тест
2. Запустить (упадет)
3. Написать код
4. Запустить (пройдет)
5. Рефакторинг

BDD:

- Описание поведения на естественном языке
- Given-When-Then формат
- Фокус на пользовательских сценариях
