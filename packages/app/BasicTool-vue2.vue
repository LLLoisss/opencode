<template>
  <el-collapse v-model="activeNames"
               @change="handleOpenChange">
    <el-collapse-item :name="collapseItemName"
                      :disabled="locked">
      <!-- Trigger 头部区域 -->
      <template slot="title">
        <div class="tool-trigger">
          <div class="tool-trigger-content">
            <!-- 图标 -->
            <i :class="iconClass"
               class="tool-icon"></i>

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
                        { clickable: hasSubtitleClickListener },
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
                             :is="getActionComponent()" />
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

<script>
/**
 * BasicTool 组件 - Vue 2.7 + Element UI 2 版本
 *
 * @description 一个可折叠的工具卡片组件，用于展示工具调用信息
 *
 * ============================================================
 * Props 参数说明：
 * ============================================================
 *
 * @prop {String} icon - 图标类名 (必填)
 *   - 使用 Element UI 的图标类名，如 'el-icon-setting'、'el-icon-document' 等
 *   - 也可以使用自定义图标类名
 *   - 示例: icon="el-icon-document"
 *
 * @prop {Object} trigger - 触发器标题配置 (可选)
 *   - 结构化的标题配置对象，包含以下属性：
 *   - {String} title - 主标题文本 (必填)
 *   - {String} titleClass - 主标题的自定义 CSS 类名 (可选)
 *   - {String} subtitle - 副标题文本 (可选)
 *   - {String} subtitleClass - 副标题的自定义 CSS 类名 (可选)
 *   - {Array<String>} args - 参数列表，会渲染为多个标签 (可选)
 *   - {String} argsClass - 参数标签的自定义 CSS 类名 (可选)
 *   - {VNode|Function} action - 操作按钮/元素，显示在标题右侧 (可选)
 *   - 示例:
 *     trigger: {
 *       title: '文件读取',
 *       subtitle: 'src/index.ts',
 *       args: ['line 1-50', 'readonly']
 *     }
 *
 * @prop {Boolean} hideDetails - 是否隐藏详情内容 (可选)
 *   - 默认值: false
 *   - 设为 true 时，折叠面板的内容区域将不会渲染
 *
 * @prop {Boolean} defaultOpen - 是否默认展开 (可选)
 *   - 默认值: false
 *   - 设为 true 时，组件初始化时会处于展开状态
 *
 * @prop {Boolean} forceOpen - 是否强制展开 (可选)
 *   - 默认值: false
 *   - 设为 true 时，会自动展开折叠面板
 *   - 可用于程序控制展开状态
 *
 * @prop {Boolean} locked - 是否锁定 (可选)
 *   - 默认值: false
 *   - 设为 true 时，折叠面板无法被用户折叠
 *
 * ============================================================
 * Events 事件说明：
 * ============================================================
 *
 * @event subtitle-click - 副标题点击事件
 *   - 当用户点击副标题时触发
 *   - 无参数
 *
 * @event open-change - 展开/折叠状态变化事件
 *   - 当折叠面板的展开状态发生变化时触发
 *   - 参数: {Boolean} isOpen - 是否展开
 *
 * ============================================================
 * Slots 插槽说明：
 * ============================================================
 *
 * @slot default - 折叠面板的内容区域
 * @slot trigger - 自定义触发器内容 (当不使用 trigger prop 时)
 * @slot action - 操作按钮区域，显示在标题右侧
 *
 * ============================================================
 * 使用示例：
 * ============================================================
 *
 * <basic-tool
 *   icon="el-icon-document"
 *   :trigger="{
 *     title: '读取文件',
 *     subtitle: 'src/components/App.vue',
 *     args: ['行 1-100']
 *   }"
 *   :default-open="true"
 *   @subtitle-click="handleFileClick"
 *   @open-change="handleOpenChange"
 * >
 *   <pre>文件内容...</pre>
 * </basic-tool>
 */
