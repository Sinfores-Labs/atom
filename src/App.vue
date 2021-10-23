<script>
import { ref, computed } from 'vue'
import { XIcon, ChatAltIcon, FireIcon, FilterIcon, StatusOnlineIcon, AdjustmentsIcon, LinkIcon, UploadIcon, DownloadIcon, PlusSmIcon, ChevronDownIcon, CollectionIcon, ChevronUpIcon, ViewGridAddIcon, ViewGridIcon, ViewBoardsIcon } from '@heroicons/vue/outline'

import { Popover, PopoverButton, PopoverPanel } from '@headlessui/vue'
import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/vue'
import { saveAs } from 'file-saver'
import Markdown from 'vue3-markdown-it'

import { useFlyovers } from '/src/composables/flyovers'
import { useDebounceRef } from "/src/composables/debounce"
import { useConvertors } from '/src/composables/convertors'
import { swatches } from '/src/data/swatches'

import Grid from '/src/components/Grid.vue'
import DetailsCustomFields from '/src/components/DetailsCustomFields.vue'
import DetailsCustomFieldsEdit from '/src/components/DetailsCustomFieldsEdit.vue'

import FlyOverAbout from '/src/components/flyovers/About.vue'
import FlyOverDescription from '/src/components/flyovers/Description.vue'
import FlyOverFilters from '/src/components/flyovers/Filters.vue'
import FlyOverReferences from '/src/components/flyovers/Reference.vue'
import FlyOverGroups from '/src/components/flyovers/Groups.vue'
import FlyOverFields from '/src/components/flyovers/Fields.vue'
import FlyOverLoad from '/src/components/flyovers/Load.vue'

