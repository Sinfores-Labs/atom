<script>
import Popper from 'vue3-popper'
import Item from '/src/components/Item.vue'

export default {
    components: { Popper, Item },

    props: {
        poppers: {
            type: Boolean
        },
        heatmap: {
            type: Boolean
        },
        items: {
            type: Array,
            default: () => ([])
        },
        activeItem: {
            type: Object
        },
        header: {
            type: String,
            default: ''
        },
        getFieldByIdFn: {
            type: Function
        },
        getReferenceByIdFn: {
            type: Function
        },
        setActiveItemFn: {
            type: Function
        }
    },

    setup(props) {},
}
</script>

<template>
    <div>
        <header v-if="header" class="font-bold px-4" :class="[heatmap ? 'py-0 px-6 text-sm' : 'py-6']">{{ header }}</header>
        <transition-group
            v-if="poppers"
            name="flip-list"
            tag="div"
            class="p-4 pt-12 grid"
            :class="[heatmap ? 'grid-cols-6 lg:grid-cols-7 xl:grid-cols-10 pb-4' : 'gris-cols-1 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 3xl:grid-cols-5 gap-4 pb-32']"
        >
            <Popper
                hover
                arrow
                placement="bottom"
                v-for="item in items"
                :key="item.id"
            >
                <Item
                    :item="item"
                    :activeItem="activeItem"
                    :heatmap="heatmap"
                    :get-field-by-id-fn="getFieldByIdFn"
                    :get-reference-by-id-fn="getReferenceByIdFn"
                    @set-active-item="setActiveItemFn"
                ></Item>

                <template #content>
                <div class="space-y-2">
                    <div class="font-bold">{{ item.name }}</div>
                    <div>Оценка: {{ item.score }}</div>
                    <div v-if="item.note">{{ item.note }}</div>
                </div>
                </template>
            </Popper>
        </transition-group>
        <transition-group
            v-else
            name="flip-list"
            tag="div"
            class="p-4 pt-12 grid"
            :class="[heatmap ? 'grid-cols-6 lg:grid-cols-7 xl:grid-cols-10 pb-4' : 'gris-cols-1 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 3xl:grid-cols-5 gap-4 pb-32']"
        >
            <Item
                v-for="item in items"
                :key="item.id"
                :item="item"
                :activeItem="activeItem"
                :heatmap="heatmap"
                :get-field-by-id-fn="getFieldByIdFn"
                :get-reference-by-id-fn="getReferenceByIdFn"
                @set-active-item="setActiveItemFn"
            ></Item>
        </transition-group>
    </div>
</template>
