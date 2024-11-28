import { DirectiveBinding } from 'vue';

export const hoverColorDirective = {
    beforeMount(el: HTMLElement, binding: DirectiveBinding) {
        const defaultColor = 'lightblue';
        const hoverColor = binding.value || defaultColor;

        el.style.transition = 'background-color 0.3s ease';

        el.addEventListener('mouseover', () => {
            el.style.backgroundColor = hoverColor;
        });

        el.addEventListener('mouseout', () => {
            el.style.backgroundColor = '';
        });
    }
};