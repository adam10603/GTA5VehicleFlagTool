var checkboxes = [];
var flagValueInput = null;
var flagTypeInput = null;
var checkboxesTable = null;

const checkboxesWidth = 4;

const flagNames = {
    strModelFlags: [
        "IS_VAN",
        "IS_BUS",
        "IS_LOW",
        "IS_BIG",
        "ABS_STD",
        "ABS_OPTION",
        "ABS_ALT_STD",
        "ABS_ALT_OPTION",
        "NO_DOORS",
        "TANDEM_SEATS",
        "SIT_IN_BOAT",
        "HAS_TRACKS",
        "NO_EXHAUST",
        "DOUBLE_EXHAUST",
        "NO1FPS_LOOK_BEHIND",
        "CAN_ENTER_IF_NO_DOOR",
        "AXLE_F_TORSION",
        "AXLE_F_SOLID",
        "AXLE_F_MCPHERSON",
        "ATTACH_PED_TO_BODYSHELL",
        "AXLE_R_TORSION",
        "AXLE_R_SOLID",
        "AXLE_R_MCPHERSON",
        "DONT_FORCE_GRND_CLEARANCE",
        "DONT_RENDER_STEER",
        "NO_WHEEL_BURST",
        "INDESTRUCTIBLE",
        "DOUBLE_FRONT_WHEELS",
        "RC",
        "DOUBLE_RWHEELS",
        "MF_NO_WHEEL_BREAK",
        "IS_HATCHBACK"
    ],
    strHandlingFlags: [
        "SMOOTH_COMPRESN",
        "REDUCED_MOD_MASS",
        "",
        "Grip Min-To-Max",
        "NO_HANDBRAKE",
        "STEER_REARWHEELS",
        "HB_REARWHEEL_STEER",
        "STEER_ALL_WHEELS",
        "FREEWHEEL_NO_GAS",
        "NO_REVERSE",
        "",
        "STEER_NO_WHEELS",
        "CVT",
        "ALT_EXT_WHEEL_BOUNDS_BEH",
        "DONT_RAISE_BOUNDS_AT_SPEED",
        "",
        "LESS_SNOW_SINK",
        "TYRES_CAN_CLIP",
        "",
        "",
        "OFFROAD_ABILITY",
        "OFFROAD_ABILITY2",
        "HF_TYRES_RAISE_SIDE_IMPACT_THRESHOLD",
        "Rally Car",
        "ENABLE_LEAN",
        "",
        "HEAVYARMOUR",
        "ARMOURED",
        "SELF_RIGHTING_IN_WATER",
        "IMPROVED_RIGHTING_FORCE",
        "",
        ""
    ],
    strDamageFlags: [
        "DRIVER_SIDE_FRONT_DOOR",
        "DRIVER_SIDE_REAR_DOOR",
        "DRIVER_PASSENGER_SIDE_FRONT_DOOR",
        "DRIVER_PASSENGER_SIDE_REAR_DOOR",
        "BONNET",
        "BOOT",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        ""
    ],
    strAdvancedFlags: [
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "Lower Shifting Points",
        "Over Revving",
        "Bouncy Suspension",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        ""
    ]
};

function _newCheckbox(td, flagName, val) {
    var unknown = false;
    if (flagName.length == 0) {
        flagName = "[unknown]";
        unknown = true;
    }
    td.className = "flag";
    var newCheckbox = document.createElement('input');
    var valStr = val.toString();
    newCheckbox.type = "checkbox";
    newCheckbox.name = flagName;
    newCheckbox.value = valStr;
    newCheckbox.id = "FLAG_" + valStr;
    var newLabel = document.createElement("label");
    newLabel.appendChild(newCheckbox);
    newLabel.onchange = updateFlagValue;
    newLabel.innerHTML += (unknown ? "<div class=\"dimmedColor\">" : "<div>") + flagName + "<br>" + "<div class=\"flag_value\">(1 << " + val + ")</div></div>";
    td.appendChild(newLabel);
    return newCheckbox;
}

function drawAllCheckboxes() {
    checkboxes = [];
    checkboxesTable.innerHTML = "";
    var flagVal = 0;
    for (var i = 0; i < Math.ceil(32 / checkboxesWidth); i++) { // Rows
        var newTr = document.createElement("tr");
        for (var j = 0; j < checkboxesWidth; j++, flagVal++) { // Columns
            var newTd = document.createElement("td");
            var flagName = flagNames[flagTypeInput.value][flagVal];
            var unknown = false;
            checkboxes.push(_newCheckbox(newTd, flagName, flagVal));
            newTr.appendChild(newTd);
        }
        checkboxesTable.appendChild(newTr);
    }
}

function updateAllCheckboxes(flagsValueNum) {
    checkboxes.forEach((checkbox) => {
        var flagBit = ((0x1 << parseInt(checkbox.value)));
        if ((BigInt(flagBit) & BigInt(flagsValueNum)) > 0) {
            $("#" + checkbox.id).prop("checked", true);
        }
        else {
            $("#" + checkbox.id).prop("checked", false);
        }
    });
}

function updateFlagValue() {
    var flagsNumber = 0;
    checkboxes.forEach((checkbox) => {
        if ($("#" + checkbox.id).prop("checked")) {
            flagsNumber |= (0x1 << parseInt(checkbox.value));
        }
    });
    flagValueInput.value = (flagsNumber>>>0).toString(16).toUpperCase();
}

function processFlagValue() {
    flagValueInput.value = flagValueInput.value.toUpperCase().substr(0, 8);
    var input = (flagValueInput.value.length > 0) ? flagValueInput.value : 0;
    if (!(/^[0-9a-f]+$/i.test(input))) {
        flagValueInput.className = "badInput";
        updateAllCheckboxes(0);
        return;
    } else {
        flagValueInput.className = "";
        var inputNumber = parseInt(input, 16);
        updateAllCheckboxes(inputNumber);
    }
}

function processFlagType() {
    drawAllCheckboxes();
    processFlagValue();
}

window.onload = () => {
    flagValueInput = document.getElementById("flagvalue");
    flagTypeInput = document.getElementById("flagtype");
    checkboxesTable = document.getElementById("checkboxes_table");

    flagValueInput.value = "0";

    drawAllCheckboxes();
};
