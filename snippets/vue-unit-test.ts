<template>
  <div>
    <p>{{ fullName }}</p>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  firstName: String,
  lastName: String
});

const fullName = computed(() => {
  return `${props.firstName} ${props.lastName}`;
});
</script>



import { mount } from '@vue/test-utils';
import Component from './UserName.vue';

describe('UserName.vue', () => {
  it('renders full name correctly', () => {
    const wrapper = mount(Component, {
      props: {
        firstName: 'John',
        lastName: 'Doe'
      }
    });

    expect(wrapper.text()).toContain('John Doe');
  });
});