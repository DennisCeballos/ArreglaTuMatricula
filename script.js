//Variables "globales"

// Funcion para formatear horas
function formatHour(hour) {
    const period = hour >= 12 ? 'pm' : 'am';
    const adjustedHour = hour % 12 || 12;
    return `${adjustedHour}:00 ${period}`;
}

// Funcion para obtener un color aleatorio
function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

//Lista de cursos en la pagina
let cursos = [];

// Funcion para pintar una celda segun su posicion
// se le trata como si fuera un array matematico
function pintarCeldaHorario(a, b, cursoColor) {
    const scheduleTable = document.getElementById('schedule-table');
    const rows = scheduleTable.querySelectorAll('tr');

    //Correccion de valores por la _forma rara_ de la tabla
    a = a+1;

    if (a <= rows.length) {
        const cells = rows[a].querySelectorAll('.schedule-cell');
        if (b < cells.length) {
            cells[b].style.backgroundColor = cursoColor;
        }
    }
}

// Funcion para "ocultar" una celda segun su posicion
// se le trata como si fuera un array matematico
function visibilidadCeldaHorario(a, b, check) {
    const scheduleTable = document.getElementById('schedule-table');
    const rows = scheduleTable.querySelectorAll('tr');

    //Correccion de valores por la _forma rara_ de la tabla
    a = a+1;

    if (a <= rows.length) {
        const cells = rows[a].querySelectorAll('.schedule-cell');
        if (b < cells.length) {
            if (check) {
                cells[b].classList.remove('hidden');
            } else {
                cells[b].classList.add('hidden');
            }
        }
    }
}

// Funcion para agregar un curso a la pagina
function agregarCurso(cursoName, cursoColor, tiempoValue) {
    //Elemento html de los cursos
    const cursoList = document.getElementById('cursos-list');
    
    // Create a new curso item
    const cursoItem = document.createElement('div');
    cursoItem.className = 'curso-item';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'curso-checkbox';
    checkbox.checked = true;
    
    const cursoNameElement = document.createElement('div');
    cursoNameElement.className = 'curso-name';
    cursoNameElement.textContent = cursoName;
    
    const cursoColorElement = document.createElement('div');
    cursoColorElement.className = 'curso-color';
    cursoColorElement.style.backgroundColor = cursoColor;

    const deleteButton = document.createElement('button');
    deleteButton.className = 'delete-button';
    deleteButton.textContent = 'X';
    
    cursoItem.appendChild(checkbox);
    cursoItem.appendChild(cursoNameElement);
    cursoItem.appendChild(cursoColorElement);
    cursoItem.appendChild(deleteButton);

    // Add the new task item to the task list
    cursoList.appendChild(cursoItem);

    //Obtiene del textArea la indo
    //!!DEBUG!!Recibe un input simple para obtener las coordenadas a pintar (eg. "1,1;2,2;3,3;4,4")
    //!!DEBUG!!const coordinates = tiempoValue.split(";").map(coord => coord.split(',').map(num => parseInt(num.trim())));
    const coordinates = conversorInputEnTouples(tiempoValue);
    console.log(coordinates);
    const cursoCells = [];

    //Por cada par de coordenadas
    coordinates.forEach(([rowIndex, colIndex]) => {
        //Pintar el horario
        pintarCeldaHorario(rowIndex, colIndex, cursoColor);
        cursoCells.push({rowIndex, colIndex});
    });

    //Guardar los datos del curso creado
    cursos.push({
        cells: cursoCells,
        color: cursoColor,
        element: cursoItem,
        checkbox
    });

    // Handle checkbox click event
    checkbox.addEventListener('change', () => {
        const checked = checkbox.checked;
        cursoCells.forEach(({rowIndex, colIndex}) => {
            if (checked) {
                pintarCeldaHorario(rowIndex, colIndex, cursoColor);
            }
            else
            {
                pintarCeldaHorario(rowIndex, colIndex, '');
            }
        });
    });

    // Handle delete button click event
    deleteButton.addEventListener('click', () => {
        cursoList.removeChild(cursoItem);
        cursoCells.forEach(({rowIndex, colIndex}) => {
            pintarCeldaHorario(rowIndex, colIndex, '');
        });
        //Elimina el curso de la lista 'global'
        cursos = cursos.filter(curso => curso.element !== cursoItem);
    });

    // Handle Hover events
    cursoItem.addEventListener('mouseenter', () => {
        //solo en caso SI este seleccionado
        if (!checkbox.checked) { 
            return;
        }
        
        // Hide all cursos
        cursos.forEach(curso => {
            curso.cells.forEach(({ rowIndex, colIndex }) => {
                visibilidadCeldaHorario(rowIndex, colIndex, false)
            });
        });
        
        // Show the hovered task
        cursoCells.forEach(({ rowIndex, colIndex }) => {
            visibilidadCeldaHorario(rowIndex, colIndex, true);
        });
    });

    cursoItem.addEventListener('mouseleave', () => {
        // Show all cursos que esten checked
        cursos.forEach(curso => {
            curso.cells.forEach(({ rowIndex, colIndex }) => {
                if (curso.checkbox.checked) {
                    visibilidadCeldaHorario(rowIndex, colIndex, true);
                } else {
                    visibilidadCeldaHorario(rowIndex, colIndex, false);
                }
            });
        });
    });
}

