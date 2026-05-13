<template>
  <el-collapse v-model="activeNames"
               @change="handleOpenChange">
    <el-collapse-item :name="collapseItemName"
                      :disabled="locked">
      <!-- Trigger 头部区域 -->
      <template #title>
        <div class="tool-trigger">
          <div class="tool-trigger-content">
            <!-- 图标 -->
            <el-icon :size="16">
              <component :is="iconComponent" />
            </el-icon>

            <!-- 工具信息区域 -->
            <div class="tool-info">
              <!-- 结构化标题模式 -->
              <template v-if="isStructuredTrigger">
                <div class="tool-info-structured">
                  <div class="tool-info-main">
                    <!-- 主标题 -->
                    <span class="tool-title"
                          :class="triggerData.titleClass">
                      {{ triggerData.title }}
                    </span>

                    <!-- 副标题 -->
                    <span v-if="triggerData.subtitle"
                          class="tool-subtitle"
                          :class="[
                        triggerData.subtitleClass,
                        { clickable: !!onSubtitleClick },
                      ]"
                          @click.stop="handleSubtitleClick">
                      {{ triggerData.subtitle }}
                    </span>

                    <!-- 参数列表 -->
                    <span v-for="(arg, index) in triggerData.args"
                          :key="index"
                          class="tool-arg"
                          :class="triggerData.argsClass">
                      {{ arg }}
                    </span>
                  </div>

                  <!-- 操作按钮区域 (通过 trigger.action 传入) -->
                  <component v-if="triggerData.action"
                             :is="typeof triggerData.action === 'function' ? triggerData.action() : triggerData.action" />
                  <!-- 或通过插槽传入 -->
                  <slot name="action"></slot>
                </div>
              </template>

              <!-- 自定义内容模式 -->
              <template v-else>
                <slot name="trigger"></slot>
              </template>
            </div>
          </div>
        </div>
      </template>

      <!-- 折叠内容区域 -->
      <div v-if="!hideDetails"
           class="tool-content">
        <slot></slot>
      </div>
    </el-collapse-item>
  </el-collapse>
</template>

<script setup lang="ts">
import { ref, computed, watch, defineProps, defineEmits, type VNode } from "vue"
import { ElCollapse, ElCollapseItem, ElIcon } from "element-plus"

/**
 * TriggerTitle - 结构化标题的类型定义
 */
export interface TriggerTitle {
  /** 主标题文本 */
  title: string
  /** 主标题的自定义CSS类名 */
  titleClass?: string
  /** 副标题文本 */
  subtitle?: string
  /** 副标题的自定义CSS类名 */
  subtitleClass?: string
  /** 参数列表，会渲染为多个标签 */
  args?: string[]
  /** 参数标签的自定义CSS类名 */
  argsClass?: string
  /** 操作按钮/元素，显示在标题右侧 */
  action?: VNode | (() => VNode)
}

/**
 * BasicTool 组件的 Props 定义
 */
export interface BasicToolProps {
  /**
   * 图标组件名称
   * @description 需要是 Element Plus 图标组件或自定义图标组件
   * @example 'Setting', 'Tools', 'Document'
   */
  icon: any

  /**
   * 触发器标题配置
   * @description 可以是结构化的 TriggerTitle 对象，包含标题、副标题、参数等
   * @example { title: '文件读取', subtitle: 'src/index.ts', args: ['line 1-50'] }
   */
  trigger?: TriggerTitle

  /**
   * 是否隐藏详情内容
   * @default false
   */
  hideDetails?: boolean

  /**
   * 是否默认展开
   * @default false
   */
  defaultOpen?: boolean

  /**
   * 是否强制展开（设置后会自动展开）
   * @default false
   */
  forceOpen?: boolean

  /**
   * 是否锁定（锁定后无法折叠）
   * @default false
   */
  locked?: boolean
}

// Props 定义
const props = withDefaults(defineProps<BasicToolProps>(), {
  hideDetails: false,
  defaultOpen: false,
  forceOpen: false,
  locked: false,
})

// Emits 定义
const emit = defineEmits<{
  /** 副标题点击事件 */
  (e: "subtitle-click"): void
  /** 展开/折叠状态变化事件 */
  (e: "open-change", value: boolean): void
}>()

// 折叠面板的唯一标识
const collapseItemName = "basic-tool"

// 当前展开的面板
const activeNames = ref<string[]>(props.defaultOpen ? [collapseItemName] : [])

// 计算图标组件
const iconComponent = computed(() => props.icon)

// 判断是否为结构化触发器
const isStructuredTrigger = computed(() => {
  return props.trigger && typeof props.trigger === "object" && "title" in props.trigger
})

// 获取结构化触发器数据
const triggerData = computed(() => {
  return props.trigger as TriggerTitle
})

// 副标题点击处理函数
const onSubtitleClick = computed(() => {
  // 检查是否有监听 subtitle-click 事件
  return true // Vue 3 中需要通过其他方式检测
})

// 监听 forceOpen 变化
watch(
  () => props.forceOpen,
  (newVal) => {
    if (newVal) {
      activeNames.value = [collapseItemName]
    }
  },
  { immediate: true }
)

// 处理展开/折叠状态变化
function handleOpenChange(names: string | string[]) {
  const namesArray = Array.isArray(names) ? names : [names]
  const isOpen = namesArray.includes(collapseItemName)

  // 如果锁定且尝试关闭，则阻止
  if (props.locked && !isOpen) {
    activeNames.value = [collapseItemName]
    return
  }

  emit("open-change", isOpen)
}

// 处理副标题点击
function handleSubtitleClick() {
  emit("subtitle-click")
}
</script>

<style scoped>
.tool-trigger {
  display: flex;
  align-items: center;
  width: 100%;
}

.tool-trigger-content {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.tool-info {
  flex: 1;
  min-width: 0;
}

.tool-info-structured {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.tool-info-main {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  min-width: 0;
}

.tool-title {
  font-weight: 500;
  color: var(--el-text-color-primary);
}

.tool-subtitle {
  color: var(--el-text-color-secondary);
  font-size: 12px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tool-subtitle.clickable {
  cursor: pointer;
  color: var(--el-color-primary);
}

.tool-subtitle.clickable:hover {
  text-decoration: underline;
}

.tool-arg {
  padding: 2px 6px;
  background-color: var(--el-fill-color-light);
  border-radius: 4px;
  font-size: 12px;
  color: var(--el-text-color-regular);
}

.tool-content {
  padding: 12px;
  background-color: var(--el-fill-color-lighter);
  border-radius: 4px;
}

/* 覆盖 Element Plus 折叠面板默认样式 */
:deep(.el-collapse-item__header) {
  padding: 8px 12px;
  height: auto;
  line-height: 1.5;
}

:deep(.el-collapse-item__content) {
  padding-bottom: 0;
}
</style>
