<script>
import { computed } from 'vue'
import Markdown from 'vue3-markdown-it'
import MarkdwonTaskList from 'markdown-it-task-lists'
import MarkdownAbbr from 'markdown-it-abbr'
import MarkdownDefList from 'markdown-it-deflist'

export default {
    components: { Markdown },

    props: {
        fields: {
            type: Array,
            default: () => ([])
        },
        getFieldByIdFn: {
            type: Function
        },
        isWide: {
            type: Boolean,
            default: false
        }
    },

    setup(props) {
        const mdPlugins = [
            {
                plugin: MarkdwonTaskList
            },
            {
                plugin: MarkdownAbbr
            },
            {
                plugin: MarkdownDefList
            }
        ]

        const visibleNonEmptyFields = computed(() => {
            return props.fields.filter(el => (
                ((props.getFieldByIdFn(el.id).type !== 'bool' && el.value) || (props.getFieldByIdFn(el.id).type === 'bool'))
                && props.getFieldByIdFn(el.id).showInDetals)
            )
        })

        return {
            mdPlugins,
            visibleNonEmptyFields
        }
    },
}
</script>

<template>
    <section
        v-for="field in visibleNonEmptyFields"
        :key="field.id"
        :class="[isWide ? 'text-base' : 'text-xs']"
    >

        <!-- Fixing: -->
        <!-- Invalid prop: type check failed for prop "source". Expected String, got Boolean with value true.  -->
        <!-- <Vue3MarkdownIt source=true plugins=..." -->
        <div
            v-if="getFieldByIdFn(field.id).type === 'bool'"
        >
            <label class="inline-flex items-center">
                <input type="checkbox" class="
                    rounded
                    border-gray-300
                    text-indigo-600
                    shadow-sm
                    focus:border-indigo-300
                    focus:ring
                    focus:ring-offset-0
                    focus:ring-indigo-200
                    focus:ring-opacity-50
                " v-model="field.value" disabled>
                <span class="ml-2">{{ getFieldByIdFn(field.id).name }}</span>
            </label>
        </div>

        <div 
            v-else
            :class="[isWide ? 'space-y-4' : 'space-y-2']"
        >
            <header class="uppercase font-bold text-gray-500">{{ getFieldByIdFn(field.id).name }}</header>
            <div class="atom-prose">
                <Markdown :source="field.value" :plugins="mdPlugins" :linkify="true" />
            </div>
        </div>

    </section>
</template>