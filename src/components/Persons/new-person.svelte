<script>
    export let personsNew;
    export let hdlNew = () => {};
</script>

<style>
    .btnNew {
        position: relative;
        width: 150px;
        height: 50px;
        background: linear-gradient(270.46deg, #5dcaca 26.81%, #74b5e1 111.33%);
        border-radius: 10px;
    }
    
    .btnContainer {
        width: 50%;
        max-width: 60rem;
        background: #FFFFFF;
        border: none;
        text-align: right;
        margin: auto;
    }
    
</style>

<div class="btnContainer">

    <button class="btnNew " on:click={hdlNew({ personsNew })}>
        اضافه کردن
        <i class="icofont-ui-add" style={'color:white;'} /></button>
</div>