export default {
  components: { FlyOverAbout, FlyOverDescription, FlyOverFilters, FlyOverReferences, FlyOverGroups, FlyOverFields, FlyOverLoad, Grid, DetailsCustomFields, DetailsCustomFieldsEdit, Markdown, XIcon, ChatAltIcon, FireIcon, FilterIcon, StatusOnlineIcon, AdjustmentsIcon, LinkIcon, UploadIcon, DownloadIcon, PlusSmIcon, ChevronDownIcon, ChevronUpIcon, ViewBoardsIcon, ViewGridAddIcon, ViewGridIcon, CollectionIcon, Popover, PopoverButton, PopoverPanel, Disclosure, DisclosureButton, DisclosurePanel },

  setup() {
    const actualJSONVersion = 3
    const { showFlyover, hideFlyover, toggleFlyover, about, desc, filters, references, groups, fields, load } = useFlyovers()

    const viewBoard = ref(false)
    const poppers = ref(false)
    const heatmap = ref(false)

    const db = ref(undefined)
    const { convert } = useConvertors()
    const setDB = (value) => { db.value = value; convert(db, actualJSONVersion) }

    const isLayerReady = ref(false)
    const setLayerReady = (value) => { isLayerReady.value = value }
    

    const activeItem = ref(undefined)
    const setActiveItem = (value) => {
      if (db.value && db.value.items) {
        activeItem.value = db.value.items.find(el => el.id === parseInt(value))
      } else {
        return undefined
      }
    }
    const isAdditionalFieldsVisible = ref(false)
    const isWideDetails = ref(false)

    const getGroupById = (id) => {
      if (db.value && db.value.groups) {
        return db.value.groups.find(el => el.id === parseInt(id))
      } else {
        return undefined
      }
    }

    const getFieldById = (id) => {
      if (db.value && db.value.fields) {
        return db.value.fields.find(el => el.id === parseInt(id))
      } else {
        return undefined
      }
    }

    const newItem = ref('')
    const addNewItem = () => {
      if (newItem.value === '') return
      let lastIndex = 0
      db.value.items.forEach(el => {
        if (el.id > lastIndex) {
          lastIndex = el.id
        }
      })
      const fields = []
      db.value.fields.forEach(el => {
        fields.push({
          id: el.id,
          value: ''
        })
      })
      const newAtom = {
        id: lastIndex + 1,
        name: newItem.value,
        note: "",
        color: "bg-gray-100",
        score: 0,
        groupId: 0,
        fields,
        references: []
      }
      db.value.items.push(newAtom)
      newItem.value = ''
      activeItem.value = db.value.items.find(el => el.id === newAtom.id)
    }
    const deleteItem = () => {
      if (activeItem.value) {
        const idToDelete = activeItem.value.id
        activeItem.value = undefined
        const index = db.value.items.findIndex(el => el.id === idToDelete)
        if (index > -1) {
          db.value.items.splice(index, 1)
        }
      }
    }
    
    const searchQuery = useDebounceRef('', 400)
    const searchResults = computed(() => {
        if (isLayerReady.value && db.value && db.value.items) {
          const q = searchQuery.value.toLowerCase()
          if (q.length < 3) return db.value.items;
          return db.value.items.filter(el => {
            let searchString = `${el.name}`
            db.value.fields.forEach(field => {
              if (field.searchable) {
                searchString += el.fields.find(i => i.id === field.id).value
              }
            })
            return (searchString.toLowerCase().indexOf(q) > -1)
          })
        } else {
          return []
        }
    })

    const saveJSON = () => {
      // https://stackoverflow.com/questions/679915/how-do-i-test-for-an-empty-javascript-object
      if (db && Object.keys(db.value).length !== 0) {
        let blob = new Blob([JSON.stringify(db.value)], {type: "application/json;charset=utf-8"});
        saveAs(blob, "atoms.json");
      }
    };

    const filterByGroup = (id) => {
      return searchResults.value.filter(el => el.groupId === parseInt(id))
    }

    const nonEmptyGroups = computed(() => {
      return db.value.groups.filter(group => searchResults.value.findIndex(item => item.groupId === group.id) > -1)
    })

    const toggleReference = (referenceId) => {
      if (activeItem.value.references.includes(referenceId)) {
        const index = activeItem.value.references.findIndex(el => el === referenceId)
        activeItem.value.references.splice(index, 1)
      } else {
        activeItem.value.references.push(referenceId)
      }
    }

    const getReferenceById = (referenceId) => {
      return db.value.references.find(el => el.id === referenceId)
    }

    return {
      actualJSONVersion,
      viewBoard, poppers, heatmap,
      db, setDB,
      isLayerReady, setLayerReady,
      activeItem, setActiveItem, isAdditionalFieldsVisible, isWideDetails,
      newItem, addNewItem, deleteItem,
      getGroupById, getFieldById,
      showFlyover, hideFlyover, toggleFlyover, about, desc, filters, references, groups, fields, load,
      searchQuery, searchResults,
      swatches,
      saveJSON,
      filterByGroup, nonEmptyGroups,
      toggleReference, getReferenceById
    }
  }
}
</script>

