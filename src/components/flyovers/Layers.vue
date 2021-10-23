<script>
import { ref } from 'vue'
import { XIcon, ChevronUpIcon, PlusSmIcon } from '@heroicons/vue/outline'
import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/vue'
import { Popover, PopoverButton, PopoverPanel } from '@headlessui/vue'
import { useFlyovers } from '/src/composables/flyovers'
import { useActiveLayer } from '/src/composables/activeLayer'

export default {
    components: { XIcon, ChevronUpIcon, PlusSmIcon, Disclosure, DisclosureButton, DisclosurePanel, Popover, PopoverButton, PopoverPanel  },

    props: {
        db: {
            type: Object,
            default: () => ({})
        }
    },

    setup(props) {
        const { hideFlyover, layers } = useFlyovers()
        const { activeLayer, setActiveLayer } = useActiveLayer()

        const newLayer = ref("")

        const add = () => {
            if (newLayer.value) {
                let lastIndex = 0
                props.db.layers.forEach(el => {
                    if (el.id > lastIndex) {
                        lastIndex = el.id
                    }
                })
                props.db.layers.push({
                    id: lastIndex + 1,
                    name: newLayer.value
                })
                props.db.items.forEach(el => {
                    el.layers.push({
                        id: lastIndex + 1,
                        color: 'bg-gray-100',
                        score: 0
                    })
                })
                newLayer.value = ""
            }
        }

        const remove = (layer) => {
            if (props.db.layers.length < 1) return
            setActiveLayer(props.db.layers[0])
            props.db.items.forEach(el => {
                const layerIndex = el.layers.findIndex(l => l.id === layer.id)
                if (layerIndex > -1) {
                    el.layers.splice(layerIndex, 1)
                }
            })
            const layerIndex = props.db.layers.findIndex(el => el.id === layer.id)
            if (layerIndex > -1) {
                props.db.layers.splice(layerIndex, 1)
            }
        }


        return {
            hideFlyover,
            layers,
            activeLayer,
            setActiveLayer,
            newLayer,
            add,
            remove
        }
    },
}
</script>

<template>
    <div :class="layers ? 'translate-y-0' : 'translate-y-full'" class="z-40 transition absolute bottom-9 right-112 w-96 h-large overflow-hidden flex flex-col border shadow-xl border-t-2 border-t-purple-500">
        <div class="h-16 bg-white flex items-center justify-between px-4 space-x-2">
            <div class="flex-1 font-bold">Слои</div>
            <div>
                <div class="hover:bg-gray-100 cursor-pointer rounded-full h-6 w-6 flex items-center justify-center" @click="hideFlyover('layers')">
                <XIcon class="h-4 w-4 text-gray-400"/>
                </div>
            </div>
        </div>

        <div class="flex-1 bg-white overflow-auto px-4 pb-32 text-sm">
            <Popover v-slot="{ open }" class="relative mb-4">
                <PopoverButton
                    :class="open ? '' : 'opacity-90'"
                    class="rounded-full bg-gray-50 h-8 w-8 flex items-center justify-center cursor-pointer text-gray-500 hover:bg-gray-200 hover:text-gray-900"
                >
                    <PlusSmIcon class="w-5 h-5" />
                </PopoverButton>

                <transition
                    enter-active-class="transition duration-200 ease-out"
                    enter-from-class="translate-y-1 opacity-0"
                    enter-to-class="translate-y-0 opacity-100"
                    leave-active-class="transition duration-150 ease-in"
                    leave-from-class="translate-y-0 opacity-100"
                    leave-to-class="translate-y-1 opacity-0"
                >
                    <PopoverPanel class="absolute z-10 w-80 mt-1 transform -translate-x-1/2 left-40 sm:px-0 lg:max-w-3xl" v-slot="{ close }">
                    <div  class="bg-white overflow-hidden rounded shadow-lg ring-1 ring-black ring-opacity-5 p-4 space-y-4">
                        <p class="text-xs text-gray-600">Введите название нового слоя</p>
                        <label class="block">
                            <textarea
                                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                rows="3"
                                v-model="newLayer"
                            ></textarea>
                        </label>
                        <button @click="add(); close()" class="bg-purple-600 text-white px-6 py-2 text-sm font-semibold rounded-lg">Создать</button>
                    </div>
                    </PopoverPanel>
                </transition>
            </Popover>
            <div
                class="border-t last:border-b px-2"
                :class="[activeLayer.id === layer.id ? 'bg-purple-50' : '']"
                v-for="layer in db.layers"
                :key="layer.id"
            >
                <Disclosure v-slot="{ open }">
                    <DisclosureButton class="py-2 w-full">
                        <div class="w-full flex justify-between items-center space-x-4">
                            <div :class="[activeLayer.id === layer.id ? 'font-semibold' : '']">
                                <div class="line-clamp-1">{{ layer.name }}</div>
                            </div>
                            <ChevronUpIcon
                                :class="open ? 'transform rotate-180' : ''"
                                class="w-5 h-5 text-purple-500"
                            />
                        </div>
                    </DisclosureButton>
                    <DisclosurePanel class="text-gray-500 pb-4">
                        <label class="block">
                            <input
                                type="text"
                                class="text-sm mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                v-model="layer.name"
                            >
                        </label>
                        <div class="flex items-center space-x-2">
                            <button
                                @click="setActiveLayer(layer)"
                                class="my-2 bg-purple-500 rounded text-purple-50 py-2 px-4 cursor-pointer hover:bg-purple-600 hover:text-white transition text-xs font-semibold"
                            >Сделать активным</button>
                            <button
                                v-if="db.layers.length > 1"
                                @click="remove(layer)"
                                class="my-2 bg-white border border-red-100 rounded text-red-500 py-2 px-4 cursor-pointer hover:bg-red-50 hover:text-red-700 transition text-xs font-semibold"
                            >Удалить</button>
                        </div>
                    </DisclosurePanel>
                </Disclosure>
            </div>
        </div>
    </div>
</template>