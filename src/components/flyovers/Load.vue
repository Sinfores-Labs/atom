<script>
import { XIcon } from '@heroicons/vue/outline'
import { useDropzone } from 'vue3-dropzone'
import { useConvertors } from '/src/composables/convertors'
import { useFlyovers } from '/src/composables/flyovers'

import emptyData from '/src/data/empty.json'

export default {
    components: { XIcon },

    props: {
        activeItem: {
            type: Object
        },
        db: {
            type: Object
        },
        version: {
            type: Number
        }
    },

    emits: ['set-db', 'set-layer-ready', 'set-active-item'],

    setup(props, { emit }) {
        const { hideFlyover, load } = useFlyovers()
        let sourceJSONFile = undefined
        const { convert } = useConvertors()

        const loadJSON = () => {
            let reader = new FileReader()
            reader.onload = event => {
                emit("set-layer-ready", false)
                emit("set-active-item", undefined)
                emit("set-db", JSON.parse(event.target.result))
                emit("set-layer-ready", true)
                hideFlyover("load")
            }
            reader.onerror = error => console.log(error)
            reader.readAsText(sourceJSONFile)
        }

        const loadDefault = () => {
            emit("set-db", JSON.parse(JSON.stringify(emptyData)))
            emit("set-layer-ready", true)
            emit("set-active-item", undefined)
            hideFlyover("load")
        }

        const onDrop = (acceptFiles, rejectReasons) => { sourceJSONFile = acceptFiles[0]; loadJSON() }
        
        const { getRootProps, getInputProps, ...rest } = useDropzone({ onDrop })

        return {
            getRootProps,
            getInputProps,
            ...rest,
            loadDefault,
            hideFlyover,
            load
        }
    },
}
</script>

<template>
    <div :class="load ? 'translate-y-0' : 'translate-y-full'" class="z-40 transition absolute bottom-9 right-4 w-96 h-96 overflow-hidden flex flex-col border shadow-xl border-t-2 border-t-purple-500">
      <div class="h-16 bg-white flex items-center justify-between px-4 space-x-2">
        <div class="flex-1 font-bold">Загрузка файла</div>
        <div>
          <div class="hover:bg-gray-100 cursor-pointer rounded-full h-6 w-6 flex items-center justify-center" @click="hideFlyover('load')">
            <XIcon class="h-4 w-4 text-gray-400"/>
          </div>
        </div>
      </div>
      <div class="flex-1 bg-white overflow-auto px-4 space-y-4">
        <p class="text-sm text-gray-500">
          Выберите json-файл для загрузки
        </p>
        <div class="h-16 bg-gray-50 border border-dashed rounded-lg my-4 flex items-center justify-center text-xs text-gray-500">
          <div v-bind="getRootProps()">
            <input v-bind="getInputProps()" >
            <p v-if="isDragActive">Перетащите файл сюда...</p>
            <p v-else class="cursor-pointer">Перетащите файл сюда или кликните для выбора</p>
          </div>
        </div>
        <p class="text-sm text-gray-500">Или выберите одну из стандартных моделей</p>
        <div class="text-sm text-gray-600">
          <p @click="loadDefault()" class="hover:underline hover:text-gray-800 cursor-pointer">Пустая модель</p>
        </div>
      </div>
    </div>
</template>