<template>
  <div class="h-screen w-screen overflow-hidden flex flex-col">

    <!-- Flyovers -->
    <!-- -------------------------------------------------- -->
    <fly-over-about />
    <fly-over-description v-if="isLayerReady" :db="db" />
    <fly-over-filters v-if="isLayerReady" />
    <fly-over-references v-if="isLayerReady" :db="db" />
    <fly-over-groups v-if="isLayerReady" :db="db" />
    <fly-over-fields v-if="isLayerReady" :db="db" />
    <fly-over-load
      :db="db"
      :active-item="activeItem"
      :version="actualJSONVersion"
      @set-db="setDB"
      @set-layer-ready="setLayerReady"
      @set-active-item="setActiveItem"
    />
    <!-- -------------------------------------------------- -->
    
    <div class="flex-1 flex">
      <div class="flex-1 flex flex-col">
        <!-- Search & Actions-->
        <!-- -------------------------------------------------- -->
        <div v-if="isLayerReady" class="h-16 flex items-center justify-between px-12 space-x-4">
          <div class="flex-1">
            <label class="block">
              <input
                v-model="searchQuery"
                type="text"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-300 focus:ring focus:ring-purple-200 focus:ring-opacity-50"
                placeholder="Поиск..."
              />
            </label>
          </div>
          <div class="flex items-center space-x-2">
            <div class="rounded-lg bg-gray-50 h-8 w-8 flex items-center justify-center cursor-pointer text-gray-500 hover:bg-gray-200 hover:text-gray-900">
              <ViewGridIcon v-if="viewBoard" class="w-5 h-5" @click="viewBoard = false" />
              <ViewBoardsIcon v-else class="w-5 h-5" @click="viewBoard = true" />
            </div>
            <div
              :class="[heatmap ? 'bg-purple-50 text-purple-500 border border-purple-100' : 'bg-gray-50 text-gray-500']"
              class="rounded-lg h-8 w-8 flex items-center justify-center cursor-pointer text-gray-500 hover:bg-gray-200 hover:text-gray-900"
            >
              <FireIcon class="w-5 h-5" @click="heatmap = !heatmap" />
            </div>
            <div
              :class="[poppers ? 'bg-purple-50 text-purple-500 border border-purple-100' : 'bg-gray-50 text-gray-500']"
              class="rounded-lg h-8 w-8 flex items-center justify-center cursor-pointer text-gray-500 hover:bg-gray-200 hover:text-gray-900"
            >
              <ChatAltIcon class="w-5 h-5" @click="poppers = !poppers" />
            </div>
            <Popover v-slot="{ open }" class="relative">
              <PopoverButton
                :class="open ? '' : 'opacity-90'"
                class="rounded-lg bg-gray-50 h-8 w-8 flex items-center justify-center cursor-pointer text-gray-500 hover:bg-gray-200 hover:text-gray-900"
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
                <PopoverPanel class="absolute z-10 w-80 mt-1 transform -translate-x-full left-40 sm:px-0 lg:max-w-3xl">
                  <div  class="bg-white overflow-hidden rounded shadow-lg ring-1 ring-black ring-opacity-5 p-4 space-y-4">
                    <p class="text-xs text-gray-600">Введите название нового элемента, которое будет отображаться в сетке. После создания элемента можно будет внести в него необходимые изменения.</p>
                    <label class="block">
                      <textarea class="
                          mt-1
                          block
                          w-full
                          rounded-md
                          border-gray-300
                          shadow-sm
                          text-sm
                          focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50
                        " rows="3" v-model="newItem"></textarea>
                    </label>
                    <button @click="addNewItem" class="bg-purple-600 text-white px-6 py-2 text-sm font-semibold rounded-lg">Создать</button>
                  </div>
                </PopoverPanel>
              </transition>
            </Popover>
          </div>
        </div>
        <!-- -------------------------------------------------- -->

        <!-- Grid -->
        <!-- -------------------------------------------------- -->
        <div v-if="isLayerReady" class="pb-32 overflow-hidden" style="height: calc(100vh - 6.5rem);">
          <div v-if="viewBoard"
            class="px-2 py-4 pb-32 overflow-y-auto space-y-1"
            style="height: calc(100vh - 6.5rem);"
          >
            <!-- Non-group -->
            <Grid
              v-if="filterByGroup(0).length > 0"
              :poppers="poppers"
              :heatmap="heatmap"
              :items="filterByGroup(0)"
              :active-item="activeItem"
              :get-field-by-id-fn="getFieldById"
              :get-reference-by-id-fn="getReferenceById"
              :set-active-item-fn="setActiveItem"
              class="overflow-y-auto px-8"
            />
            <!-- Group exist -->
            <Grid
              v-for="group in nonEmptyGroups"
              :key="group.id"
              :header="group.name"
              :poppers="poppers"
              :heatmap="heatmap"
              :items="filterByGroup(group.id)"
              :active-item="activeItem"
              :get-field-by-id-fn="getFieldById"
              :get-reference-by-id-fn="getReferenceById"
              :set-active-item-fn="setActiveItem"
              class="overflow-y-auto px-8"
            />
          </div>
          <div v-else style="height: calc(100vh - 6.5rem);" class="overflow-y-auto p-8">
            <Grid
              :poppers="poppers"
              :heatmap="heatmap"
              :items="searchResults"
              :active-item="activeItem"
              :get-field-by-id-fn="getFieldById"
              :get-reference-by-id-fn="getReferenceById"
              :set-active-item-fn="setActiveItem"
            />
          </div>
        </div>
        <!-- -------------------------------------------------- -->
      </div>

      <!-- Detais -->
      <!-- -------------------------------------------------- -->
      <div
        :class="[isWideDetails ? 'w-132' : 'w-96']"
        class="bg-gray-50 overflow-y-auto shadow-lg border-l rounded-tl-lg p-4 relative transition"
        style="height: calc(100vh - 2.5rem);"
      >
        <!-- Button to toggle details window size -->
        <div
          @click="isWideDetails = !isWideDetails"
          class="absolute top-5 w-8 h-8 left-5 bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700 rounded-full flex items-center justify-center cursor-pointer"
        ><ChevronUpIcon class="h-5 w-5 transition-all" :class="[isWideDetails ? 'rotate-90' : '-rotate-90']" /></div>

        <!-- Button to close active item -->
        <div
          v-if="activeItem"
          @click="activeItem = undefined"
          class="absolute top-5 w-8 h-8 right-5 bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700 rounded-full flex items-center justify-center cursor-pointer"
        ><XIcon class="w-5 h-5" /></div>

        <div v-if="activeItem" class="px-2 py-16 space-y-8">
          <!-- Header -->
          <section class="space-y-2">
            <div class="font-bold" :class="[isWideDetails ? 'text-xl' : 'text-base']">{{ activeItem.name }}</div>
              <!-- Custom fields -->
              <div
                v-for="field in activeItem.fields"
                :key="field.id"
              >
                <div v-if="getFieldById(field.id).showInHeader && field.value" class="space-y-2">
                  <div class="atom-prose font-semibold" :class="isWideDetails ? 'text-3xl' : 'text-base'">
                    <Markdown :source="field.value" />
                  </div>
                </div>
              </div>
          </section>

          <section class="border-t border-b py-4 space-y-4">

            <div class="flex items-center space-x-2">
              <!-- Color picker -->
              <div class="flex-1">
                <Popover v-slot="{ open }" class="relative">
                  <PopoverButton
                    :class="open ? '' : 'text-opacity-90'"
                    class="w-full inline-flex items-center justify-between shadow px-3 py-3 text-base font-medium text-gray-900 bg-white rounded-md group hover:text-opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75"
                  >
                    <div class="flex items-center space-x-2">
                      <div class="text-sm">Цвет</div>
                      <div class="w-16 h-5 rounded border" :class="activeItem.color"></div>
                    </div>
                    <ChevronDownIcon
                      :class="open ? '' : 'text-opacity-70'"
                      class="w-4 h-4 ml-2 text-gray-500 transition duration-150 ease-in-out group-hover:text-opacity-80"
                      aria-hidden="true"
                    />
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
                      <div class="bg-white overflow-hidden rounded shadow-lg ring-1 ring-black ring-opacity-5">
                        <div class="grid grid-cols-9 gap-1 p-4">
                          <div @click="activeItem.color = swatch" v-for="(swatch, index) in swatches" :key="index" class="rounded cursor-pointer" :class="[activeItem.color === swatch ? 'ring-2 ring-offset-1 ring-black ring-opacity-30' : '', swatch, 'h-6']"></div>
                        </div>
                      </div>
                    </PopoverPanel>
                  </transition>
                </Popover>
              </div>
              <!-- Score -->
              <label class="block w-24">
                <input type="text" class="
                    block
                    w-full
                    rounded-md
                    border-gray-300
                    shadow-sm
                    focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50
                  " placeholder="Score" v-model="activeItem.score">
              </label>
            </div>

            <div @click="isAdditionalFieldsVisible = !isAdditionalFieldsVisible" class="bg-gray-100 h-5 rounded cursor-pointer hover:bg-gray-200 flex justify-center items-center">
              <ChevronDownIcon :class="isAdditionalFieldsVisible ? 'rotate-180' : ''" class="h-4 w-4 text-gray-600"></ChevronDownIcon>
            </div>

            <div v-if="isAdditionalFieldsVisible" class="space-y-2">
              <!-- Name -->
              <div>
                <label class="block">
                  <span class="text-gray-700 text-sm">Название</span>
                  <input type="text" class="
                      mt-1
                      block
                      w-full
                      rounded-md
                      border-gray-300
                      shadow-sm
                      text-sm
                      focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50
                    " v-model="activeItem.name">
                </label>
              </div>
              <!-- Group -->
              <div>
                <Popover v-slot="{ open }" class="relative">
                  <PopoverButton
                    :class="open ? '' : 'text-opacity-90'"
                    class="w-full inline-flex items-center justify-between shadow px-3 py-3 text-base font-medium text-gray-900 bg-white rounded-md group hover:text-opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75"
                  >
                    <div class="flex items-center space-x-2">
                      <div class="text-sm font-bold">Группа:</div>
                      <div class="text-sm line-clamp-1" v-if="activeItem.groupId">{{ getGroupById(activeItem.groupId).name }}</div>
                      <div class="text-sm line-clamp-1" v-else>Не выбрана</div>
                    </div>
                    <ChevronDownIcon
                      :class="open ? '' : 'text-opacity-70'"
                      class="w-4 h-4 ml-2 text-gray-500 transition duration-150 ease-in-out group-hover:text-opacity-80"
                      aria-hidden="true"
                    />
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
                      <div class="bg-white overflow-auto rounded shadow-lg ring-1 ring-black ring-opacity-5 p-2">
                        <div @click="activeItem.groupId = 0" :class="[0 === activeItem.groupId ? 'font-bold' : '']" class="px-2 py-1 text-sm hover:bg-gray-100 cursor-pointer rounded-lg line-clamp-1">Без группы</div>
                        <div
                          v-for="group in db.groups"
                          :key="group.id"
                          :class="[group.id === activeItem.groupId ? 'font-bold' : '']"
                          class="px-2 py-1 text-sm hover:bg-gray-100 cursor-pointer rounded-lg line-clamp-1"
                          @click="activeItem.groupId = group.id"
                        >{{ group.name }}</div>
                      </div>
                    </PopoverPanel>
                  </transition>
                </Popover>
              </div>
              <!-- References -->
              <div class="py-4">
                <header class="flex items-center">
                  <div v-if="db.referenceName" class="flex-1 text-xs text-gray-700">{{ db.referenceName }}</div>
                  <div v-else class="flex-1 text-xs text-gray-700">Связи</div>
                  <Popover v-slot="{ open }" class="relative">
                    <PopoverButton
                      :class="open ? '' : 'opacity-90'"
                      class="rounded-lg bg-gray-50 h-8 w-8 flex items-center justify-center cursor-pointer text-gray-500 hover:bg-gray-200 hover:text-gray-900"
                    >
                      <AdjustmentsIcon class="w-5 h-5" />
                    </PopoverButton>

                    <transition
                      enter-active-class="transition duration-200 ease-out"
                      enter-from-class="translate-y-1 opacity-0"
                      enter-to-class="translate-y-0 opacity-100"
                      leave-active-class="transition duration-150 ease-in"
                      leave-from-class="translate-y-0 opacity-100"
                      leave-to-class="translate-y-1 opacity-0"
                    >
                      <PopoverPanel class="absolute z-10 w-80 mt-1 transform -translate-x-full left-8 sm:px-0 lg:max-w-3xl">
                        <div class="bg-white overflow-hidden rounded shadow-lg ring-1 ring-black ring-opacity-5 p-4 space-y-4 flex flex-col">
                          <div class="h-96 overflow-y-auto">
                            <div
                              v-for="reference in db.references"
                              :key="reference.id"
                            >
                              <label class="inline-flex items-center">
                                <input type="checkbox" class="
                                    rounded
                                    border-gray-300
                                    text-purple-600
                                    shadow-sm
                                    focus:border-purple-300
                                    focus:ring
                                    focus:ring-offset-0
                                    focus:ring-purple-200
                                    focus:ring-opacity-50
                                  " :checked="activeItem.references.includes(reference.id)" @click="toggleReference(reference.id)">
                                <span class="ml-2 text-sm line-clamp-1">{{ reference.name }}</span>
                              </label>
                            </div>
                          </div>
                        </div>
                      </PopoverPanel>
                    </transition>
                  </Popover>
                </header>
                <div class="space-y-1">
                  <div
                    v-for="reference in activeItem.references"
                    :key="reference"
                    class="font-bold text-sm"
                  >
                    {{ getReferenceById(reference).name }}
                  </div>
                </div>
              </div>
              <!-- Comments -->
              <div>
                <label class="block">
                  <span class="text-gray-700 text-xs">Комментарий</span>
                  <textarea class="
                      mt-1
                      block
                      w-full
                      rounded-md
                      border-gray-300
                      shadow-sm
                      text-sm
                      focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50
                    " rows="6" v-model="activeItem.note"></textarea>
                </label>
              </div>

              <!-- Custom fields -->
              <DetailsCustomFieldsEdit
                :fields="activeItem.fields"
                :get-field-by-id-fn="getFieldById"
              />

              <div class="py-4">
                <button @click="deleteItem()" class="cursor-pointer w-full bg-red-50 border border-red-100 text-red-700 font-semibold text-xs py-2 flex justify-center rounded">Удалить</button>
              </div>
            </div>

          </section>

          <section :class="[isWideDetails ? 'space-y-12 px-4' : 'space-y-6 px-0']">
            <div v-if="activeItem.references.length > 0" :class="[isWideDetails ? 'text-base space-y-4' : 'text-xs space-y-2']">
              <header v-if="db.referenceName" class="uppercase font-bold text-gray-500">{{ db.referenceName}}</header>
              <header v-else class="uppercase font-bold text-gray-500">Связи</header>
              <div>
                <span
                  v-for="(reference, index) in activeItem.references"
                  :key="reference"
                >{{ getReferenceById(reference).name }}<span v-if="index < activeItem.references.length - 1">, </span></span>
              </div>
            </div>

            <!-- Custom fields -->
            <DetailsCustomFields
              :fields="activeItem.fields"
              :is-wide="isWideDetails"
              :get-field-by-id-fn="getFieldById"
            />
          </section>

        </div>

        <div v-else>
          <div v-if="isLayerReady" class="space-y-2 px-2 py-16">
            <div class="font-bold">{{ db.model.name }}</div>
            <div class="text-sm text-gray-600">{{ db.model.description }}</div>
            <div v-if="db.model.version" class="text-xs text-gray-600 font-bold">Версия: {{ db.model.version }}</div>
          </div>
        </div>
      </div>
      <!-- -------------------------------------------------- -->
    </div>

    <!-- Footer -->
    <!-- -------------------------------------------------- -->
    <div class="z-50 h-10 bg-gray-50 border-t flex items-center justify-between text-xs px-4">
      <div @click="toggleFlyover('about')" class="cursor-pointer select-none"><span class="font-bold">ATOM</span> &middot; Sinfores SX</div>

      <!-- Main menu -->
      <!-- -------------------------------------------------- -->
      <div class="flex items-center space-x-2 border-b-2 border-transparent">
        <!-- Description -->
        <div @click="toggleFlyover('desc')" v-if="isLayerReady" :class="[desc ? 'border-purple-500' : 'border-transparent']" class="border-t-2 border-transparent h-10 px-4 hover:bg-gray-200 cursor-pointer select-none font-semibold flex items-center space-x-2" type="button">
          <StatusOnlineIcon class="w-5 h-5" aria-hidden="true" />
          <div>Описание</div>
        </div>
        <!-- Filters -->
        <div @click="toggleFlyover('filters')" v-if="isLayerReady" :class="[filters ? 'border-purple-500' : 'border-transparent']" class="border-t-2 border-transparent h-10 px-4 hover:bg-gray-200 cursor-pointer select-none font-semibold flex items-center space-x-2" type="button">
          <FilterIcon class="w-5 h-5" aria-hidden="true" />
          <div>Фильтры</div>
        </div>
        <!-- References -->
        <div @click="toggleFlyover('references')" v-if="isLayerReady" :class="[references ? 'border-purple-500' : 'border-transparent']" class="border-t-2 border-transparent h-10 px-4 hover:bg-gray-200 cursor-pointer select-none font-semibold flex items-center space-x-2" type="button">
          <LinkIcon class="w-5 h-5" aria-hidden="true" />
          <div v-if="db.referenceName">{{ db.referenceName }}</div>
          <div v-else>Связи</div>
        </div>
        <!-- Groups -->
        <div @click="toggleFlyover('groups')" v-if="isLayerReady" :class="[groups ? 'border-purple-500' : 'border-transparent']" class="border-t-2 border-transparent h-10 px-4 hover:bg-gray-200 cursor-pointer select-none font-semibold flex items-center space-x-2" type="button">
          <ViewGridAddIcon class="w-5 h-5" aria-hidden="true" />
          <div>Группы</div>
        </div>
        <!-- Fields -->
        <div @click="toggleFlyover('fields')" v-if="isLayerReady" :class="[fields ? 'border-purple-500' : 'border-transparent']" class="border-t-2 border-transparent h-10 px-4 hover:bg-gray-200 cursor-pointer select-none font-semibold flex items-center space-x-2" type="button">
          <CollectionIcon class="w-5 h-5" aria-hidden="true" />
          <div>Поля</div>
        </div>
        <!-- Load -->
        <div @click="toggleFlyover('load')" :class="[load ? 'border-purple-500' : 'border-transparent']" class="border-t-2 h-10 px-4 hover:bg-gray-200 cursor-pointer select-none font-semibold flex items-center space-x-2 select-none" type="button">
          <UploadIcon class="w-5 h-5" aria-hidden="true" />
          <div>Загрузить</div>
        </div>
        <!-- Save -->
        <div @click="saveJSON()" v-if="isLayerReady" class="border-t-2 border-transparent h-10 px-4 hover:bg-gray-200 cursor-pointer select-none font-semibold flex items-center space-x-2" type="button">
          <DownloadIcon class="w-5 h-5" aria-hidden="true" />
          <div>Сохранить</div>
        </div>
      </div>
      <!-- -------------------------------------------------- -->

    </div>
    <!-- -------------------------------------------------- -->
  </div>
</template>

<style scoped>
:deep(.popper) {
  @apply bg-gray-800;
  @apply text-gray-100;
  @apply shadow;
  @apply rounded;
  @apply text-xs;
  @apply p-3;
  @apply max-w-sm;
}
:deep(.popper #arrow::before) {
  @apply bg-gray-800;
}
:deep(.popper:hover),
:deep(.popper:hover > #arrow::before) {
  @apply bg-gray-800;
}
</style>
