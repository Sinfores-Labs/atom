<script>
import { ref, computed } from 'vue'
import { XIcon, UploadIcon, DownloadIcon, PlusSmIcon, ChevronDownIcon, CollectionIcon, ChevronUpIcon, ViewGridAddIcon, ViewGridIcon, ViewBoardsIcon } from '@heroicons/vue/outline'
import { Popover, PopoverButton, PopoverPanel } from '@headlessui/vue'
import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/vue'
import { saveAs } from 'file-saver'
import Markdown from 'vue3-markdown-it'
import Popper from "vue3-popper"
import { useDropzone } from 'vue3-dropzone'

import { useFlyovers } from '/src/composables/flyovers'
import { useDebounceRef } from "/src/composables/debounce";
import { swatches } from '/src/data/swatches'

import emptyData from '/src/data/empty.json'

export default {
  components: { Popper, Markdown, XIcon, UploadIcon, DownloadIcon, PlusSmIcon, ChevronDownIcon, ChevronUpIcon, ViewBoardsIcon, ViewGridAddIcon, ViewGridIcon, CollectionIcon, Popover, PopoverButton, PopoverPanel, Disclosure, DisclosureButton, DisclosurePanel },

  setup() {
    const viewBoard = ref(false)

    const db = ref(undefined)
    const isLayerReady = ref(false)
    const { showFlyover, hideFlyover, toggleFlyover, about, groups, fields, load } = useFlyovers()

    const activeItem = ref(undefined)
    const setActiveItem = (id) => {
      if (db.value && db.value.items) {
        activeItem.value = db.value.items.find(el => el.id === parseInt(id))
      } else {
        return undefined
      }
    }
    const isAdditionalFieldsVisible = ref(false)

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
    }

    const newField = ref('')
    const addNewField = () => {
      if (newField.value === '') return
      let lastIndex = 0
      db.value.fields.forEach(el => {
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
        searchable: false,
        filterable: false
      }
      db.value.fields.push(_newField)
      db.value.items.forEach(el => {
        el.fields.push({
          id: lastIndex + 1,
          value: ''
        })
      })
      newField.value = ''
    }

    const newGroup = ref('')
    const addNewGroup= () => {
      if (newGroup.value === '') return
      let lastIndex = 0
      db.value.groups.forEach(el => {
        if (el.id > lastIndex) {
          lastIndex = el.id
        }
      })
      const _newGroup = {
        id: lastIndex + 1,
        name: newGroup.value
      }
      db.value.groups.push(_newGroup)
      newGroup.value = ''
    }
    
    const searchQuery = useDebounceRef('', 400)
    const searchResults = computed(() => {
        if (isLayerReady.value && db.value && db.value.items) {
          const q = searchQuery.value.toLowerCase()
          if (q.length < 3) return db.value.items;
          return db.value.items.filter(el => `${el.name}`.toLowerCase().indexOf(q) > -1)
        } else {
          return []
        }
    })

    let sourceJSONFile = undefined
    const loadJSON = () => {
      let reader = new FileReader()
      reader.onload = event => {
        isLayerReady.value = false
        activeItem.value = undefined
        db.value = JSON.parse(event.target.result)
        console.log(db.value)
        isLayerReady.value = true
      }
      reader.onerror = error => console.log(error)
      reader.readAsText(sourceJSONFile)
    }
    const loadDefault = () => {
      db.value = JSON.parse(JSON.stringify(emptyData))
      isLayerReady.value = true
      activeItem.value = undefined
    }
    const onDrop = (acceptFiles, rejectReasons) => { sourceJSONFile = acceptFiles[0]; loadJSON() }
    const { getRootProps, getInputProps, ...rest } = useDropzone({ onDrop })
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

    return {
      viewBoard,
      db,
      isLayerReady,
      activeItem, setActiveItem, isAdditionalFieldsVisible,
      newItem, addNewItem,
      newField, addNewField,
      newGroup, addNewGroup,
      getGroupById, getFieldById,
      showFlyover, hideFlyover, toggleFlyover, about, groups, fields, load,
      searchQuery, searchResults,
      swatches,
      getRootProps, getInputProps, ...rest, saveJSON, loadDefault,
      filterByGroup, nonEmptyGroups
    }
  }
}
</script>

