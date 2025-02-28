<svelte:options immutable={true} />

<script context="module">
  // Tabs implementation taken from: https://svelte.dev/repl/8e68120858e5322272dc9136c4bb79cc?version=3.7.0

  export const ConsoleContextKey = 'console';
</script>

<script lang="ts">
  import ChevronDownIcon from '@nasa-jpl/stellar/icons/chevron_down.svg?component';
  import ChevronUpIcon from '@nasa-jpl/stellar/icons/chevron_up.svg?component';
  import { createEventDispatcher } from 'svelte';
  import type { TabId } from '../../types/tabs';
  import Tabs from '../ui/Tabs/Tabs.svelte';
  import ConsoleDragHandle from './ConsoleDragHandle.svelte';

  export function openConsole(tabId: TabId) {
    tabs.selectTab(tabId);
    toggleConsole(true);
  }

  const consoleHeaderHeight: number = 36;
  const dispatch = createEventDispatcher<{
    resize: string;
  }>();

  let consoleHeight: number = 0;
  let consoleHeightString: string;
  let currentSelectedConsoleIndex: number | null = null;
  let isOpen: boolean = false;
  let previousConsoleHeight: number = 300;
  let tabs: Tabs;

  $: {
    consoleHeightString = `${consoleHeight + consoleHeaderHeight}px`;
    dispatch('resize', consoleHeightString);
  }

  function onSelectTab(event: CustomEvent<{ index: number }>) {
    const { index } = event.detail;
    if (currentSelectedConsoleIndex === index) {
      onToggle();
    } else {
      toggleConsole(true);
    }

    currentSelectedConsoleIndex = index;
  }

  function onToggle() {
    toggleConsole(!isOpen);
  }

  function onUpdateRowHeight(event: CustomEvent<{ newHeight: number }>) {
    consoleHeight = event.detail.newHeight;
  }

  function toggleConsole(updatedOpenState: boolean) {
    if (!updatedOpenState) {
      previousConsoleHeight = consoleHeight;
      consoleHeight = 0;
    } else if (!isOpen) {
      consoleHeight = previousConsoleHeight;
    }

    isOpen = updatedOpenState;
  }
</script>

<div class="console-container">
  <div class="console-expand-container" class:expanded={isOpen} style:height={consoleHeightString}>
    {#if isOpen}
      <ConsoleDragHandle maxHeight="75%" rowHeight={consoleHeight} on:updateRowHeight={onUpdateRowHeight} />
    {/if}
    <Tabs bind:this={tabs} tabContextKey={ConsoleContextKey} on:select-tab={onSelectTab}>
      <svelte:fragment slot="tab-list">
        <div class="console-tabs-container">
          <div class="console-tabs">
            <slot name="console-tabs" />
          </div>
          <div class="console-toggle" role="none" on:click={onToggle}>
            {#if isOpen}
              <ChevronDownIcon />
            {:else}
              <ChevronUpIcon />
            {/if}
          </div>
        </div>
      </svelte:fragment>
      <div class="console-panels">
        <slot />
      </div>
    </Tabs>
  </div>
</div>

<style>
  .console-container {
    position: relative;
    width: 100%;
  }

  .console-expand-container {
    background-color: var(--st-gray-15);
    left: 0;
    overflow: hidden;
    position: absolute;
    top: 0;
    width: 100%;
    z-index: 1;
  }

  .console-tabs-container {
    align-items: center;
    display: grid;
    grid-template-columns: auto min-content;
    justify-content: space-between;
    width: 100%;
  }

  .console-tabs {
    align-items: center;
    display: flex;
  }

  .console-toggle {
    cursor: pointer;
    margin-right: 1rem;
  }

  .console-panels {
    height: 0;
    overflow: hidden;
  }

  .console-expand-container.expanded .console-panels {
    height: 100%;
  }
</style>
