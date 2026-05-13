<template>
  <div v-if="shouldRender">
    <!-- Vue 3 动态组件，等价于 SolidJS 的 <Dynamic> -->
    <component
      :is="render"
      :input="input"
      :tool="part.tool"
      :metadata="metadata"
      :output="part.state?.output"
      :status="part.state?.status"
      :hide-details="hideDetails"
      :force-open="forceOpen"
      :locked="locked"
      :default-open="defaultOpen"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, type PropType } from 'vue'
import type { Component } from 'vue'

/**
 * 工具部分的状态接口
 */
interface ToolPartState {
  input?: Record<string, any>
  output?: string
  status?: string
  metadata?: Record<string, any>
}

/**
 * 工具部分接口
 */
interface ToolPart {
  tool: string
  callID: string
  state: ToolPartState
}

/**
 * 消息接口
 */
interface Message {
  id: string
  sessionID: string
  role: string
}

// ==================== Props 定义 ====================
const props = defineProps({
  /**
   * 工具部分数据
   */
  part: {
    type: Object as PropType<ToolPart>,
    required: true
  },

  /**
   * 消息数据
   */
  message: {
    type: Object as PropType<Message>,
    required: true
  },

  /**
   * 是否隐藏详情
   */
  hideDetails: {
    type: Boolean,
    default: false
  },

  /**
   * 默认是否展开
   */
  defaultOpen: {
    type: Boolean,
    default: false
  },

  /**
   * 渲染组件（动态组件）
   */
  render: {
    type: [Object, Function] as PropType<Component>,
    required: true
  },

  /**
   * 是否显示权限提示
   */
  showPermission: {
    type: Boolean,
    default: false
  },

  /**
   * 是否显示问题提示
   */
  showQuestion: {
    type: Boolean,
    default: false
  },

  /**
   * 是否强制打开
   */
  isForceOpen: {
    type: Boolean,
    default: false
  }
})

// ==================== 计算属性 ====================

/**
 * 输入数据
 * 从 part.state.input 获取，如果不存在则返回空对象
 */
const input = computed(() => {
  return props.part.state?.input ?? {}
})

/**
 * 元数据
 * 从 part.state.metadata 获取，如果不存在则返回空对象
 */
const metadata = computed(() => {
  return props.part.state?.metadata ?? {}
})

/**
 * 是否强制打开
 * 优先使用 prop 传入的值，否则根据权限或问题状态判断
 */
const forceOpen = computed(() => {
  return props.isForceOpen || props.showPermission || props.showQuestion
})

/**
 * 是否锁定
 * 当显示权限提示或问题提示时锁定
 */
const locked = computed(() => {
  return props.showPermission || props.showQuestion
})

/**
 * 是否应该渲染
 * 等价于 SolidJS 的 <Match when={true}>
 */
const shouldRender = computed(() => {
  return true // 在实际使用中，这里可以根据具体条件判断
})
</script>

<style scoped>
/* 如果需要使用 Element UI 的样式，可以在这里添加 */
/* 也可以使用 Element Plus 的主题变量 */
</style>
