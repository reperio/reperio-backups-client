// function to act as a class
function SwitchComponent () {}

// gets called once before the renderer is used
SwitchComponent.prototype.init = function(params) {
    this.api = params.api;
    this.data = params.data;
    // create the cell
    this.eGui = document.createElement('div');
    this.eGui.innerHTML = `<label class="r-switch">
                                <input class="enabled-checkbox" type="checkbox" change.delegate="changeJobStatus(this)" />
                                <span class="slider round">
                                    <span class="slider-text-on">ON</span>
                                    <span class="slider-text-off">OFF</span> 
                                </span>
                            </label>`;

    // get references to the elements we want
    this.eCheckbox = this.eGui.querySelector('.enabled-checkbox');
    this.eSpanOn = this.eGui.querySelector('.slider-text-on');
    this.eSpanOff = this.eGui.querySelector('.slider-text-off');

    // set value into cell
    this.eCheckbox.checked = params.value; //might be the wrong variable name

    if (this.eCheckbox.checked) {
        this.eSpanOn.removeAttribute('hidden');
        this.eSpanOff.setAttribute('hidden', true);
    } else {
        this.eSpanOff.removeAttribute('hidden');
        this.eSpanOn.setAttribute('hidden', true);
    }

    // add event listener to button
    this.eventListener = () => {
        if (this.eCheckbox.checked) {
            this.eSpanOn.removeAttribute('hidden');
            this.eSpanOff.setAttribute('hidden', true);
        } else {
            this.eSpanOff.removeAttribute('hidden');
            this.eSpanOn.setAttribute('hidden', true);
        }
        this.data.enabled = this.eCheckbox.checked;
        this.api.gridOptionsWrapper.gridOptions.onCellValueChanged(this.data);
    };
    this.eCheckbox.addEventListener('click', this.eventListener);
};

// gets called once when grid ready to insert the element
SwitchComponent.prototype.getGui = function() {
    return this.eGui;
};

// gets called whenever the user gets the cell to refresh
SwitchComponent.prototype.refresh = function(params) {
    // set value into cell again
    this.eValue.innerHTML = params.value;
    // return true to tell the grid we refreshed successfully
    return true;
};

// gets called when the cell is removed from the grid
SwitchComponent.prototype.destroy = function() {
    // do cleanup, remove event listener from button
    this.eCheckbox.removeEventListener('click', this.eventListener);
};

export default SwitchComponent;