<script>
import { computed } from 'vue'
import Markdown from 'vue3-markdown-it'

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
        const visibleNonEmptyFields = computed(() => {
            return props.fields.filter(el => el.value && props.getFieldByIdFn(el.id).showInDetals)
        })

        return {
            visibleNonEmptyFields
        }
    },
}
</script>

<template>
    <section
        v-for="field in visibleNonEmptyFields"
        :key="field.id"
        class="text-xs space-y-2"
        :class="[isWide ? 'text-base space-y-4' : 'text-xs space-y-2']"
    >
        <header class="uppercase font-bold text-gray-500">{{ getFieldByIdFn(field.id).name }}</header>
        <div class="atom-prose">
            <Markdown :source="field.value" />
        </div>
    </section>
</template>