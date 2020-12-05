<script>
    import {getContext} from "svelte";
    export let personModal = {};
    export let onUpdate = () =>{};
    let _submit= "بروز رسانی";
    if (personModal.id !== -1){
        _submit= "ثبت";
    }

    const {close} = getContext("simple-modal");

    let handelUpdate=()=>{
        onUpdate(personModal);
    }
    const _onOk= () =>{
        onUpdate(personModal);
        close();
    }

</script>

<form class="content" on:submit|preventDefault={_onOk} >
    <label>نام
        <input type="text" bind:value={personModal.firstName} />
    </label>
    <label>نام خانوادگی
        <input type="text" bind:value={personModal.lastName} />
    </label>
    <label>شماره تماس
        <input type="text" bind:value={personModal.phone} />
    </label>
    <label>تامین کننده
        <input type="text" bind:value={personModal.provider} />
    </label>
    <label>شهر 
        <input type="text" bind:value={personModal.city} /> 
    </label>
    <label>تصویر
        <input type="text" bind:value={personModal.picture} />
    </label>
<button >{_submit}</button>
</form>
