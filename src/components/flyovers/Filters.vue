<script>
import { XIcon, PlusSmIcon } from '@heroicons/vue/outline'
import { useFlyovers } from '/src/composables/flyovers'

export default {
    components: { XIcon },

    setup() {
        const { hideFlyover, filters } = useFlyovers()

        return {
            filters,
            hideFlyover
        }
    },
}
</script>

<template>
    <div :class="filters ? 'translate-y-0' : 'translate-y-full'" class="z-40 transition absolute bottom-9 right-108 w-96 h-large overflow-hidden flex flex-col border shadow-xl border-t-2 border-t-purple-500">
        <div class="h-16 bg-white flex items-center justify-between px-4 space-x-2">
            <div class="flex-1 font-bold">Фильтры</div>
            <div>
                <div class="hover:bg-gray-100 cursor-pointer rounded-full h-6 w-6 flex items-center justify-center" @click="hideFlyover('filters')">
                <XIcon class="h-4 w-4 text-gray-400"/>
                </div>
            </div>
        </div>

        <div class="flex-1 bg-white overflow-auto px-4 pb-32 space-y-4 text-sm">
        </div>
    </div>
</template>