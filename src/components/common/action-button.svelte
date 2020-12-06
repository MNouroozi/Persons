<script>
    export let kind  = "success";
    export let icon = "";
    export let onClick = () => {};
</script>

<style>
    .btn{
        border: none;
        background: none;
        cursor: pointer;
    }
    .btn.success i{
        color: green;
    }
    .btn.danger i{
        color: red;
    }
</style>

<button on:click={onClick()} class={"btn " + kind} ><i class={"icofont-" + icon}></i><slot></slot></button>