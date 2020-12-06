<script>
    export let textSearch = "";
    export let Searching = (e) => {};
</script>

<style>
    .searchBarContainer {
        width: 50%;
        margin: auto;
        max-width: 60rem;
        background: #ffffff;
        border: none;
        text-align: right;
        position: relative;
    }

    .searchBarContainer input {
        padding-right: 30px;
        border-radius: 10px;
        width: 100%;
        border: 2px solid #80eade;
    }
    .searchBarContainer i {
        position: absolute;
        right: 11px;
        top: 14px;
        color: silver;
    }
</style>

<div class="searchBarContainer">
    <i class="icofont-filter" />
    <input
        placeholder="فیلترینگ"
        type="text"
        bind:value={textSearch}
        on:keyup={Searching(textSearch)} />
</div>