<template>
  <div class="h-screen w-screen overflow-hidden flex flex-col">

    <!-- Flyovers -->
    <!-- -------------------------------------------------- -->

    <!-- Flyover: About -->
    <div :class="about ? 'translate-y-0' : 'translate-y-full'" class="z-40 transition absolute bottom-9 left-2 w-96 h-large overflow-hidden flex flex-col border shadow-xl border-t-2 border-t-purple-500">
      <div class="h-16 bg-white flex items-center justify-between px-4 space-x-2">
        <div class="flex-1 font-bold">ATOM</div>
        <div>
          <div class="hover:bg-gray-100 cursor-pointer rounded-full h-6 w-6 flex items-center justify-center" @click="hideFlyover('about')">
            <XIcon class="h-4 w-4 text-gray-400"/>
          </div>
        </div>
      </div>
      <div class="flex-1 bg-white overflow-auto px-4 space-y-4 text-sm">
        <p class="text-xs">Полезная штука, чтобы осуществлять декомпозицию сложных процессов, структурировано хранить информацию и т.д. Посмотрите видео ниже, как мы ей пользуемся для декомпозиции процессов или для аудита по ФСТЭК-239.</p>
        <p class="text-xs">Реализовано в рамках инициативы Security Expirience (SX) в компании Sinfores Group, направленной на облегчение труда рядовых специалистов по кибербезопасности, в рамках которой мы открываем доступ к своим инструментам, которые используются в проектной работе.</p>
      </div>
    </div>
    <!-- -------------------------------------------------- -->

    <!-- Flyover: Groups -->
    <div v-if="isLayerReady" :class="groups ? 'translate-y-0' : 'translate-y-full'" class="z-40 transition absolute bottom-9 right-32 w-96 h-large overflow-hidden flex flex-col border shadow-xl border-t-2 border-t-purple-500">
      <div class="h-16 bg-white flex items-center justify-between px-4 space-x-2">
        <div class="flex-1 font-bold">Управление группами</div>
        <div>
          <div class="hover:bg-gray-100 cursor-pointer rounded-full h-6 w-6 flex items-center justify-center" @click="hideFlyover('groups')">
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
                <p class="text-xs text-gray-600">Введите название новой группы.</p>
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
                    " rows="3" v-model="newGroup"></textarea>
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
            <input type="text" class="
                mt-1
                block
                w-full
                rounded-md
                border-gray-300
                shadow-sm
                text-sm
                focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50
              " v-model="group.name">
          </label>
        </div>
      </div>
    </div>
    <!-- -------------------------------------------------- -->

    <!-- Flyover: Fields -->
    <div v-if="isLayerReady" :class="fields ? 'translate-y-0' : 'translate-y-full'" class="z-40 transition absolute bottom-9 right-32 w-96 h-large overflow-hidden flex flex-col border shadow-xl border-t-2 border-t-purple-500">
      <div class="h-16 bg-white flex items-center justify-between px-4 space-x-2">
        <div class="flex-1 font-bold">Управление полями</div>
        <div>
          <div class="hover:bg-gray-100 cursor-pointer rounded-full h-6 w-6 flex items-center justify-center" @click="hideFlyover('fields')">
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
                  <textarea class="
                      mt-1
                      block
                      w-full
                      rounded-md
                      border-gray-300
                      shadow-sm
                      text-sm
                      focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50
                    " rows="3" v-model="newField"></textarea>
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
            <span class="truncate">{{ field.name }}</span>
            <ChevronUpIcon
              :class="open ? 'transform rotate-180' : ''"
              class="w-5 h-5 text-purple-500"
            />
          </DisclosureButton>
          <DisclosurePanel class="px-2 pt-2 pb-2 text-sm text-gray-500 space-y-1">
            <div class="pb-4">
              <label class="block">
                <span class="font-bold text-black">Название поля</span>
                <input type="text" class="
                    mt-1
                    block
                    w-full
                    rounded-md
                    border-gray-300
                    shadow-sm
                    focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50
                  " placeholder="Название" v-model="field.name">
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
    <!-- -------------------------------------------------- -->

    <!-- Flyover: Load -->
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
    <!-- -------------------------------------------------- -->

    <!-- -------------------------------------------------- -->
    
    <div class="flex-1 flex">
      <div class="flex-1 flex flex-col">
        <!-- Search & Actions-->
        <!-- -------------------------------------------------- -->
        <div v-if="isLayerReady" class="h-16 flex items-center justify-between px-4 space-x-4">
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
          <div v-if="viewBoard" class="space-y-12 px-6 py-4 pb-32 overflow-y-auto" style="height: calc(100vh - 6.5rem);">
            <div
              v-for="group in nonEmptyGroups"
              :key="group.id"
            >
              <header class="font-bold border-t py-6 px-2">{{ group.name }}</header>
              <transition-group name="flip-list" tag="div" class="grid grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                <Popper
                  hover
                  arrow
                  placement="right"
                  v-for="item in filterByGroup(group.id)"
                  :key="item.id"
                >
                  <div
                    @click="setActiveItem(item.id)"
                    :class="[(activeItem && activeItem.id === item.id) ? 'ring-2 ring-offset-1 ring-purple-500 ring-opacity-40' : '']"
                    class="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 rounded p-1"
                  >
                    <div class="h-8 w-8 rounded flex-shrink-0" :class="[item.color]"></div>
                    <div class="flex-1">
                      <div class="font-bold text-xs line-clamp-1">{{ item.name }}</div>
                      <div
                        class="text-xs text-gray-500 line-clamp-1"
                        v-for="field in item.fields"
                        :key="field.id"
                      >
                        <div v-if="getFieldById(field.id).showInGrid">{{ field.value }}</div>
                      </div>
                    </div>
                  </div>

                  <template #content>
                    <div class="space-y-2">
                      <div class="font-bold">{{ item.name }}</div>
                      <div>Оценка: {{ item.score }}</div>
                      <div v-if="item.note">{{ item.note }}</div>
                    </div>
                  </template>
                </Popper>
              </transition-group>
            </div>
          </div>
          <transition-group v-else name="flip-list" tag="div" class="p-4 grid grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            <Popper
              hover
              arrow
              placement="right"
              v-for="item in searchResults"
              :key="item.id"
            >
              <div
                @click="setActiveItem(item.id)"
                :class="[(activeItem && activeItem.id === item.id) ? 'ring-2 ring-offset-1 ring-purple-500 ring-opacity-40' : '']"
                class="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 rounded p-1"
              >
                <div class="h-8 w-8 rounded flex-shrink-0" :class="[item.color]"></div>
                <div class="flex-1">
                  <div class="font-bold text-xs line-clamp-1">{{ item.name }}</div>
                  <div
                    class="text-xs text-gray-500 line-clamp-1"
                    v-for="field in item.fields"
                    :key="field.id"
                  >
                    <div v-if="getFieldById(field.id).showInGrid">{{ field.value }}</div>
                  </div>
                </div>
              </div>

              <template #content>
                <div class="space-y-2">
                  <div class="font-bold">{{ item.name }}</div>
                  <div>Оценка: {{ item.score }}</div>
                  <div v-if="item.note">{{ item.note }}</div>
                </div>
              </template>
            </Popper>
          </transition-group>
        </div>
        <!-- -------------------------------------------------- -->
      </div>

      <!-- Detais -->
      <!-- -------------------------------------------------- -->
      <div class="w-96 bg-gray-50 overflow-y-auto shadow-lg border-l rounded-tl-lg p-4" style="height: calc(100vh - 2.5rem);">
        <div v-if="activeItem" class="p-4 space-y-4">
          <section class="space-y-2">
            <div class="font-bold">{{ activeItem.name }}</div>
            <div class="text-xs text-gray-600">
              <Markdown :source="activeItem.note" />
            </div>
          </section>

          <hr />

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
                    <div class="text-sm truncate" v-if="activeItem.groupId">{{ getGroupById(activeItem.groupId).name }}</div>
                    <div class="text-sm truncate" v-else>Не выбрана</div>
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
                      <div @click="activeItem.groupId = 0" :class="[0 === activeItem.groupId ? 'font-bold' : '']" class="p-2 text-sm hover:bg-gray-100 cursor-pointer rounded-lg truncate">Без группы</div>
                      <div
                        v-for="group in db.groups"
                        :key="group.id"
                        :class="[group.id === activeItem.groupId ? 'font-bold' : '']"
                        class="p-2 text-sm hover:bg-gray-100 cursor-pointer rounded-lg truncate"
                        @click="activeItem.groupId = group.id"
                      >{{ group.name }}</div>
                    </div>
                  </PopoverPanel>
                </transition>
              </Popover>
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
            <div
              v-for="field in activeItem.fields"
              :key="field.id"
            >
              <label class="block">
                <span class="text-gray-700 text-xs">{{ getFieldById(field.id).name }}</span>
                <textarea class="
                    mt-1
                    block
                    w-full
                    rounded-md
                    border-gray-300
                    shadow-sm
                    text-sm
                    focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50
                  " rows="6" v-model="field.value"></textarea>
              </label>
            </div>
          </div>

          <hr />

          <section
            v-for="field in activeItem.fields"
            :key="field.id"
          >
            <div v-if="getFieldById(field.id).showInDetals && field.value" class="text-xs space-y-2">
              <header class="uppercase font-bold text-gray-500">{{ getFieldById(field.id).name }}</header>
              <div>
                <Markdown :source="field.value" />
              </div>
            </div>
          </section>

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
        <!-- Groups -->
        <div @click="toggleFlyover('groups')" v-if="isLayerReady" :class="[groups ? 'border-purple-500' : 'border-transparent']" class="border-t-2 border-transparent h-10 px-4 hover:bg-gray-200 cursor-pointer font-semibold flex items-center space-x-2" type="button">
          <ViewGridAddIcon class="w-5 h-5" aria-hidden="true" />
          <div>Группы</div>
        </div>
        <!-- Fields -->
        <div @click="toggleFlyover('fields')" v-if="isLayerReady" :class="[fields ? 'border-purple-500' : 'border-transparent']" class="border-t-2 border-transparent h-10 px-4 hover:bg-gray-200 cursor-pointer font-semibold flex items-center space-x-2" type="button">
          <CollectionIcon class="w-5 h-5" aria-hidden="true" />
          <div>Поля</div>
        </div>
        <!-- Load -->
        <div @click="toggleFlyover('load')" :class="[load ? 'border-purple-500' : 'border-transparent']" class="border-t-2 h-10 px-4 hover:bg-gray-200 cursor-pointer font-semibold flex items-center space-x-2 select-none" type="button">
          <UploadIcon class="w-5 h-5" aria-hidden="true" />
          <div>Загрузить</div>
        </div>
        <!-- Save -->
        <div @click="saveJSON()" v-if="isLayerReady" class="border-t-2 border-transparent h-10 px-4 hover:bg-gray-200 cursor-pointer font-semibold flex items-center space-x-2" type="button">
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
