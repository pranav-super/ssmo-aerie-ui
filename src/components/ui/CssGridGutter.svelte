<svelte:options immutable={true} />

<script lang="ts">
  export let track: number = 1; // Array index number in the children of CSSGrid
  export let type: 'column' | 'row' = 'column';
  export let draggable: boolean = true;
</script>

<div class="css-grid-gutter {type}" class:draggable data-track={track} />

<style>
  .css-grid-gutter {
    background-color: var(--st-gray-20);
    background-position: 50%;
    background-repeat: no-repeat;
  }

  .css-grid-gutter.draggable:hover,
  .css-grid-gutter.draggable:active {
    background-color: var(--st-gray-30);
  }

  .css-grid-gutter.draggable.column {
    background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAeCAYAAADkftS9AAAAIklEQVQoU2M4c+bMfxAGAgYYmwGrIIiDjrELjpo5aiZeMwF+yNnOs5KSvgAAAABJRU5ErkJggg==');
    cursor: col-resize;
  }

  .css-grid-gutter.draggable.row {
    background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAFAQMAAABo7865AAAABlBMVEVHcEzMzMzyAv2sAAAAAXRSTlMAQObYZgAAABBJREFUeF5jOAMEEAIEEFwAn3kMwcB6I2AAAAAASUVORK5CYII=');
    cursor: row-resize;
  }
</style>
