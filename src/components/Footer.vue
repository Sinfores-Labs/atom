<script>
import {
    StatusOnlineIcon,
    CollectionIcon,
    FilterIcon,
    LinkIcon,
    ViewGridAddIcon,
    DuplicateIcon,
    UploadIcon,
    DownloadIcon
} from '@heroicons/vue/outline'
import { saveAs } from 'file-saver'
import { useFlyovers } from '/src/composables/flyovers'

export default {
    components: {
        StatusOnlineIcon,
        CollectionIcon,
        FilterIcon,
        LinkIcon,
        ViewGridAddIcon,
        DuplicateIcon,
        UploadIcon,
        DownloadIcon
    },

    props: {
        db: {
            type: Object,
            default: () => ({})
        },
        isLayerReady: {
            type: Boolean,
            default: false
        }
    },

    setup(props) {
        const { toggleFlyover, about, desc, layers, filters, references, groups, fields, load } = useFlyovers()

        const saveJSON = () => {
        // https://stackoverflow.com/questions/679915/how-do-i-test-for-an-empty-javascript-object
        if (props.db && Object.keys(props.db).length !== 0) {
            let blob = new Blob([JSON.stringify(props.db)], {type: "application/json;charset=utf-8"});
            saveAs(blob, "atoms.json");
        }
        };
        
        return {
            toggleFlyover, about, desc, layers, filters, references, groups, fields, load,
            saveJSON
        }
    },
}
</script>

<template>
    <div class="z-50 h-10 bg-gray-50 border-t flex items-center justify-between text-xs px-4">
        <div @click="toggleFlyover('about')" class="cursor-pointer select-none"><span class="font-bold">ATOM</span> &middot; Sinfores SX</div>

        <!-- Main menu -->
        <!-- -------------------------------------------------- -->

        <div class="flex items-center space-x-2 border-b-2 border-transparent">
            <!-- Description -->
            <div @click="toggleFlyover('desc')" v-if="isLayerReady" :class="[desc ? 'border-purple-500' : 'border-transparent']" class="border-t-2 border-transparent h-10 px-4 hover:bg-gray-200 cursor-pointer select-none font-semibold flex items-center space-x-2" type="button">
                <StatusOnlineIcon class="w-5 h-5" aria-hidden="true" />
                <div class="hidden xl:block">Описание</div>
            </div>
            <!-- Layers -->
            <div @click="toggleFlyover('layers')" v-if="isLayerReady" :class="[layers ? 'border-purple-500' : 'border-transparent']" class="border-t-2 border-transparent h-10 px-4 hover:bg-gray-200 cursor-pointer select-none font-semibold flex items-center space-x-2" type="button">
                <CollectionIcon class="w-5 h-5" aria-hidden="true" />
                <div class="hidden xl:block">Слои</div>
            </div>
            <!-- Filters -->
            <div @click="toggleFlyover('filters')" v-if="isLayerReady" :class="[filters ? 'border-purple-500' : 'border-transparent']" class="border-t-2 border-transparent h-10 px-4 hover:bg-gray-200 cursor-pointer select-none font-semibold flex items-center space-x-2" type="button">
                <FilterIcon class="w-5 h-5" aria-hidden="true" />
                <div class="hidden xl:block">Фильтры</div>
            </div>
            <!-- References -->
            <div @click="toggleFlyover('references')" v-if="isLayerReady" :class="[references ? 'border-purple-500' : 'border-transparent']" class="border-t-2 border-transparent h-10 px-4 hover:bg-gray-200 cursor-pointer select-none font-semibold flex items-center space-x-2" type="button">
                <LinkIcon class="w-5 h-5" aria-hidden="true" />
                <div v-if="db.referenceName" class="hidden xl:block">{{ db.referenceName }}</div>
                <div v-else class="hidden xl:block">Связи</div>
            </div>
            <!-- Groups -->
            <div @click="toggleFlyover('groups')" v-if="isLayerReady" :class="[groups ? 'border-purple-500' : 'border-transparent']" class="border-t-2 border-transparent h-10 px-4 hover:bg-gray-200 cursor-pointer select-none font-semibold flex items-center space-x-2" type="button">
                <ViewGridAddIcon class="w-5 h-5" aria-hidden="true" />
                <div class="hidden xl:block">Группы</div>
            </div>
            <!-- Fields -->
            <div @click="toggleFlyover('fields')" v-if="isLayerReady" :class="[fields ? 'border-purple-500' : 'border-transparent']" class="border-t-2 border-transparent h-10 px-4 hover:bg-gray-200 cursor-pointer select-none font-semibold flex items-center space-x-2" type="button">
                <DuplicateIcon class="w-5 h-5" aria-hidden="true" />
                <div class="hidden xl:block">Поля</div>
            </div>
            <!-- Load -->
            <div @click="toggleFlyover('load')" :class="[load ? 'border-purple-500' : 'border-transparent']" class="border-t-2 h-10 px-4 hover:bg-gray-200 cursor-pointer select-none font-semibold flex items-center space-x-2 select-none" type="button">
                <UploadIcon class="w-5 h-5" aria-hidden="true" />
                <div class="hidden xl:block">Загрузить</div>
            </div>
            <!-- Save -->
            <div @click="saveJSON()" v-if="isLayerReady" class="border-t-2 border-transparent h-10 px-4 hover:bg-gray-200 cursor-pointer select-none font-semibold flex items-center space-x-2" type="button">
                <DownloadIcon class="w-5 h-5" aria-hidden="true" />
                <div class="hidden xl:block">Сохранить</div>
            </div>
        </div>

        <!-- -------------------------------------------------- -->

    </div>
</template>
