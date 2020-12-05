<script>
	import Modal from "./components/Persons/modal.svelte";
	import Persons from "./components/Persons/persons.svelte";

</script>

<main>
	<Modal>
		<Persons />
	</Modal>
</main>

<style>
	main {
		text-align: center;
		padding: 1em;
		max-width: 240px;
		margin: 0 auto;
		direction: rtl;
		text-align: right;
	}
	@media (min-width: 640px) {
		main {
			max-width: none;
		}
	}
</style>