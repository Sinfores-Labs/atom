<script>
import { useActiveLayer } from '/src/composables/activeLayer'
import { usePopper } from '/src/composables/popper'

export default {
    props: {
        item: {
            type: Object,
            default: () => ({})
        },
        activeItem: {
            type: Object
        },
        heatmap: {
            type: Boolean,
            default: false
        },
        getFieldByIdFn: {
            type: Function
        },
        getReferenceByIdFn: {
            type: Function
        }
    },

    emits: ['set-active-item'],

    setup(props, { emit }) {
        const { activeLayer } = useActiveLayer()
        const { popper } = usePopper()

        const setActiveItem = () => {
            emit('set-active-item', props.item.id)
        }

        return {
            activeLayer,
            setActiveItem
        }
    },
}
</script>

<template>
    <div
        @click="setActiveItem()"
        :class="[(activeItem && activeItem.id === item.id) ? 'ring-2 ring-offset-1 ring-purple-500 ring-opacity-40 bg-purple-50' : '']"
        class="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 rounded p-2"
    >
        <div
            class="h-12 w-12 rounded border flex items-center px-2"
            :class="[item.layers.find(el => el.id === activeLayer.id).color, heatmap ? 'h-12 flex-1' : 'h-12 w-12 flex-shrink-0 ']"
        >
            <div v-if="heatmap" class="font-bold text-xs line-clamp-1">{{ item.name }}</div>
        </div>
        <div class="flex-1" v-if="!heatmap">
            <div class="font-bold text-xs line-clamp-1">{{ item.name }}</div>
            <div
            class="text-xs text-gray-500 line-clamp-1"
            v-for="field in item.fields"
            :key="field.id"
            >
            <div v-if="getFieldByIdFn(field.id).showInGrid">{{ field.value }}</div>
            </div>
            <div v-if="item.references.length > 0" class="text-xs text-gray-500 line-clamp-1">
            <span
                v-for="(reference, index) in item.references"
                :key="reference"
            >{{ getReferenceByIdFn(reference).name }}<span v-if="index < item.references.length - 1">, </span></span>
            </div>
        </div>
    </div>
</template>