# Настройка ESLint и Prettier

## Установленные пакеты

### ESLint

- `eslint@^8.57.0` - основной линтер
- `@typescript-eslint/parser@^7.0.0` - парсер для TypeScript
- `@typescript-eslint/eslint-plugin@^7.0.0` - плагин для TypeScript правил
- `eslint-plugin-vue@^9.0.0` - плагин для Vue.js
- `@vue/eslint-config-typescript@^13.0.0` - конфигурация Vue + TypeScript

### Prettier

- `prettier@^3.6.2` - форматтер кода
- `eslint-config-prettier@^9.1.0` - отключает конфликтующие ESLint правила
- `eslint-plugin-prettier@^5.1.0` - интегрирует Prettier в ESLint

## Конфигурация

### ESLint (.eslintrc.js)

```javascript
module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    '@vue/typescript/recommended',
    'plugin:vue/vue3-essential',
    'plugin:prettier/recommended',
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: ['vue', '@typescript-eslint'],
  rules: {
    // Vue правила
    'vue/multi-word-component-names': 'off',
    'vue/no-unused-vars': 'error',
    'vue/no-unused-components': 'error',
    'vue/require-default-prop': 'error',
    'vue/require-prop-types': 'error',
    'vue/component-name-in-template-casing': ['error', 'PascalCase'],
    'vue/component-definition-name-casing': ['error', 'PascalCase'],
    'vue/component-options-name-casing': ['error', 'PascalCase'],
    'vue/custom-event-name-casing': ['error', 'camelCase'],
    'vue/define-macros-order': [
      'error',
      {
        order: ['defineProps', 'defineEmits'],
      },
    ],
    'vue/html-comment-content-spacing': ['error', 'always'],
    'vue/no-unused-properties': [
      'error',
      {
        groups: ['props', 'data', 'computed', 'methods'],
      },
    ],
    'vue/padding-line-between-blocks': ['error', 'always'],
    'vue/prefer-separate-static-class': 'error',

    // TypeScript правила
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-non-null-assertion': 'warn',
    '@typescript-eslint/no-var-requires': 'error',

    // Общие правила
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-unused-vars': 'off', // Используем TypeScript версию
    'prefer-const': 'error',
    'no-var': 'error',
    'object-shorthand': 'error',
    'prefer-template': 'error',
    'template-curly-spacing': 'error',
    'arrow-spacing': 'error',
    //'comma-dangle': ['error', 'always-multiline'],
    semi: ['error', 'never'],
    quotes: ['error', 'single'],
    indent: ['error', 2],
    'no-trailing-spaces': 'error',
    'eol-last': 'error',
    'no-multiple-empty-lines': ['error', { max: 1 }],
  },
  overrides: [
    {
      files: ['*.vue'],
      rules: {
        indent: 'off', // Отключаем для Vue файлов, используем prettier
      },
    },
  ],
}
```

### Prettier (.prettierrc)

```json
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 80,
  "bracketSpacing": true,
  "arrowParens": "avoid",
  "endOfLine": "lf",
  "vueIndentScriptAndStyle": false,
  "htmlWhitespaceSensitivity": "ignore",
  "singleAttributePerLine": false,
  "proseWrap": "preserve"
}
```

### VS Code настройки (.vscode/settings.json)

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit",
    "source.organizeImports": "explicit"
  },
  "eslint.validate": [
    "javascript",
    "javascriptreact",
    "typescript",
    "typescriptreact",
    "vue"
  ],
  "typescript.preferences.importModuleSpecifier": "relative",
  "vue.codeActions.enabled": true,
  "files.associations": {
    "*.vue": "vue"
  },
  "emmet.includeLanguages": {
    "vue-html": "html",
    "vue": "html"
  },
  "vetur.validation.template": false,
  "vetur.validation.script": false,
  "vetur.validation.style": false
}
```

## Скрипты в package.json

```json
{
  "scripts": {
    "lint": "eslint . --ext .vue,.js,.ts,.jsx,.tsx --fix",
    "lint:check": "eslint . --ext .vue,.js,.ts,.jsx,.tsx",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "type-check": "vue-tsc --noEmit"
  }
}
```

## Использование

### Проверка и исправление ошибок

```bash
pnpm lint          # Проверка и автоматическое исправление
pnpm lint:check    # Только проверка без исправления
```

### Форматирование кода

```bash
pnpm format        # Форматирование всех файлов
pnpm format:check  # Проверка форматирования без изменений
```

### Проверка типов TypeScript

```bash
pnpm type-check    # Проверка типов без компиляции
```

## Рекомендуемые расширения VS Code

- `esbenp.prettier-vscode` - Prettier форматтер
- `dbaeumer.vscode-eslint` - ESLint интеграция
- `Vue.volar` - Vue 3 поддержка
- `Vue.vscode-typescript-vue-plugin` - TypeScript для Vue
- `bradlc.vscode-tailwindcss` - Tailwind CSS поддержка

## Исключения

### .eslintignore

```
node_modules/
dist/
coverage/
*.min.js
*.bundle.js
public/
*.config.js
vite.config.ts
```

### .prettierignore

```
node_modules/
dist/
coverage/
*.min.js
*.bundle.js
pnpm-lock.yaml
package-lock.json
yarn.lock
.git/
```

## Особенности настройки

1. **TypeScript версия**: Текущая версия TypeScript (5.8.3) не полностью поддерживается ESLint, но работает корректно
2. **Vue 3**: Настроена поддержка Composition API и `<script setup>`
3. **Автоматическое форматирование**: При сохранении файла в VS Code
4. **Интеграция**: ESLint и Prettier работают вместе без конфликтов
