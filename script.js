// ===== Hent HTML-elementer =====
const input = document.getElementById("todo-input");      // input-felt for ny oppgave
const prioritySelect = document.getElementById("priority"); // dropdown for prioritet
const addButton = document.getElementById("add-button");  // legg til-knapp
const deleteButton = document.getElementById("delete-button"); // slett valgt-knapp
const deleteFinished = document.getElementById("delete-finished"); // slett alle ferdige
const sortButton = document.getElementById("sort-button"); // sortering-knapp
const list = document.querySelector("ul");               // ul-liste for oppgaver

// ===== LocalStorage – hent lagrede oppgaver eller start med tom liste =====
let tasks = JSON.parse(localStorage.getItem("tasks")) || []; 

// ===== Funksjon for å lagre tasks i LocalStorage =====
function saveTasks(){
  localStorage.setItem("tasks", JSON.stringify(tasks)); // konverter array til JSON og lagre
}

// ===== Funksjon for å sette opp funksjonalitet for hver li =====
function setupListItem(li,index){
  // Klikk på li → marker valgt
  li.addEventListener("click",()=>{ 
    document.querySelectorAll("ul li").forEach(item=>item.classList.remove("valgt")); // fjern valgt fra andre
    li.classList.add("valgt"); // marker denne som valgt
  });

  // Dobbelklikk → toggle ferdig
  li.addEventListener("dblclick",()=>{
    if(!li.classList.contains("editing")){ // ikke hvis vi redigerer
      li.classList.toggle("ferdig");       // legg til/fjern ferdig-klasse
      li.classList.remove("valgt");       // fjern valgt markering
      tasks[index].ferdig = li.classList.contains("ferdig"); // oppdater array
      saveTasks();                         // lagre i LocalStorage
    }
  });

  // Høyreklikk → rediger oppgave
  li.addEventListener("contextmenu",(e)=>{
    e.preventDefault(); // forhindrer standard høyreklikk-meny
    editTask(li,index); // åpne redigeringsmodus
  });
}

// ===== Redigeringsfunksjon =====
function editTask(li,index){
  li.classList.add("editing");                 // marker li som redigeres
  const oldText = tasks[index].text;           // hent gammel tekst
  li.textContent = "";                         // tøm li for å lage input

  // Lag input-felt
  const editInput = document.createElement("input");
  editInput.type="text";
  editInput.value = oldText;                   // fyll med gammel tekst
  li.appendChild(editInput);
  editInput.focus();                           // sett fokus på input

  // Lag lagre-knapp med ikon
  const saveBtn=document.createElement("button");
  saveBtn.textContent="💾";
  li.appendChild(saveBtn);

  // Funksjon for å lagre endring
  function save(){
    const newText=editInput.value.trim();      // hent ny tekst
    if(newText!==""){                          // sjekk at den ikke er tom
      tasks[index].text = newText;            // oppdater i array
      saveTasks();                             // lagre LocalStorage
      renderAll();                             // tegn listen på nytt
    } else alert("Oppgaven kan ikke være tom!");
  }

  saveBtn.addEventListener("click",save);      // klikk på lagre
  editInput.addEventListener("keypress",e=>{   // trykk Enter i input
    if(e.key==="Enter"){ e.preventDefault(); save(); }
  });
}

// ===== Tegn en oppgave =====
function renderTask(task,index){
  const li=document.createElement("li");        // opprett li
  li.textContent=task.text;                     // sett oppgavetekst
  li.classList.add(task.priority);              // legg til prioritet-farge
  if(task.ferdig) li.classList.add("ferdig");  // ferdig-klasse
  setupListItem(li,index);                      // legg til klikk, dblclick og høyreklikk
  list.appendChild(li);                         // legg li i ul
}

// ===== Tegn alle oppgaver =====
function renderAll(){
  list.innerHTML="";                            // tøm listen
  tasks.forEach((t,i)=>renderTask(t,i));       // tegn alle oppgaver på nytt
}

// ===== Legg til ny oppgave =====
function addTask(){
  const text=input.value.trim();                // hent tekst fra input
  const priority=prioritySelect.value;         // hent valgt prioritet
  if(text!==""){                                // sjekk at den ikke er tom
    tasks.push({text,priority,ferdig:false});  // legg til ny oppgave i array
    saveTasks(); renderAll();                   // lagre og tegn på nytt
    input.value="";                             // tøm input
  }
}

// ===== Klikk på legg til-knapp =====
addButton.addEventListener("click",addTask);

// ===== Trykk Enter i input =====
input.addEventListener("keypress",e=>{
  if(e.key==="Enter"){ e.preventDefault(); addTask(); }
});

// ===== Slett valgt oppgave =====
deleteButton.addEventListener("click",()=>{
  const valgtIndex = Array.from(list.children)
    .findIndex(li=>li.classList.contains("valgt")); // finn valgt li
  if(valgtIndex>=0){
    tasks.splice(valgtIndex,1);   // fjern fra array
    saveTasks(); renderAll();     // lagre og tegn på nytt
  } else alert("Velg en oppgave først!");
});

// ===== Slett alle ferdige oppgaver =====
deleteFinished.addEventListener("click",()=>{
  tasks = tasks.filter(task=>!task.ferdig); // behold kun ikke-ferdige
  saveTasks(); renderAll();
});

// ===== Toggle-sortering ferdig/ufullført =====
let ferdigFørst=true; // start med ferdige først
sortButton.addEventListener("click",()=>{
  if(ferdigFørst){
    tasks.sort((a,b)=>b.ferdig-a.ferdig);     // ferdige først
    sortButton.innerHTML='<i data-lucide="arrow-up-down"></i> Uferdig først';
  } else {
    tasks.sort((a,b)=>a.ferdig-b.ferdig);     // uferdige først
    sortButton.innerHTML='<i data-lucide="arrow-up-down"></i> Ferdige først';
  }
  ferdigFørst=!ferdigFørst;                   // bytt neste gang
  saveTasks(); renderAll();
});

// ===== Initial render =====
renderAll(); // vis lagrede oppgaver ved oppstart