export default {
  name: 'BasicTool',

  props: {
    /**
     * 图标类名
     * @type {String}
     * @required
     * @example 'el-icon-setting', 'el-icon-document'
     */
    icon: {
      type: String,
      required: true,
    },

    /**
     * 触发器标题配置
     * @type {Object}
     * @property {String} title - 主标题文本
     * @property {String} [titleClass] - 主标题的自定义CSS类名
     * @property {String} [subtitle] - 副标题文本
     * @property {String} [subtitleClass] - 副标题的自定义CSS类名
     * @property {Array<String>} [args] - 参数列表
     * @property {String} [argsClass] - 参数标签的自定义CSS类名
     * @property {VNode|Function} [action] - 操作按钮/元素
     */
    trigger: {
      type: Object,
      default: null,
    },

    /**
     * 是否隐藏详情内容
     * @type {Boolean}
     * @default false
     */
    hideDetails: {
      type: Boolean,
      default: false,
    },

    /**
     * 是否默认展开
     * @type {Boolean}
     * @default false
     */
    defaultOpen: {
      type: Boolean,
      default: false,
    },

    /**
     * 是否强制展开
     * @type {Boolean}
     * @default false
     */
    forceOpen: {
      type: Boolean,
      default: false,
    },

    /**
     * 是否锁定（锁定后无法折叠）
     * @type {Boolean}
     * @default false
     */
    locked: {
      type: Boolean,
      default: false,
    },
  },

  data () {
    return {
      // 折叠面板的唯一标识
      collapseItemName: 'basic-tool',
      // 当前展开的面板
      activeNames: this.defaultOpen ? ['basic-tool'] : [],
    }
  },

  computed: {
    /**
     * 计算图标类名
     */
    iconClass () {
      return this.icon
    },

    /**
     * 判断是否为结构化触发器
     */
    isStructuredTrigger () {
      return this.trigger && typeof this.trigger === 'object' && 'title' in this.trigger
    },

    /**
     * 获取结构化触发器数据
     */
    triggerData () {
      return this.trigger || {}
    },

    /**
     * 检查是否有副标题点击事件监听器
     */
    hasSubtitleClickListener () {
      return !!(this.$listeners && this.$listeners['subtitle-click'])
    },
  },

  watch: {
    /**
     * 监听 forceOpen 变化
     */
    forceOpen: {
      handler (newVal) {
        if (newVal) {
          this.activeNames = [this.collapseItemName]
        }
      },
      immediate: true,
    },
  },

  methods: {
    /**
     * 获取 action 组件
     */
    getActionComponent () {
      if (!this.triggerData.action) return null
      if (typeof this.triggerData.action === 'function') {
        return this.triggerData.action()
      }
      return this.triggerData.action
    },

    /**
     * 处理展开/折叠状态变化
     * @param {Array<String>} names - 当前展开的面板名称数组
     */
    handleOpenChange (names) {
      const namesArray = Array.isArray(names) ? names : [names]
      const isOpen = namesArray.includes(this.collapseItemName)

      // 如果锁定且尝试关闭，则阻止
      if (this.locked && !isOpen) {
        this.activeNames = [this.collapseItemName]
        return
      }

      this.$emit('open-change', isOpen)
    },

    /**
     * 处理副标题点击
     */
    handleSubtitleClick () {
      this.$emit('subtitle-click')
    },
  },
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

.tool-icon {
  font-size: 16px;
  color: #606266;
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
  color: #303133;
}

.tool-subtitle {
  color: #909399;
  font-size: 12px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tool-subtitle.clickable {
  cursor: pointer;
  color: #409eff;
}

.tool-subtitle.clickable:hover {
  text-decoration: underline;
}

.tool-arg {
  padding: 2px 6px;
  background-color: #f4f4f5;
  border-radius: 4px;
  font-size: 12px;
  color: #606266;
}

.tool-content {
  padding: 12px;
  background-color: #fafafa;
  border-radius: 4px;
}

/* 覆盖 Element UI 折叠面板默认样式 */
::v-deep .el-collapse-item__header {
  padding: 8px 12px;
  height: auto;
  line-height: 1.5;
}

::v-deep .el-collapse-item__content {
  padding-bottom: 0;
}

/* 兼容不支持 gap 的旧浏览器 */
.tool-trigger-content > * + * {
  margin-left: 8px;
}

.tool-info-main > * + * {
  margin-left: 8px;
}

.tool-info-structured > * + * {
  margin-left: 8px;
}

/* 支持 gap 的浏览器 */
@supports (gap: 8px) {
  .tool-trigger-content > * + *,
  .tool-info-main > * + *,
  .tool-info-structured > * + * {
    margin-left: 0;
  }
}
</style>
