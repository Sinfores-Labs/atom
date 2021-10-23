import { ref } from 'vue'

const heatmap = ref(false)

const useHeatmap = () => {

    const toggleHeatmap = () => {
        heatmap.value = !heatmap.value
    }

    return {
        heatmap,
        toggleHeatmap
    }
}

export { useHeatmap }
