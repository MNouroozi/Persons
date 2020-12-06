<script>
    import { getContext } from "svelte";
    export let personModal = {};
    export let onUpdate = () => {};

    let _submit = "ثبت";
    let _close = "انصراف";

    if (personModal.id !== -1) {
        _submit = "بروز رسانی";
    }

    const { close } = getContext("simple-modal");

    const _onOk = () => {
        console.log("update");
        onUpdate(personModal);
        close();
    };
    const _onClose = () => {
        console.log("On Close");
        close();
    };
</script>

<style>
    form.container {
        width: 100%;
        max-width: 60rem;
        background: #ffffff;
        border: none;
        box-sizing: none;
        border-radius: 0;
        text-align: right;
        margin: none;
    }

    .formGroup label {
        float: right;
    }

    .formGroup input {
        float: left;
        width: 68px;
    }

    .formGroup {
        height: 44px;
        display: flow-root;
        margin-bottom: 1rem;
    }

    .formGroup input {
        width: 183px;
        border-radius: 10px;
    }

    form.container button {
        background: linear-gradient(270.46deg, #5dcaca 26.81%, #74b5e1 111.33%);
        padding: 0.2rem 1rem;
        border-radius: 7px;
        margin-left: 0.5rem;
    }

    form.container input {
        border: 2px solid #80eade;
    }
</style>

<form class="container" on:submit|preventDefault={_onOk}>
    <div class="row">
        <!-- svelte-ignore a11y-missing-attribute -->
        <img src="/images/avator.JPG" />
    </div>
    <div class="row">
        <div class="col-6">
            <div class="formGroup">
                <label for="firstName">نام </label>
                <input
                    type="text"
                    name="firstName"
                    maxlength="20"
                    bind:value={personModal.firstName} />
            </div>
            <div class="formGroup">
                <label for="lastName">نام خانوادگی</label>
                <input
                    type="text"
                    name="lastName"
                    maxlength="30"
                    bind:value={personModal.lastName} />
            </div>
            <div class="formGroup">
                <label for="phone">شماره تماس</label>
                <input
                    type="number"
                    name="phone"
                    maxlength="11"
                    bind:value={personModal.phone} />
            </div>
        </div>

        <div class="col-6">
            <div class="formGroup">
                <label for="provider">تامین کننده</label>
                <input
                    type="text"
                    name="provider"
                    maxlength="30"
                    bind:value={personModal.provider} />
            </div>
            <div class="formGroup">
                <label for="city">شهر </label>
                <input
                    type="text"
                    name="city"
                    maxlength="20"
                    bind:value={personModal.city} />
            </div>
        </div>
    </div>

    <button class="">{_submit}</button>
    <button class="" on:click|preventDefault={_onClose}>{_close}</button>
</form>
