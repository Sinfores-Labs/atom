<script>
import { ref, computed } from 'vue'
import { XIcon, DuplicateIcon, ChatAltIcon, FireIcon, FilterIcon, StatusOnlineIcon, AdjustmentsIcon, LinkIcon, UploadIcon, DownloadIcon, PlusSmIcon, ChevronDownIcon, CollectionIcon, ChevronUpIcon, ViewGridAddIcon, ViewGridIcon, ViewBoardsIcon } from '@heroicons/vue/outline'

import { Popover, PopoverButton, PopoverPanel } from '@headlessui/vue'
import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/vue'
import Markdown from 'vue3-markdown-it'

import { useDebounceRef } from "/src/composables/debounce"
import { useConvertors } from '/src/composables/convertors'
import { useActiveLayer } from '/src/composables/activeLayer'
import { usePopper } from '/src/composables/popper'
import { useBoard } from '/src/composables/board'
import { useHeatmap } from '/src/composables/heatmap'
import { useLayersMenu } from '/src/composables/layersMenu'
import { swatches } from '/src/data/swatches'

import Grid from '/src/components/Grid.vue'
import Footer from '/src/components/Footer.vue'
import DetailsCustomFields from '/src/components/DetailsCustomFields.vue'
import DetailsCustomFieldsEdit from '/src/components/DetailsCustomFieldsEdit.vue'

import FlyOverAbout from '/src/components/flyovers/About.vue'
import FlyOverDescription from '/src/components/flyovers/Description.vue'
import FlyOverLayers from '/src/components/flyovers/Layers.vue'
import FlyOverFilters from '/src/components/flyovers/Filters.vue'
import FlyOverReferences from '/src/components/flyovers/Reference.vue'
import FlyOverGroups from '/src/components/flyovers/Groups.vue'
import FlyOverFields from '/src/components/flyovers/Fields.vue'
import FlyOverLoad from '/src/components/flyovers/Load.vue'

