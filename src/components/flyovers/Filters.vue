<script>
// import { watch } from 'vue'
import { XIcon, ChevronUpIcon, PlusSmIcon } from '@heroicons/vue/outline'
import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/vue'
import { useFlyovers } from '/src/composables/flyovers'

export default {
    components: { XIcon, ChevronUpIcon, Disclosure, DisclosureButton, DisclosurePanel },

    props: {
        db: {
            type: Object
        },
        selectedReferences: {
            type: Object
        }
    },

    setup(props) {
        const { hideFlyover, filters } = useFlyovers()

        const loadSelected = () => {
            props.db.references.forEach(el => {
                props.selectedReferences.push(el.id)
            })
        }
        loadSelected()

        // watch(props.db.references, (prev, next) => {
        //     loadSelected()
        // })

        const toggleReference = (id, name) => {
            const refIndex = props.selectedReferences.findIndex(el => el === id)
            if (refIndex > -1) {
                props.selectedReferences.splice(refIndex, 1)
            } else {
                props.selectedReferences.push(id)
            }
        }

        return {
            filters,
            hideFlyover,
            toggleReference
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
            <div class="border-t border-b px-2">
                <Disclosure v-slot="{ open }">
                    <DisclosureButton class="py-2 w-full">
                        <div class="w-full flex justify-between items-center space-x-4">
                            <div class="font-semibold">
                                <div v-if="db.referenceName" class="line-clamp-1">Фильтр по: {{ db.referenceName }}</div>
                                <div v-else>Фильтр по связям</div>
                            </div>
                            <ChevronUpIcon
                                :class="open ? 'transform rotate-180' : ''"
                                class="w-5 h-5 text-purple-500"
                            />
                        </div>
                    </DisclosureButton>
                    <DisclosurePanel class="text-gray-500 pb-4">
                        <div>
                            <div>
                                <div
                                    v-for="reference in db.references"
                                    :key="reference.id"
                                >
                                    <label class="inline-flex items-center">
                                        <input
                                            @click="toggleReference(reference.id)"
                                            type="checkbox"
                                            class="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-offset-0 focus:ring-indigo-200 focus:ring-opacity-50"
                                            :checked="selectedReferences.includes(reference.id)"
                                        >
                                        <span class="ml-2">{{ reference.name }}</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </DisclosurePanel>
                </Disclosure>
            </div>
        </div>
    </div>
</template>