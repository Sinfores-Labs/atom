<script>
import { ref } from 'vue'
import { XIcon, PlusSmIcon } from '@heroicons/vue/outline'
import { Popover, PopoverButton, PopoverPanel } from '@headlessui/vue'
import { useFlyovers } from '/src/composables/flyovers'

export default {
    components: { XIcon, PlusSmIcon, Popover, PopoverButton, PopoverPanel },

    props: {
        db: {
            type: Object
        }
    },

    setup(props) {
        const { hideFlyover, groups } = useFlyovers()

        const newGroup = ref('')
        const addNewGroup= () => {
        if (newGroup.value === '') return
        let lastIndex = 0
        props.db.value.groups.forEach(el => {
            if (el.id > lastIndex) {
            lastIndex = el.id
            }
        })
        const _newGroup = {
            id: lastIndex + 1,
            name: newGroup.value
        }
        props.db.value.groups.push(_newGroup)
        newGroup.value = ''
        }

        return {
            newGroup,
            addNewGroup,
            hideFlyover,
            groups
        }
    },
}
</script>

<template>
    <div :class="groups ? 'translate-y-0' : 'translate-y-full'" class="z-40 transition absolute bottom-9 right-60 w-96 h-large overflow-hidden flex flex-col border shadow-xl border-t-2 border-t-purple-500">
      <div class="h-16 bg-white flex items-center justify-between px-4 space-x-2">
        <div class="flex-1 font-bold">Управление группами</div>
        <div>
          <div class="hover:bg-gray-100 cursor-pointer rounded-full h-6 w-6 flex items-center justify-center" @click="hideFlyover('groups')">
            <XIcon class="h-4 w-4 text-gray-400"/>
          </div>
        </div>
      </div>
      <div class="flex-1 bg-white overflow-auto px-4 pb-32 space-y-4 text-sm">
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
                <p class="text-xs text-gray-600">Введите название новой группы.</p>
                <label class="block">
                    <textarea
                        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                        rows="3"
                        v-model="newGroup"
                    ></textarea>
                </label>
                <button @click="addNewGroup" class="bg-purple-600 text-white px-6 py-2 text-sm font-semibold rounded-lg">Создать</button>
              </div>
            </PopoverPanel>
          </transition>
        </Popover>
        <div class="space-y-2">
          <label
            v-for="group in db.groups"
            :key="group.id"
            class="block"
          >
            <input
                type="text"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                v-model="group.name"
            />
          </label>
        </div>
      </div>
    </div>
</template>
