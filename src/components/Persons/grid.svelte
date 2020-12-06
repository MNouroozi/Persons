<script>
    import ActionButton from "../common/action-button.svelte";
    export let Persons = {};
    export let hdlDelete = () => {};
    export let hdlEdit = () => {};
</script>

<style>
    .row {
        border-image: radial-gradient(rgb(23, 201, 255), rgb(255, 255, 255)) 2;
    }
    .rowHead {
        background: #ffffff;
        border-bottom: 1px solid #80eade;
        box-sizing: border-box;
        border-radius: 10px;
    }
</style>

<div class="container">
    <div class="row" style="margin-bottom : 20px ">
        <div class="col-2">نام</div>
        <div class="col-2">نام خانوادگی</div>
        <div class="col-2">شماره تلفن</div>
        <div class="col-2">تامین کننده</div>
        <div class="col-2">شهر</div>
        <div class="col-2">عملیات</div>
    </div>
    {#each Persons as { id, firstName, lastName, phone, provider, city, picture, visible }, i}
        {#if visible}
            <div class="row rowHead">
                <!-- svelte-ignore a11y-missing-attribute -->
                <div class="col-2">
                    {firstName}<img src="/images/avator.JPG" />
                </div>
                <div class="col-2">{lastName}</div>
                <div class="col-2">{phone}</div>
                <div class="col-2">{city}</div>
                <div class="col-2">{provider}</div>
                <div class="col-2">
                    <ActionButton
                        onClick={() => {
                            hdlDelete(id);
                        }}
                        icon="eraser"
                        kind="danger" />
                    <ActionButton
                        onClick={() => {
                            hdlEdit(id);
                        }}
                        icon="edit-alt"
                        kind="success" />
                </div>
            </div>
        {/if}
    {/each}
</div>
