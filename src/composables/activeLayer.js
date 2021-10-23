import { ref } from 'vue'

const activeLayer = ref(undefined)

const useActiveLayer = () => {

    const setActiveLayer = (layer) => {
        activeLayer.value = layer
    }

    return {
        activeLayer,
        setActiveLayer
    }
}

export { useActiveLayer }
