<script setup lang="ts">
import {Datepicker} from 'flowbite';
import {ref, onMounted} from 'vue';
import type {DatepickerOptions} from 'flowbite';
import type {InstanceOptions} from 'flowbite';

const datepickerEl = ref<HTMLInputElement | null>(null);

onMounted(() => {
    const $datepickerEl: HTMLInputElement = document.getElementById('datepicker-custom') as HTMLInputElement;

    const options: DatepickerOptions = {
        defaultDatepickerId: null,
        autohide: true,
        format: 'mm/dd/yyyy',
        maxDate: null,
        minDate: null,
        orientation: 'bottom',
        buttons: false,
        autoSelectToday: 1,
        title: null,
        rangePicker: false,
        onShow: () => {
        },
        onHide: () => {
        },
    };

    const instanceOptions: InstanceOptions = {
        id: 'datepicker-custom-example',
        override: true
    };

    const datepicker = new Datepicker(
        $datepickerEl,
        options,
        instanceOptions
    );

    const observer = new MutationObserver(() => {
        const dropdownEl = document.querySelector('.datepicker-dropdown');
        if (dropdownEl) {
            dropdownEl.setAttribute('style', 'z-index: 1000 !important');
        }
    });

    observer.observe(document.body, { childList: true, subtree: true });


    datepicker.hide();
    datepicker.getDatepickerInstance();
 });
</script>

<template>
    <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
        <svg class="w-4 h-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor"
             viewBox="0 0 20 20">
            <path
                d="M20 4a2 2 0 0 0-2-2h-2V1a1 1 0 0 0-2 0v1h-3V1a1 1 0 0 0-2 0v1H6V1a1 1 0 0 0-2 0v1H2a2 2 0 0 0-2 2v2h20V4ZM0 18a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8H0v10Zm5-8h10a1 1 0 0 1 0 2H5a1 1 0 0 1 0-2Z"/>
        </svg>
    </div>
    <input id="datepicker-custom" ref="datepickerEl" type="text"
           class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full pl-10 p-2.5"
           placeholder="Select date">
</template>

<style scoped>

</style>