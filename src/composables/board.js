import { ref } from 'vue'

const board = ref(false)

const useBoard = () => {

    const toggleBoard = () => {
        board.value = !board.value
    }

    return {
        board,
        toggleBoard
    }
}

export { useBoard }
