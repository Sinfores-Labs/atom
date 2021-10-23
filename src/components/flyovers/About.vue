<script>
import { XIcon } from '@heroicons/vue/outline'
import { useFlyovers } from '/src/composables/flyovers'

export default {
    components: { XIcon },

    setup() {
      const { hideFlyover, about } = useFlyovers()
      return {
        hideFlyover,
        about
      }
    },
}
</script>

<template>
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
        <p class="text-xs">Полезная штука, чтобы осуществлять декомпозицию сложных процессов, структурировано хранить информацию и т.д.</p>
        <p class="text-xs">Реализовано в рамках инициативы Security Expirience (SX) компании Sinfores Group. Инициатива направлена на облегчение труда рядовых специалистов по кибербезопасности. В рамках инициативы мы открываем доступ к своим инструментам, которые используются в проектной работе.</p>
        <div class="bg-red-100 p-4 rounded border border-red-200 text-red-900 space-y-2 text-xs">
          <header class="font-bold uppercase">Важно</header>
          <p>Вся работа с данными осуществляется исключительно на Вашем компьютере. Они никуда не передаются и даже никакие cookies-файлы не используются. Поэтому не забывайте периодически сохранять Ваши модели, так как мы их восстановить не сможем.</p>
        </div>
      </div>
    </div>
</template>
