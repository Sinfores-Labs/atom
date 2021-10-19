import { ref, readonly } from "vue";

function useFlyovers() {
    const about = ref(false)
    const groups = ref(false)
    const fields = ref(false)
    const load = ref(false)

    const flyovers = [about, groups, fields, load]
    
    const clear = () => { flyovers.forEach(fo => fo.value = false) }

    const showFlyover = (flyover) => {
        clear();
        switch (flyover) {
            case 'about': about.value = true; break;
            case 'groups': groups.value = true; break;
            case 'fields': fields.value = true; break;
            case 'load': load.value = true; break;
        }
    }
    
    const hideFlyover = (flyover) => {
        switch (flyover) {
            case 'about': about.value = false; break;
            case 'groups': groups.value = false; break;
            case 'fields': fields.value = false; break;
            case 'load': load.value = false; break;
        }
    }
    
    const toggleFlyover = (flyover) => {
        switch (flyover) {
            case 'about': about.value ? hideFlyover(flyover) : showFlyover(flyover); break;
            case 'groups': groups.value ? hideFlyover(flyover) : showFlyover(flyover); break;
            case 'fields': fields.value ? hideFlyover(flyover) : showFlyover(flyover); break;
            case 'load': load.value ? hideFlyover(flyover) : showFlyover(flyover); break;
        }
    }
    

    return {
        showFlyover,
        hideFlyover,
        toggleFlyover,
        about: readonly(about),
        groups: readonly(groups),
        fields: readonly(fields),
        load: readonly(load),
    }
}

export { useFlyovers }
