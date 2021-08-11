let checkboxes          = [];
let flagValueInput      = null;
let flagTypeInput       = null;
let checkboxesTable     = null;
let flagTableInput      = null;
let selectedName        = null;
let selectedDescription = null;
let init                = false;
let fetchTries          = 5;
let flagTables          = {};

const columnCount = 4;

function clearSelectedNameAndDesc() {
    selectedName.innerText = "";
    selectedDescription.innerText = "";
}

function _newCheckbox(td, currentFlag, val) {
    let unknown = false;
    var flagName = currentFlag.name;
    if (flagName.length === 0 || flagName.includes("UNKNOWN_FLAG")) {
        flagName = "[unknown]";
        unknown = true;
    }
    td.className = "flag";
    let newCheckbox = document.createElement("input");
    let valStr = val.toString();
    newCheckbox.type = "checkbox";
    newCheckbox.name = flagName;
    newCheckbox.value = valStr;
    newCheckbox.id = "FLAG_" + valStr;
    let newLabel = document.createElement("label");
    newLabel.appendChild(newCheckbox);
    newLabel.onmouseenter = () => {
        if (unknown) selectedName.classList.add("dimmedColor");
        else selectedName.classList.remove("dimmedColor");
        selectedName.innerText = flagName;
        selectedDescription.innerText = currentFlag.description;
    };
    newLabel.onmouseleave = () => {
        clearSelectedNameAndDesc();
    };
    newLabel.onchange = () => {
        updateFlagValue();
    };
    newLabel.innerHTML += `${(unknown ? "<div class=\"dimmedColor flagCellPadding\">" : "<div class=\"flagCellPadding\">")}${flagName}<br><div class=\"flag_value\">(1 << ${val})</div></div>`;
    td.appendChild(newLabel);
    return newCheckbox;
}

function redrawCheckboxes() {
    checkboxes = [];
    checkboxesTable.innerHTML = "";
    let flagVal = 0;
    let currentTable = flagTableInput.value;
    let currentType = flagTypeInput.value;
    for (let i = 0; i < Math.ceil(32 / columnCount); i++) { // Rows
        let newTr = document.createElement("tr");
        for (let j = 0; j < columnCount; j++, flagVal++) { // Columns
            let newTd = document.createElement("td");
            let currentFlag = flagTables[currentTable]["flags"][currentType][flagVal];
            checkboxes.push(_newCheckbox(
                newTd,
                currentFlag,
                flagVal
            ));
            newTr.appendChild(newTd);
        }
        checkboxesTable.appendChild(newTr);
    }
}

function updateAllCheckboxes(flagsValueNum) {
    checkboxes.forEach((checkbox) => {
        let flagBit = ((0x1 << parseInt(checkbox.value)));
        if ((BigInt(flagBit) & BigInt(flagsValueNum)) > 0) {
            $("#" + checkbox.id).prop("checked", true);
        }
        else {
            $("#" + checkbox.id).prop("checked", false);
        }
    });
}

function updateFlagValue() {
    let flagsNumber = 0;
    checkboxes.forEach((checkbox) => {
        if ($("#" + checkbox.id).prop("checked")) {
            flagsNumber |= (0x1 << parseInt(checkbox.value));
        }
    });
    flagValueInput.value = (flagsNumber>>>0).toString(16).toUpperCase();
}

function processFlagValue() {
    if (!init) return;

    flagValueInput.value = flagValueInput.value.toUpperCase().substr(0, 8);
    let input = (flagValueInput.value.length > 0) ? flagValueInput.value : 0;
    if (!(/^[0-9a-f]+$/i.test(input))) {
        flagValueInput.classList.add("badInput");
        updateAllCheckboxes(0);
        return;
    } else {
        flagValueInput.classList.remove("badInput");
        let inputNumber = parseInt(input, 16);
        updateAllCheckboxes(inputNumber);
    }
}

function processFlagType() {
    if (!init) return;

    clearSelectedNameAndDesc();

    redrawCheckboxes();
    processFlagValue();
}

function processFlagTable() {
    processFlagType();
}

async function fetchFlagTable(key, url) {
    let response = await fetch(url);

    if (response?.status === 200) {
        let obj = await response.json();
        flagTables[key] = obj;
    }
}

async function fetchAllFlagTables() {
    await fetchFlagTable("default", "https://raw.githubusercontent.com/adam10603/GTAVFlags/main/flags.json");
    await fetchFlagTable("ikt", "https://raw.githubusercontent.com/E66666666/GTAVHandlingInfo/master/flags.json");

    if (!flagTables["default"] || !flagTables["ikt"]) {
        throw new Error("Failed to load flag lookup tables. Retrying ...");
    }
}

function postFetchTables() {
    flagTableInput.options[0].innerText += ` (v${flagTables["default"]["version"]})`;
    flagTableInput.options[1].innerText += ` (v${flagTables["ikt"]["version"]})`;

    redrawCheckboxes();
    init = true;
}

function initTables() {
    fetchAllFlagTables().then(postFetchTables).catch((err) => {
        if (fetchTries-- > 0) {
            console.warn(err);
            setTimeout(initTables, 500);
        }
        else alert("Failed to load flag lookup tables. Try refreshing the page!");
    });
}

window.onload = () => {
    flagValueInput      = document.getElementById("flagvalue");
    flagTypeInput       = document.getElementById("flagtype");
    checkboxesTable     = document.getElementById("checkboxes_table");
    flagTableInput      = document.getElementById("flagtable");
    selectedName        = document.getElementById("selected_name");
    selectedDescription = document.getElementById("selected_description");

    flagValueInput.value = "0";

    initTables();
};
