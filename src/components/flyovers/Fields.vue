<script>
import { ref } from 'vue'
import { XIcon, PlusSmIcon, ChevronUpIcon } from '@heroicons/vue/outline'
import { Popover, PopoverButton, PopoverPanel } from '@headlessui/vue'
import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/vue'

export default {
    components: { XIcon, PlusSmIcon, ChevronUpIcon, Popover, PopoverButton, PopoverPanel, Disclosure, DisclosureButton, DisclosurePanel },

    props: {
        visible: {
            type: Boolean,
            default: false
        },
        hideFn: {
            type: Function
        },
        isLayerReady: {
            type: Boolean,
            default: false
        },
        db: {
            type: Object
        }
    },

    setup(props) {
        const newField = ref('')
        const addNewField = () => {
            if (newField.value === '') return
            let lastIndex = 0
            props.db.value.fields.forEach(el => {
                if (el.id > lastIndex) {
                lastIndex = el.id
                }
            })
            const _newField = {
                id: lastIndex + 1,
                name: newField.value,
                showInDetals: false,
                showInPopper: false,
                showInGrid: false,
                showInHeader: false,
                searchable: false,
                filterable: false
            }
            props.db.value.fields.push(_newField)
            props.db.value.items.forEach(el => {
                el.fields.push({
                id: lastIndex + 1,
                value: ''
                })
            })
            newField.value = ''
        }

        return {
            newField,
            addNewField
        }
        
    },
}
</script>

<template>
    <div v-if="isLayerReady" :class="visible ? 'translate-y-0' : 'translate-y-full'" class="z-40 transition absolute bottom-9 right-32 w-96 h-large overflow-hidden flex flex-col border shadow-xl border-t-2 border-t-purple-500">
      <div class="h-16 bg-white flex items-center justify-between px-4 space-x-2">
        <div class="flex-1 font-bold">Управление полями</div>
        <div>
          <div class="hover:bg-gray-100 cursor-pointer rounded-full h-6 w-6 flex items-center justify-center" @click="hideFn('fields')">
            <XIcon class="h-4 w-4 text-gray-400"/>
          </div>
        </div>
      </div>
      <div class="flex-1 bg-white overflow-auto px-4 space-y-4 text-sm">
        <Popover v-slot="{ open }" class="relative">
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
            <PopoverPanel class="absolute z-10 w-80 mt-1 transform -translate-x-1/2 left-40 sm:px-0 lg:max-w-3xl">
              <div  class="bg-white overflow-hidden rounded shadow-lg ring-1 ring-black ring-opacity-5 p-4 space-y-4">
                <p class="text-xs text-gray-600">Введите название нового поля.</p>
                <label class="block">
                  <textarea
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                    rows="3"
                    v-model="newField"
                ></textarea>
                </label>
                <button @click="addNewField" class="bg-purple-600 text-white px-6 py-2 text-sm font-semibold rounded-lg">Создать</button>
              </div>
            </PopoverPanel>
          </transition>
        </Popover>
        <Disclosure
          v-for="field in db.fields"
          :key="field.id"
          v-slot="{ open }"
        >
          <DisclosureButton
            class="flex justify-between w-full px-4 py-2 text-sm font-medium text-left text-purple-900 bg-purple-100 rounded-lg hover:bg-purple-200 focus:outline-none focus-visible:ring focus-visible:ring-purple-500 focus-visible:ring-opacity-75"
          >
            <span class="line-clamp-1">{{ field.name }}</span>
            <ChevronUpIcon
              :class="open ? 'transform rotate-180' : ''"
              class="w-5 h-5 text-purple-500"
            />
          </DisclosureButton>
          <DisclosurePanel class="px-2 pt-2 pb-2 text-sm text-gray-500 space-y-1">
            <div class="pb-4">
              <label class="block">
                <span class="font-bold text-black">Название поля</span>
                <input
                    type="text"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                    placeholder="Название"
                    v-model="field.name"
                />
              </label>
            </div>
            <div>
              <label class="inline-flex items-center">
                <input
                  type="checkbox"
                  class="rounded border-gray-300 text-purple-600 shadow-sm focus:border-purple-300 focus:ring focus:ring-offset-0 focus:ring-purple-200 focus:ring-opacity-50 cursor-pointer" 
                  v-model="field.showInHeader"
                >
                <span class="ml-2">Показывать поле в заголовке</span>
              </label>
            </div>
            <div>
              <label class="inline-flex items-center">
                <input
                  type="checkbox"
                  class="rounded border-gray-300 text-purple-600 shadow-sm focus:border-purple-300 focus:ring focus:ring-offset-0 focus:ring-purple-200 focus:ring-opacity-50 cursor-pointer" 
                  v-model="field.showInDetals"
                >
                <span class="ml-2">Показывать поле в деталях атома</span>
              </label>
            </div>
            <div>
              <label class="inline-flex items-center">
                <input
                  type="checkbox"
                  class="rounded border-gray-300 text-purple-600 shadow-sm focus:border-purple-300 focus:ring focus:ring-offset-0 focus:ring-purple-200 focus:ring-opacity-50 cursor-pointer" 
                  v-model="field.showInPopper"
                >
                <span class="ml-2">Показывать поле в подсказке</span>
              </label>
            </div>
            <div>
              <label class="inline-flex items-center">
                <input
                  type="checkbox"
                  class="rounded border-gray-300 text-purple-600 shadow-sm focus:border-purple-300 focus:ring focus:ring-offset-0 focus:ring-purple-200 focus:ring-opacity-50 cursor-pointer" 
                  v-model="field.showInGrid"
                >
                <span class="ml-2">Показывать поле в сетке</span>
              </label>
            </div>
                        <div>
              <label class="inline-flex items-center">
                <input
                  type="checkbox"
                  class="rounded border-gray-300 text-purple-600 shadow-sm focus:border-purple-300 focus:ring focus:ring-offset-0 focus:ring-purple-200 focus:ring-opacity-50 cursor-pointer" 
                  v-model="field.searchable"
                >
                <span class="ml-2">Учитывать поле при поиске</span>
              </label>
            </div>
            <div>
              <label class="inline-flex items-center">
                <input
                  type="checkbox"
                  class="rounded border-gray-300 text-purple-600 shadow-sm focus:border-purple-300 focus:ring focus:ring-offset-0 focus:ring-purple-200 focus:ring-opacity-50 cursor-pointer" 
                  v-model="field.filterable"
                >
                <span class="ml-2">Учитывать поле при фильтрации</span>
              </label>
            </div>
          </DisclosurePanel>
        </Disclosure>
      </div>
    </div>
</template>