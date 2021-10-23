import { ref } from 'vue'

const popper = ref(false)

const usePopper = () => {
    
    const togglePopper = () => {
        popper.value = !popper.value
    }
    
    return {
        popper,
        togglePopper
    }
}

export { usePopper }
