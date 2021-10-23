<script>
export default {
    props: {
        fields: {
            type: Array,
            default: () => ([])
        },
        getFieldByIdFn: {
            type: Function
        }
    },

    setup(props) {},
}
</script>

<template>
    <div
        v-for="field in fields"
        :key="field.id"
    >

        <label v-if="getFieldByIdFn(field.id).type === 'text'" class="block">
            <span class="text-gray-700 text-xs">{{ getFieldByIdFn(field.id).name }}</span>
            <textarea
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                rows="2"
                v-model="field.value"
            ></textarea>
        </label>

        <label v-if="getFieldByIdFn(field.id).type === 'bool'" class="flex items-center py-2">
            <input
                type="checkbox"
                class="rounded border-gray-300 text-purple-600 shadow-sm focus:border-purple-300 focus:ring focus:ring-offset-0 focus:ring-purple-200 focus:ring-opacity-50"
                v-model="field.value"
            >
            <span class="ml-2">{{ getFieldByIdFn(field.id).name }}</span>
        </label>

    </div>
</template>
