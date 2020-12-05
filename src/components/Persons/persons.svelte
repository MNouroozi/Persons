<script>
    import { getContext, hasContext, setContext } from "svelte";
    import personForm from "./person-form.svelte";
    import { fly } from "svelte/transition";
    import Grid from "./grid.svelte";
    import {PersonsData} from "../../store/person-store.js";
    import NewPerson from "./new-person.svelte";
    
    const { open }  = getContext("simple-modal");

    let personsData;

    const unsubscribe = PersonsData.subscribe(value => {
		personsData = value;
    });
    
    console.log("Persons data", personsData);

    let newPersonData = {
        id: -1,
        firstName: "",
        lastName: "",
        Phone: "",
        provider: "",
        city: "",
        picture: "",
    }
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

        console.log(person);
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

    let editAndNewPerson = id => {
        open(personForm, { personModal: getPersonByid(id), onUpdate: updatePerson }, { transitionWindow: fly });
    }

    let handelDeletePerson = (id) => {
        const persons = [...personsData];
        let filtredPersons = persons.filter((p) => p.id !== id);
        console.log(id);
        personsData = filtredPersons;
    };
</script>
 
<Grid Persons={personsData} hdlDelete={handelDeletePerson} hdlEdit={editAndNewPerson}/> 

<NewPerson personsNew={NewPerson} hdlNew={editAndNewPerson}/>