// Funcion para manejar los inputs
function conversorInputEnTouples(input) {
    // Helper function to convert a day string to a number (0 for Monday to 5 for Saturday)
    function dayToNumber(day) {
        const days = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
        return days.indexOf(day.toLowerCase());
    }

    // Helper function to convert a time (HH:MM) to a number from 0 to 96
    function timeToNumber(time) {
        const [hours, minutes] = time.split(':').map(Number);
        return ((hours - 7) * 6) + (minutes / 10);
    }

    const elements = input.split(';');
    const allTuples = [];

    elements.forEach(element => {

        // Validate and parse the input string
        const inputPattern = /^(\w+),(\d{1,2}:\d{2})-(\d{1,2}:\d{2})$/;
        const match = element.match(inputPattern);
        if (!match) {
            throw new Error("Invalid input format");
        }
        
        const day = match[1];
        const startTime = match[2];
        const endTime = match[3];
        
        // Validate the day
        const J = dayToNumber(day);
        if (J === -1) {
            throw new Error("Invalid day provided for element: ${element}");
        }
        
        // Validate times
        const [startHours, startMinutes] = startTime.split(':').map(Number);
        const [endHours, endMinutes] = endTime.split(':').map(Number);
        
        if (startHours < 7 || endHours > 23 || startMinutes % 10 !== 0 || endMinutes % 10 !== 0) {
            throw new Error("Invalid time provided for element: ${element}");
        }
        
        const startTimeNumber = timeToNumber(startTime);
        const endTimeNumber = timeToNumber(endTime);
        
        if (endTimeNumber <= startTimeNumber) {
            throw new Error("End time must be greater than start time for element ${element}");
        }
        
        // Create the tuples
        for (let i = startTimeNumber; i < endTimeNumber; i++) {
            allTuples.push([i, J]);
        }
    });

    return allTuples;
}

document.addEventListener("DOMContentLoaded", function() {

    // - Generacion del interior de la tabla 96x6
    function generateScheduleTable() {
        const table = document.getElementById('schedule-table');
        const days = ["HORA", "Lunes", "Martes", "Miercoles", "Jueves", "Viernes", "Sabado"];
        
        // Create the first row with days of the week
        const headerRow = document.createElement('tr');
        days.forEach(day => {
            const th = document.createElement('th');
            th.textContent = day;
            headerRow.appendChild(th);
        });
        table.appendChild(headerRow);

        // Create the rest of the table
        for (let i = 0; i < 96; i++) {
            
            const innerRow = document.createElement('tr');

            if ( i%6==0 ) {
                // Create the merged cell for the time slots
                const timeCell = document.createElement('td');
                timeCell.textContent = `${formatHour(7+(i/6))} - ${formatHour(8+(i/6))}`;
                timeCell.rowSpan = 6;
                timeCell.classList.add('time-cell');

                innerRow.appendChild(timeCell);
            }
            
            // Add the remaining 5 rows for the current time slot
            for (let k = 0; k < 6; k++) {
                const cell = document.createElement('td');
                //cell.textContent = `${k} ${i}`; //DEBUG
                cell.classList.add('schedule-cell');
                if ((i+1)%6 == 0) {
                    cell.classList.add('bottom-line');
                }
                cell.classList.add("right-line");
                innerRow.appendChild(cell);
            }
            table.appendChild(innerRow);

        }
    }

    generateScheduleTable();
    // - Generacion de la tabla 97x7


    // - Configuracion del boton para randomizar el color
    const colorInput = document.getElementById("colorCurso");
    //   Poner en un color aleatorio al seleccionador
    colorInput.value = getRandomColor();

    const randomColorButton = document.getElementById("random-color-button");

    randomColorButton.addEventListener("click", function() {
        const randomColor = getRandomColor();
        colorInput.value = randomColor;
    });
    // - Configuracion del boton para randomizar el color
    

    // - Funcionalidad de Agregar Cursos
    const form = document.getElementById('cursos-form');
    form.addEventListener('submit', (event) => {
        event.preventDefault(); // Prevent the form from submitting the traditional way
        
        const cursoInput = document.getElementById('inputCurso');
        const colorInput = document.getElementById('colorCurso');
        const tiempoInput = document.getElementById('descripcionCurso');
        
        const cursoName = cursoInput.value.trim();
        const cursoColor = colorInput.value;
        const tiempoValue = tiempoInput.value.trim();
        
        // Validacion de inputs
        if (cursoName && tiempoValue) {
            agregarCurso(cursoName, cursoColor, tiempoValue);

            // Clear inputs
            cursoInput.value = '';
            colorInput.value = getRandomColor(); // Reset to default color
            tiempoInput.value = '';
        }
    });
    // - Funcionalidad de Agregar Cursos

});
