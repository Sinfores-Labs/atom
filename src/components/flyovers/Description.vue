<script>
import { XIcon } from '@heroicons/vue/outline'
import { useFlyovers } from '/src/composables/flyovers'

export default {
    components: { XIcon },

    props: {
        db: {
            type: Object
        }
    },

    setup() {
      const { hideFlyover, desc } = useFlyovers()
      return {
        hideFlyover,
        desc
      }
    },
}
</script>

<template>
    <div :class="desc ? 'translate-y-0' : 'translate-y-full'" class="z-40 transition absolute bottom-9 right-120 w-96 h-96 overflow-hidden flex flex-col border shadow-xl border-t-2 border-t-purple-500">
      <div class="h-16 bg-white flex items-center justify-between px-4 space-x-2">
        <div class="flex-1 font-bold">Описание</div>
        <div>
          <div class="hover:bg-gray-100 cursor-pointer rounded-full h-6 w-6 flex items-center justify-center" @click="hideFlyover('desc')">
            <XIcon class="h-4 w-4 text-gray-400"/>
          </div>
        </div>
      </div>
      <div class="flex-1 bg-white overflow-auto px-4 space-y-4 text-sm">
        <div class="space-y-2">
          <label class="block">
            <span class="text-gray-700">Название</span>
            <input
              v-model="db.model.name"
              type="text"
              class="text-sm mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              placeholder="Название">
          </label>
          <label class="block">
            <span class="text-gray-700">Версия</span>
            <input
              v-model="db.model.version"
              type="text"
              class="text-sm mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              placeholder="Версия">
          </label>
          <label class="block">
                <span class="text-gray-700">Описание</span>
                <textarea
                  v-model="db.model.description"
                  class="text-sm mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  rows="3"
                ></textarea>
              </label>
        </div>
        <div class="space-y-1">
          <p class="text-xs">Атомов: {{ db.items.length }} (активных {{ db.items.filter(el => el.active).length }}), связей: {{ db.references.length }}, групп: {{ db.groups.length }}</p>
          <p class="text-xs">Версия схемы: v.{{ db.version }}</p>
        </div>
      </div>
    </div>
</template>