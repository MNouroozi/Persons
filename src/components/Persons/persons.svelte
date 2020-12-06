<script>
    import { getContext, hasContext, setContext } from "svelte";
    import personForm from "./person-form.svelte";
    import { fly } from "svelte/transition";
    import Grid from "./grid.svelte";
    import {PersonsData} from "../../store/person-store.js";
    import NewPerson from "./new-person.svelte";
    import SearchBar from "../common/search-bar.svelte";

    
    const { open }  = getContext("simple-modal");

    let personsData;

    const unsubscribe = PersonsData.subscribe(value => {
		personsData = value;
    });
    
    let newPersonData =() =>  {return {
        id: -1,
        firstName: "",
        lastName: "",
        phone: "",
        provider: "",
        city: "",
        picture: "",
        visible: true,
    }}
    let updatePerson = (person) => {
        const persons = [...personsData];
        if (person.id === -1) {
            let maxID = 0;
            personsData.forEach((p) => (maxID = p.id > maxID ? p.id : maxID));
            person.id = maxID + 1;
            persons.push(person);
            personsData = persons;
            return;
        }

        for (var i = 0; i < persons.length; i++) {
            if (persons[i].id === person.id) {
                persons[i] = person;
            }
        }
        personsData = persons;
    };

    let getPersonByid = (id) => {
        let person = personsData.filter((p) => p.id === id);
        return person[0];
    };

    let editPerson = id => {
        open(personForm, { personModal: getPersonByid(id), onUpdate: updatePerson }, { transitionWindow: fly });
    }
    let hdlNewPerson = id => {
        
        open(personForm, { personModal: newPersonData() , onUpdate: updatePerson }, { transitionWindow: fly });
    }
    let handelDeletePerson = (id) => {
        const persons = [...personsData];
        let filtredPersons = persons.filter((p) => p.id !== id);
        console.log(id);
        personsData = filtredPersons;
    };

    let searchin = textSearch => {
        const persons = [...personsData];
        for(var i = 0; i < persons.length; i++){
            let js = JSON.stringify(persons[i]);
            if(js.includes(textSearch)){
                persons[i].visible = true;
            } else {
                persons[i].visible = false;
            }
        }
        personsData = persons;
    }

</script>

<style>

</style>

<NewPerson personsNew={personsData} hdlNew={hdlNewPerson}/>
<br/>
<SearchBar Searching={searchin}/>
<br/>
<Grid Persons={personsData} hdlDelete={handelDeletePerson} hdlEdit={editPerson}/> 