export default {
  components: { FlyOverAbout, FlyOverDescription, FlyOverLayers, FlyOverFilters, FlyOverReferences, FlyOverGroups, FlyOverFields, FlyOverLoad, Grid, Footer, DetailsCustomFields, DetailsCustomFieldsEdit, Markdown, XIcon, DuplicateIcon, ChatAltIcon, FireIcon, FilterIcon, StatusOnlineIcon, AdjustmentsIcon, LinkIcon, UploadIcon, DownloadIcon, PlusSmIcon, ChevronDownIcon, ChevronUpIcon, ViewBoardsIcon, ViewGridAddIcon, ViewGridIcon, CollectionIcon, Popover, PopoverButton, PopoverPanel, Disclosure, DisclosureButton, DisclosurePanel },

  setup() {
    const actualJSONVersion = 5

    const { board, toggleBoard } = useBoard()
    const { popper, togglePopper } = usePopper()
    const { heatmap, toggleHeatmap } = useHeatmap()
    const { isLayersMenuVisible, toggleLayersMenu } = useLayersMenu()

    const db = ref(undefined)
    const { activeLayer, setActiveLayer } = useActiveLayer()
    const { convert } = useConvertors()
    const setDB = (value) => {
      db.value = value;
      convert(db, actualJSONVersion);
      setActiveLayer(db.value.layers[0])
    }

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
        layers: [],
        groupId: 0,
        fields,
        references: []
      }
      db.value.layers.forEach(el => {
        newAtom.layers.push({
          id: el.id,
          note: "",
          color: "bg-gray-100",
          score: 0,
        })
      })
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
    
    const selectedReferences = ref([])
    const showWithoutReference = ref(true)
    const toggleShowWithoutReference = () => { showWithoutReference.value = !showWithoutReference.value}
    const filteredResults = computed(() => {
      if (isLayerReady.value && db.value && db.value.items) {
        return db.value.items.filter(item => {
          const intersection = selectedReferences.value.filter(x => item.references.includes(x))
          const empty = showWithoutReference.value && (item.references.length === 0)
          return (intersection.length > 0) || empty
        })
      } else {
        return []
      }
    })
    const searchQuery = useDebounceRef('', 400)
    const searchResults = computed(() => {
        const q = searchQuery.value.toLowerCase()
        if (q.length < 3) return filteredResults.value;
        return filteredResults.value.filter(el => {
          let searchString = `${el.name}`
          db.value.fields.forEach(field => {
            if (field.searchable) {
              searchString += el.fields.find(i => i.id === field.id).value
            }
          })
          return (searchString.toLowerCase().indexOf(q) > -1)
        })
    })

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
      board, toggleBoard,
      popper, togglePopper,
      heatmap, toggleHeatmap,
      isLayersMenuVisible, toggleLayersMenu,
      db, setDB,
      isLayerReady, setLayerReady, activeLayer, setActiveLayer,
      activeItem, setActiveItem, isAdditionalFieldsVisible, isWideDetails,
      newItem, addNewItem, deleteItem,
      getGroupById, getFieldById,
      searchQuery, searchResults, selectedReferences, showWithoutReference, toggleShowWithoutReference,
      swatches,
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
    <fly-over-layers v-if="isLayerReady" :db="db" />
    <fly-over-filters
      v-if="isLayerReady"
      :db="db"
      :selected-references="selectedReferences"
      :show-without-reference="showWithoutReference"
      @toggle-empty="toggleShowWithoutReference()"
    />
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
        <div v-if="isLayerReady" class="h-16 flex items-center justify-between relative">
          <!-- Search -->
          <div class="flex-1 pl-12 flex items-center space-x-4">
            <div
              @click="toggleLayersMenu()"
              class="rounded-lg h-8 w-8 flex items-center justify-center cursor-pointer text-gray-500 hover:bg-gray-200 hover:text-gray-900"
            >
              <CollectionIcon class="w-5 h-5" />
            </div>
            <label class="block flex-1">
              <input
                v-model="searchQuery"
                type="text"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-300 focus:ring focus:ring-purple-200 focus:ring-opacity-50"
                placeholder="Поиск..."
              />
            </label>
          </div>
          <!-- Actions -->
          <div class="flex items-center space-x-2 px-4">
            <div class="rounded-lg bg-gray-50 h-8 w-8 flex items-center justify-center cursor-pointer text-gray-500 hover:bg-gray-200 hover:text-gray-900">
              <ViewGridIcon v-if="board" class="w-5 h-5" @click="toggleBoard()" />
              <ViewBoardsIcon v-else class="w-5 h-5" @click="toggleBoard()" />
            </div>
            <div
              :class="[heatmap ? 'bg-purple-50 text-purple-500 border border-purple-100' : 'bg-gray-50 text-gray-500']"
              class="rounded-lg h-8 w-8 flex items-center justify-center cursor-pointer text-gray-500 hover:bg-gray-200 hover:text-gray-900"
            >
              <FireIcon class="w-5 h-5" @click="toggleHeatmap()" />
            </div>
            <div
              :class="[popper ? 'bg-purple-50 text-purple-500 border border-purple-100' : 'bg-gray-50 text-gray-500']"
              class="rounded-lg h-8 w-8 flex items-center justify-center cursor-pointer text-gray-500 hover:bg-gray-200 hover:text-gray-900"
            >
              <ChatAltIcon class="w-5 h-5" @click="togglePopper()" />
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

          <div
            :class="[isLayersMenuVisible ? 'translate-x-0' : '-translate-x-full']"
            class="absolute inset-0 bg-gray-100 flex items-center px-12 transition-all overflow-hidden space-x-6"
          >
            <div
              @click="toggleLayersMenu()"
              class="rounded-lg h-8 w-8 flex items-center justify-center cursor-pointer text-gray-500 hover:bg-gray-200 hover:text-gray-900"
            >
              <XIcon class="w-5 h-5" />
            </div>
            <div class="flex-1 overflow-x-auto flex items-center space-x-6">
              <div
                v-for="layer in db.layers"
                :key="layer.id"
                :class="[layer.id === activeLayer.id ? 'border-purple-500' : 'border-transparent']"
                class="border-b-2 cursor-pointer"
                @click="setActiveLayer(layer)"
              >{{ layer.name }}</div>
            </div>
          </div>
        </div>
        <!-- -------------------------------------------------- -->

        <!-- Grid -->
        <!-- -------------------------------------------------- -->
        <div v-if="isLayerReady" class="pb-32 overflow-hidden" style="height: calc(100vh - 6.5rem);">
          <div v-if="board"
            class="px-2 py-4 pb-32 overflow-y-auto space-y-1"
            style="height: calc(100vh - 6.5rem);"
          >
            <!-- Non-group -->
            <Grid
              v-if="filterByGroup(0).length > 0"
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
                      <div class="w-16 h-5 rounded border" :class="activeItem.layers.find(el => el.id === activeLayer.id).color"></div>
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
                          <div @click="activeItem.layers.find(el => el.id === activeLayer.id).color = swatch" v-for="(swatch, index) in swatches" :key="index" class="rounded cursor-pointer" :class="[activeItem.color === swatch ? 'ring-2 ring-offset-1 ring-black ring-opacity-30' : '', swatch, 'h-6']"></div>
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
                  " placeholder="Score" v-model="activeItem.layers.find(el => el.id === activeLayer.id).score">
              </label>
            </div>

            <div>
                <label class="inline-flex items-center">
                  <input
                    type="checkbox"
                    class="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-offset-0 focus:ring-indigo-200 focus:ring-opacity-50"
                    v-model="activeItem.active"
                  >
                  <span class="ml-2">Активно</span>
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
                    " rows="6" v-model="activeItem.layers.find(el => el.id === activeLayer.id).note"></textarea>
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
    <Footer :db="db" :is-layer-ready="isLayerReady" />
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
