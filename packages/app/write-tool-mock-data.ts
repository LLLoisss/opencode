/**
 * WriteTool 组件的 Mock 数据
 * 用于开发和测试展示
 */

import type { WriteToolProps } from "./WriteTool.vue"

/**
 * 基础写入工具数据 - 创建新文件
 */
export const mockWriteToolBasic: WriteToolProps = {
  tool: "write",
  input: {
    filePath: "src/components/Button.vue",
    content: `<template>
  <button
    :class="['btn', \`btn-\${variant}\`, \`btn-\${size}\`]"
    :disabled="disabled"
    @click="handleClick"
  >
    <slot></slot>
  </button>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from "vue"

interface ButtonProps {
  variant?: "primary" | "secondary" | "ghost"
  size?: "small" | "medium" | "large"
  disabled?: boolean
}

const props = withDefaults(defineProps<ButtonProps>(), {
  variant: "primary",
  size: "medium",
  disabled: false,
})

const emit = defineEmits<{
  (e: "click", event: MouseEvent): void
}>()

function handleClick(event: MouseEvent) {
  if (!props.disabled) {
    emit("click", event)
  }
}
</script>

<style scoped>
.btn {
  padding: 8px 16px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-primary {
  background-color: #409eff;
  color: white;
}

.btn-secondary {
  background-color: #909399;
  color: white;
}

.btn-ghost {
  background-color: transparent;
  border: 1px solid #dcdfe6;
}

.btn-small {
  padding: 4px 8px;
  font-size: 12px;
}

.btn-medium {
  padding: 8px 16px;
  font-size: 14px;
}

.btn-large {
  padding: 12px 24px;
  font-size: 16px;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>`,
  },
  metadata: {},
  status: "completed",
}

/**
 * 带诊断错误的写入工具数据
 */
export const mockWriteToolWithDiagnostics: WriteToolProps = {
  tool: "write",
  input: {
    filePath: "src/utils/validator.ts",
    content: `export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/
  return emailRegex.test(email)
}

export function validatePassword(password: string): boolean {
  // 密码必须至少8位，包含大小写字母和数字
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)[a-zA-Z\\d]{8,}$/
  return passwordRegex.test(password)
}

export function validatePhone(phone: string): boolean {
  // 中国手机号验证
  const phoneRegex = /^1[3-9]\\d{9}$/
  return phoneRegex.test(phone)
}

// 类型错误：返回值应该是 boolean
export function validateURL(url: string) {
  try {
    new URL(url)
    return true
  } catch {
    return "invalid"
  }
}`,
  },
  metadata: {
    diagnostics: {
      "src/utils/validator.ts": [
        {
          range: {
            start: { line: 18, character: 11 },
            end: { line: 18, character: 27 },
          },
          message: "Type 'string | boolean' is not assignable to type 'boolean'.",
          severity: 1, // Error
        },
        {
          range: {
            start: { line: 22, character: 4 },
            end: { line: 22, character: 20 },
          },
          message: "Function lacks return type annotation.",
          severity: 1,
        },
        {
          range: {
            start: { line: 1, character: 0 },
            end: { line: 1, character: 47 },
          },
          message: "Missing semicolon.",
          severity: 1,
        },
      ],
    },
  },
  status: "completed",
}

/**
 * 深层目录结构的写入工具数据
 */
export const mockWriteToolDeepPath: WriteToolProps = {
  tool: "write",
  input: {
    filePath: "src/features/auth/components/LoginForm/LoginForm.vue",
    content: `<template>
  <el-form
    ref="loginFormRef"
    :model="loginForm"
    :rules="loginRules"
    class="login-form"
  >
    <el-form-item prop="username">
      <el-input
        v-model="loginForm.username"
        placeholder="请输入用户名"
        prefix-icon="User"
      />
    </el-form-item>

    <el-form-item prop="password">
      <el-input
        v-model="loginForm.password"
        type="password"
        placeholder="请输入密码"
        prefix-icon="Lock"
        show-password
      />
    </el-form-item>

    <el-form-item>
      <el-button
        type="primary"
        :loading="loading"
        @click="handleLogin"
        style="width: 100%"
      >
        登录
      </el-button>
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue"
import type { FormInstance, FormRules } from "element-plus"

const loginFormRef = ref<FormInstance>()
const loading = ref(false)

const loginForm = reactive({
  username: "",
  password: "",
})

const loginRules: FormRules = {
  username: [{ required: true, message: "请输入用户名", trigger: "blur" }],
  password: [
    { required: true, message: "请输入密码", trigger: "blur" },
    { min: 6, message: "密码长度至少6位", trigger: "blur" },
  ],
}

const handleLogin = async () => {
  if (!loginFormRef.value) return

  await loginFormRef.value.validate((valid) => {
    if (valid) {
      loading.value = true
      // 模拟登录请求
      setTimeout(() => {
        console.log("登录成功", loginForm)
        loading.value = false
      }, 1000)
    }
  })
}
</script>

<style scoped>
.login-form {
  max-width: 400px;
  margin: 0 auto;
  padding: 20px;
}
</style>`,
  },
  metadata: {},
  status: "completed",
}

/**
 * 正在执行中的写入操作
 */
export const mockWriteToolPending: WriteToolProps = {
  tool: "write",
  input: {
    filePath: "src/store/user.ts",
    content: `import { defineStore } from "pinia"

export const useUserStore = defineStore("user", {
  state: () => ({
    userInfo: null,
    token: "",
    isLoggedIn: false,
  }),

  actions: {
    setUserInfo(info: any) {
      this.userInfo = info
      this.isLoggedIn = true
    },

    logout() {
      this.userInfo = null
      this.token = ""
      this.isLoggedIn = false
    },
  },
})`,
  },
  metadata: {},
  status: "pending",
}

/**
 * 写入失败的错误状态
 */
export const mockWriteToolError: WriteToolProps = {
  tool: "write",
  input: {
    filePath: "protected/system/config.ts",
    content: `export const systemConfig = {
  apiUrl: "https://api.example.com",
  version: "1.0.0",
}`,
  },
  metadata: {},
  status: "error",
  output: "Error: Permission denied: Cannot write to protected directory",
}

/**
 * 简单文件名（无目录路径）
 */
export const mockWriteToolSimple: WriteToolProps = {
  tool: "write",
  input: {
    filePath: "README.md",
    content: `# 项目说明

这是一个使用 Vue 3 + TypeScript + Element Plus 开发的项目。

## 安装

\`\`\`bash
npm install
\`\`\`

## 运行

\`\`\`bash
npm run dev
\`\`\`

## 构建

\`\`\`bash
npm run build
\`\`\``,
  },
  metadata: {},
  status: "completed",
}

/**
 * 所有 mock 数据的集合
 */
export const mockWriteToolExamples = {
  basic: mockWriteToolBasic,
  withDiagnostics: mockWriteToolWithDiagnostics,
  deepPath: mockWriteToolDeepPath,
  pending: mockWriteToolPending,
  error: mockWriteToolError,
  simple: mockWriteToolSimple,
}

/**
 * 默认导出一个基础示例
 */
export default mockWriteToolBasic
