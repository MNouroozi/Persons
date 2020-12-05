<script>
    export let Persons = {};
    export let hdlDelete = () => {};
    export let hdlEdit = () => {};
</script>

<div class="container">
    <div class="row">
        <div class="col-2">نام</div>
        <div class="col-2">نام خانوادگی</div>
        <div class="col-2">شماره تلفن</div>
        <div class="col-2">تامین کننده</div>
        <div class="col-2">شهر</div>
        <div class="col-2">عملیات</div>
    </div>
    {#each Persons as { id, firstName, lastName, phone, provider, city, picture }, i}
        <div class="row">
            <!-- svelte-ignore a11y-missing-attribute -->
            <div class="col-2">{firstName}<img src= "/images/user-avatar-svg-ai-free-detail-0-2.png" /></div>
            <div class="col-2">{lastName}</div>
            <div class="col-2">{phone}</div>
            <div class="col-2">{city}</div>
            <div class="col-2">{provider}</div>
            <div class="col-2">
                <button on:click={hdlDelete(id)}><i
                        class="icofont-eraser"
                        style={'color:red;'} /></button>
                <button on:click={hdlEdit(id)}><i
                        class="icofont-edit-alt"
                        style={'color:green;'} /></button>
            </div>
        </div>
    {/each}
</div>
