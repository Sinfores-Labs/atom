import { ref, readonly } from 'vue'

const isLayersMenuVisible = ref(false)

const useLayersMenu = () => {

    const toggleLayersMenu = () => {
        isLayersMenuVisible.value = !isLayersMenuVisible.value
    }

    return {
        isLayersMenuVisible: readonly(isLayersMenuVisible),
        toggleLayersMenu
    }
}

export { useLayersMenu }
